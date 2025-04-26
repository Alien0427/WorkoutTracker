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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

import { createExercise, clearError } from '../../redux/slices/exerciseSlice';
import { addNotification } from '../../redux/slices/uiSlice';

// Options for select inputs
const categories = ['strength', 'cardio', 'flexibility', 'balance', 'sport', 'other'];
const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 
  'quadriceps', 'hamstrings', 'calves', 'glutes', 'core', 'fullBody', 'none'
];
const equipment = ['none', 'barbell', 'dumbbell', 'kettlebell', 'machine', 'cables', 'bands', 'bodyweight', 'other'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

const CreateExercise = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.exercises);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength', // Default category
    muscleGroups: [],
    equipmentNeeded: 'none', // Default equipment
    difficultyLevel: 'intermediate', // Default difficulty
    instructions: '',
    imageUrl: '',
    videoUrl: ''
  });

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle multi-select change for muscle groups
  const handleMuscleGroupChange = (event) => {
    const { target: { value } } = event;
    setFormData({
      ...formData,
      muscleGroups: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      dispatch(addNotification({ message: 'Name and Category are required', type: 'warning' }));
      return;
    }
    
    dispatch(createExercise(formData)).then((action) => {
      if (createExercise.fulfilled.match(action)) {
        dispatch(addNotification({ message: 'Custom exercise created successfully!', type: 'success' }));
        navigate(`/exercises/${action.payload.data._id}`);
      } else {
        dispatch(addNotification({ message: error || 'Failed to create exercise', type: 'error' }));
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
            <IconButton onClick={() => navigate('/exercises')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              Create Custom Exercise
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Exercise Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {categories.map(cat => <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Muscle Groups</InputLabel>
                  <Select
                    name="muscleGroups"
                    multiple
                    value={formData.muscleGroups}
                    onChange={handleMuscleGroupChange}
                    label="Target Muscle Groups"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small"/>
                        ))}
                      </Box>
                    )}
                  >
                    {muscleGroups.map((mg) => (
                      <MenuItem key={mg} value={mg}>
                        {mg.charAt(0).toUpperCase() + mg.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipment Needed</InputLabel>
                  <Select
                    name="equipmentNeeded"
                    value={formData.equipmentNeeded}
                    label="Equipment Needed"
                    onChange={handleChange}
                  >
                    {equipment.map(eq => <MenuItem key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    label="Difficulty Level"
                    onChange={handleChange}
                  >
                    {difficulties.map(diff => <MenuItem key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Instructions (Optional)"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={5}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Image URL (Optional)"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Video URL (Optional)"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Exercise'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateExercise; 