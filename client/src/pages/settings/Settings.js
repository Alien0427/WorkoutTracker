import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Switch, FormControlLabel, Grid, Divider, Button, Box, TextField, MenuItem, Select, FormControl, InputLabel, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { setThemeMode } from '../../redux/slices/uiSlice';
import { updateUser } from '../../redux/slices/authSlice';
import Layout from '../../components/layout/Layout';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { themeMode } = useSelector((state) => state.ui);

  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    height: '',
    weight: '',
    fitnessGoal: ''
  });

  const [preferences, setPreferences] = useState({
    darkMode: themeMode === 'dark',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    measurementUnit: 'metric'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        height: user.height || '',
        weight: user.weight || '',
        fitnessGoal: user.fitnessGoal || ''
      });
    }
  }, [user]);

  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      darkMode: themeMode === 'dark'
    }));
  }, [themeMode]);

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked
    });

    if (name === 'darkMode') {
      dispatch(setThemeMode(checked ? 'dark' : 'light'));
    }
  };

  const handleUnitChange = (e) => {
    setPreferences({
      ...preferences,
      measurementUnit: e.target.value
    });
  };

  const handleSaveSettings = () => {
    const userData = {
      ...personalInfo,
      preferences: {
        darkMode: preferences.darkMode,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        weeklyReports: preferences.weeklyReports,
        measurementUnit: preferences.measurementUnit
      }
    };

    dispatch(updateUser(userData));
    setSaveSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Height"
                      name="height"
                      value={personalInfo.height}
                      onChange={handlePersonalInfoChange}
                      margin="normal"
                      InputProps={{
                        endAdornment: <Typography variant="body2">{preferences.measurementUnit === 'metric' ? 'cm' : 'in'}</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Weight"
                      name="weight"
                      value={personalInfo.weight}
                      onChange={handlePersonalInfoChange}
                      margin="normal"
                      InputProps={{
                        endAdornment: <Typography variant="body2">{preferences.measurementUnit === 'metric' ? 'kg' : 'lb'}</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Fitness Goal"
                      name="fitnessGoal"
                      value={personalInfo.fitnessGoal}
                      onChange={handlePersonalInfoChange}
                      margin="normal"
                      select
                    >
                      <MenuItem value="weight_loss">Weight Loss</MenuItem>
                      <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                      <MenuItem value="strength">Strength</MenuItem>
                      <MenuItem value="endurance">Endurance</MenuItem>
                      <MenuItem value="flexibility">Flexibility</MenuItem>
                      <MenuItem value="general_fitness">General Fitness</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.darkMode}
                      onChange={handlePreferenceChange}
                      name="darkMode"
                    />
                  }
                  label="Dark Mode"
                />
                
                <Box mt={2}>
                  <FormControl fullWidth>
                    <InputLabel id="unit-label">Measurement Units</InputLabel>
                    <Select
                      labelId="unit-label"
                      value={preferences.measurementUnit}
                      onChange={handleUnitChange}
                      label="Measurement Units"
                    >
                      <MenuItem value="metric">Metric (kg, cm)</MenuItem>
                      <MenuItem value="imperial">Imperial (lb, in)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={handlePreferenceChange}
                      name="emailNotifications"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.pushNotifications}
                      onChange={handlePreferenceChange}
                      name="pushNotifications"
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.weeklyReports}
                      onChange={handlePreferenceChange}
                      name="weeklyReports"
                    />
                  }
                  label="Weekly Progress Reports"
                />
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>

          <Snackbar
            open={saveSuccess}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity="success">
              Settings saved successfully!
            </Alert>
          </Snackbar>
        </Container>
      </motion.div>
    </Layout>
  );
};

export default Settings; 