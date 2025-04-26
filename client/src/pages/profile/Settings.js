import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar
} from '@mui/material';
import { 
  PhotoCamera, 
  Save, 
  ArrowBack,
  Delete,
  Notifications,
  LockReset,
  Palette,
  DarkMode,
  Settings,
  Info,
  PrivacyTip
} from '@mui/icons-material';
import { 
  updateUserProfile, 
  updatePassword, 
  deleteAccount,
  updateUser,
  clearError,
  updateUserSettings
} from '../../redux/slices/authSlice';
import { toggleDarkMode } from '../../redux/slices/uiSlice';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingButton from '../../components/common/LoadingButton';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Settings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, loading, error, success } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null,
    weightUnit: 'kg',
    heightUnit: 'cm',
    darkMode: false,
    emailNotifications: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    workoutReminders: true,
    progressUpdates: true
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: 'en',
    measurementUnit: 'metric',
    dataSharing: false,
  });
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Load initial user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        weightUnit: user.preferences?.weightUnit || 'kg',
        heightUnit: user.preferences?.heightUnit || 'cm',
        darkMode: user.preferences?.darkMode || false,
        emailNotifications: user.preferences?.emailNotifications !== false
      });
      setAvatarPreview(user.avatar || '');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [user, dispatch]);
  
  // Clear success message after display
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // Reset success state (you would need to add this to your auth slice)
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  useEffect(() => {
    // Load user settings from profile if available
    if (user?.settings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...user.settings
      }));
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setProfileData({
          ...profileData,
          avatar: file
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio,
      avatar: profileData.avatar,
      preferences: {
        weightUnit: profileData.weightUnit,
        heightUnit: profileData.heightUnit,
        darkMode: profileData.darkMode,
        emailNotifications: profileData.emailNotifications
      }
    };
    
    try {
      await dispatch(updateUser(userData)).unwrap();
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is handled by the slice and displayed in the component
    }
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Handle password mismatch (you could add this to your error state)
      return;
    }
    dispatch(updatePassword(passwordData));
  };
  
  const handleDeleteAccount = () => {
    if (confirmDelete) {
      dispatch(deleteAccount());
      // Redirect to login page after successful deletion would be handled in your auth slice
    } else {
      setConfirmDelete(true);
    }
  };
  
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  const saveSettings = () => {
    dispatch(updateUserSettings(settings))
      .unwrap()
      .then(() => {
        setSnackbarMessage('Settings saved successfully');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setSnackbarMessage('Failed to save settings: ' + error.message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="back to profile" 
              onClick={() => navigate('/profile')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} fontSize="large" /> Settings
            </Typography>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} /> App Preferences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleDarkModeToggle}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="unit-label">Measurement Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    id="measurementUnit"
                    value={settings.measurementUnit}
                    onChange={(e) => handleSettingChange('measurementUnit', e.target.value)}
                    label="Measurement Unit"
                  >
                    <MenuItem value="metric">Metric (kg, cm)</MenuItem>
                    <MenuItem value="imperial">Imperial (lb, in)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} /> Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PrivacyTipIcon sx={{ mr: 1 }} /> Privacy
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataSharing}
                  onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                  color="primary"
                />
              }
              label="Allow anonymous data sharing for app improvement"
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveSettings}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </motion.div>
      </motion.div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 