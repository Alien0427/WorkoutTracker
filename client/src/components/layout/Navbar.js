import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { logout } from '../../redux/slices/authSlice';
import { toggleDarkMode, toggleSidebar } from '../../redux/slices/uiSlice';

const Navbar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const { darkMode, sidebarOpen } = useSelector((state) => state.ui);

  // State for profile menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Handle menu open
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle profile navigation
  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  // Handle logout
  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        width: isMobile ? '100%' : sidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 64px)',
        ml: isMobile ? 0 : sidebarOpen ? '240px' : '64px',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }}
    >
      <Toolbar>
        {/* Menu Icon - shows on mobile or when sidebar is collapsed */}
        {(isMobile || !sidebarOpen) && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo - only show on mobile */}
        {isMobile && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Workout Tracker
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Dark mode toggle */}
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <motion.div whileTap={{ scale: 0.95 }}>
            <IconButton 
              color="inherit" 
              onClick={() => dispatch(toggleDarkMode())}
              sx={{ mr: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </motion.div>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <motion.div whileTap={{ scale: 0.95 }}>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
          </motion.div>
        </Tooltip>

        {/* Profile Menu */}
        <Box>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              {user?.avatar ? (
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 