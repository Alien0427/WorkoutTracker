import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { setLoading } from './uiSlice';

const initialState = {
  progressEntries: [],
  progressEntry: null,
  pagination: null,
  stats: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  }
};

// Get all progress entries
export const getProgressEntries = createAsyncThunk(
  'progress/getProgressEntries',
  async (params, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      const { dateRange } = getState().progress;
      const queryParams = new URLSearchParams();
      
      // Add date range to query params
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      
      // Add pagination params
      if (params?.page) queryParams.append('page', params.page);
      if (params?.limit) queryParams.append('limit', params.limit);
      
      // Add sort param
      if (params?.sort) queryParams.append('sort', params.sort);
      
      const response = await api.get(`/progress?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch progress entries'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

// Get progress statistics
export const getProgressStats = createAsyncThunk(
  'progress/getProgressStats',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      const { dateRange } = getState().progress;
      const queryParams = new URLSearchParams();
      
      // Add date range to query params
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      
      const response = await api.get(`/progress/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch progress statistics'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

// Get single progress entry
export const getProgressEntry = createAsyncThunk(
  'progress/getProgressEntry',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      const response = await api.get(`/progress/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch progress entry'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

// Create progress entry
export const createProgressEntry = createAsyncThunk(
  'progress/createProgressEntry',
  async (progressData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      const response = await api.post('/progress', progressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create progress entry'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

// Update progress entry
export const updateProgressEntry = createAsyncThunk(
  'progress/updateProgressEntry',
  async ({ id, progressData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      const response = await api.put(`/progress/${id}`, progressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update progress entry'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

// Delete progress entry
export const deleteProgressEntry = createAsyncThunk(
  'progress/deleteProgressEntry',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'progress', value: true }));
      
      await api.delete(`/progress/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete progress entry'
      );
    } finally {
      dispatch(setLoading({ key: 'progress', value: false }));
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearProgressEntry: (state) => {
      state.progressEntry = null;
    },
    setDateRange: (state, action) => {
      state.dateRange = {
        ...state.dateRange,
        ...action.payload
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Progress Entries
      .addCase(getProgressEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.progressEntries = action.payload.data;
        state.pagination = {
          count: action.payload.count,
          ...action.payload.pagination
        };
      })
      .addCase(getProgressEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Progress Stats
      .addCase(getProgressStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getProgressStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Progress Entry
      .addCase(getProgressEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.progressEntry = action.payload.data;
      })
      .addCase(getProgressEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Progress Entry
      .addCase(createProgressEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProgressEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.progressEntries.unshift(action.payload.data);
        state.progressEntry = action.payload.data;
      })
      .addCase(createProgressEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Progress Entry
      .addCase(updateProgressEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProgressEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.progressEntry = action.payload.data;
        state.progressEntries = state.progressEntries.map(entry =>
          entry._id === action.payload.data._id
            ? action.payload.data
            : entry
        );
      })
      .addCase(updateProgressEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Progress Entry
      .addCase(deleteProgressEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProgressEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.progressEntries = state.progressEntries.filter(
          entry => entry._id !== action.payload
        );
        if (state.progressEntry && state.progressEntry._id === action.payload) {
          state.progressEntry = null;
        }
      })
      .addCase(deleteProgressEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProgressEntry, setDateRange, clearError } = progressSlice.actions;

export default progressSlice.reducer; 