import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

/**
 * ASYNC THUNKS
 */

// Handle Admin Login
export const adminLoginThunk = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      // credentials = { email, password }
      const response = await API.post('/admin/login', credentials);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Handle Admin Registration OTP Request
export const adminRegisterOtpThunk = createAsyncThunk(
  'auth/adminRegisterOtp',
  async (adminData, { rejectWithValue }) => {
    try {
      // adminData = { email, password, adminSecretKey }
      const response = await API.post('/admin/register-request', adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP Request failed');
    }
  }
);

/**
 * INITIAL STATE
 * Updated to use 'adminToken' to prevent session collision with the user app.
 */
const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken') || null, // Changed from 'token'
  isAuthenticated: !!localStorage.getItem('adminToken'), // Changed from 'token'
  loading: false,
  error: null,
  otpSent: false, 
};

/**
 * AUTH SLICE
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      // Specifically removing 'adminToken'
      localStorage.removeItem('adminToken'); 
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Login Cases
      .addCase(adminLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        // Storing as 'adminToken' for portal isolation
        localStorage.setItem('adminToken', action.payload.token); 
      })
      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin Registration OTP Cases
      .addCase(adminRegisterOtpThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminRegisterOtpThunk.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(adminRegisterOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;