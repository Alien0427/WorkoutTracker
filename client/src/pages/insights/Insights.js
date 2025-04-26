import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import { Insights as InsightsIcon, CompareArrows as CompareIcon } from '@mui/icons-material';

// Placeholder for Insights / Comparison Module

const InsightCard = ({ title, value, comparison, unit = '' }) => (
  <Card elevation={2}>
    <CardContent>
      <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h4" component="div" fontWeight="bold">
        {value} {unit}
      </Typography>
      {comparison && (
        <Typography variant="body2" color={comparison.startsWith('+') ? 'success.main' : 'error.main'}>
          {comparison} vs last period
        </Typography>
      )}
      {!comparison && (
         <Typography variant="body2" color="text.secondary">
            No comparison data available.
         </Typography>
      )}
    </CardContent>
  </Card>
);

const Insights = () => {
  const dispatch = useDispatch();
  // Placeholder state (replace with actual data fetching/redux state)
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month'); // 'week', 'month', 'year'
  const [comparisonGroup, setComparisonGroup] = useState('self'); // 'self', 'ageGenderGroup', 'allUsers'

  // TODO: Fetch insights data based on selected period and group
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Placeholder fetch logic
    const fetchInsights = async () => {
        try {
            // Replace with actual API call
            // e.g., dispatch(fetchInsights({ period: timePeriod, compareTo: comparisonGroup }));
            await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
            
            // Placeholder data generation
            setInsights({
                totalWorkouts: { value: Math.floor(Math.random() * 20) + 5, comparison: Math.random() > 0.3 ? `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 5) + 1}` : null },
                avgDuration: { value: Math.floor(Math.random() * 30) + 45, comparison: Math.random() > 0.3 ? `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 10) + 1}` : null, unit: 'min' },
                weightChange: { value: Math.round((Math.random() - 0.5) * 4 * 10) / 10, comparison: null, unit: 'kg' }, // No comparison for absolute change yet
                benchPR: { value: Math.floor(Math.random() * 30) + 80, comparison: Math.random() > 0.3 ? `+${Math.floor(Math.random() * 5) + 1}` : null, unit: 'kg' },
                // Add more insights as needed
            });
        } catch (err) {
            setError('Failed to load insights data.');
        } finally {
            setLoading(false);
        }
    };
    fetchInsights();

  }, [dispatch, timePeriod, comparisonGroup]);

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  const handleComparisonGroupChange = (event) => {
    setComparisonGroup(event.target.value);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Training Insights
        </Typography>
      </motion.div>

      {/* Filter Controls */} 
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="Time Period"
                onChange={handleTimePeriodChange}
              >
                <MenuItem value={'week'}>Last Week</MenuItem>
                <MenuItem value={'month'}>Last Month</MenuItem>
                <MenuItem value={'year'}>Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
             <FormControl fullWidth size="small">
              <InputLabel>Compare Against</InputLabel>
              <Select
                value={comparisonGroup}
                label="Compare Against"
                onChange={handleComparisonGroupChange}
                // TODO: Disable options if backend doesn't support them
              >
                <MenuItem value={'self'}>Your Past Performance</MenuItem>
                <MenuItem value={'ageGenderGroup'}>Similar Users (Anonymous)</MenuItem>
                {/* <MenuItem value={'allUsers'}>All Users (Anonymous)</MenuItem> */} 
              </Select>
            </FormControl>
          </Grid>
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

      {!loading && !error && insights && (
        <Grid container spacing={3}>
            {/* Example Insight Cards - Replace with actual data structure */} 
            <Grid item xs={12} sm={6} md={4}>
                <InsightCard 
                    title="Total Workouts" 
                    value={insights.totalWorkouts.value}
                    comparison={insights.totalWorkouts.comparison}
                />
            </Grid>
             <Grid item xs={12} sm={6} md={4}>
                <InsightCard 
                    title="Avg. Duration" 
                    value={insights.avgDuration.value}
                    comparison={insights.avgDuration.comparison}
                    unit={insights.avgDuration.unit}
                />
            </Grid>
             <Grid item xs={12} sm={6} md={4}>
                <InsightCard 
                    title={`Weight Change (${timePeriod})`} 
                    value={insights.weightChange.value > 0 ? `+${insights.weightChange.value}` : insights.weightChange.value}
                    comparison={null} // Comparison logic for change needs more definition
                    unit={insights.weightChange.unit}
                />
            </Grid>
             <Grid item xs={12} sm={6} md={4}>
                <InsightCard 
                    title="Bench Press PR Est." // Example specific insight
                    value={insights.benchPR.value}
                    comparison={insights.benchPR.comparison}
                    unit={insights.benchPR.unit}
                />
            </Grid>
            {/* Add more cards based on available insights */} 
        </Grid>
      )}
       {!loading && !error && !insights && (
          <Typography color="text.secondary" sx={{ mt: 3 }}>
            No insights available for the selected period or comparison group.
          </Typography>
       )}
    </Box>
  );
};

export default Insights; 