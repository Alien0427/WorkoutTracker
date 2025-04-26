import React from 'react';
import { Alert, AlertTitle, Box, Typography, Paper, Collapse } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Error message component for displaying error messages consistently across the app
 * 
 * @param {Object} props
 * @param {string} props.message - The main error message to display
 * @param {string|Object} [props.details] - Additional error details (can be string or error object)
 * @param {string} [props.severity="error"] - Severity level (error, warning, info, success)
 * @param {boolean} [props.showDetails=false] - Whether to show detailed error information
 */
const ErrorMessage = ({ 
  message, 
  details, 
  severity = "error", 
  showDetails = false 
}) => {
  // Format error details if they exist
  const formatDetails = () => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return details;
    }
    
    if (details.message) {
      return details.message;
    }
    
    return JSON.stringify(details);
  };

  const formattedDetails = formatDetails();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert 
        severity={severity}
        variant="filled"
        sx={{ 
          mb: 2,
          borderRadius: 1
        }}
      >
        <AlertTitle>{message}</AlertTitle>
        
        {showDetails && formattedDetails && (
          <Collapse in={showDetails}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1, 
                mt: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.09)',
                maxHeight: '100px',
                overflow: 'auto'
              }}
            >
              <Typography 
                variant="body2" 
                component="pre"
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  m: 0,
                  fontSize: '0.8rem'
                }}
              >
                {formattedDetails}
              </Typography>
            </Paper>
          </Collapse>
        )}
      </Alert>
    </motion.div>
  );
};

export default ErrorMessage; 