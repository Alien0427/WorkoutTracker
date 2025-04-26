import { createSlice } from '@reduxjs/toolkit';
import { loadUser } from './authSlice';

// Check if dark mode is set in local storage, otherwise use system preference
const getInitialDarkMode = () => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    return savedDarkMode === 'true';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState = {
  darkMode: getInitialDarkMode(),
  sidebarOpen: window.innerWidth > 900, // Open by default on larger screens
  isMobileView: window.innerWidth < 768,
  notifications: [],
  loading: {
    global: false,
    workouts: false,
    exercises: false,
    progress: false
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setMobileView: (state, action) => {
      state.isMobileView = action.payload;
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        show: true
      });
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      if (key in state.loading) {
        state.loading[key] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        // Sync dark mode setting with user preference from server if available
        if (action.payload.data && action.payload.data.darkMode !== undefined) {
          state.darkMode = action.payload.data.darkMode;
          localStorage.setItem('darkMode', state.darkMode);
        }
      });
  }
});

export const {
  toggleDarkMode,
  toggleSidebar,
  setSidebarOpen,
  setMobileView,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading
} = uiSlice.actions;

export default uiSlice.reducer; 