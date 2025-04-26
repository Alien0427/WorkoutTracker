import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
  Switch,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ArrowBack as ArrowBackIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { getExercises, clearError as clearExerciseError } from '../../redux/slices/exerciseSlice';
import { createWorkout, clearError as clearWorkoutError } from '../../redux/slices/workoutSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const CreateWorkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const template = location.state?.template;
  
  const { 
    exercises, 
    loading: exercisesLoading, 
    error: exercisesError 
  } = useSelector((state) => state.exercises);
  const { 
    loading: workoutLoading, 
    error: workoutError 
  } = useSelector((state) => state.workouts);

  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [openExerciseSelector, setOpenExerciseSelector] = useState(false);
  
  // Fetch exercises for the selector
  useEffect(() => {
    dispatch(getExercises({ limit: 100 }));
  }, [dispatch]);
  
  // Populate form if template data exists
  useEffect(() => {
    if (template && exercises.length > 0) { 
      setWorkoutName(`${template.name} (Copy)`);
      setDescription(template.description || '');
      setIsTemplate(false);
      setScheduledDate(null);
      
      const populatedTemplateExercises = template.exercises.map(templateEx => {
        const fullExercise = exercises.find(ex => ex._id === templateEx.exercise || ex._id === templateEx.exercise?._id); 
        
        if (!fullExercise) {
          console.warn(`Exercise with ID ${templateEx.exercise} from template not found in fetched list.`);
          return null;
        }
        
        return {
          exercise: fullExercise,
          sets: templateEx.sets.map((set, index) => ({
            setNumber: set.setNumber || index + 1,
            reps: set.reps || '',
            weight: set.weight || '',
            duration: set.duration || '',
            distance: set.distance || '',
            restTime: set.restTime || '',
            notes: set.notes || ''
          }))
        };
      }).filter(ex => ex !== null);
      
      setSelectedExercises(populatedTemplateExercises);
    }
  }, [template, exercises]);
  
  // Debounce exercise search
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
      dispatch(clearWorkoutError());
      dispatch(clearExerciseError());
    };
  }, [dispatch]);

  // Handle adding an exercise to the workout
  const handleAddExercise = (exercise) => {
    if (exercise && !selectedExercises.some(ex => ex.exercise._id === exercise._id)) {
      setSelectedExercises([
        ...selectedExercises,
        { 
          exercise: exercise,
          sets: [{ setNumber: 1, reps: 10, weight: 0, restTime: 60 }]
        }
      ]);
    }
    setExerciseSearchTerm('');
    setOpenExerciseSelector(false);
  };

  // Handle removing an exercise from the workout
  const handleRemoveExercise = (index) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };

  // Handle adding a set to an exercise
  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...selectedExercises];
    const lastSetNumber = updatedExercises[exerciseIndex].sets.length > 0
      ? updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1].setNumber
      : 0;
    updatedExercises[exerciseIndex].sets.push({
      setNumber: lastSetNumber + 1,
      reps: 10,
      weight: 0,
      restTime: 60
    });
    setSelectedExercises(updatedExercises);
  };

  // Handle removing a set from an exercise
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.map((set, i) => ({ ...set, setNumber: i + 1 }));
    setSelectedExercises(updatedExercises);
  };

  // Handle set detail change
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setSelectedExercises(updatedExercises);
  };

  // Handle saving the workout
  const handleSaveWorkout = () => {
    if (!workoutName) {
      dispatch(addNotification({ message: 'Please enter a workout name', type: 'warning' }));
      return;
    }
    if (selectedExercises.length === 0) {
      dispatch(addNotification({ message: 'Please add at least one exercise', type: 'warning' }));
      return;
    }

    const workoutData = {
      name: workoutName,
      description,
      isTemplate,
      schedule: scheduledDate ? { date: scheduledDate } : undefined,
      exercises: selectedExercises.map(ex => ({
        exercise: ex.exercise._id,
        sets: ex.sets.map(set => ({
          setNumber: set.setNumber,
          reps: parseInt(set.reps, 10) || undefined,
          weight: parseFloat(set.weight) || undefined,
          duration: parseInt(set.duration, 10) || undefined,
          distance: parseFloat(set.distance) || undefined,
          restTime: parseInt(set.restTime, 10) || undefined,
          notes: set.notes || undefined
        }))
      }))
    };
    
    dispatch(createWorkout(workoutData)).then((action) => {
      if (createWorkout.fulfilled.match(action)) {
        dispatch(addNotification({ message: 'Workout created successfully!', type: 'success' }));
        navigate(`/workouts/${action.payload.data._id}`);
      } else {
        dispatch(addNotification({ message: workoutError || 'Failed to create workout', type: 'error' }));
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/workouts')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              {template ? 'Create Workout from Template' : 'Create New Workout'}
            </Typography>
          </Box>

          {workoutError && <Alert severity="error" sx={{ mb: 2 }}>{workoutError}</Alert>}
          {exercisesError && <Alert severity="error" sx={{ mb: 2 }}>{exercisesError}</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Workout Name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={1}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Schedule Date (Optional)"
                type="date"
                value={scheduledDate || ''}
                onChange={(e) => setScheduledDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} />}
                label="Save as Template"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }}><Chip label="Exercises" /></Divider>

          <Autocomplete
            open={openExerciseSelector}
            onOpen={() => setOpenExerciseSelector(true)}
            onClose={() => setOpenExerciseSelector(false)}
            options={exercises}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            loading={exercisesLoading}
            onChange={(event, newValue) => handleAddExercise(newValue)}
            inputValue={exerciseSearchTerm}
            onInputChange={(event, newInputValue) => setExerciseSearchTerm(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Exercise"
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
            sx={{ mb: 3 }}
          />

          {selectedExercises.map((selectedEx, exIndex) => (
            <Paper key={exIndex} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="medium">
                  {exIndex + 1}. {selectedEx.exercise?.name || 'Exercise loading...'}
                </Typography>
                <IconButton onClick={() => handleRemoveExercise(exIndex)} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              {selectedEx.sets.map((set, setIndex) => (
                <Grid container spacing={1} key={setIndex} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={1}><Typography align="center">{set.setNumber}.</Typography></Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField 
                      label="Reps"
                      type="number"
                      size="small"
                      value={set.reps || ''}
                      onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField 
                      label="Weight"
                      type="number"
                      size="small"
                      value={set.weight || ''}
                      onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField 
                      label="Duration (s)"
                      type="number"
                      size="small"
                      value={set.duration || ''}
                      onChange={(e) => handleSetChange(exIndex, setIndex, 'duration', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField 
                      label="Rest (s)"
                      type="number"
                      size="small"
                      value={set.restTime || ''}
                      onChange={(e) => handleSetChange(exIndex, setIndex, 'restTime', e.target.value)}
                    />
                  </Grid>
                   <Grid item xs={12} sm={2} textAlign="right">
                    <IconButton onClick={() => handleRemoveSet(exIndex, setIndex)} size="small" color="warning">
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button 
                size="small" 
                startIcon={<AddIcon />} 
                onClick={() => handleAddSet(exIndex)} 
                sx={{ mt: 1 }}
              >
                Add Set
              </Button>
            </Paper>
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSaveWorkout}
              disabled={workoutLoading}
            >
              {workoutLoading ? <CircularProgress size={24} /> : 'Save Workout'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateWorkout; 