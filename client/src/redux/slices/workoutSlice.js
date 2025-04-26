import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { setLoading } from './uiSlice';

const initialState = {
  workouts: [],
  workout: null,
  pagination: null,
  loading: false,
  error: null,
  filters: {
    isTemplate: '',
    isCompleted: '',
    search: ''
  }
};

// Get all workouts
export const getWorkouts = createAsyncThunk(
  'workouts/getWorkouts',
  async (params, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      const { filters } = getState().workouts;
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.isTemplate !== '') queryParams.append('isTemplate', filters.isTemplate);
      if (filters.isCompleted !== '') queryParams.append('isCompleted', filters.isCompleted);
      
      // Add pagination params
      if (params?.page) queryParams.append('page', params.page);
      if (params?.limit) queryParams.append('limit', params.limit);
      
      // Add sort param
      if (params?.sort) queryParams.append('sort', params.sort);
      
      const response = await api.get(`/workouts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch workouts'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

// Get single workout
export const getWorkout = createAsyncThunk(
  'workouts/getWorkout',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      const response = await api.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch workout'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

// Create workout
export const createWorkout = createAsyncThunk(
  'workouts/createWorkout',
  async (workoutData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      const response = await api.post('/workouts', workoutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create workout'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

// Update workout
export const updateWorkout = createAsyncThunk(
  'workouts/updateWorkout',
  async ({ id, workoutData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      const response = await api.put(`/workouts/${id}`, workoutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update workout'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

// Toggle workout complete
export const toggleWorkoutComplete = createAsyncThunk(
  'workouts/toggleWorkoutComplete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      const response = await api.put(`/workouts/${id}/complete`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to toggle workout completion'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

// Delete workout
export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'workouts', value: true }));
      
      await api.delete(`/workouts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete workout'
      );
    } finally {
      dispatch(setLoading({ key: 'workouts', value: false }));
    }
  }
);

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    clearWorkout: (state) => {
      state.workout = null;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = {
        isTemplate: '',
        isCompleted: '',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Workouts
      .addCase(getWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts = action.payload.data;
        state.pagination = {
          count: action.payload.count,
          ...action.payload.pagination
        };
      })
      .addCase(getWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Workout
      .addCase(getWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workout = action.payload.data;
      })
      .addCase(getWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Workout
      .addCase(createWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts.unshift(action.payload.data);
        state.workout = action.payload.data;
      })
      .addCase(createWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Workout
      .addCase(updateWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workout = action.payload.data;
        state.workouts = state.workouts.map(workout =>
          workout._id === action.payload.data._id
            ? action.payload.data
            : workout
        );
      })
      .addCase(updateWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle Workout Complete
      .addCase(toggleWorkoutComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWorkoutComplete.fulfilled, (state, action) => {
        state.loading = false;
        state.workout = action.payload.data;
        state.workouts = state.workouts.map(workout =>
          workout._id === action.payload.data._id
            ? action.payload.data
            : workout
        );
      })
      .addCase(toggleWorkoutComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Workout
      .addCase(deleteWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts = state.workouts.filter(
          workout => workout._id !== action.payload
        );
        if (state.workout && state.workout._id === action.payload) {
          state.workout = null;
        }
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearWorkout, setFilters, clearFilters, clearError } = workoutSlice.actions;

export default workoutSlice.reducer; 