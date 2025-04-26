import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// Theme
import { darkTheme, lightTheme } from './theme';

// Redux actions
import { loadUser } from './redux/slices/authSlice';
import { setMobileView } from './redux/slices/uiSlice';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleCallback from './pages/auth/GoogleCallback';

// Main app pages
import Dashboard from './pages/Dashboard';
import Workouts from './pages/workouts/Workouts';
import WorkoutDetail from './pages/workouts/WorkoutDetail';
import CreateWorkout from './pages/workouts/CreateWorkout';
import EditWorkout from './pages/workouts/EditWorkout';
import Exercises from './pages/exercises/Exercises';
import ExerciseDetail from './pages/exercises/ExerciseDetail';
import CreateExercise from './pages/exercises/CreateExercise';
import EditExercise from './pages/exercises/EditExercise';
import Progress from './pages/progress/Progress';
import CreateProgressEntry from './pages/progress/CreateProgressEntry';
import EditProgressEntry from './pages/progress/EditProgressEntry';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Import the new Suggestions component
import Suggestions from './pages/suggestions/Suggestions';

// Import the new Leaderboard component
import Leaderboard from './pages/leaderboard/Leaderboard';

// Import the new BodyStats component
import BodyStats from './pages/bodyStats/BodyStats';

// Import the new Insights component
import Insights from './pages/insights/Insights';

function App() {
  const dispatch = useDispatch();
  const { darkMode, isMobileView } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Load user data on app init if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      dispatch(setMobileView(window.innerWidth < 768));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <PrivateRoute>
                  <Workouts />
                </PrivateRoute>
              }
            />
            <Route
              path="/workouts/:id"
              element={
                <PrivateRoute>
                  <WorkoutDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/workouts/create"
              element={
                <PrivateRoute>
                  <CreateWorkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/workouts/edit/:id"
              element={
                <PrivateRoute>
                  <EditWorkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <PrivateRoute>
                  <Exercises />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises/:id"
              element={
                <PrivateRoute>
                  <ExerciseDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises/create"
              element={
                <PrivateRoute>
                  <CreateExercise />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises/edit/:id"
              element={
                <PrivateRoute>
                  <EditExercise />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <PrivateRoute>
                  <Progress />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress/create"
              element={
                <PrivateRoute>
                  <CreateProgressEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress/edit/:id"
              element={
                <PrivateRoute>
                  <EditProgressEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/body-stats"
              element={
                <PrivateRoute>
                  <BodyStats />
                </PrivateRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <PrivateRoute>
                  <Insights />
                </PrivateRoute>
              }
            />
            <Route
              path="/suggestions"
              element={
                <PrivateRoute>
                  <Suggestions />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App; 