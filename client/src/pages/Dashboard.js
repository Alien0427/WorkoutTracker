import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Event as EventIcon, 
  ShowChart as ShowChartIcon, 
  FitnessCenter as FitnessCenterIcon,
  AddCircleOutline as AddIcon,
  PlayCircleOutline as PlayIcon,
  Assessment as ProgressIcon,
  History as HistoryIcon,
  CheckCircleOutline as CompletedIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  RestartAlt as ResetIcon,
  Timer as TimerIcon,
  MonitorWeight as WeightIcon,
  Percent as PercentIcon,
  Update as IntervalIcon,
  Restaurant as NutritionIcon,
  Link as LinkIcon
} from '@mui/icons-material';

// Redux actions
import { getWorkouts } from '../redux/slices/workoutSlice';
import { getProgressStats } from '../redux/slices/progressSlice';
import { getExercises } from '../redux/slices/exerciseSlice';

// Helper components
const StatCard = ({ title, value, icon, color }) => (
  <Paper
    component={motion.div}
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 2,
    }}
    whileHover={{ scale: 1.03 }}
  >
    <Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" fontWeight="bold">
        {value}
      </Typography>
    </Box>
    <Box sx={{ color }}>
      {icon}
    </Box>
  </Paper>
);

// Helper function to format duration
const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Placeholder Nutrition Card Component
const NutritionCard = () => {
  // Placeholder state - replace with actual data/connection status
  const isConnected = false; 
  const caloriesIn = 1850; // Dummy data
  const caloriesOut = 2200; // Dummy data

  const handleConnect = () => {
    // TODO: Implement logic to initiate connection flow
    alert('Connection to nutrition service TBD!');
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="medium">Nutrition Sync</Typography>
            <NutritionIcon color="action" />
        </Stack>
        {isConnected ? (
            <Stack spacing={1}>
                <Typography variant="body1">Calories In: {caloriesIn} kcal</Typography>
                <Typography variant="body1">Calories Out (Est.): {caloriesOut} kcal</Typography>
                {/* TODO: Add more details, link to nutrition page? */} 
            </Stack>
        ) : (
            <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Connect your nutrition tracking app (e.g., MyFitnessPal) to see daily calorie balance.
                </Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<LinkIcon />}
                    onClick={handleConnect}
                 >
                    Connect Service
                </Button>
            </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { workouts, loading: workoutsLoading, error: workoutsError, pagination: workoutsPagination } = useSelector((state) => state.workouts);
  const { stats, loading: progressLoading, error: progressError } = useSelector((state) => state.progress);
  const { pagination: exercisesPagination, loading: exercisesLoading, error: exercisesError } = useSelector((state) => state.exercises);

  // Timer State
  const [timerMode, setTimerMode] = useState('stopwatch');
  
  // Stopwatch State
  const [stopwatchValue, setStopwatchValue] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalId = useRef(null);

  // Interval Timer State
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [numIntervals, setNumIntervals] = useState(5);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [intervalValue, setIntervalValue] = useState(workTime);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const intervalTimerId = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch recent workouts (both scheduled and completed/updated)
    dispatch(getWorkouts({ limit: 10, sort: '-updatedAt' }));
    dispatch(getProgressStats());
    dispatch(getExercises({ limit: 1 }));
  }, [dispatch]);

  // Timer Logic
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalId.current = setInterval(() => {
        setStopwatchValue(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(stopwatchIntervalId.current);
    }
    return () => clearInterval(stopwatchIntervalId.current);
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (!isIntervalRunning) {
        clearInterval(intervalTimerId.current);
        return;
    }

    if (intervalValue === 0 && currentInterval === 1 && isWorkPhase) {
        setIntervalValue(workTime);
    }

    intervalTimerId.current = setInterval(() => {
        setIntervalValue(prev => {
            if (prev <= 1) {
                try { audioRef.current?.play(); } catch(e) { console.error("Audio play failed", e); }
                
                if (isWorkPhase) {
                    setIsWorkPhase(false);
                    return restTime;
                } else {
                    if (currentInterval < numIntervals) {
                        setIsWorkPhase(true);
                        setCurrentInterval(prevInterval => prevInterval + 1);
                        return workTime;
                    } else {
                        setIsIntervalRunning(false);
                        alert('Intervals Complete!');
                        return 0;
                    }
                }
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(intervalTimerId.current);
}, [isIntervalRunning, isWorkPhase, currentInterval, workTime, restTime, numIntervals]);

  const handleTimerModeChange = (event, newMode) => {
    if (isStopwatchRunning || isIntervalRunning) {
        handleReset();
    }
    setTimerMode(newMode);
  };

  const handleStartPause = () => {
    if (timerMode === 'stopwatch') {
      setIsStopwatchRunning(!isStopwatchRunning);
    } else {
       if (!isIntervalRunning && currentInterval === numIntervals && !isWorkPhase && intervalValue === 0) {
           handleReset();
       }
        if (intervalValue === 0 && currentInterval === 1 && isWorkPhase) {
            setIntervalValue(workTime); 
        }
       setIsIntervalRunning(!isIntervalRunning);
    }
  };

  const handleReset = () => {
    if (timerMode === 'stopwatch') {
      setIsStopwatchRunning(false);
      setStopwatchValue(0);
    } else {
      setIsIntervalRunning(false);
      setCurrentInterval(1);
      setIsWorkPhase(true);
      setIntervalValue(workTime);
    }
  };

  const handlePositiveIntChange = (setter) => (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 0) {
        setter(val);
        if (timerMode === 'interval' && !isIntervalRunning && isWorkPhase && setter === setWorkTime) {
            setIntervalValue(val);
        }
    }
  };

  const isLoading = workoutsLoading || progressLoading || exercisesLoading;
  const error = workoutsError || progressError || exercisesError;

  // Filter workouts for different sections
  const upcomingWorkouts = workouts
    .filter(w => 
        w.schedule?.date && 
        !w.isCompleted &&
        new Date(w.schedule.date) >= new Date().setHours(0,0,0,0)
    )
    .sort((a, b) => new Date(a.schedule.date) - new Date(b.schedule.date))
    .slice(0, 3);

  const recentActivity = workouts
    .filter(w => w.isCompleted)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Find the most recently created workout (non-template, non-completed ideally)
  const lastWorkout = workouts
      .filter(w => !w.isTemplate && !w.isCompleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

  // Extract latest stats for cards
  const latestWeight = stats?.weightProgress?.[stats.weightProgress.length - 1];
  const latestBodyFat = stats?.bodyFatProgress?.[stats.bodyFatProgress.length - 1];

  const isTimerActive = isStopwatchRunning || isIntervalRunning;
  const displayTime = timerMode === 'stopwatch' ? stopwatchValue : intervalValue;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome back, {user?.name || 'User'}!
        </Typography>
      </motion.div>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!isLoading && !error && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Stats Cards - Adjusted grid size and added Body Fat */}
          <Grid item xs={12} sm={6} md={3}> {/* Adjusted md size */} 
            <StatCard 
              title="Total Workouts" 
              value={workoutsPagination?.count || 0} 
              icon={<FitnessCenterIcon sx={{ fontSize: 40 }} />} 
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}> {/* Adjusted md size */} 
            <StatCard 
              title="Total Exercises" 
              value={exercisesPagination?.count || 0} 
              icon={<FitnessCenterIcon sx={{ fontSize: 40 }} />} 
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}> {/* Adjusted md size */} 
            <StatCard 
              title="Latest Weight" 
              value={latestWeight ? `${latestWeight.weight} ${latestWeight.unit || ''}` : 'N/A'} 
              icon={<WeightIcon sx={{ fontSize: 40 }} />} // Specific Icon
              color="success.main"
            />
          </Grid>
           <Grid item xs={12} sm={6} md={3}> {/* New Stat Card */} 
            <StatCard 
              title="Latest Body Fat" 
              value={latestBodyFat ? `${latestBodyFat.bodyFat}%` : 'N/A'} 
              icon={<PercentIcon sx={{ fontSize: 40 }} />} // Specific Icon
              color="info.main"
            />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
             <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
               <Typography variant="h6" gutterBottom fontWeight="medium">
                 Quick Actions
               </Typography>
               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                 <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/workouts/create')}
                    fullWidth
                 >
                    Create Workout
                 </Button>
                 <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ProgressIcon />}
                    onClick={() => navigate('/progress/create')}
                    fullWidth
                 >
                    Add Progress
                 </Button>
                 {lastWorkout && (
                    <Button
                        variant="outlined"
                        startIcon={<PlayIcon />}
                        onClick={() => navigate(`/workouts/${lastWorkout._id}?start=true`)}
                        fullWidth
                        disabled={lastWorkout.isCompleted}
                    >
                        Start Last Workout ({lastWorkout.name})
                    </Button>
                 )}
               </Stack>
             </Paper>
          </Grid>

          {/* Updated Timer Widget */}
          <Grid item xs={12} md={6}> 
            <Paper elevation={2} sx={{ p: 0, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Mode Tabs */}
                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={timerMode} 
                        onChange={handleTimerModeChange} 
                        variant="fullWidth"
                        aria-label="timer mode tabs"
                    >
                        <Tab icon={<TimerIcon />} iconPosition="start" label="Stopwatch" value="stopwatch" />
                        <Tab icon={<IntervalIcon />} iconPosition="start" label="Intervals" value="interval" />
                    </Tabs>
                </Box>
                
                {/* Content Area */} 
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    {/* Interval Settings (Only in interval mode & not running) */} 
                    {timerMode === 'interval' && !isIntervalRunning && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="center">
                            <TextField 
                                label="Work (s)" 
                                type="number" 
                                size="small" 
                                value={workTime} 
                                onChange={handlePositiveIntChange(setWorkTime)}
                                sx={{ width: 100 }}
                            />
                            <TextField 
                                label="Rest (s)" 
                                type="number" 
                                size="small" 
                                value={restTime} 
                                onChange={handlePositiveIntChange(setRestTime)}
                                 sx={{ width: 100 }}
                           />
                            <TextField 
                                label="Intervals" 
                                type="number" 
                                size="small" 
                                value={numIntervals} 
                                onChange={handlePositiveIntChange(setNumIntervals)}
                                 sx={{ width: 100 }}
                            />
                        </Stack>
                    )}

                    {/* Phase/Interval Display (Only in interval mode) */} 
                    {timerMode === 'interval' && (
                        <Typography variant="h6" color={isWorkPhase ? 'success.main' : 'info.main'} gutterBottom>
                            {isIntervalRunning ? `${isWorkPhase ? 'Work' : 'Rest'} (${currentInterval}/${numIntervals})` : 'Interval Setup'}
                        </Typography>
                    )}

                    {/* Timer Display */} 
                    <Typography variant="h2" fontWeight="bold" sx={{ my: timerMode === 'interval' ? 1 : 2 }}>
                        {formatTimer(displayTime)}
                    </Typography>
                    
                    {/* Control Buttons */} 
                    <Stack direction="row" spacing={2}>
                        <IconButton 
                            color={isTimerActive ? "warning" : "success"} 
                            onClick={handleStartPause}
                            size="large"
                        >
                            {isTimerActive ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                        </IconButton>
                        <IconButton 
                            color="error" 
                            onClick={handleReset}
                            disabled={displayTime === (timerMode === 'interval' ? workTime : 0) && !isTimerActive}
                            size="large"
                        >
                            <ResetIcon fontSize="large"/>
                        </IconButton>
                    </Stack>
                </Box>
            </Paper>
          </Grid>

          {/* Nutrition Sync Card */} 
          <Grid item xs={12} md={6}> 
            <NutritionCard />
          </Grid>

          {/* Upcoming Workouts */}
          {upcomingWorkouts.length > 0 && (
            <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                    Upcoming Workouts
                </Typography>
                <List>
                  {upcomingWorkouts.map((workout) => (
                    <ListItem 
                      key={workout._id} 
                      disablePadding 
                      secondaryAction={
                        <Button 
                          component={RouterLink} 
                          to={`/workouts/${workout._id}`} 
                          size="small"
                        >
                          View
                        </Button>
                      }
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <EventIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={workout.name} 
                          secondary={`Scheduled: ${new Date(workout.schedule.date).toLocaleDateString()}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Button 
                    component={RouterLink} 
                    to="/workouts" 
                    variant="text"
                    sx={{ mt: 2 }}
                >
                    View All Workouts
                </Button>
                </Paper>
            </Grid>
           )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
             <Grid item xs={12} md={upcomingWorkouts.length > 0 ? 12 : 6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                    Recent Activity
                </Typography>
                 <List>
                  {recentActivity.map((workout, index) => (
                    <React.Fragment key={workout._id}>
                    <ListItem 
                      disablePadding 
                      secondaryAction={
                        <Button 
                          component={RouterLink} 
                          to={`/workouts/${workout._id}`}
                          size="small"
                        >
                          Details
                        </Button>
                      }
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <CompletedIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={workout.name} 
                          secondary={`Completed: ${new Date(workout.updatedAt).toLocaleDateString()}`}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                </Paper>
            </Grid>
          )}

        </Grid>
      )}
    </Box>
  );
};

export default Dashboard; 