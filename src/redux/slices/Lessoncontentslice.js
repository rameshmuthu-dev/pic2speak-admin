import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

const BASE_URL = '/lesson-contents';

export const fetchLessonContents = createAsyncThunk(
  'lessonContent/fetchLessonContents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get(BASE_URL);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson contents.');
    }
  }
);

export const fetchLessonContentById = createAsyncThunk(
  'lessonContent/fetchLessonContentById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson content.');
    }
  }
);

export const fetchLessonContentsByLesson = createAsyncThunk(
  'lessonContent/fetchLessonContentsByLesson',
  async (lessonId, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}?lessonMasterId=${lessonId}`);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson contents.');
    }
  }
);

export const createLessonContent = createAsyncThunk(
  'lessonContent/createLessonContent',
  async (payload, { rejectWithValue }) => {
    try {
      // 🔹 REMOVED multipart/form-data header. Axios will auto-set application/json
      const res = await API.post(BASE_URL, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create lesson content.');
    }
  }
);

export const updateLessonContent = createAsyncThunk(
  'lessonContent/updateLessonContent',
  // 🔹 Aliased formData to payload just in case your component still passes { id, formData }
  async ({ id, formData: payload }, { rejectWithValue }) => {
    try {
      // 🔹 REMOVED multipart/form-data header. Axios will auto-set application/json
      const res = await API.put(`${BASE_URL}/${id}`, payload || arguments[0].payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update lesson content.');
    }
  }
);

export const deleteLessonContent = createAsyncThunk(
  'lessonContent/deleteLessonContent',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to delete lesson content.');
    }
  }
);

export const changeLessonContentStatus = createAsyncThunk(
  'lessonContent/changeLessonContentStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to change lesson content status.');
    }
  }
);

export const publishLessonContent = createAsyncThunk(
  'lessonContent/publishLessonContent',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/publish`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to publish lesson content.');
    }
  }
);

const initialState = {
  items: [],
  selectedLessonContent: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

const lessonContentSlice = createSlice({
  name: 'lessonContent',
  initialState,
  reducers: {
    clearLessonContentError: (state) => {
      state.error = null;
    },
    clearSelectedLessonContent: (state) => {
      state.selectedLessonContent = null;
    },
    resetLessonContentItems: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonContents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLessonContents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLessonContents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchLessonContentById.fulfilled, (state, action) => {
        state.selectedLessonContent = action.payload;
      })

      .addCase(fetchLessonContentsByLesson.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLessonContentsByLesson.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLessonContentsByLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(createLessonContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createLessonContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createLessonContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(updateLessonContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateLessonContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateLessonContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteLessonContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteLessonContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteLessonContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(changeLessonContentStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeLessonContentStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeLessonContentStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(publishLessonContent.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(publishLessonContent.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((c) => c._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(publishLessonContent.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  clearLessonContentError,
  clearSelectedLessonContent,
  resetLessonContentItems,
} = lessonContentSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllLessonContents = (state) => state.lessonContent?.items || EMPTY_ARRAY;
export const selectLessonContentsByLessonId = (lessonId) => (state) =>
  (state.lessonContent?.items || EMPTY_ARRAY).filter(
    (c) => (typeof c.lessonMasterId === 'object' ? c.lessonMasterId?._id : c.lessonMasterId) === lessonId
  );
export const selectLessonContentStatus = (state) => state.lessonContent?.status || 'idle';
export const selectLessonContentActionStatus = (state) => state.lessonContent?.actionStatus || 'idle';
export const selectLessonContentError = (state) => state.lessonContent?.error || null;
export const selectSelectedLessonContent = (state) => state.lessonContent?.selectedLessonContent || null;

export default lessonContentSlice.reducer;