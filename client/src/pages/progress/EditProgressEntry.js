import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
import { 
  getProgressEntry, 
  updateProgressEntry, 
  clearError, 
  clearProgressEntry 
} from '../../redux/slices/progressSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const EditProgressEntry = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { 
    exercises, 
    loading: exercisesLoading 
  } = useSelector((state) => state.exercises);
  const { 
    progressEntry, 
    loading: progressLoading, 
    error: progressError 
  } = useSelector((state) => state.progress);

  const [formData, setFormData] = useState({
    date: '',
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

  // Fetch progress entry data
  useEffect(() => {
    dispatch(getProgressEntry(id));
    
    // Cleanup on unmount
    return () => {
      dispatch(clearProgressEntry());
    }
  }, [dispatch, id]);

  // Populate form when data loads
  useEffect(() => {
    if (progressEntry) {
      // Pre-populate PRs with exercise names if possible
      const populatedPRs = progressEntry.personalRecords?.map(pr => ({
        ...pr,
        exerciseName: exercises.find(ex => ex._id === pr.exercise)?.name || 'Unknown Exercise'
      })) || [];
      
      setFormData({
        date: new Date(progressEntry.date).toISOString().split('T')[0],
        metrics: {
          weight: progressEntry.metrics?.weight || { value: '', unit: user?.weightUnit || 'kg' },
          bodyFat: progressEntry.metrics?.bodyFat || '',
          measurements: progressEntry.metrics?.measurements || {
            chest: '', waist: '', hips: '', biceps: '', thighs: ''
          }
        },
        personalRecords: populatedPRs,
        notes: progressEntry.notes || ''
      });
    }
  }, [progressEntry, exercises, user?.weightUnit]);

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

  // --- Handlers (mostly same as CreateProgressEntry) ---

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
            exerciseName: exercise.name, 
            value: '', 
            unit: user?.weightUnit || 'kg'
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

  // Handle form submission (Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date) {
       dispatch(addNotification({ message: 'Please select a date', type: 'warning' }));
       return;
    }
    
    // Clean up empty values and structure for update
    const cleanedData = { ...formData };
    // Ensure metric objects exist if any sub-field has value
    if (!cleanedData.metrics?.weight?.value) delete cleanedData.metrics.weight;
    if (!cleanedData.metrics?.bodyFat) delete cleanedData.metrics.bodyFat;
    
    let hasMeasurement = false;
    if (cleanedData.metrics?.measurements) {
        Object.keys(cleanedData.metrics.measurements).forEach(key => {
            if (!cleanedData.metrics.measurements[key]) {
                delete cleanedData.metrics.measurements[key];
            } else {
                hasMeasurement = true;
            }
        });
        if (!hasMeasurement) delete cleanedData.metrics.measurements;
    }
    if (!cleanedData.metrics?.weight?.value && !cleanedData.metrics?.bodyFat && !hasMeasurement) {
        delete cleanedData.metrics; 
    }
    
    cleanedData.personalRecords = cleanedData.personalRecords?.filter(pr => pr.value).map(pr => ({ // Keep only needed fields for update
      exercise: pr.exercise,
      value: pr.value,
      unit: pr.unit,
      date: pr.date || formData.date // Use entry date if PR date not set
    })) || [];
    if (cleanedData.personalRecords.length === 0) delete cleanedData.personalRecords;
    
    if (!cleanedData.notes) delete cleanedData.notes;

    dispatch(updateProgressEntry({ id, progressData: cleanedData })).then((action) => {
      if (updateProgressEntry.fulfilled.match(action)) {
        dispatch(addNotification({ message: 'Progress entry updated!', type: 'success' }));
        navigate('/progress');
      } else {
        dispatch(addNotification({ message: progressError || 'Failed to update entry', type: 'error' }));
      }
    });
  };

  if (progressLoading && !progressEntry) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
              Edit Progress Entry
            </Typography>
          </Box>

          {progressError && <Alert severity="error" sx={{ mb: 2 }}>{progressError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Fields are same as CreateProgressEntry, populated with data */}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Body Fat (%)"
                  type="number"
                  value={formData.metrics.bodyFat}
                  onChange={(e) => setFormData(prev => ({ ...prev, metrics: { ...prev.metrics, bodyFat: e.target.value } }))}
                  fullWidth
                />
              </Grid>
              
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
              
              {formData.personalRecords.map((pr, index) => (
                 <Grid container spacing={1} key={index} alignItems="center" sx={{ p: 1, ml: 1, border: '1px dashed grey', borderRadius: 1, mb: 1 }}>
                     <Grid item xs={12} sm={4}>
                       <Typography>{pr.exerciseName || 'Loading exercise...'}</Typography>
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
                {progressLoading ? <CircularProgress size={24} /> : 'Update Entry'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default EditProgressEntry; 