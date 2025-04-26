import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { removeNotification } from '../../redux/slices/uiSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.ui);

  // Handle notification close
  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 40,
            }}
          >
            <Snackbar
              open={true}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{ position: 'static', mb: 1 }}
            >
              <Alert
                severity={notification.type || 'info'}
                variant="filled"
                sx={{ width: '100%', boxShadow: 3 }}
                action={
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleClose(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default Notifications; 