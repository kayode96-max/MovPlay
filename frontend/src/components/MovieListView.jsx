import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Chip, 
  IconButton,
  Button,
  Rating,
  Divider
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MovieListItem = ({ movie, index = 0 }) => {
  const navigate = useNavigate();

  const handleMovieClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return 'No overview available.';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        sx={{
          display: 'flex',
          mb: 2,
          p: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
            backgroundColor: 'action.hover'
          }
        }}
        onClick={handleMovieClick}
      >
        {/* Movie Poster */}
        <CardMedia
          component="img"
          sx={{
            width: 120,
            height: 180,
            borderRadius: 2,
            flexShrink: 0,
            mr: 2
          }}
          image={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : '/placeholder-movie.png'
          }
          alt={`${movie.title} poster`}
          onError={(e) => {
            e.target.src = '/placeholder-movie.png';
          }}
        />

        {/* Movie Content */}
        <CardContent sx={{ flex: 1, p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mr: 2 }}>
              {movie.title}
            </Typography>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to favorites logic
                }}
                aria-label="Add to favorites"
              >
                <FavoriteBorderIcon />
              </IconButton>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to watchlist logic
                }}
                aria-label="Add to watchlist"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Release Date and Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {formatDate(movie.release_date)}
            </Typography>
            
            <Divider orientation="vertical" flexItem />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating
                value={movie.vote_average / 2}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                {formatRating(movie.vote_average)}
              </Typography>
            </Box>
          </Box>

          {/* Overview */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, lineHeight: 1.6 }}
          >
            {truncateText(movie.overview)}
          </Typography>

          {/* Genres (if available) */}
          {movie.genres && movie.genres.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {movie.genres.slice(0, 3).map(genre => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  size="small"
                  variant="outlined"
                />
              ))}
              {movie.genres.length > 3 && (
                <Chip
                  label={`+${movie.genres.length - 3} more`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleMovieClick();
              }}
            >
              Details
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={(e) => {
                e.stopPropagation();
                // Play trailer logic
              }}
            >
              Trailer
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MovieListView = ({ movies = [] }) => {
  return (
    <Box>
      {movies.map((movie, index) => (
        <MovieListItem
          key={movie.id}
          movie={movie}
          index={index}
        />
      ))}
    </Box>
  );
};

export default MovieListView;
