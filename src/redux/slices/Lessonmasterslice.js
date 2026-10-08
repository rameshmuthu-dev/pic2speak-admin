import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

const BASE_URL = '/lesson-masters';

export const fetchLessonMasters = createAsyncThunk(
  'lessonMaster/fetchLessonMasters',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get(BASE_URL);
      const responseData = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lessons.');
    }
  }
);

export const fetchLessonMasterById = createAsyncThunk(
  'lessonMaster/fetchLessonMasterById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`${BASE_URL}/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to load lesson.');
    }
  }
);

export const createLessonMaster = createAsyncThunk(
  'lessonMaster/createLessonMaster',
  async ({ order, completionXP, rewardCoins, accessType }, { rejectWithValue }) => {
    try {
      const res = await API.post(BASE_URL, { order, completionXP, rewardCoins, accessType });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to create lesson.');
    }
  }
);

export const updateLessonMaster = createAsyncThunk(
  'lessonMaster/updateLessonMaster',
  async ({ id, order, completionXP, rewardCoins, accessType }, { rejectWithValue }) => {
    try {
      const res = await API.put(`${BASE_URL}/${id}`, { order, completionXP, rewardCoins, accessType });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to update lesson.');
    }
  }
);

export const changeLessonMasterStatus = createAsyncThunk(
  'lessonMaster/changeLessonMasterStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to change lesson status.');
    }
  }
);

export const deleteLessonMaster = createAsyncThunk(
  'lessonMaster/deleteLessonMaster',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to delete lesson.');
    }
  }
);

const initialState = {
  items: [],
  selectedLessonMaster: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

const lessonMasterSlice = createSlice({
  name: 'lessonMaster',
  initialState,
  reducers: {
    clearLessonMasterError: (state) => {
      state.error = null;
    },
    clearSelectedLessonMaster: (state) => {
      state.selectedLessonMaster = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonMasters.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLessonMasters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLessonMasters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchLessonMasterById.fulfilled, (state, action) => {
        state.selectedLessonMaster = action.payload;
      })

      .addCase(createLessonMaster.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createLessonMaster.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createLessonMaster.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(updateLessonMaster.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateLessonMaster.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((l) => l._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateLessonMaster.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(changeLessonMasterStatus.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(changeLessonMasterStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.items.findIndex((l) => l._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(changeLessonMasterStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteLessonMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      })
      .addCase(deleteLessonMaster.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearLessonMasterError, clearSelectedLessonMaster } = lessonMasterSlice.actions;

const EMPTY_ARRAY = [];

export const selectAllLessonMasters = (state) => state.lessonMaster?.items || EMPTY_ARRAY;
export const selectLessonMasterStatus = (state) => state.lessonMaster?.status || 'idle';
export const selectLessonMasterActionStatus = (state) => state.lessonMaster?.actionStatus || 'idle';
export const selectLessonMasterError = (state) => state.lessonMaster?.error || null;
export const selectSelectedLessonMaster = (state) => state.lessonMaster?.selectedLessonMaster || null;

export default lessonMasterSlice.reducer;