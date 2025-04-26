import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import exerciseReducer from './slices/exerciseSlice';
import workoutReducer from './slices/workoutSlice';
import progressReducer from './slices/progressSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    exercises: exerciseReducer,
    workouts: workoutReducer,
    progress: progressReducer,
    ui: uiReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store; 