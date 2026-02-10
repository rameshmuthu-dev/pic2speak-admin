import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

/**
 * ASYNC THUNKS
 * All thunks handle multipart/form-data automatically via the formData object.
 */

// Create a new lesson (Topic + Category + Thumbnail + Metadata)
export const createFullLesson = createAsyncThunk(
  'lessons/createFull',
  async (formData, { rejectWithValue }) => {
    try {
      // Note: Axios automatically sets 'Content-Type': 'multipart/form-data' when sending FormData
      const response = await API.post('/lessons', formData);
      return response.data.newLesson;
    } catch (error) {
      // Captures backend error messages (like "Category is required")
      return rejectWithValue(error.response?.data?.message || "Creation failed");
    }
  }
);

// Fetch all lessons (can be filtered by level)
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

// Fetch a single lesson by ID (used for the lesson details/management page)
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

// Update lesson details or thumbnail
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

// Delete a lesson and cleanup its assets
export const deleteLesson = createAsyncThunk(
  'lessons/deleteLesson',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/lessons/${id}`);
      return id; // Return ID to remove it from the local state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

/**
 * LESSON SLICE
 * Manages the global state for lessons in the Pic2Speak app.
 */
const lessonSlice = createSlice({
  name: 'lessons',
  initialState: { 
    items: [],           // Array for the grid view
    currentLesson: null, // Object for the single lesson view
    loading: false, 
    success: false,      // Used to trigger modal closures in UI
    error: null          // Stores backend error messages
  },
  reducers: { 
    // Clears success and error flags so they don't interfere with next actions
    resetLessonState: (state) => { 
      state.success = false; 
      state.error = null;
      state.loading = false;
    } 
  },
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; 
      })

      // CREATE
      .addCase(createFullLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Add the new lesson to the top of the list immediately
        state.items.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update the item in the list
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        
        // Sync currentLesson if we are on the details page
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload;
        }
      })

      // GET BY ID
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })

      // DELETE
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })

      // GLOBAL MATCHERS for Pending and Rejected states
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