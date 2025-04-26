import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Notifications from './Notifications';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector((state) => state.ui);
  
  // Calculate main content width based on sidebar state
  const mainContentWidth = isMobile
    ? '100%'
    : sidebarOpen
    ? 'calc(100% - 240px)'
    : 'calc(100% - 64px)';
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };
  
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar component */}
      <Sidebar />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: mainContentWidth,
          ml: isMobile ? 0 : sidebarOpen ? '240px' : '64px',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }}
      >
        {/* Top navbar */}
        <Navbar />
        
        {/* Page content with animations */}
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Box sx={{ p: 3, pt: 10 }}>
            <Outlet />
          </Box>
        </motion.div>
      </Box>
      
      {/* Notification system */}
      <Notifications />
    </Box>
  );
};

export default Layout; 