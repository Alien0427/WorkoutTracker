import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { loginSuccess } from '../../redux/slices/authSlice';

const GoogleCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the token from the URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
          // Store the token in localStorage
          localStorage.setItem('token', token);
          
          // Dispatch login success action
          dispatch(loginSuccess({ token }));
          
          // Redirect to dashboard
          navigate('/');
        } else {
          // If no token, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error processing Google callback:', error);
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [dispatch, location.search, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Processing Google login...
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
