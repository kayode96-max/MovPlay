import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Skeleton,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../components/NotificationProvider';
import { useKeyboardNavigation, useAccessibility } from '../hooks/useAccessibility';
import API, { watchlistAPI, userAPI, movieAPI } from '../api';

const MovieCard = ({ movie, loading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [actionInProgress, setActionInProgress] = useState('');
  const [watchlists, setWatchlists] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { prefersReducedMotion } = useAccessibility();
  const navigate = useNavigate();

  // Check if movie is in favorites on component mount
  useEffect(() => {
    // Disabled API calls to prevent timeout errors
    // if (isAuthenticated && user && movie?.id) {
    //   checkFavoriteStatus();
    //   fetchWatchlists();
    // }
  }, [isAuthenticated, user, movie?.id]);

  const checkFavoriteStatus = async () => {
    // Disabled to prevent timeout errors
    // TODO: Re-enable when backend is properly configured
    return;
    /*
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await userAPI.getProfile();
      const data = response.data;
      
      const isMovieFavorite = data.favorites?.some(fav => {
        // Handle both populated and non-populated favorites
        if (fav.tmdbId) {
          return fav.tmdbId === movie.id.toString();
        } else if (fav._id) {
          // If not populated, we can't directly compare, so we'll have to assume it's not a match
          return false;
        }
        return false;
      });
      
      setIsFavorite(isMovieFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Silent fail - just don't show as favorite
    }
    */
  };

  const fetchWatchlists = async () => {
    // Disabled to prevent timeout errors
    // TODO: Re-enable when backend is properly configured
    return;
    /*
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await userAPI.getProfile(); // This returns the full profile including watchlists
      const data = response.data;
      
      setWatchlists(data.watchlists || []);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      // Silent fail
    }
    */
  };

  const cardVariants = prefersReducedMotion ? {} : {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.9 
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
    hover: {
      y: -10,
      scale: 1.03,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const overlayVariants = prefersReducedMotion ? {} : {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Keyboard navigation
  const handleKeyPress = useKeyboardNavigation(
    () => handleCardClick(), // Enter
    null, // Escape
    null, // Arrow Up
    null  // Arrow Down
  );

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!movie?.id) {
      showError('Movie information is missing');
      return;
    }
    
    // Disabled to prevent API timeout errors
    showError('Favorites feature temporarily disabled');
    /*
    TODO: Re-enable when backend is properly configured
    setActionInProgress('favorite');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please log in again');
        navigate('/login');
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        const response = await movieAPI.removeFromFavorites(movie.id.toString());
        setIsFavorite(false);
        showSuccess(`Removed "${movie.title || movie.name}" from favorites`);
      } else {
        // Add to favorites
        const response = await movieAPI.addToFavorites(movie.id.toString());
        setIsFavorite(true);
        showSuccess(`Added "${movie.title || movie.name}" to favorites`);
      }
    } catch (error) {
      console.error('Favorite operation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update favorites';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again';
        navigate('/login');
      } else if (error.response?.status === 404) {
        errorMessage = 'Movie not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showError(errorMessage);
    } finally {
      setActionInProgress('');
    }
    */
  };

  const handleAddToWatchlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Disabled to prevent API timeout errors
    showError('Watchlist feature temporarily disabled');
    /*
    TODO: Re-enable when backend is properly configured
    if (watchlists.length === 0) {
      showError('Please create a watchlist first');
      return;
    }

    setActionInProgress('watchlist');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please log in again');
        navigate('/login');
        return;
      }

      
      // Add to the first watchlist (or we could show a selection dialog)
      const firstWatchlist = watchlists[0];
      const response = await watchlistAPI.addToWatchlist(firstWatchlist._id, movie.id.toString());
      
      showSuccess(`Added "${movie.title || movie.name}" to ${firstWatchlist.name}`);
    } catch (error) {
      console.error('Watchlist operation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to add to watchlist';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again';
        navigate('/login');
      } else if (error.response?.status === 404) {
        errorMessage = 'Movie not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showError(errorMessage);
    } finally {
      setActionInProgress('');
    }
    */
  };

  // Ensure poster_path is a valid URL or use a fallback
  const getPosterUrl = () => {
    if (!movie?.poster_path) {
      return 'https://via.placeholder.com/400x600/1a1a1a/667eea?text=No+Image';
    }
    // If poster_path is already a full URL, use it; otherwise, prepend TMDB base URL
    return movie.poster_path.startsWith('http')
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).getFullYear();
  };

  if (loading) {
    return (
      <Card 
        className="movie-card"
        sx={{ 
          maxWidth: 300, 
          height: 450,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--glass-border)',
        }}
        role="article"
        aria-label="Loading movie card"
      >
        <Skeleton 
          variant="rectangular" 
          height={400} 
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px 20px 0 0' 
          }}
          aria-hidden="true" 
        />
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="text" height={24} sx={{ mb: 1 }} aria-hidden="true" />
          <Skeleton variant="text" height={20} width="60%" aria-hidden="true" />
        </CardContent>
      </Card>
    );
  }

  if (!movie) {
    return (
      <Card 
        className="movie-card"
        sx={{ 
          maxWidth: 300, 
          height: 450,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        role="article"
        aria-label="Movie unavailable"
      >
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            Movie data unavailable
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className="movie-card"
        tabIndex={0}
        role="article"
        aria-labelledby={`movie-title-${movie.id}`}
        aria-describedby={`movie-desc-${movie.id}`}
        onKeyDown={handleKeyPress}
        sx={{
          maxWidth: 300,
          height: 450,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--accent-gradient)',
            opacity: 0,
            transition: 'opacity var(--transition-normal)',
            zIndex: -1,
          },
          '&:hover::before': {
            opacity: 0.1,
          },
          '&:focus': {
            outline: '3px solid var(--primary-color)',
            outlineOffset: '2px',
          }
        }}
        onClick={handleCardClick}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="300"
            image={getPosterUrl()}
            alt={`${movie.title || movie.name || 'Movie'} poster`}
            onLoad={() => setImageLoaded(true)}
            sx={{ 
              objectFit: 'cover',
              transition: 'transform var(--transition-slow)',
              transform: isHovered && !prefersReducedMotion ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          
          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1rem',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      size="small"
                      onClick={handleFavoriteClick}
                      disabled={actionInProgress === 'favorite'}
                      aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: !prefersReducedMotion ? 'scale(1.1)' : 'none'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                        }
                      }}
                    >
                      {isFavorite ? (
                        <FavoriteIcon sx={{ color: '#f093fb' }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ color: 'white' }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Add to Watchlist">
                    <IconButton
                      size="small"
                      onClick={handleAddToWatchlist}
                      disabled={actionInProgress === 'watchlist'}
                      aria-label={`Add ${movie.title} to watchlist`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: !prefersReducedMotion ? 'scale(1.1)' : 'none'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                        }
                      }}
                    >
                      <AddIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="More Info">
                    <IconButton
                      size="small"
                      aria-label={`View details for ${movie.title}`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: !prefersReducedMotion ? 'scale(1.1)' : 'none'
                        },
                      }}
                    >
                      <InfoIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rating badge */}
          {movie.vote_average && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <StarIcon sx={{ fontSize: 16, color: '#ffd700' }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {movie.vote_average?.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 2, height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              id={`movie-title-${movie.id}`}
              variant="h6" 
              component="h3"
              sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {movie.title || movie.name || 'Untitled'}
            </Typography>
            
            <Typography 
              id={`movie-desc-${movie.id}`}
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                mb: 1
              }}
            >
              {movie.overview || 'No description available.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={formatDate(movie.release_date || movie.first_air_date)}
              size="small"
              sx={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MovieCard;

