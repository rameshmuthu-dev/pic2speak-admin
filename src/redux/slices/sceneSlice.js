import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

const BASE_URL = '/scenes';

export const fetchScenes = createAsyncThunk(
  'scene/fetchScenes',
  async (lessonMasterId, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/lesson/${lessonMasterId}`);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load scenes.');
    }
  }
);

export const fetchSceneById = createAsyncThunk(
  'scene/fetchSceneById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load scene.');
    }
  }
);

export const createScene = createAsyncThunk(
  'scene/createScene',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create scene.');
    }
  }
);

export const updateScene = createAsyncThunk(
  'scene/updateScene',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`${BASE_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update scene.');
    }
  }
);

export const changeSceneStatus = createAsyncThunk(
  'scene/changeSceneStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to change scene status.');
    }
  }
);

export const deleteScene = createAsyncThunk(
  'scene/deleteScene',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to delete scene.');
    }
  }
);

const initialState = {
  items: [],
  selectedScene: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

const sceneSlice = createSlice({
  name: 'scene',
  initialState,
  reducers: {
    clearSceneError: (state) => {
      state.error = null;
    },
    clearSelectedScene: (state) => {
      state.selectedScene = null;
    },
    resetSceneItems: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScenes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchScenes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchScenes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchSceneById.fulfilled, (state, action) => {
        state.selectedScene = action.payload;
      })

      .addCase(createScene.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createScene.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createScene.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(updateScene.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateScene.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((s) => s._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateScene.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(changeSceneStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeSceneStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((s) => s._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeSceneStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteScene.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteScene.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSceneError, clearSelectedScene, resetSceneItems } = sceneSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllScenes = (state) => state.scene?.items || EMPTY_ARRAY;
export const selectSceneStatus = (state) => state.scene?.status || 'idle';
export const selectSceneActionStatus = (state) => state.scene?.actionStatus || 'idle';
export const selectSceneError = (state) => state.scene?.error || null;
export const selectSelectedScene = (state) => state.scene?.selectedScene || null;

export default sceneSlice.reducer;