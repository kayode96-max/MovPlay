import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Fab
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Whatshot as WhatshotIcon,
  MovieFilter as MovieIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  SkipNext as SkipNextIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from '../components/NotificationProvider';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import LoadingState from '../components/LoadingState';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, user } = useAuth();
  const { prefersReducedMotion, announce, manageFocus } = useAccessibility();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const mainContentRef = useRef(null);
  const heroRef = useRef(null);
  const skipLinkRef = useRef(null);

  // Announce page load to screen readers
  useEffect(() => {
    announce(
      isAuthenticated 
        ? `Welcome back to MovPlay, ${user?.username}. Home page loaded with movie recommendations.`
        : 'Welcome to MovPlay. Discover amazing movies and entertainment.'
    );
  }, [isAuthenticated, user, announce]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "easeOut"
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 1,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        announce('Loading movie recommendations...');
        
        // Enhanced mock data for better visual presentation
        const mockMovies = [
          {
            id: 1,
            title: "The Matrix",
            overview: "A computer programmer discovers that reality as he knows it doesn't exist. Join Neo on his journey to uncover the truth behind the Matrix.",
            poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
            release_date: "1999-03-30",
            vote_average: 8.7,
            genre_ids: [28, 878]
          },
          {
            id: 2,
            title: "Inception",
            overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
            release_date: "2010-07-16",
            vote_average: 8.8,
            genre_ids: [28, 878, 53]
          },
          {
            id: 3,
            title: "Interstellar",
            overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
            release_date: "2014-11-07",
            vote_average: 8.6,
            genre_ids: [18, 878]
          },
          {
            id: 4,
            title: "Dune",
            overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet.",
            poster_path: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/iopYFB1b6Bh7FWZh3onQhph1sih.jpg",
            release_date: "2021-10-22",
            vote_average: 8.0,
            genre_ids: [878, 12]
          },
          {
            id: 5,
            title: "The Dark Knight",
            overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
            poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
            release_date: "2008-07-18",
            vote_average: 9.0,
            genre_ids: [18, 28, 80]
          },
          {
            id: 6,
            title: "Avatar",
            overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world.",
            poster_path: "https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs8UYD7ybct1l.jpg",
            backdrop_path: "https://image.tmdb.org/t/p/original/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg",
            release_date: "2009-12-18",
            vote_average: 7.6,
            genre_ids: [28, 12, 14, 878]
          }
        ];

        // Try to fetch real data, fallback to mock data
        try {
          const [trendingRes, popularRes, topRatedRes] = await Promise.all([
            movieAPI.getTrending('day', 1),
            movieAPI.getPopular(1),
            movieAPI.getTopRated(1)
          ]);

          const trending = trendingRes?.data?.results?.slice(0, 8) || mockMovies.slice(0, 3);
          const popular = popularRes?.data?.results?.slice(0, 8) || mockMovies.slice(2, 5);
          const topRated = topRatedRes?.data?.results?.slice(0, 8) || mockMovies.slice(3, 6);

          setTrendingMovies(trending);
          setPopularMovies(popular);
          setTopRatedMovies(topRated);
          setHeroMovie(trending[0] || mockMovies[0]);
          
          showSuccess('Movie recommendations loaded successfully!');
          announce(`Loaded ${trending.length + popular.length + topRated.length} movie recommendations`);
          
        } catch (apiError) {
          // API not available, using mock data
          setTrendingMovies(mockMovies.slice(0, 3));
          setPopularMovies(mockMovies.slice(2, 5));
          setTopRatedMovies(mockMovies.slice(3, 6));
          setHeroMovie(mockMovies[0]);
          
          announce('Demo movie recommendations loaded');
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movie recommendations');
        showError('Failed to load movie recommendations. Please try again later.');
        announce('Error loading movie recommendations');
        
        // Fallback to empty arrays
        setTrendingMovies([]);
        setPopularMovies([]);
        setTopRatedMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [announce, showError, showSuccess]);

  const LoadingSkeleton = ({ count = 6 }) => (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
          >
            <LoadingState 
              type="skeleton" 
              height={450}
              sx={{
                borderRadius: 5,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  const SectionHeader = ({ title, icon, subtitle, id }) => (
    <motion.div variants={sectionVariants} className="section-header">
      <Box className="section-icon" aria-hidden="true">
        {icon}
      </Box>
      <Box>
        <Typography 
          variant="h3" 
          className="section-title"
          id={id}
          sx={{ 
            mb: 1,
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mt: 0.5, color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </motion.div>
  );

  const MovieSection = ({ title, movies, icon, loading: sectionLoading, subtitle, sectionId }) => (
    <motion.div variants={sectionVariants}>
      <Box sx={{ mb: 4 }} component="section" aria-labelledby={sectionId}>
        <SectionHeader title={title} icon={icon} subtitle={subtitle} id={sectionId} />
        {sectionLoading ? (
          <Box role="status" aria-label={`Loading ${title.toLowerCase()}`}>
            <LoadingSkeleton count={4} />
          </Box>
        ) : movies.length > 0 ? (
          <Grid 
            container 
            spacing={3} 
            className="movie-grid"
            role="list"
            aria-label={`${title} movies`}
          >
            {movies.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id} role="listitem">
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'var(--text-secondary)'
            }}
            role="status"
          >
            <Typography variant="body1">
              No {title.toLowerCase()} available at the moment.
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );

  const HeroSection = () => (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="visible"
      className="hero-section"
    >
      <Box
        ref={heroRef}
        component="section"
        aria-labelledby="hero-title"
        role="banner"
        sx={{
          position: 'relative',
          minHeight: { xs: 300, md: 400 },
          borderRadius: 6,
          overflow: 'hidden',
          background: heroMovie?.backdrop_path
            ? `linear-gradient(45deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${heroMovie.backdrop_path.startsWith('http') ? heroMovie.backdrop_path : `https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`})`
            : 'var(--primary-gradient)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.8 }}
              >
                <Chip
                  label="✨ Featured"
                  sx={{
                    mb: 2,
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                  aria-hidden="true"
                />
                <Typography
                  id="hero-title"
                  variant="h1"
                  className="hero-title"
                  sx={{
                    mb: 2,
                    color: 'white !important',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {isAuthenticated ? `Welcome back, ${user?.username}!` : 'Discover Amazing Movies'}
                </Typography>
                <Typography
                  variant="h5"
                  className="hero-subtitle"
                  sx={{
                    mb: 3,
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    lineHeight: 1.4,
                  }}
                >
                  {heroMovie?.title ? `Now featuring: ${heroMovie.title}` : 'Your ultimate movie companion for endless entertainment'}
                </Typography>
                {heroMovie?.overview && (
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: 'rgba(255,255,255,0.8)',
                      maxWidth: 600,
                      lineHeight: 1.6,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    {heroMovie.overview.length > 150 
                      ? `${heroMovie.overview.substring(0, 150)}...` 
                      : heroMovie.overview}
                  </Typography>
                )}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  role="group"
                  aria-label="Hero action buttons"
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={() => {
                      if (heroMovie) {
                        navigate(`/movie/${heroMovie.id}`);
                        announce(`Navigating to ${heroMovie.title} details`);
                      } else {
                        navigate('/discover');
                        announce('Navigating to discover movies');
                      }
                    }}
                    sx={{
                      background: 'var(--primary-gradient)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'var(--primary-gradient)',
                        transform: prefersReducedMotion ? 'none' : 'translateY(-3px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                      },
                      '&:focus': {
                        outline: '3px solid white',
                        outlineOffset: '2px',
                      }
                    }}
                  >
                    {heroMovie ? 'Watch Now' : 'Explore Movies'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ExploreIcon />}
                    onClick={() => {
                      navigate('/discover');
                      announce('Navigating to discover more movies');
                    }}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        transform: prefersReducedMotion ? 'none' : 'translateY(-3px)',
                      },
                      '&:focus': {
                        outline: '3px solid white',
                        outlineOffset: '2px',
                      }
                    }}
                  >
                    Discover More
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </motion.div>
  );

  const StatsSection = () => (
    <motion.div variants={sectionVariants}>
      <Box 
        component="section"
        aria-labelledby="stats-heading"
        sx={{ mb: 6 }}
      >
        <Typography 
          id="stats-heading" 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: 'var(--text-primary)',
            fontWeight: 600
          }}
        >
          Movie Statistics
        </Typography>
        <Grid 
          container 
          spacing={3} 
          className="stats-grid"
          role="list"
          aria-label="Movie statistics"
        >
          <Grid item xs={12} sm={4} role="listitem">
            <Box 
              className="stat-card glass-hover"
              sx={{
                textAlign: 'center',
                p: 3,
                background: 'var(--glass-bg)',
                borderRadius: 3,
                border: '1px solid var(--glass-border)',
                transition: 'all var(--transition-normal)',
                '&:hover': {
                  background: 'var(--surface-hover)',
                  transform: prefersReducedMotion ? 'none' : 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                }
              }}
              tabIndex={0}
              role="region"
              aria-labelledby="trending-stat"
            >
              <Typography 
                id="trending-stat"
                variant="h2" 
                className="stat-number"
                sx={{ 
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {trendingMovies.length || '6+'}
              </Typography>
              <Typography 
                variant="body2" 
                className="stat-label"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Trending Movies
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} role="listitem">
            <Box 
              className="stat-card glass-hover"
              sx={{
                textAlign: 'center',
                p: 3,
                background: 'var(--glass-bg)',
                borderRadius: 3,
                border: '1px solid var(--glass-border)',
                transition: 'all var(--transition-normal)',
                '&:hover': {
                  background: 'var(--surface-hover)',
                  transform: prefersReducedMotion ? 'none' : 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(240, 147, 251, 0.2)',
                }
              }}
              tabIndex={0}
              role="region"
              aria-labelledby="popular-stat"
            >
              <Typography 
                id="popular-stat"
                variant="h2" 
                className="stat-number"
                sx={{ 
                  color: 'var(--secondary-color)',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {popularMovies.length || '6+'}
              </Typography>
              <Typography 
                variant="body2" 
                className="stat-label"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Popular Picks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} role="listitem">
            <Box 
              className="stat-card glass-hover"
              sx={{
                textAlign: 'center',
                p: 3,
                background: 'var(--glass-bg)',
                borderRadius: 3,
                border: '1px solid var(--glass-border)',
                transition: 'all var(--transition-normal)',
                '&:hover': {
                  background: 'var(--surface-hover)',
                  transform: prefersReducedMotion ? 'none' : 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.2)',
                }
              }}
              tabIndex={0}
              role="region"
              aria-labelledby="toprated-stat"
            >
              <Typography 
                id="toprated-stat"
                variant="h2" 
                className="stat-number"
                sx={{ 
                  color: 'var(--accent-color)',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {topRatedMovies.length || '6+'}
              </Typography>
              <Typography 
                variant="body2" 
                className="stat-label"
                sx={{ color: 'var(--text-secondary)' }}
              >
                Top Rated
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link"
        onFocus={() => skipLinkRef.current?.focus()}
        ref={skipLinkRef}
      >
        Skip to main content
      </a>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <main id="main-content" ref={mainContentRef} tabIndex="-1">
          {/* Search Section */}
          <motion.div variants={sectionVariants}>
            <Box 
              className="search-container" 
              sx={{ my: 4 }}
              component="section"
              aria-labelledby="search-heading"
            >
              <Typography 
                id="search-heading"
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  textAlign: 'center',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Find Your Next Favorite Movie
              </Typography>
              <SearchBar />
            </Box>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="assertive"
            >
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: 2,
                  mb: 4
                }}
              >
                <Typography variant="h6" sx={{ color: 'var(--error-color)', mb: 2 }}>
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                  sx={{ 
                    borderColor: 'var(--error-color)',
                    color: 'var(--error-color)',
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </motion.div>
          )}

          {/* Stats Section */}
          {!error && <StatsSection />}

          {/* Movie Sections */}
          {!error && (
            <>
              <MovieSection
                title="Trending Now"
                subtitle="What's hot this week"
                movies={trendingMovies}
                icon={<TrendingIcon sx={{ color: 'var(--primary-color)' }} />}
                loading={loading}
                sectionId="trending-section"
              />

              <MovieSection
                title="Popular Movies"
                subtitle="Audience favorites"
                movies={popularMovies}
                icon={<WhatshotIcon sx={{ color: 'var(--secondary-color)' }} />}
                loading={loading}
                sectionId="popular-section"
              />

              <MovieSection
                title="Top Rated"
                subtitle="Critically acclaimed"
                movies={topRatedMovies}
                icon={<StarIcon sx={{ color: 'var(--accent-color)' }} />}
                loading={loading}
                sectionId="toprated-section"
              />
            </>
          )}
        </main>

        {/* Floating Action Button */}
        <Fab
          className="fab"
          onClick={() => {
            navigate('/discover');
            announce('Navigating to discover page');
          }}
          aria-label="Open discover page"
          sx={{ 
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'var(--primary-gradient)',
            color: 'white',
            '&:hover': {
              background: 'var(--primary-gradient)',
              transform: prefersReducedMotion ? 'none' : 'scale(1.1)',
            },
            '&:focus': {
              outline: '3px solid var(--primary-color)',
              outlineOffset: '2px',
            }
          }}
        >
          <SearchIcon />
        </Fab>

        {/* Screen reader status updates */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loading && 'Loading movie recommendations...'}
          {error && `Error: ${error}`}
        </div>
      </Container>
    </motion.div>
  );
};

export default Home;

