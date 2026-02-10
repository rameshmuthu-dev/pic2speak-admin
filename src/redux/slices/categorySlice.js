import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api'; 

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/categories');
      return response.data.categories; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.updatedCategory; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/categories/${id}`);
      return id; 
    } catch (error) {
      // Backend status 404 aaga irundhaal "Route not found" message ingae varum
      return rejectWithValue(error.response?.data?.message || "Route not found");
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCategoryState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCategory.pending, (state) => { state.loading = true; })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          state.success = true;
          const index = state.items.findIndex(item => item._id === action.payload._id);
          if (index !== -1) state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true; // Fix: success flag set seiyappattulladhu
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;