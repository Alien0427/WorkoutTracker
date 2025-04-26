import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Pagination,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  FileCopy as FileCopyIcon, // For templates
  Search as SearchIcon,
  ContentCopy as CloneIcon
} from '@mui/icons-material';

import { 
  getWorkouts, 
  deleteWorkout, 
  setFilters, 
  clearError,
  clearFilters
} from '../../redux/slices/workoutSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const Workouts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    workouts,
    loading,
    error,
    pagination,
    filters
  } = useSelector((state) => state.workouts);

  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Templates, 2: Completed
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Fetch workouts when page or filters change
  useEffect(() => {
    dispatch(getWorkouts({ page }));
  }, [dispatch, page, filters]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearFilters());
    };
  }, [dispatch]);
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    let newFilters = {};
    if (newValue === 1) { // Templates
      newFilters = { isTemplate: true, isCompleted: '' };
    } else if (newValue === 2) { // Completed
      newFilters = { isCompleted: true, isTemplate: '' };
    } else { // All
      newFilters = { isTemplate: '', isCompleted: '' };
    }
    dispatch(setFilters(newFilters));
    setPage(1); // Reset page when filters change
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Debounce search term update
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setFilters({ search: searchTerm }));
      setPage(1); // Reset page when search term changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, dispatch]);

  // Handle delete workout
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      dispatch(deleteWorkout(id)).then(() => {
        dispatch(addNotification({ message: 'Workout deleted successfully', type: 'success' }));
        // Re-fetch workouts if the deleted item was on the current page
        if (workouts.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          dispatch(getWorkouts({ page }));
        }
      }).catch(() => {
        dispatch(addNotification({ message: 'Failed to delete workout', type: 'error' }));
      });
    }
  };

  // Handle cloning a template
  const handleCloneTemplate = (templateWorkout) => {
    // Navigate to create page, passing the full template data in state
    // Need to ensure the template object has necessary details (exercises with sets)
    navigate('/workouts/create', { state: { template: templateWorkout } });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            My Workouts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/workouts/create"
          >
            Create Workout
          </Button>
        </Box>
      </motion.div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="workout filter tabs">
          <Tab label="All" />
          <Tab label="Templates" />
          <Tab label="Completed" />
        </Tabs>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search workouts..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!loading && !error && workouts.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No workouts found. Create your first workout!
        </Typography>
      )}

      {!loading && !error && workouts.length > 0 && (
        <Grid container spacing={3}>
          {workouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: workouts.indexOf(workout) * 0.05 }}
              >
                <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" fontWeight="medium" gutterBottom noWrap>
                      {workout.name}
                    </Typography>
                    {workout.isTemplate && (
                      <Typography variant="caption" color="secondary.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FileCopyIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Template
                      </Typography>
                    )}
                    {workout.isCompleted && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Completed
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {workout.description || 'No description'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Exercises: {workout.exercises.length}
                    </Typography>
                    {workout.schedule?.date && (
                      <Typography variant="body2" color="text.secondary">
                        Scheduled: {new Date(workout.schedule.date).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                    <Box>
                      {workout.isTemplate ? (
                        <Tooltip title="Use this template to create a new workout">
                          <Button 
                            size="small" 
                            startIcon={<CloneIcon />} 
                            onClick={() => handleCloneTemplate(workout)}
                            color="primary"
                          >
                            Use Template
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button 
                          size="small" 
                          startIcon={<PlayArrowIcon />} 
                          onClick={() => navigate(`/workouts/${workout._id}?start=true`)}
                          disabled={workout.isCompleted}
                          color="success"
                        >
                          Start
                        </Button>
                      )}
                    </Box>

                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          component={RouterLink} 
                          to={`/workouts/edit/${workout._id}`}
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(workout._id)}
                        >
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {pagination && pagination.total > pagination.limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(pagination.count / pagination.limit) || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default Workouts; 