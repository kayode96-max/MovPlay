import React, { createContext, useContext } from 'react';
import { Snackbar, Alert, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import useNotification from '../hooks/useNotification';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const notificationHook = useNotification();
  const { notifications, removeNotification } = notificationHook;

  const notificationVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.3
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.5,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
      
      {/* Notification Container */}
      <Stack
        spacing={1}
        sx={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 10000,
          maxWidth: 400,
          width: '100%',
          maxHeight: 'calc(100vh - 100px)',
          overflow: 'hidden',
        }}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              variants={notificationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Alert
                severity={notification.type}
                onClose={() => removeNotification(notification.id)}
                sx={{
                  width: '100%',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '& .MuiAlert-message': {
                    color: 'var(--text-primary)',
                  },
                  '& .MuiAlert-icon': {
                    color: notification.type === 'error' ? '#f44336' : 
                           notification.type === 'warning' ? '#ff9800' :
                           notification.type === 'success' ? '#4caf50' : '#2196f3',
                  }
                }}
                role="alert"
                aria-atomic="true"
              >
                {notification.message}
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
