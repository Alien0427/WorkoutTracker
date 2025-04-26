import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Avatar, 
  Button, 
  Divider, 
  Box,
  Skeleton,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon 
} from '@mui/material';
import { 
  Edit, 
  FitnessCenter,
  DirectionsRun,
  Straighten,
  ShowChart,
  EmojiEvents,
  CalendarMonth
} from '@mui/icons-material';
import { fetchUserProfile } from '../../redux/slices/authSlice';
import { fetchUserStats } from '../../redux/slices/progressSlice';
import { fetchUserWorkouts } from '../../redux/slices/workoutSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, loading: userLoading } = useSelector(state => state.auth);
  const { userStats, loading: statsLoading } = useSelector(state => state.progress);
  const { userWorkouts, loading: workoutsLoading } = useSelector(state => state.workouts);
  
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserStats());
    dispatch(fetchUserWorkouts({ limit: 5 }));
  }, [dispatch]);
  
  const loading = userLoading || statsLoading || workoutsLoading;
  
  const profileVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  if (!user && !loading) {
    navigate('/login');
    return null;
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={profileVariants}
      >
        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {loading ? (
                    <Skeleton variant="circular" width={120} height={120} />
                  ) : (
                    <Avatar 
                      src={user?.avatar}
                      sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                  )}
                  
                  {loading ? (
                    <Skeleton width="60%" height={40} />
                  ) : (
                    <Typography variant="h5" gutterBottom>
                      {user?.name}
                    </Typography>
                  )}
                  
                  {loading ? (
                    <Skeleton width="40%" height={24} />
                  ) : (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {user?.email}
                    </Typography>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<Edit />}
                    onClick={() => navigate('/settings')}
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  User Info
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarMonth fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Member Since"
                      secondary={loading ? 
                        <Skeleton width={100} /> : 
                        new Date(user?.createdAt).toLocaleDateString()
                      }
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsRun fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Workout Streak"
                      secondary={loading ? <Skeleton width={60} /> : userStats?.streak || '0 days'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </motion.div>
          </Grid>
          
          {/* Stats Overview */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Fitness Overview
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <FitnessCenter color="primary" />
                        <Typography variant="h6" component="div">
                          {loading ? <Skeleton width={60} /> : userStats?.totalWorkouts || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Workouts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <ShowChart color="primary" />
                        <Typography variant="h6" component="div">
                          {loading ? <Skeleton width={60} /> : userStats?.progressEntries || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Progress Records
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <EmojiEvents color="primary" />
                        <Typography variant="h6" component="div">
                          {loading ? <Skeleton width={60} /> : userStats?.totalPRs || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Personal Records
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {userStats?.goals && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Goals Progress
                    </Typography>
                    
                    {Object.entries(userStats.goals).map(([goal, progress]) => (
                      <Box key={goal} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{goal}</Typography>
                          <Typography variant="body2">{progress}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ mt: 1, height: 8, borderRadius: 5 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </motion.div>
            
            {/* Recent Workouts */}
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    Recent Workouts
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/workouts')}
                  >
                    View All
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {loading ? (
                  Array.from(new Array(3)).map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={60} />
                    </Box>
                  ))
                ) : userWorkouts && userWorkouts.length > 0 ? (
                  userWorkouts.map((workout) => (
                    <Box 
                      key={workout._id}
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderRadius: 1, 
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } 
                      }}
                      onClick={() => navigate(`/workouts/${workout._id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {workout.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(workout.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {workout.exercises.length > 0 && (
                          <Chip 
                            size="small" 
                            icon={<FitnessCenter fontSize="small" />} 
                            label={`${workout.exercises.length} exercises`}
                          />
                        )}
                        {workout.category && (
                          <Chip size="small" label={workout.category} />
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No workouts found. Start creating your workout plans!
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </Grid>
          
          {/* Recent Progress */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ p: 3, mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    Progress Highlights
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/progress')}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {loading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : userStats?.recentProgress && userStats.recentProgress.length > 0 ? (
                  <Grid container spacing={3}>
                    {userStats.recentProgress.map((progress, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {progress.metric}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                              <Typography variant="h4" component="span">
                                {progress.current}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {progress.unit}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                variant="body2" 
                                color={progress.change > 0 ? 'success.main' : 'error.main'}
                              >
                                {progress.change > 0 ? '+' : ''}{progress.change} {progress.unit}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                from previous
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                              {new Date(progress.date).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No progress data yet. Start tracking your fitness journey!
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Profile; 