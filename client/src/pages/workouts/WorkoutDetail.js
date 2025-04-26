import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Rating,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  Notes as NotesIcon,
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  Repeat as RepeatIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  PauseCircleFilled as PauseCircleFilledIcon,
  StopCircle as StopCircleIcon,
  SentimentSatisfiedAlt as MoodIcon,
  BatteryChargingFull as EnergyIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { getWorkout, deleteWorkout, updateWorkout, clearWorkout } from '../../redux/slices/workoutSlice';
import { addNotification } from '../../redux/slices/uiSlice';

// Helper function to format duration
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Format remaining recovery time (e.g., 23h 15m or Recovered)
const formatRecoveryTime = (endTime) => {
  const now = new Date().getTime();
  const remainingMillis = endTime - now;

  if (remainingMillis <= 0) {
    return "Recovered";
  }

  const hours = Math.floor(remainingMillis / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMillis % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m remaining`;
};

// Recovery Time Configuration (Placeholder)
// Durations in hours
const muscleGroupRecoveryTimes = {
  chest: 48,
  back: 48,
  shoulders: 48,
  glutes: 48,
  quadriceps: 72, // Often need more
  hamstrings: 72, // Often need more
  biceps: 24,
  triceps: 24,
  calves: 24,
  forearms: 24,
  core: 24,
  fullBody: 48, // Average for full body routines
  cardio: 12, // Shorter recovery for cardio focus
  flexibility: 8,
  balance: 8,
  sport: 24, // Depends on sport
  other: 24,
  none: 0,
  default: 48 // Default if group not listed
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { workout, loading, error } = useSelector((state) => state.workouts);
  const { user } = useSelector((state) => state.auth);

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [completedSets, setCompletedSets] = useState({});
  const [setNotes, setSetNotes] = useState({});
  const [editNoteId, setEditNoteId] = useState(null);
  const [currentNote, setCurrentNote] = useState('');

  // Mood and Energy State
  const [preWorkoutMood, setPreWorkoutMood] = useState(3); // Default to neutral
  const [preWorkoutEnergy, setPreWorkoutEnergy] = useState(3); // Default to neutral
  const [postWorkoutMood, setPostWorkoutMood] = useState(3);
  const [postWorkoutEnergy, setPostWorkoutEnergy] = useState(3);
  const [showPostWorkoutRating, setShowPostWorkoutRating] = useState(false);

  // Recovery Timer State
  const [recoveryTimers, setRecoveryTimers] = useState([]);
  const [_, setTick] = useState(0); // State to force re-render for timers

  // Check if we should start the workout immediately
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('start') === 'true') {
      // Reset ratings when starting a workout
      setPreWorkoutMood(3);
      setPreWorkoutEnergy(3);
      setPostWorkoutMood(3);
      setPostWorkoutEnergy(3);
      setShowPostWorkoutRating(false);
      setIsWorkoutActive(true);
    }
  }, [location.search]);

  // Fetch workout data
  useEffect(() => {
    dispatch(getWorkout(id));

    // Cleanup workout state on unmount
    return () => {
      dispatch(clearWorkout());
    }
  }, [dispatch, id]);

  // Initialize completed sets state when workout loads
  useEffect(() => {
    if (workout) {
      const initialCompleted = {};
      const initialNotes = {};
      workout.exercises.forEach((ex, exIndex) => {
        ex.sets.forEach((set, setIndex) => {
          const setId = `${exIndex}-${setIndex}`;
          initialCompleted[setId] = set.completed || false;
          initialNotes[setId] = set.notes || '';
        });
      });
      setCompletedSets(initialCompleted);
      setSetNotes(initialNotes);
    }
  }, [workout]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      const id = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  // Calculate and set recovery timers when a completed workout is loaded
  useEffect(() => {
    if (workout?.isCompleted) {
      const completionTime = new Date(workout.updatedAt).getTime(); // Use updatedAt as proxy
      const workedMuscleGroups = new Set();

      workout.exercises.forEach(ex => {
        ex.exercise?.muscleGroups?.forEach(group => workedMuscleGroups.add(group.toLowerCase()));
        // Consider category if no muscle groups specified (e.g., cardio)
        if (!ex.exercise?.muscleGroups || ex.exercise?.muscleGroups.length === 0) {
            workedMuscleGroups.add(ex.exercise?.category?.toLowerCase() || 'other');
        }
      });

      const timers = Array.from(workedMuscleGroups).map(group => {
        const recoveryHours = muscleGroupRecoveryTimes[group] || muscleGroupRecoveryTimes.default;
        const recoveryMillis = recoveryHours * 60 * 60 * 1000;
        const endTime = completionTime + recoveryMillis;
        const totalDuration = recoveryMillis;
        return {
          group: group.charAt(0).toUpperCase() + group.slice(1),
          endTime,
          totalDuration
         };
      });

      setRecoveryTimers(timers);
    } else {
        setRecoveryTimers([]); // Clear timers if workout not completed
    }
  }, [workout]);

  // Interval to update recovery timers display
  useEffect(() => {
    if (recoveryTimers.length > 0) {
        const intervalId = setInterval(() => {
            setTick(prev => prev + 1); // Trigger re-render
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }
  }, [recoveryTimers]);

  // Handle delete workout
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      dispatch(deleteWorkout(id)).then(() => {
        dispatch(addNotification({ message: 'Workout deleted successfully', type: 'success' }));
        navigate('/workouts');
      }).catch(() => {
        dispatch(addNotification({ message: 'Failed to delete workout', type: 'error' }));
      });
    }
  };

  // Toggle set completion
  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const setId = `${exerciseIndex}-${setIndex}`;
    setCompletedSets(prev => ({ ...prev, [setId]: !prev[setId] }));
  };

  // Navigate to next/previous set/exercise or show post-workout ratings
  const navigateWorkout = (direction) => {
    if (!workout) return;
    const currentExercise = workout.exercises[activeExerciseIndex];
    const isLastSet = activeSetIndex === currentExercise.sets.length - 1;
    const isLastExercise = activeExerciseIndex === workout.exercises.length - 1;

    if (direction === 'next') {
      if (isLastSet && isLastExercise) {
        // Reached the end, show post-workout rating UI
        setShowPostWorkoutRating(true);
      } else if (isLastSet) {
        // Move to next exercise
        setActiveExerciseIndex(activeExerciseIndex + 1);
        setActiveSetIndex(0);
      } else {
        // Move to next set
        setActiveSetIndex(activeSetIndex + 1);
      }
    } else { // previous
      if (activeSetIndex > 0) {
        setActiveSetIndex(activeSetIndex - 1);
      } else if (activeExerciseIndex > 0) {
        setActiveExerciseIndex(activeExerciseIndex - 1);
        setActiveSetIndex(workout.exercises[activeExerciseIndex - 1].sets.length - 1);
      }
    }
  };

  // Handle timer controls
  const handleTimerStart = () => setIsTimerRunning(true);
  const handleTimerPause = () => setIsTimerRunning(false);
  const handleTimerReset = () => setTimer(0);

  // Open note editing dialog
  const handleEditNoteOpen = (exerciseIndex, setIndex) => {
    const setId = `${exerciseIndex}-${setIndex}`;
    setEditNoteId(setId);
    setCurrentNote(setNotes[setId] || '');
  };

  // Close note editing dialog
  const handleEditNoteClose = () => {
    setEditNoteId(null);
    setCurrentNote('');
  };

  // Save note
  const handleSaveNote = () => {
    if (editNoteId) {
      setSetNotes(prev => ({ ...prev, [editNoteId]: currentNote }));
    }
    handleEditNoteClose();
  };

  // Finish workout and save progress (including mood/energy)
  const finishWorkout = async () => {
    setIsTimerRunning(false);
    setShowPostWorkoutRating(false); // Hide rating UI after saving

    if (!workout) return;

    // Prepare updated workout data with completed sets and notes
    const updatedExercises = workout.exercises.map((ex, exIndex) => ({
      ...ex,
      exercise: ex.exercise._id, // Send only ID
      sets: ex.sets.map((set, setIndex) => {
        const setId = `${exIndex}-${setIndex}`;
        return {
          ...set,
          completed: completedSets[setId] || false,
          notes: setNotes[setId] || ''
        };
      })
    }));

    const workoutData = {
      ...workout,
      exercises: updatedExercises,
      isCompleted: true,
      duration: Math.floor(timer / 60),
      preWorkoutMood,
      preWorkoutEnergy,
      postWorkoutMood,
      postWorkoutEnergy
    };

    try {
      await dispatch(updateWorkout({ id: workout._id, workoutData })).unwrap();
      dispatch(addNotification({ message: 'Workout completed and saved!', type: 'success' }));
      navigate('/workouts');
    } catch (err) {
      dispatch(addNotification({ message: `Failed to save workout: ${err.message || err}`, type: 'error' }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  if (!workout) {
    return <Typography>Workout not found.</Typography>;
  }

  const currentExercise = isWorkoutActive ? workout.exercises[activeExerciseIndex] : null;
  const currentSet = currentExercise ? currentExercise.sets[activeSetIndex] : null;
  const currentSetId = currentExercise ? `${activeExerciseIndex}-${activeSetIndex}` : null;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/workouts')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" component="div" sx={{ flexGrow: 1, ml: 1 }}>
              {workout.name}
            </Typography>
            <Box>
              <IconButton
                color="primary"
                component={Link}
                to={`/workouts/edit/${id}`}
              >
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {workout.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {workout.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {workout.isTemplate && <Chip label="Template" color="secondary" size="small" icon={<RepeatIcon />} />}
            {workout.isCompleted && <Chip label="Completed" color="success" size="small" icon={<CheckCircleIcon />} />}
            {workout.schedule?.date && (
              <Chip
                label={`Scheduled: ${new Date(workout.schedule.date).toLocaleDateString()}`}
                size="small"
                icon={<EventIcon />}
              />
            )}
          </Stack>

          {/* Show Recovery Timers if Completed */}
          {workout?.isCompleted && recoveryTimers.length > 0 && (
            <Box sx={{ mt: 3 }}>
               <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                 <RestoreIcon sx={{ mr: 1 }} /> Muscle Group Recovery
               </Typography>
               <Grid container spacing={2}>
                 {recoveryTimers.map(timer => {
                    const now = new Date().getTime();
                    const remainingMillis = Math.max(0, timer.endTime - now);
                    const progress = timer.totalDuration > 0 ? (1 - (remainingMillis / timer.totalDuration)) * 100 : 100;
                    const timeText = formatRecoveryTime(timer.endTime);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={timer.group}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{timer.group}</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 8, borderRadius: 4, my: 0.5 }}
                                color={progress >= 100 ? "success" : "primary"}
                             />
                            <Typography variant="caption" color="text.secondary">
                                {timeText}
                            </Typography>
                        </Box>
                      </Grid>
                    );
                 })}
               </Grid>
            </Box>
          )}

          {!isWorkoutActive && !workout?.isCompleted && (
            <Button
              variant="contained"
              startIcon={<PlayCircleFilledIcon />}
              onClick={() => setIsWorkoutActive(true)}
              sx={{ mt: 2 }}
            >
              Start Workout
            </Button>
          )}
        </Paper>
      </motion.div>

      {/* Workout Player View */}
      {isWorkoutActive && !showPostWorkoutRating && currentExercise && currentSet && (
        <motion.div
          key="player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            {/* Pre-Workout Rating (Show only at the beginning?) - Optional placement*/}
            {activeExerciseIndex === 0 && activeSetIndex === 0 && (
              <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>How are you feeling?</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MoodIcon />
                    <Typography gutterBottom>Mood:</Typography>
                    <Slider
                      value={preWorkoutMood}
                      onChange={(e, newValue) => setPreWorkoutMood(newValue)}
                      aria-labelledby="pre-mood-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={1}
                      max={5}
                    />
                  </Stack>
                   <Stack direction="row" spacing={1} alignItems="center">
                    <EnergyIcon />
                    <Typography gutterBottom>Energy:</Typography>
                    <Slider
                      value={preWorkoutEnergy}
                      onChange={(e, newValue) => setPreWorkoutEnergy(newValue)}
                      aria-labelledby="pre-energy-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={1}
                      max={5}
                    />
                  </Stack>
                </Stack>
              </Box>
            )}

            <Typography variant="h5" fontWeight="medium" gutterBottom>
              {activeExerciseIndex + 1}. {currentExercise.exercise.name}
            </Typography>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Set {activeSetIndex + 1} / {currentExercise.sets.length}
            </Typography>

            <Grid container spacing={2} sx={{ my: 2 }}>
              {currentSet.weight !== undefined && (
                <Grid item xs={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">Weight ({user?.weightUnit || 'kg'})</Typography>
                  <Typography variant="h5">{currentSet.weight}</Typography>
                </Grid>
              )}
              {currentSet.reps !== undefined && (
                <Grid item xs={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">Reps</Typography>
                  <Typography variant="h5">{currentSet.reps}</Typography>
                </Grid>
              )}
              {currentSet.duration !== undefined && (
                <Grid item xs={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="h5">{formatDuration(currentSet.duration)}</Typography>
                </Grid>
              )}
              {currentSet.distance !== undefined && (
                <Grid item xs={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">Distance (m)</Typography>
                  <Typography variant="h5">{currentSet.distance}</Typography>
                </Grid>
              )}
              {currentSet.restTime !== undefined && (
                <Grid item xs={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">Rest</Typography>
                  <Typography variant="h5">{formatDuration(currentSet.restTime)}</Typography>
                </Grid>
              )}
            </Grid>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 2 }}>
              <IconButton onClick={() => handleEditNoteOpen(activeExerciseIndex, activeSetIndex)} size="small">
                <NotesIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {setNotes[currentSetId] || 'Add notes...'}
              </Typography>
            </Stack>

            <Button
              variant={completedSets[currentSetId] ? "outlined" : "contained"}
              startIcon={completedSets[currentSetId] ? null : <CheckCircleIcon />}
              onClick={() => toggleSetComplete(activeExerciseIndex, activeSetIndex)}
              fullWidth
              sx={{ mb: 2 }}
            >
              {completedSets[currentSetId] ? 'Mark as Incomplete' : 'Mark Set as Complete'}
            </Button>

            <Divider sx={{ my: 2 }} />

            {/* Workout Timer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Workout Timer:</Typography>
              <Typography variant="h5" fontWeight="bold">{formatDuration(timer)}</Typography>
              <Stack direction="row" spacing={1}>
                {!isTimerRunning ? (
                  <IconButton onClick={handleTimerStart} color="success">
                    <PlayCircleFilledIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleTimerPause} color="warning">
                    <PauseCircleFilledIcon />
                  </IconButton>
                )}
                <IconButton onClick={handleTimerReset} color="error">
                  <StopCircleIcon />
                </IconButton>
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigateWorkout('prev')}
                disabled={activeExerciseIndex === 0 && activeSetIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={() => navigateWorkout('next')}
              >
                {activeExerciseIndex === workout.exercises.length - 1 && activeSetIndex === currentExercise.sets.length - 1
                  ? 'Finish'
                  : 'Next Set'}
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      )}

      {/* Post-Workout Rating View */}
      {showPostWorkoutRating && (
        <motion.div
          key="rating"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom fontWeight="medium">Workout Complete!</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>Rate your post-workout feeling:</Typography>
              <Stack spacing={3} sx={{ maxWidth: 400, margin: 'auto' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MoodIcon />
                  <Typography gutterBottom>Mood:</Typography>
                  <Slider
                    value={postWorkoutMood}
                    onChange={(e, newValue) => setPostWorkoutMood(newValue)}
                    aria-labelledby="post-mood-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={5}
                  />
                </Stack>
                 <Stack direction="row" spacing={1} alignItems="center">
                  <EnergyIcon />
                  <Typography gutterBottom>Energy:</Typography>
                  <Slider
                    value={postWorkoutEnergy}
                    onChange={(e, newValue) => setPostWorkoutEnergy(newValue)}
                    aria-labelledby="post-energy-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={5}
                  />
                </Stack>
              </Stack>
              <Button
                variant="contained"
                onClick={finishWorkout}
                sx={{ mt: 4 }}
                size="large"
              >
                Save & Finish Workout
              </Button>
          </Paper>
        </motion.div>
      )}

      {/* Static Workout View (when not active and not rating) */}
      {!isWorkoutActive && !showPostWorkoutRating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="medium" gutterBottom>
              Exercises
            </Typography>
            <List>
              {workout.exercises.map((ex, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <FitnessCenterIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${index + 1}. ${ex.exercise.name}`}
                      secondary={`(${ex.sets.length} sets)`}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <List disablePadding sx={{ pl: 4 }}>
                    {ex.sets.map((set, setIndex) => (
                      <ListItem key={setIndex} dense>
                        <ListItemText
                          primary={`Set ${set.setNumber}:
                            ${set.reps ? `${set.reps} reps` : ''}
                            ${set.weight ? ` @ ${set.weight} ${user?.weightUnit || 'kg'}` : ''}
                            ${set.duration ? ` for ${formatDuration(set.duration)}` : ''}
                            ${set.distance ? ` for ${set.distance}m` : ''}
                            ${set.restTime ? ` (Rest: ${formatDuration(set.restTime)})` : ''}
                          `}
                          secondary={set.notes}
                          secondaryTypographyProps={{ fontStyle: 'italic' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {ex.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 1 }}>
                      <i>Exercise Notes: {ex.notes}</i>
                    </Typography>
                  )}
                  {index < workout.exercises.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </List>
          </Paper>
        </motion.div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={editNoteId !== null} onClose={handleEditNoteClose} fullWidth maxWidth="xs">
        <DialogTitle>Edit Set Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={3}
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditNoteClose}>Cancel</Button>
          <Button onClick={handleSaveNote}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutDetail;