import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/api";

// ======================================================================
// Async Thunks
// ======================================================================

export const fetchDraftMap = createAsyncThunk(
  "adventureMap/fetchDraftMap",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/adventure-map/draft");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const saveDraftMap = createAsyncThunk(
  "adventureMap/saveDraftMap",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post("/adventure-map/draft", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const saveMapAssets = createAsyncThunk(
  "adventureMap/saveMapAssets",
  async (payload, { rejectWithValue }) => {
    try {
      // payload -> FormData
      const res = await API.post("/adventure-map/assets", payload);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Uploads a single file (building/tree image, walk-cycle frame, footstep
// sound clip, background texture...) to the backend. This goes through the
// SAME /adventure-map/assets route as saveMapAssets (now with multer's
// `upload.single("file")` attached on that route) — the backend branches on
// whether req.file is present (→ just push to Cloudinary, return the URL)
// or req.body.customAssets is present (→ persist the asset list). This
// replaces every `reader.readAsDataURL(file)` call on the frontend —
// nothing gets turned into base64 anymore, so nothing bloats the database.
export const uploadMapFile = createAsyncThunk(
  "adventureMap/uploadMapFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/adventure-map/assets", formData);

      // Expected shape: { url } (or { secure_url } straight from Cloudinary)
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const publishMap = createAsyncThunk(
  "adventureMap/publishMap",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.post("/adventure-map/publish");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPublishedMap = createAsyncThunk(
  "adventureMap/fetchPublishedMap",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/adventure-map/published");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ======================================================================
// Initial State
// ======================================================================

const initialState = {
  draft: {
    mapTitle: "",
    mapActive: true,
    bgSections: [],
    customThemes: {},
    mapItems: [],
    roadPaths: [],
    languagesList: [],
  },

  published: null,

  lastUploadedUrl: null,

  status: {
    fetch: "idle",
    save: "idle",
    asset: "idle",
    upload: "idle",
    publish: "idle",
    publishedFetch: "idle",
  },

  error: null,
};

// ======================================================================
// Helper Functions
// ======================================================================

const setPending = (state, key) => {
  state.status[key] = "loading";
  state.error = null;
};

const setSuccess = (state, key) => {
  state.status[key] = "succeeded";
};

const setRejected = (state, key, action) => {
  state.status[key] = "failed";
  state.error = action.payload;
};

// ======================================================================
// Slice
// ======================================================================

const adventureMapSlice = createSlice({
  name: "adventureMap",

  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    resetStatus: (state) => {
      Object.keys(state.status).forEach((key) => {
        state.status[key] = "idle";
      });
    },

    setDraft: (state, action) => {
      state.draft = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================================
      // Fetch Draft
      // ==========================================================

      .addCase(fetchDraftMap.pending, (state) => {
        setPending(state, "fetch");
      })

      .addCase(fetchDraftMap.fulfilled, (state, action) => {
        setSuccess(state, "fetch");
        state.draft = action.payload;
      })

      .addCase(fetchDraftMap.rejected, (state, action) => {
        setRejected(state, "fetch", action);
      })

      // ==========================================================
      // Save Draft
      // ==========================================================

      .addCase(saveDraftMap.pending, (state) => {
        setPending(state, "save");
      })

      .addCase(saveDraftMap.fulfilled, (state, action) => {
        setSuccess(state, "save");
        state.draft = action.payload;
      })

      .addCase(saveDraftMap.rejected, (state, action) => {
        setRejected(state, "save", action);
      })

      // ==========================================================
      // Save Assets
      // ==========================================================

      .addCase(saveMapAssets.pending, (state) => {
        setPending(state, "asset");
      })

      .addCase(saveMapAssets.fulfilled, (state, action) => {
        setSuccess(state, "asset");

        state.draft = {
          ...state.draft,
          ...action.payload,
        };
      })

      .addCase(saveMapAssets.rejected, (state, action) => {
        setRejected(state, "asset", action);
      })

      // ==========================================================
      // Upload File (single file -> Cloudinary URL)
      // ==========================================================

      .addCase(uploadMapFile.pending, (state) => {
        setPending(state, "upload");
      })

      .addCase(uploadMapFile.fulfilled, (state, action) => {
        setSuccess(state, "upload");
        state.lastUploadedUrl = action.payload?.url || action.payload?.secure_url || null;
      })

      .addCase(uploadMapFile.rejected, (state, action) => {
        setRejected(state, "upload", action);
      })

      // ==========================================================
      // Publish
      // ==========================================================

      .addCase(publishMap.pending, (state) => {
        setPending(state, "publish");
      })

      .addCase(publishMap.fulfilled, (state, action) => {
        setSuccess(state, "publish");
        state.published = action.payload;
      })

      .addCase(publishMap.rejected, (state, action) => {
        setRejected(state, "publish", action);
      })

      // ==========================================================
      // Fetch Published
      // ==========================================================

      .addCase(fetchPublishedMap.pending, (state) => {
        setPending(state, "publishedFetch");
      })

      .addCase(fetchPublishedMap.fulfilled, (state, action) => {
        setSuccess(state, "publishedFetch");
        state.published = action.payload;
      })

      .addCase(fetchPublishedMap.rejected, (state, action) => {
        setRejected(state, "publishedFetch", action);
      });
  },
});

// ======================================================================
// Actions
// ======================================================================

export const {
  clearError,
  resetStatus,
  setDraft,
} = adventureMapSlice.actions;

// ======================================================================
// Selectors
// ======================================================================

export const selectDraftMap = (state) => state.adventureMap.draft;

export const selectPublishedMap = (state) =>
  state.adventureMap.published;

export const selectAdventureMapStatus = (state) =>
  state.adventureMap.status;

export const selectAdventureMapError = (state) =>
  state.adventureMap.error;

export const selectLastUploadedUrl = (state) =>
  state.adventureMap.lastUploadedUrl;

// ======================================================================

export default adventureMapSlice.reducer;