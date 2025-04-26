import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Stack,
  IconButton,
  CardMedia
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  FitnessCenter as MuscleIcon,
  Build as EquipmentIcon,
  School as DifficultyIcon,
  PlayCircleOutline as VideoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { getExercise, deleteExercise, clearExercise } from '../../redux/slices/exerciseSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { exercise, loading, error } = useSelector((state) => state.exercises);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getExercise(id));
    
    // Cleanup exercise state on unmount
    return () => {
      dispatch(clearExercise());
    }
  }, [dispatch, id]);

  // Handle delete exercise
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this custom exercise?')) {
      dispatch(deleteExercise(id)).then(() => {
        dispatch(addNotification({ message: 'Exercise deleted successfully', type: 'success' }));
        navigate('/exercises');
      }).catch(() => {
        dispatch(addNotification({ message: 'Failed to delete exercise', type: 'error' }));
      });
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

  if (!exercise) {
    return <Typography>Exercise not found.</Typography>;
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/exercises')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" component="div" sx={{ flexGrow: 1 }}>
              {exercise.name}
            </Typography>
            {exercise.isCustom && exercise.user === user.id && (
              <Box>
                <IconButton 
                  color="primary" 
                  component={RouterLink} 
                  to={`/exercises/edit/${id}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Left Column: Image/Video */}
            <Grid item xs={12} md={5}>
              {exercise.imageUrl && (
                <CardMedia
                  component="img"
                  image={exercise.imageUrl}
                  alt={exercise.name}
                  sx={{ borderRadius: 2, width: '100%', maxHeight: 300, objectFit: 'contain' }}
                />
              )}
              {exercise.videoUrl && (
                <Button
                  variant="outlined"
                  startIcon={<VideoIcon />}
                  href={exercise.videoUrl} // Make sure videoUrl is a valid URL
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                >
                  Watch Video Guide
                </Button>
              )}
              {!exercise.imageUrl && !exercise.videoUrl && (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200', borderRadius: 2 }}>
                  <Typography color="text.secondary">No media available</Typography>
                </Box>
              )}
            </Grid>
            
            {/* Right Column: Details */}
            <Grid item xs={12} md={7}>
              {exercise.description && (
                <Typography variant="body1" paragraph>
                  {exercise.description}
                </Typography>
              )}
              
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Chip icon={<CategoryIcon />} label={`Category: ${exercise?.category || 'N/A'}`} size="small" />
                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                  <Chip icon={<MuscleIcon />} label={`Muscles: ${exercise.muscleGroups.join(', ')}`} size="small" />
                )}
                <Chip icon={<EquipmentIcon />} label={`Equipment: ${exercise?.equipmentNeeded || 'N/A'}`} size="small" />
                <Chip icon={<DifficultyIcon />} label={`Difficulty: ${exercise?.difficultyLevel || 'N/A'}`} size="small" />
              </Stack>
              
              {exercise.instructions && (
                <Box>
                  <Typography variant="h6" gutterBottom>Instructions:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {exercise.instructions}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ExerciseDetail; 