import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const createSubLesson = createAsyncThunk('subLessons/create', async (subLessonData, { rejectWithValue }) => {
  try {
    const response = await API.post('/sublessons', subLessonData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Creation failed");
  }
});

export const fetchSubLessonsByLesson = createAsyncThunk('subLessons/fetchByLesson', async (lessonId, { rejectWithValue }) => {
  try {
    const response = await API.get(`/sublessons/lesson/${lessonId}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch sub-lessons");
  }
});

export const fetchSubLessonById = createAsyncThunk('subLessons/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/sublessons/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to load sub-lesson");
  }
});

export const updateSubLesson = createAsyncThunk('subLessons/update', async ({ id, updateData }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/sublessons/${id}`, updateData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Update failed");
  }
});

export const deleteSubLesson = createAsyncThunk('subLessons/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/sublessons/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Delete failed");
  }
});

export const addSentenceToSubLesson = createAsyncThunk('subLessons/addSentence', async ({ subLessonId, sentenceData }, { rejectWithValue }) => {
  try {
    const response = await API.post(`/sublessons/${subLessonId}/sentence`, sentenceData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add sentence");
  }
});

export const updateSentenceInSubLesson = createAsyncThunk('subLessons/updateSentence', async ({ subLessonId, sentenceId, updateData }, { rejectWithValue }) => {
  try {
    await API.put(`/sublessons/${subLessonId}/sentence/${sentenceId}`, updateData);
    return { sentenceId, updateData };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update sentence");
  }
});

export const deleteSentenceFromSubLesson = createAsyncThunk('subLessons/deleteSentence', async ({ subLessonId, sentenceId }, { rejectWithValue }) => {
  try {
    await API.delete(`/sublessons/${subLessonId}/sentence/${sentenceId}`);
    return { sentenceId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete sentence");
  }
});

const subLessonSlice = createSlice({
  name: 'subLessons',
  initialState: {
    subItems: [],
    currentSubLesson: null,
    loading: false,
    success: false,
    error: null
  },
  reducers: {
    resetSubLessonState: (state) => {
      state.success = false;
      state.error = null;
      state.loading = false;
    },
    clearCurrentSubLesson: (state) => {
      state.currentSubLesson = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubLessonsByLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.subItems = action.payload || [];
      })
      .addCase(createSubLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.subItems.push(action.payload);
      })
      .addCase(updateSubLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.subItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) state.subItems[index] = action.payload;
      })
      .addCase(fetchSubLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubLesson = action.payload;
      })
      .addCase(deleteSubLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.subItems = state.subItems.filter((item) => item._id !== action.payload);
      })
      .addCase(addSentenceToSubLesson.fulfilled, (state, action) => {
        if (state.currentSubLesson) state.currentSubLesson.content = action.payload;
      })
      .addCase(updateSentenceInSubLesson.fulfilled, (state, action) => {
        if (state.currentSubLesson) {
          const index = state.currentSubLesson.content.findIndex(s => s._id === action.payload.sentenceId);
          if (index !== -1) {
            state.currentSubLesson.content[index] = { ...state.currentSubLesson.content[index], ...action.payload.updateData };
          }
        }
      })
      .addCase(deleteSentenceFromSubLesson.fulfilled, (state, action) => {
        if (state.currentSubLesson) {
          state.currentSubLesson.content = state.currentSubLesson.content.filter(s => s._id !== action.payload.sentenceId);
        }
      })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetSubLessonState, clearCurrentSubLesson } = subLessonSlice.actions;
export default subLessonSlice.reducer;