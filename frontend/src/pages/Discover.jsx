import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  Pagination
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  NewReleases as NewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import LoadingState from '../components/LoadingState';
import MovieStats from '../components/MovieStats';
import MovieListView from '../components/MovieListView';
import ResultsHeader from '../components/ResultsHeader';
import { useMovies } from '../hooks/useMovies';
import { useAccessibility } from '../hooks/useAccessibility';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'vote_count.desc', label: 'Most Votes' },
  { value: 'revenue.desc', label: 'Highest Revenue' }
];

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const Discover = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  const [filters, setFilters] = useState({
    sort_by: 'popularity.desc',
    with_genres: [],
    primary_release_date_gte: '',
    primary_release_date_lte: '',
    vote_average_gte: 0,
    vote_average_lte: 10,
    vote_count_gte: 0,
    page: 1
  });

  const [quickCategory, setQuickCategory] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const { movies, loading, error, discoverMovies, searchMovies, getTrendingMovies, getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies } = useMovies();
  const { announce } = useAccessibility();

  // Sort movies client-side when sortBy changes
  const sortMovies = (movies, sortOption) => {
    const sorted = [...movies];
    switch (sortOption) {
      case 'title.asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title.desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'release_date.desc':
        return sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      case 'release_date.asc':
        return sorted.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
      case 'vote_average.desc':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'vote_average.asc':
        return sorted.sort((a, b) => a.vote_average - b.vote_average);
      default:
        return sorted; // Keep original order for popularity
    }
  };

  const sortedMovies = sortMovies(movies, sortBy);

  // Load movies on component mount and when search query changes
  useEffect(() => {
    if (searchQuery) {
      // If there's a search query, perform search instead of showing popular movies
      handleSearch();
    } else {
      // Default to popular movies if no search query
      handleQuickCategory('popular');
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const results = await searchMovies(searchQuery);
      if (results) {
        setTotalPages(results.total_pages || 1);
        announce(`Found ${results.total_results || 0} movies for "${searchQuery}"`);
      }
    } catch (error) {
      announce('Search failed. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleGenreToggle = (genreId) => {
    setFilters(prev => ({
      ...prev,
      with_genres: prev.with_genres.includes(genreId)
        ? prev.with_genres.filter(id => id !== genreId)
        : [...prev.with_genres, genreId],
      page: 1
    }));
  };

  const handleQuickCategory = async (category) => {
    setQuickCategory(category);
    setFilters(prev => ({ ...prev, page: 1 }));
    
    let result;
    switch (category) {
      case 'trending':
        result = await getTrendingMovies('week', 1);
        announce('Loading trending movies');
        break;
      case 'popular':
        result = await getPopularMovies(1);
        announce('Loading popular movies');
        break;
      case 'top_rated':
        result = await getTopRatedMovies(1);
        announce('Loading top rated movies');
        break;
      case 'now_playing':
        result = await getNowPlayingMovies(1);
        announce('Loading now playing movies');
        break;
      case 'upcoming':
        result = await getUpcomingMovies(1);
        announce('Loading upcoming movies');
        break;
      default:
        break;
    }
    
    if (result) {
      setTotalPages(Math.min(result.total_pages || 1, 500)); // TMDB limits to 500 pages
    }
  };

  const handleDiscoverMovies = async () => {
    const cleanFilters = { ...filters };
    
    // Remove empty values
    Object.keys(cleanFilters).forEach(key => {
      if (cleanFilters[key] === '' || 
          (Array.isArray(cleanFilters[key]) && cleanFilters[key].length === 0) ||
          (key === 'vote_average_gte' && cleanFilters[key] === 0) ||
          (key === 'vote_count_gte' && cleanFilters[key] === 0)) {
        delete cleanFilters[key];
      }
    });

    // Convert genre array to string
    if (cleanFilters.with_genres && cleanFilters.with_genres.length > 0) {
      cleanFilters.with_genres = cleanFilters.with_genres.join(',');
    }

    const result = await discoverMovies(cleanFilters);
    setQuickCategory(''); // Clear quick category when using custom filters
    announce(`Found ${result?.results?.length || 0} movies with current filters`);
    
    if (result) {
      setTotalPages(Math.min(result.total_pages || 1, 500));
    }
  };

  const handlePageChange = async (event, page) => {
    setFilters(prev => ({ ...prev, page }));
    
    if (quickCategory) {
      // Use the same quick category function but with new page
      switch (quickCategory) {
        case 'trending':
          await getTrendingMovies('week', page);
          break;
        case 'popular':
          await getPopularMovies(page);
          break;
        case 'top_rated':
          await getTopRatedMovies(page);
          break;
        case 'now_playing':
          await getNowPlayingMovies(page);
          break;
        case 'upcoming':
          await getUpcomingMovies(page);
          break;
      }
    } else {
      // Use discover with current filters
      await handleDiscoverMovies();
    }
  };

  const clearFilters = () => {
    setFilters({
      sort_by: 'popularity.desc',
      with_genres: [],
      primary_release_date_gte: '',
      primary_release_date_lte: '',
      vote_average_gte: 0,
      vote_average_lte: 10,
      vote_count_gte: 0,
      page: 1
    });
    setQuickCategory('');
    handleQuickCategory('popular'); // Load popular movies after clearing
  };

  return (
    <Container 
      component="main"
      maxWidth="xl" 
      sx={{ mt: 4, mb: 4 }}
      role="main"
      aria-labelledby="discover-heading"
    >
      <Typography 
        id="discover-heading"
        variant="h3" 
        component="h1"
        fontWeight={700} 
        gutterBottom 
        color="primary.main"
        sx={{ mb: 4 }}
      >
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Movies'}
      </Typography>

      {/* Movie Statistics */}
      <MovieStats 
        totalMovies={movies.length || 0}
        avgRating={movies.length > 0 ? movies.reduce((sum, movie) => sum + (movie.vote_average || 0), 0) / movies.length : 0}
        totalViews={movies.length > 0 ? movies.reduce((sum, movie) => sum + (movie.popularity || 0), 0) : 0}
        trendingCount={quickCategory === 'trending' ? movies.length : 0}
      />

      {/* Quick Category Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { key: 'trending', label: 'Trending', icon: <TrendingIcon /> },
            { key: 'popular', label: 'Popular', icon: <StarIcon /> },
            { key: 'top_rated', label: 'Top Rated', icon: <StarIcon /> },
            { key: 'now_playing', label: 'Now Playing', icon: <PlayIcon /> },
            { key: 'upcoming', label: 'Upcoming', icon: <NewIcon /> }
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={quickCategory === key ? 'contained' : 'outlined'}
              startIcon={icon}
              onClick={() => handleQuickCategory(key)}
              sx={{ minWidth: 120 }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Advanced Filters */}
      <Accordion 
        expanded={filtersExpanded} 
        onChange={(e, expanded) => setFiltersExpanded(expanded)}
        sx={{ mb: 4 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">Advanced Filters</Typography>
            {filters.with_genres.length > 0 && (
              <Chip 
                size="small" 
                label={`${filters.with_genres.length} genres`} 
                color="primary" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sort_by}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Release Date From */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Release Date From"
                type="date"
                value={filters.primary_release_date_gte}
                onChange={(e) => handleFilterChange('primary_release_date_gte', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Release Date To */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Release Date To"
                type="date"
                value={filters.primary_release_date_lte}
                onChange={(e) => handleFilterChange('primary_release_date_lte', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Minimum Vote Count */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Minimum Vote Count"
                type="number"
                value={filters.vote_count_gte}
                onChange={(e) => handleFilterChange('vote_count_gte', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Rating Range */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Rating Range: {filters.vote_average_gte} - {filters.vote_average_lte}
              </Typography>
              <Slider
                value={[filters.vote_average_gte, filters.vote_average_lte]}
                onChange={(e, newValue) => {
                  handleFilterChange('vote_average_gte', newValue[0]);
                  handleFilterChange('vote_average_lte', newValue[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' }
                ]}
              />
            </Grid>

            {/* Genres */}
            <Grid item xs={12}>
              <Typography gutterBottom>Genres</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {GENRES.map(genre => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    variant={filters.with_genres.includes(genre.id) ? 'filled' : 'outlined'}
                    color={filters.with_genres.includes(genre.id) ? 'primary' : 'default'}
                    onClick={() => handleGenreToggle(genre.id)}
                    clickable
                  />
                ))}
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleDiscoverMovies}
                  startIcon={<FilterIcon />}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Loading State */}
      {loading && <LoadingState message="Discovering movies..." />}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} role="alert" aria-live="polite">
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {movies.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResultsHeader
            resultCount={movies.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchTerm={quickCategory ? 
              `${quickCategory.replace('_', ' ').toUpperCase()} Movies` : 
              'Discovery Results'}
            showViewToggle={true}
          />

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {viewMode === 'list' ? (
            <MovieListView movies={sortedMovies} />
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence mode="wait">
                {sortedMovies.map((movie, index) => (
                  <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <MovieCard movie={movie} />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </motion.div>
      )}

      {/* No Results Message */}
      {!loading && !error && movies.length === 0 && (
        <Typography 
          sx={{ mt: 4, textAlign: 'center' }}
          color="text.secondary"
          component="p"
          role="status"
          aria-live="polite"
        >
          No movies found with the current filters. Try adjusting your search criteria.
        </Typography>
      )}
    </Container>
  );
};

export default Discover;
