import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const createFullLesson = createAsyncThunk(
  'lessons/createFull',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/lessons', formData);
      return response.data.newLesson;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Creation failed");
    }
  }
);

export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (level = 'all', { rejectWithValue }) => {
    try {
      const response = await API.get(`/lessons?level=${level}`);
      return response.data.lessons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch lessons");
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/lessons/${id}`);
      return response.data.lesson;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load lesson");
    }
  }
);

export const updateLesson = createAsyncThunk(
  'lessons/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/lessons/${id}`, formData);
      return response.data.updatedLesson;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const deleteLesson = createAsyncThunk(
  'lessons/deleteLesson',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/lessons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

const lessonSlice = createSlice({
  name: 'lessons',
  initialState: {
    items: [],
    currentLesson: null,
    loading: false,
    success: false,
    error: null
  },
  reducers: {
    resetLessonState: (state) => {
      state.success = false;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createFullLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload;
        }
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.success = false;
        }
      );
  }
});

export const { resetLessonState } = lessonSlice.actions;
export default lessonSlice.reducer;