import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { getExercises } from '../../redux/slices/exerciseSlice';
import { createProgressEntry, clearError } from '../../redux/slices/progressSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const CreateProgressEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { 
    exercises, 
    loading: exercisesLoading 
  } = useSelector((state) => state.exercises);
  const { 
    loading: progressLoading, 
    error: progressError 
  } = useSelector((state) => state.progress);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    metrics: {
      weight: { value: '', unit: user?.weightUnit || 'kg' },
      bodyFat: '',
      measurements: {
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        thighs: ''
      }
    },
    personalRecords: [],
    notes: ''
  });
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [openExerciseSelector, setOpenExerciseSelector] = useState(false);

  // Fetch exercises for PR selector
  useEffect(() => {
    dispatch(getExercises({ limit: 50 }));
  }, [dispatch]);

  // Debounce exercise search for PR selector
  useEffect(() => {
    const handler = setTimeout(() => {
      if (exerciseSearchTerm) {
        dispatch(getExercises({ limit: 50, search: exerciseSearchTerm }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [exerciseSearchTerm, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle metric changes
  const handleMetricChange = (metric, field, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric]: { ...prev.metrics[metric], [field]: value }
      }
    }));
  };

  // Handle measurement changes
  const handleMeasurementChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        measurements: { ...prev.metrics.measurements, [field]: value }
      }
    }));
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  // Handle adding a PR
  const handleAddPR = (exercise) => {
    if (exercise && !formData.personalRecords.some(pr => pr.exercise === exercise._id)) {
      setFormData(prev => ({
        ...prev,
        personalRecords: [
          ...prev.personalRecords,
          { 
            exercise: exercise._id,
            exerciseName: exercise.name, // Store name for display
            value: '', 
            unit: user?.weightUnit || 'kg' // Default unit based on user preference or kg
          }
        ]
      }));
    }
    setExerciseSearchTerm('');
    setOpenExerciseSelector(false);
  };

  // Handle removing a PR
  const handleRemovePR = (index) => {
    setFormData(prev => ({
      ...prev,
      personalRecords: prev.personalRecords.filter((_, i) => i !== index)
    }));
  };

  // Handle PR detail change
  const handlePRChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      personalRecords: prev.personalRecords.map((pr, i) => 
        i === index ? { ...pr, [field]: value } : pr
      )
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.date) {
       dispatch(addNotification({ message: 'Please select a date', type: 'warning' }));
       return;
    }
    
    // Clean up empty values before submitting
    const cleanedData = { ...formData };
    if (!cleanedData.metrics.weight.value) delete cleanedData.metrics.weight;
    if (!cleanedData.metrics.bodyFat) delete cleanedData.metrics.bodyFat;
    Object.keys(cleanedData.metrics.measurements).forEach(key => {
      if (!cleanedData.metrics.measurements[key]) {
        delete cleanedData.metrics.measurements[key];
      }
    });
    if (Object.keys(cleanedData.metrics.measurements).length === 0) {
      delete cleanedData.metrics.measurements;
    }
    if (Object.keys(cleanedData.metrics).length === 0) {
       delete cleanedData.metrics;
    }
    cleanedData.personalRecords = cleanedData.personalRecords.filter(pr => pr.value);
    if (cleanedData.personalRecords.length === 0) {
      delete cleanedData.personalRecords;
    }
    if (!cleanedData.notes) delete cleanedData.notes;

    dispatch(createProgressEntry(cleanedData)).then((action) => {
      if (createProgressEntry.fulfilled.match(action)) {
        dispatch(addNotification({ message: 'Progress entry added!', type: 'success' }));
        navigate('/progress');
      } else {
        dispatch(addNotification({ message: progressError || 'Failed to add entry', type: 'error' }));
      }
    });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate('/progress')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              Add Progress Entry
            </Typography>
          </Box>

          {progressError && <Alert severity="error" sx={{ mb: 2 }}>{progressError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Date Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}><Divider sx={{ my: 1 }}><Chip label="Metrics" /></Divider></Grid>
              
              {/* Weight Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Weight"
                  type="number"
                  value={formData.metrics.weight.value}
                  onChange={(e) => handleMetricChange('weight', 'value', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Select
                          variant="standard"
                          disableUnderline
                          value={formData.metrics.weight.unit}
                          onChange={(e) => handleMetricChange('weight', 'unit', e.target.value)}
                          sx={{ ml: 1 }}
                        >
                          <MenuItem value="kg">kg</MenuItem>
                          <MenuItem value="lb">lb</MenuItem>
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              {/* Body Fat Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Body Fat (%)"
                  type="number"
                  value={formData.metrics.bodyFat}
                  onChange={(e) => setFormData(prev => ({ ...prev, metrics: { ...prev.metrics, bodyFat: e.target.value } }))}
                  fullWidth
                />
              </Grid>
              
              {/* Measurements */}
              <Grid item xs={12}><Typography variant="subtitle1">Measurements (cm)</Typography></Grid>
              {Object.keys(formData.metrics.measurements).map(key => (
                  <Grid item xs={6} sm={4} md={2.4} key={key}>
                      <TextField
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          type="number"
                          value={formData.metrics.measurements[key]}
                          onChange={(e) => handleMeasurementChange(key, e.target.value)}
                          fullWidth
                          size="small"
                      />
                  </Grid>
              ))}

              <Grid item xs={12}><Divider sx={{ my: 1 }}><Chip label="Personal Records" /></Divider></Grid>
              
              {/* PR Selector */}
              <Grid item xs={12}>
                <Autocomplete
                  open={openExerciseSelector}
                  onOpen={() => setOpenExerciseSelector(true)}
                  onClose={() => setOpenExerciseSelector(false)}
                  options={exercises.filter(ex => !formData.personalRecords.some(pr => pr.exercise === ex._id))}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  loading={exercisesLoading}
                  onChange={(event, newValue) => handleAddPR(newValue)}
                  inputValue={exerciseSearchTerm}
                  onInputChange={(event, newInputValue) => setExerciseSearchTerm(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add Personal Record for Exercise"
                      placeholder="Search exercises..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {exercisesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              {/* Added PRs List */}
              {formData.personalRecords.map((pr, index) => (
                 <Grid container spacing={1} key={index} alignItems="center" sx={{ p: 1, ml: 1, border: '1px dashed grey', borderRadius: 1, mb: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography>{pr.exerciseName}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                       <TextField 
                        label="Value"
                        type="number"
                        size="small"
                        value={pr.value}
                        onChange={(e) => handlePRChange(index, 'value', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={pr.unit}
                          label="Unit"
                          onChange={(e) => handlePRChange(index, 'unit', e.target.value)}
                        >
                          <MenuItem value="kg">kg</MenuItem>
                          <MenuItem value="lb">lb</MenuItem>
                          <MenuItem value="seconds">seconds</MenuItem>
                          <MenuItem value="minutes">minutes</MenuItem>
                          <MenuItem value="meters">meters</MenuItem>
                          <MenuItem value="km">km</MenuItem>
                          <MenuItem value="miles">miles</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2} textAlign="right">
                      <IconButton onClick={() => handleRemovePR(index)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
              ))}
              
              <Grid item xs={12}><Divider sx={{ my: 1 }}><Chip label="Notes" /></Divider></Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleNotesChange}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={progressLoading}
              >
                {progressLoading ? <CircularProgress size={24} /> : 'Save Entry'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateProgressEntry; 