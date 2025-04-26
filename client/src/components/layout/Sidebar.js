import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as DirectionsRunIcon,
  ShowChart as ShowChartIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Psychology as PsychologyIcon,
  Leaderboard as LeaderboardIcon,
  AccessibilityNew as BodyStatsIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { toggleSidebar } from '../../redux/slices/uiSlice';

// Navigation menu items
const menuItems = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
  },
  {
    text: 'Workouts',
    path: '/workouts',
    icon: <DirectionsRunIcon />,
  },
  {
    text: 'Exercises',
    path: '/exercises',
    icon: <FitnessCenterIcon />,
  },
  {
    text: 'Progress',
    path: '/progress',
    icon: <ShowChartIcon />,
  },
  {
    text: 'Body Stats',
    path: '/body-stats',
    icon: <BodyStatsIcon />,
  },
  {
    text: 'Insights',
    path: '/insights',
    icon: <InsightsIcon />,
  },
  {
    text: 'Suggestions',
    path: '/suggestions',
    icon: <PsychologyIcon />,
  },
  {
    text: 'Leaderboard',
    path: '/leaderboard',
    icon: <LeaderboardIcon />,
  },
  {
    text: 'Profile',
    path: '/profile',
    icon: <SettingsIcon />,
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Animation variants
  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  // Handle navigation item click
  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  // Sidebar drawer width
  const drawerWidth = sidebarOpen ? 240 : 64;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={isMobile ? () => dispatch(toggleSidebar()) : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 0,
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.08)',
          backgroundColor: theme.palette.background.paper,
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          padding: theme.spacing(2),
          height: 64
        }}
      >
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">
              Workout Tracker
            </Typography>
          </motion.div>
        )}
        
        {!isMobile && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <ChevronLeftIcon
              onClick={() => dispatch(toggleSidebar())}
              sx={{ 
                cursor: 'pointer',
                transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s'
              }}
            />
          </motion.div>
        )}
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ display: 'block' }}
            >
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: isActive 
                    ? theme.palette.primary.main + '15' 
                    : 'transparent',
                  borderLeft: isActive 
                    ? `4px solid ${theme.palette.primary.main}` 
                    : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? theme.palette.primary.main + '25'
                      : theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                
                {sidebarOpen && (
                  <motion.div 
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? theme.palette.primary.main : 'inherit'
                      }}
                      sx={{ opacity: sidebarOpen ? 1 : 0 }}
                    />
                  </motion.div>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar; 