import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Pagination,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonitorWeight as WeightIcon,
  FitnessCenter as PRIcon,
  DateRange as DateRangeIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale
  TimeSeriesScale // Import TimeSeriesScale if using specific time series features
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import date adapter

import { 
  getProgressEntries,
  getProgressStats,
  deleteProgressEntry,
  setDateRange,
  clearError 
} from '../../redux/slices/progressSlice';
import { addNotification } from '../../redux/slices/uiSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend
);

// Helper to format date for chart labels
const formatDateLabel = (date) => new Date(date).toLocaleDateString();

const Progress = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    progressEntries,
    stats,
    loading,
    error,
    pagination,
    dateRange
  } = useSelector((state) => state.progress);
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);

  // Fetch data on mount and when filters/page change
  useEffect(() => {
    dispatch(getProgressEntries({ page }));
    dispatch(getProgressStats());
  }, [dispatch, page, dateRange]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle date range change
  const handleDateChange = (e) => {
    dispatch(setDateRange({ [e.target.name]: e.target.value }));
    setPage(1); // Reset page when date range changes
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle delete entry
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this progress entry?')) {
      dispatch(deleteProgressEntry(id)).then(() => {
        dispatch(addNotification({ message: 'Progress entry deleted', type: 'success' }));
        // Re-fetch data
        if (progressEntries.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          dispatch(getProgressEntries({ page }));
          dispatch(getProgressStats());
        }
      }).catch(() => {
        dispatch(addNotification({ message: 'Failed to delete entry', type: 'error' }));
      });
    }
  };
  
  // Chart data preparation
  const weightChartData = {
    labels: stats?.weightProgress?.map(item => formatDateLabel(item.date)) || [],
    datasets: [
      {
        label: `Weight (${user?.weightUnit || 'kg'})`,
        data: stats?.weightProgress?.map(item => item.weight) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };
  
  const bodyFatChartData = {
    labels: stats?.bodyFatProgress?.map(item => formatDateLabel(item.date)) || [],
    datasets: [
      {
        label: 'Body Fat (%)',
        data: stats?.bodyFatProgress?.map(item => item.bodyFat) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progress Over Time',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'PP', // Luxon format for Date
          displayFormats: {
            day: 'MMM d' // Format for axis labels
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false, // Adjust based on data (e.g., true for body fat)
        title: {
          display: true,
          text: 'Value'
        }
      }
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
            Progress Tracking
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/progress/create"
          >
            Add New Entry
          </Button>
        </Box>
      </motion.div>

      {/* Date Range Filter */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Filter by Date</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          {/* Apply button is removed, filtering happens on date change */}
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3}>
          {/* Charts */} 
          {stats?.weightProgress?.length > 1 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Weight Trend</Typography>
                <Line options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Weight Trend' } }, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, title: { display: true, text: `Weight (${user?.weightUnit || 'kg'})` } } } }} data={weightChartData} />
              </Paper>
            </Grid>
          )}
          {stats?.bodyFatProgress?.length > 1 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Body Fat Trend</Typography>
                 <Line options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Body Fat Trend' } }, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, title: { display: true, text: 'Body Fat (%)' }, beginAtZero: true } } }} data={bodyFatChartData} />
              </Paper>
            </Grid>
          )}
          
          {/* Progress Entry List */}
          <Grid item xs={12}>
             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Recent Entries</Typography>
                {progressEntries.length === 0 ? (
                  <Typography color="text.secondary">No progress entries found for the selected period.</Typography>
                ) : (
                  <List disablePadding>
                    {progressEntries.map((entry) => (
                      <React.Fragment key={entry._id}>
                        <ListItem 
                          secondaryAction={
                            <> 
                              <IconButton edge="end" aria-label="edit" component={RouterLink} to={`/progress/edit/${entry._id}`}>
                                <EditIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(entry._id)} sx={{ ml: 1 }}>
                                <DeleteIcon />
                              </IconButton>
                            </>
                          }
                          disablePadding
                        >
                          <ListItemButton component={RouterLink} to={`/progress/edit/${entry._id}`}> 
                            <ListItemIcon>
                              <DateRangeIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Entry: ${new Date(entry.date).toLocaleDateString()}`}
                              secondary={
                                <React.Fragment>
                                  {entry.metrics?.weight?.value && <Chip size="small" icon={<WeightIcon fontSize="inherit"/>} label={`${entry.metrics.weight.value} ${entry.metrics.weight.unit}`} sx={{ mr: 0.5, mb: 0.5 }} />}
                                  {entry.metrics?.bodyFat && <Chip size="small" label={`BF: ${entry.metrics.bodyFat}%`} sx={{ mr: 0.5, mb: 0.5 }} />}
                                  {entry.personalRecords?.length > 0 && <Chip size="small" icon={<PRIcon fontSize="inherit" />} label={`${entry.personalRecords.length} PRs`} sx={{ mr: 0.5, mb: 0.5 }} />}
                                  {entry.notes && <Chip size="small" icon={<NotesIcon fontSize="inherit" />} label="Notes" sx={{ mr: 0.5, mb: 0.5 }} />}
                                </React.Fragment>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
                {pagination && pagination.total > pagination.limit && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={Math.ceil(pagination.count / pagination.limit) || 1}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
             </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Progress; 