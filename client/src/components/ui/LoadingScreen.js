import React from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { motion } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  rotate: {
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const LoadingScreen = ({ message = "Loading your workout data..." }) => {
  return (
    <Container 
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{ textAlign: 'center' }}
      >
        <motion.div variants={itemVariants}>
          <motion.div 
            animate="rotate"
            variants={iconVariants}
            style={{ display: 'inline-block', marginBottom: '20px' }}
          >
            <FitnessCenterIcon color="primary" sx={{ fontSize: 60 }} />
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
            Workout Tracker
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography variant="body1" color="textSecondary">
            {message}
          </Typography>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default LoadingScreen; 