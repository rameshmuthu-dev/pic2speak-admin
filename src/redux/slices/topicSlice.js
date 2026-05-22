import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const fetchTopicsByCategory = createAsyncThunk(
  'topics/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/topics/${categoryId}`);
      return response.data.topics; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load topics");
    }
  }
);

export const createTopic = createAsyncThunk(
  'topics/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/topics', formData);
      return response.data.topic;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create topic");
    }
  }
);

export const updateTopic = createAsyncThunk(
  'topics/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/topics/${id}`, formData);
      return response.data.topic;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update topic");
    }
  }
);

export const deleteTopic = createAsyncThunk(
  'topics/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/topics/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete topic");
    }
  }
);

const topicSlice = createSlice({
  name: 'topics',
  initialState: {
    items: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetTopicState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopicsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true; 
        state.items = state.items.filter((topic) => topic._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export const { resetTopicState } = topicSlice.actions;
export default topicSlice.reducer;