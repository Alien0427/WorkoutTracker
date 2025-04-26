import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';

// Placeholder for Body Stats Visualizer
// This will eventually display SVG/body map and detailed charts

// Placeholder SVG component (replace with actual implementation)
const BodyMapPlaceholder = () => (
  <Box 
    sx={{
      height: 400, 
      width: '100%', 
      bgcolor: 'grey.300', 
      borderRadius: 2, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}
  >
    <Typography color="text.secondary">Body Map / SVG Visualizer Placeholder</Typography>
  </Box>
);

const BodyStats = () => {
  const dispatch = useDispatch();
  // Placeholder state (replace with actual data fetching/redux state for stats)
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Fetch detailed body stats data (measurements, weight, body fat history)
  useEffect(() => {
    // Example: dispatch(fetchDetailedBodyStats());
    console.log('Fetching detailed body stats...'); // Placeholder
  }, [dispatch]);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Body Stats Visualizer
        </Typography>
      </motion.div>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Visualizer Column */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Body Map</Typography>
              <BodyMapPlaceholder />
              {/* TODO: Add interaction logic to highlight parts based on data */}
            </Paper>
          </Grid>
          
          {/* Data/Charts Column */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
               <Typography variant="h6" gutterBottom>Detailed Stats</Typography>
               {/* TODO: Display latest measurements, charts (e.g., weight, body fat, specific measurements over time) */}
               <Typography color="text.secondary" sx={{ mt: 2 }}>
                Detailed stats and charts will be displayed here.
               </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BodyStats; 