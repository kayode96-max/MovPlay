import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

export const LoadingState = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  size = 'medium',
  announceToScreenReader = true 
}) => {
  const sizeMap = {
    small: 30,
    medium: 40,
    large: 60
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={4}
      role="status"
      aria-label={announceToScreenReader ? message : undefined}
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CircularProgress 
          size={sizeMap[size]} 
          sx={{ 
            color: 'var(--primary-color)',
            mb: 2 
          }}
          aria-hidden="true"
        />
      </motion.div>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          textAlign: 'center',
          maxWidth: 300,
          color: 'var(--text-secondary)'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export const LoadingSkeleton = ({ 
  count = 6, 
  type = 'movie-card',
  height = 450 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 3,
        width: '100%'
      }}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Box
            sx={{
              background: 'var(--glass-bg)',
              borderRadius: 5,
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Skeleton
              variant="rectangular"
              height={300}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                '&::after': {
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                },
              }}
              aria-hidden="true"
            />
            <Box sx={{ p: 2 }}>
              <Skeleton 
                variant="text" 
                height={28} 
                sx={{ mb: 1, background: 'rgba(255, 255, 255, 0.1)' }}
                aria-hidden="true"
              />
              <Skeleton 
                variant="text" 
                height={20} 
                width="60%"
                sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                aria-hidden="true"
              />
            </Box>
          </Box>
        </motion.div>
      ))}
      <div className="sr-only" aria-live="polite">
        Loading {count} movie cards
      </div>
    </Box>
  );
};

export const ProgressIndicator = ({ 
  value, 
  max = 100, 
  label = 'Progress',
  showPercentage = true 
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        {showPercentage && (
          <Typography variant="body2" color="text.secondary">
            {percentage}%
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: 8,
          backgroundColor: 'var(--surface)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}% complete`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            height: '100%',
            background: 'var(--primary-gradient)',
            borderRadius: 4,
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingState;
