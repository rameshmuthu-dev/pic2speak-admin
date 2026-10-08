import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const fetchAssetGroups = createAsyncThunk(
  'assetGroups/fetchAssetGroups',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/asset-groups');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createAssetGroup = createAsyncThunk(
  'assetGroups/createAssetGroup',
  async (name, { rejectWithValue }) => {
    try {
      const res = await API.post('/asset-groups', { name });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteAssetGroup = createAsyncThunk(
  'assetGroups/deleteAssetGroup',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/asset-groups/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  items: [], // [{ _id, name }]
  status: 'idle',
  error: null
};

const assetGroupSlice = createSlice({
  name: 'assetGroups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetGroups.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssetGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssetGroups.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createAssetGroup.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteAssetGroup.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload);
      });
  }
});

export default assetGroupSlice.reducer;