import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * NoData component for displaying empty state across the application
 * 
 * @param {Object} props
 * @param {string} props.title - The main message to display
 * @param {string} [props.description] - Optional detailed description
 * @param {React.ReactNode} [props.icon] - Custom icon to display (defaults to SentimentDissatisfied)
 * @param {string} [props.actionText] - Text for the action button
 * @param {function} [props.onActionClick] - Click handler for the action button
 * @param {boolean} [props.elevated=true] - Whether to show in an elevated paper
 */
const NoData = ({
  title = 'No Data Found',
  description = 'There is no data to display at the moment',
  icon,
  actionText,
  onActionClick,
  elevated = true
}) => {
  const IconComponent = icon || SentimentDissatisfiedIcon;
  
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 5,
          px: 3
        }}
      >
        <IconComponent sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
        
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ maxWidth: '400px', mb: actionText ? 3 : 0 }}
        >
          {description}
        </Typography>
        
        {actionText && onActionClick && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onActionClick}
            sx={{ mt: 2 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </motion.div>
  );
  
  if (elevated) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        {content}
      </Paper>
    );
  }
  
  return content;
};

NoData.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  actionText: PropTypes.string,
  onActionClick: PropTypes.func,
  elevated: PropTypes.bool
};

export default NoData; 