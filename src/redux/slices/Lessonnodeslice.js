import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

const BASE_URL = '/lesson-nodes';

export const fetchLessonNodes = createAsyncThunk(
  'lessonNode/fetchLessonNodes',
  async ({ mapChapterId, admin } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (mapChapterId) params.append('mapChapterId', mapChapterId);
      if (admin) params.append('admin', 'true');
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await API.get(`${BASE_URL}${query}`);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson nodes.');
    }
  }
);

export const fetchLessonNodeById = createAsyncThunk(
  'lessonNode/fetchLessonNodeById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson node.');
    }
  }
);

export const createLessonNode = createAsyncThunk(
  'lessonNode/createLessonNode',
  async ({ mapChapterId, lessonMasterId, displayOrder, x, y, width, height, rotation, zIndex }, { rejectWithValue }) => {
    try {
      const res = await API.post(BASE_URL, {
        mapChapterId,
        lessonMasterId,
        displayOrder,
        x,
        y,
        width,
        height,
        rotation,
        zIndex,
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create lesson node.');
    }
  }
);

export const updateLessonNode = createAsyncThunk(
  'lessonNode/updateLessonNode',
  async ({ id, displayOrder, x, y, width, height, rotation, zIndex }, { rejectWithValue }) => {
    try {
      const res = await API.put(`${BASE_URL}/${id}`, {
        displayOrder,
        x,
        y,
        width,
        height,
        rotation,
        zIndex,
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update lesson node.');
    }
  }
);

export const changeLessonNodeStatus = createAsyncThunk(
  'lessonNode/changeLessonNodeStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to change lesson node status.');
    }
  }
);

export const deleteLessonNode = createAsyncThunk(
  'lessonNode/deleteLessonNode',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to delete lesson node.');
    }
  }
);

const initialState = {
  items: [],
  selectedLessonNode: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

const lessonNodeSlice = createSlice({
  name: 'lessonNode',
  initialState,
  reducers: {
    clearLessonNodeError: (state) => {
      state.error = null;
    },
    clearSelectedLessonNode: (state) => {
      state.selectedLessonNode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonNodes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLessonNodes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLessonNodes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchLessonNodeById.fulfilled, (state, action) => {
        state.selectedLessonNode = action.payload;
      })

      .addCase(createLessonNode.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createLessonNode.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createLessonNode.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(updateLessonNode.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateLessonNode.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((n) => n._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateLessonNode.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(changeLessonNodeStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeLessonNodeStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((n) => n._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeLessonNodeStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteLessonNode.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      })
      .addCase(deleteLessonNode.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearLessonNodeError, clearSelectedLessonNode } = lessonNodeSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllLessonNodes = (state) => state.lessonNode?.items || EMPTY_ARRAY;
export const selectLessonNodeStatus = (state) => state.lessonNode?.status || 'idle';
export const selectLessonNodeActionStatus = (state) => state.lessonNode?.actionStatus || 'idle';
export const selectLessonNodeError = (state) => state.lessonNode?.error || null;
export const selectSelectedLessonNode = (state) => state.lessonNode?.selectedLessonNode || null;

export default lessonNodeSlice.reducer;