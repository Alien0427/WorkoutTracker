import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Pagination,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { EmojiEvents as RankIcon, People as FriendsIcon, Public as PublicIcon } from '@mui/icons-material';

// Placeholder for Leaderboard functionality
// This component will eventually fetch and display user rankings

const Leaderboard = () => {
  const dispatch = useDispatch();
  // Placeholder state (replace with actual data fetching/redux state)
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: Public, 1: Friends
  const [page, setPage] = useState(1);
  const { user } = useSelector((state) => state.auth);

  // TODO: Implement data fetching based on tab and page
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Placeholder fetch logic
    const fetchLeaderboard = async () => {
      try {
        // Replace with actual API call
        // e.g., dispatch(fetchLeaderboard({ scope: tabValue === 0 ? 'public' : 'friends', page }));
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Placeholder data generation
        const scope = tabValue === 0 ? 'Public' : 'Friends';
        const startRank = (page - 1) * 10 + 1;
        const data = Array.from({ length: 10 }, (_, i) => ({
          _id: `user_${scope}_${startRank + i}`,
          rank: startRank + i,
          name: `${scope} User ${startRank + i}`,
          score: Math.floor(Math.random() * 5000) + 1000, // Random score
          avatar: { url: '' } // Placeholder avatar
        }));
        setLeaderboardData(data);
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    
    // Clear data on unmount or tab change?
    // return () => setLeaderboardData([]);
    
  }, [dispatch, tabValue, page]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset page on tab change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Leaderboard
        </Typography>
      </motion.div>

      <Paper elevation={2} sx={{ p: 0, mt: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Public" icon={<PublicIcon />} iconPosition="start" />
            <Tab label="Friends" icon={<FriendsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        )}

        {!loading && !error && (
          <> 
            <List sx={{ py: 0 }}>
              {leaderboardData.length === 0 ? (
                 <ListItem><ListItemText primary="No users found on this leaderboard." /></ListItem>
              ) : (
                leaderboardData.map((entry, index) => (
                  <React.Fragment key={entry._id}>
                    <ListItem 
                      sx={{ 
                        bgcolor: entry._id === user?.id ? 'action.hover' : 'inherit' // Highlight current user
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40, mr: 1 }}>
                        <Typography variant="h6" color="text.secondary">#{entry.rank}</Typography>
                      </ListItemAvatar>
                      <ListItemAvatar>
                        <Avatar src={entry.avatar?.url} alt={entry.name} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={entry.name} 
                        secondary={`Score: ${entry.score}`}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      {/* Optional: Add badge icons or streak */} 
                    </ListItem>
                    {index < leaderboardData.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
             {/* Placeholder Pagination - Adjust count based on actual total */} 
             {leaderboardData.length > 0 && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                     <Pagination
                         count={10} // Replace with actual total page count
                         page={page}
                         onChange={handlePageChange}
                         color="primary"
                     />
                 </Box>
             )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Leaderboard; 