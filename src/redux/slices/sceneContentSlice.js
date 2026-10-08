import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

const BASE_URL = '/scene-contents';

export const fetchSceneContents = createAsyncThunk(
  'sceneContent/fetchSceneContents',
  async (sceneId, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/scene/${sceneId}`);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load scene contents.');
    }
  }
);

export const fetchSceneContentById = createAsyncThunk(
  'sceneContent/fetchSceneContentById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load scene content.');
    }
  }
);

export const createSceneContent = createAsyncThunk(
  'sceneContent/createSceneContent',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create scene content.');
    }
  }
);

export const updateSceneContent = createAsyncThunk(
  'sceneContent/updateSceneContent',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`${BASE_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update scene content.');
    }
  }
);

export const deleteSceneContent = createAsyncThunk(
  'sceneContent/deleteSceneContent',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to delete scene content.');
    }
  }
);

export const changeSceneContentStatus = createAsyncThunk(
  'sceneContent/changeSceneContentStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to change scene content status.');
    }
  }
);

export const publishSceneContent = createAsyncThunk(
  'sceneContent/publishSceneContent',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/publish`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to publish scene content.');
    }
  }
);

const initialState = {
  items: [],
  selectedSceneContent: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

const sceneContentSlice = createSlice({
  name: 'sceneContent',
  initialState,
  reducers: {
    clearSceneContentError: (state) => {
      state.error = null;
    },
    clearSelectedSceneContent: (state) => {
      state.selectedSceneContent = null;
    },
    resetSceneContentItems: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSceneContents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSceneContents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSceneContents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchSceneContentById.fulfilled, (state, action) => {
        state.selectedSceneContent = action.payload;
      })

      .addCase(createSceneContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createSceneContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createSceneContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(updateSceneContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateSceneContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSceneContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteSceneContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteSceneContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteSceneContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(changeSceneContentStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeSceneContentStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeSceneContentStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(publishSceneContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(publishSceneContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(publishSceneContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  clearSceneContentError,
  clearSelectedSceneContent,
  resetSceneContentItems,
} = sceneContentSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllSceneContents = (state) => state.sceneContent?.items || EMPTY_ARRAY;
export const selectSceneContentsBySceneId = (sceneId) => (state) =>
  (state.sceneContent?.items || EMPTY_ARRAY).filter(
    (c) => (typeof c.sceneId === 'object' ? c.sceneId?._id : c.sceneId) === sceneId
  );
export const selectSceneContentStatus = (state) => state.sceneContent?.status || 'idle';
export const selectSceneContentActionStatus = (state) => state.sceneContent?.actionStatus || 'idle';
export const selectSceneContentError = (state) => state.sceneContent?.error || null;
export const selectSelectedSceneContent = (state) => state.sceneContent?.selectedSceneContent || null;

export default sceneContentSlice.reducer;