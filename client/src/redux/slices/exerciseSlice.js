import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { setLoading } from './uiSlice';

const initialState = {
  exercises: [],
  exercise: null,
  pagination: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    muscleGroups: '',
    equipmentNeeded: '',
    search: ''
  }
};

// Get all exercises
export const getExercises = createAsyncThunk(
  'exercises/getExercises',
  async (params, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading({ key: 'exercises', value: true }));
      
      const { filters } = getState().exercises;
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.muscleGroups) queryParams.append('muscleGroups', filters.muscleGroups);
      if (filters.equipmentNeeded) queryParams.append('equipmentNeeded', filters.equipmentNeeded);
      
      // Add pagination params
      if (params?.page) queryParams.append('page', params.page);
      if (params?.limit) queryParams.append('limit', params.limit);
      
      // Add sort param
      if (params?.sort) queryParams.append('sort', params.sort);
      
      const response = await api.get(`/exercises?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch exercises'
      );
    } finally {
      dispatch(setLoading({ key: 'exercises', value: false }));
    }
  }
);

// Get single exercise
export const getExercise = createAsyncThunk(
  'exercises/getExercise',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'exercises', value: true }));
      
      const response = await api.get(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch exercise'
      );
    } finally {
      dispatch(setLoading({ key: 'exercises', value: false }));
    }
  }
);

// Create exercise
export const createExercise = createAsyncThunk(
  'exercises/createExercise',
  async (exerciseData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'exercises', value: true }));
      
      const response = await api.post('/exercises', exerciseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create exercise'
      );
    } finally {
      dispatch(setLoading({ key: 'exercises', value: false }));
    }
  }
);

// Update exercise
export const updateExercise = createAsyncThunk(
  'exercises/updateExercise',
  async ({ id, exerciseData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'exercises', value: true }));
      
      const response = await api.put(`/exercises/${id}`, exerciseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update exercise'
      );
    } finally {
      dispatch(setLoading({ key: 'exercises', value: false }));
    }
  }
);

// Delete exercise
export const deleteExercise = createAsyncThunk(
  'exercises/deleteExercise',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: 'exercises', value: true }));
      
      await api.delete(`/exercises/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete exercise'
      );
    } finally {
      dispatch(setLoading({ key: 'exercises', value: false }));
    }
  }
);

const exerciseSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearExercise: (state) => {
      state.exercise = null;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        muscleGroups: '',
        equipmentNeeded: '',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Exercises
      .addCase(getExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExercises.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises = action.payload.data;
        state.pagination = {
          count: action.payload.count,
          ...action.payload.pagination
        };
      })
      .addCase(getExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Exercise
      .addCase(getExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExercise.fulfilled, (state, action) => {
        state.loading = false;
        state.exercise = action.payload.data;
      })
      .addCase(getExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Exercise
      .addCase(createExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExercise.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises.unshift(action.payload.data);
      })
      .addCase(createExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Exercise
      .addCase(updateExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExercise.fulfilled, (state, action) => {
        state.loading = false;
        state.exercise = action.payload.data;
        state.exercises = state.exercises.map(exercise =>
          exercise._id === action.payload.data._id
            ? action.payload.data
            : exercise
        );
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Exercise
      .addCase(deleteExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises = state.exercises.filter(
          exercise => exercise._id !== action.payload
        );
        if (state.exercise && state.exercise._id === action.payload) {
          state.exercise = null;
        }
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearExercise, setFilters, clearFilters, clearError } = exerciseSlice.actions;

export default exerciseSlice.reducer; 