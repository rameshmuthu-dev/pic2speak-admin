import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

/**
 * ASYNC THUNK: Fetch Dashboard Statistics with Range Filtering
 * @param {string} range - Accepts 'today', 'week', 'month', or 'year'
 * This thunk sends the selected range to the backend to get filtered counts.
 */
export const fetchDashboardStatsThunk = createAsyncThunk(
  'admin/fetchStats',
  async (range = 'year', { rejectWithValue }) => {
    try {
      // Sends request to: /api/admin/stats-summary?range=today (or week/month/year)
      const response = await API.get(`/admin/stats-summary?range=${range}`);
      
      // The backend returns an object containing 'stats'
      // Expected structure: { success: true, stats: { totalUsers: 0, userGrowth: [...], ... } }
      return response.data.stats; 
    } catch (error) {
      // Handles API errors and returns a custom error message to the UI
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

/**
 * ASYNC THUNK: Fetch Dynamic System Health Status
 * Checks if MongoDB and Redis are online.
 */
export const fetchSystemHealthThunk = createAsyncThunk(
  'admin/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/health');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'System health check failed'
      );
    }
  }
);

const initialState = {
  stats: {
    totalUsers: 0,
    totalLessons: 0,
    totalSentences: 0,
    totalFeedbacks: 0,
    totalCategories: 0,
    totalTopics: 0,
    averageRating: 0,
    userGrowth: [] // Array used for the AreaChart labels (Hours/Days/Months)
  },
  health: {
    status: 'Checking...',
    details: {
      database: 'Checking...',
      cache: 'Checking...',
      uptime: 0
    }
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Resets the dashboard to initial state (useful on logout)
    resetAdminStats: (state) => {
      state.stats = initialState.stats;
      state.health = initialState.health;
    },
    // Clears any error messages from the UI
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Dashboard Stats Lifecycle ---
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.loading = true; // Triggers the Loading Spinner in the Dashboard
        state.error = null;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Updates all card counts and the chart data with real-time filtered values
        state.stats = action.payload; 
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // --- System Health Lifecycle ---
      .addCase(fetchSystemHealthThunk.fulfilled, (state, action) => {
        state.health.status = action.payload.status;
        state.health.details = action.payload.details;
      })
      .addCase(fetchSystemHealthThunk.rejected, (state) => {
        state.health.status = 'Unhealthy';
        state.health.details = {
          database: 'Disconnected',
          cache: 'Offline',
          uptime: 0
        };
      });
  },
});

export const { resetAdminStats, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;