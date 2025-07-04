import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from './NotificationProvider';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import LoadingState from './LoadingState';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { announce, prefersReducedMotion } = useAccessibility();
  const { showInfo } = useNotifications();
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    if (loading) {
      announce('Checking authentication status...');
    } else if (!user) {
      announce('Authentication required. Redirecting to login page.');
      showInfo('Please log in to access this page');
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [loading, user, announce, showInfo]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        role="status"
        aria-live="polite"
        sx={{ p: 4 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          <LoadingState 
            type="spinner" 
            size="large"
            message="Checking authentication..."
          />
        </motion.div>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 2, 
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}
        >
          Verifying your access...
        </Typography>
        
        {/* Screen reader only status */}
        <div className="sr-only" aria-live="polite">
          Loading authentication status
        </div>
      </Box>
    );
  }

  if (!user) {
    // Provide feedback before redirect
    const redirectPath = location.pathname + location.search;
    
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          sx={{ p: 4, textAlign: 'center' }}
          role="status"
          aria-live="polite"
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--text-primary)',
              mb: 2
            }}
          >
            Authentication Required
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'var(--text-secondary)',
              mb: 3
            }}
          >
            You need to be logged in to access this page. Redirecting to login...
          </Typography>
          
          <LoadingState 
            type="spinner" 
            size="medium"
            message="Redirecting..."
          />
          
          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="assertive">
            Authentication required. Redirecting to login page.
          </div>
        </Box>
        
        {/* Redirect after a brief delay to show the message */}
        <Navigate 
          to="/login" 
          state={{ 
            from: location,
            message: `Please log in to access ${redirectPath}` 
          }} 
          replace 
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
