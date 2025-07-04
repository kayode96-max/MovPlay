import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  Movie as MovieIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const StatsCard = ({ icon, title, value, color = 'primary' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)',
        border: '1px solid rgba(25,118,210,0.2)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ mb: 2, color: `${color}.main` }}>
          {icon}
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const MovieStats = ({ totalMovies = 0, avgRating = 0, totalViews = 0, trendingCount = 0 }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    {
      icon: <MovieIcon sx={{ fontSize: 40 }} />,
      title: 'Total Movies',
      value: formatNumber(totalMovies),
      color: 'primary'
    },
    {
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      title: 'Avg Rating',
      value: avgRating.toFixed(1),
      color: 'warning'
    },
    {
      icon: <ViewIcon sx={{ fontSize: 40 }} />,
      title: 'Total Views',
      value: formatNumber(totalViews),
      color: 'success'
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 40 }} />,
      title: 'Trending',
      value: formatNumber(trendingCount),
      color: 'error'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Movie Statistics
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MovieStats;
