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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import { 
  getExercises, 
  deleteExercise, 
  setFilters, 
  clearFilters, 
  clearError 
} from '../../redux/slices/exerciseSlice';
import { addNotification } from '../../redux/slices/uiSlice';

// Exercise categories and muscle groups for filtering
const categories = ['strength', 'cardio', 'flexibility', 'balance', 'sport', 'other'];
const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 
  'quadriceps', 'hamstrings', 'calves', 'glutes', 'core', 'fullBody', 'none'
];
const equipment = ['none', 'barbell', 'dumbbell', 'kettlebell', 'machine', 'cables', 'bands', 'bodyweight', 'other'];

const Exercises = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    exercises, 
    loading, 
    error, 
    pagination, 
    filters 
  } = useSelector((state) => state.exercises);
  const { user } = useSelector((state) => state.auth); // Needed to check if user owns custom exercise

  const [page, setPage] = useState(1);
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch exercises when page or filters change
  useEffect(() => {
    dispatch(getExercises({ page }));
  }, [dispatch, page, filters]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      // Optionally clear filters when leaving the page
      // dispatch(clearFilters()); 
    };
  }, [dispatch]);
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };
  
  // Apply filters
  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setPage(1); // Reset page when filters change
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setLocalFilters({
      category: '',
      muscleGroups: '',
      equipmentNeeded: '',
      search: ''
    });
    setSearchTerm('');
    dispatch(clearFilters());
    setPage(1); // Reset page when filters clear
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Debounce search term update to filters
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setFilters({ search: searchTerm }));
      setPage(1); // Reset page when search term changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, dispatch]);

  // Handle delete exercise
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this custom exercise?')) {
      dispatch(deleteExercise(id)).then(() => {
        dispatch(addNotification({ message: 'Exercise deleted successfully', type: 'success' }));
        // Re-fetch exercises
        if (exercises.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          dispatch(getExercises({ page }));
        }
      }).catch((err) => {
        dispatch(addNotification({ message: error || 'Failed to delete exercise', type: 'error' }));
      });
    }
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
            Exercise Library
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/exercises/create"
          >
            Create Custom Exercise
          </Button>
        </Box>
      </motion.div>

      {/* Search and Filter Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
            <Button 
              startIcon={<FilterListIcon />} 
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outlined" size="small">
              Clear Filters
            </Button>
          </Grid>
        </Grid>
        
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={localFilters.category}
                    label="Category"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {categories.map(cat => <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Muscle Group</InputLabel>
                  <Select
                    name="muscleGroups"
                    value={localFilters.muscleGroups}
                    label="Muscle Group"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {muscleGroups.map(mg => <MenuItem key={mg} value={mg}>{mg.charAt(0).toUpperCase() + mg.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    name="equipmentNeeded"
                    value={localFilters.equipmentNeeded}
                    label="Equipment"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {equipment.map(eq => <MenuItem key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} textAlign="right">
                <Button variant="contained" onClick={applyFilters} size="small">
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!loading && !error && exercises.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No exercises found matching your criteria.
        </Typography>
      )}

      {!loading && !error && exercises.length > 0 && (
        <Grid container spacing={3}>
          {exercises.map((exercise) => (
            <Grid item xs={12} sm={6} md={4} key={exercise._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: exercises.indexOf(exercise) * 0.05 }}
              >
                <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" fontWeight="medium" gutterBottom noWrap>
                      {exercise.name}
                      {exercise.isCustom && <Chip label="Custom" size="small" color="info" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Category: {exercise.category}
                    </Typography>
                    {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Muscles: {exercise.muscleGroups.join(', ')}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Equipment: {exercise.equipmentNeeded}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />} 
                      component={RouterLink} 
                      to={`/exercises/${exercise._id}`}
                    >
                      View
                    </Button>
                    {exercise.isCustom && exercise.user === user.id && (
                      <>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />} 
                          component={RouterLink} 
                          to={`/exercises/edit/${exercise._id}`}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<DeleteIcon />} 
                          color="error"
                          onClick={() => handleDelete(exercise._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
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

export default Exercises; 