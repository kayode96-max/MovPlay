import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Paper, Stack, MenuItem, Select, FormControl, InputLabel, Alert, Chip, Divider, Dialog, DialogContent, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import API, { movieAPI, userAPI, watchlistAPI } from '../api';
import MovieCard from '../components/MovieCard';
import ReviewForm from '../components/ReviewForm';
import LoadingState from '../components/LoadingState';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from '../components/NotificationProvider';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [error, setError] = useState('');
  const [favMsg, setFavMsg] = useState('');
  const [reviews, setReviews] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [wlMsg, setWlMsg] = useState('');
  const [trailers, setTrailers] = useState([]);
  const [trailerOpen, setTrailerOpen] = useState(false);
  
  const { announce, prefersReducedMotion } = useAccessibility();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await movieAPI.getDetails(id);
        setMovie(data);
        announce(`Movie details loaded: ${data.title}`);
        const rec = await movieAPI.getRecommendations(id);
        setRecommendations(rec.data.results || []);
      } catch (err) {
        const errorMsg = 'Failed to load movie details';
        setError(errorMsg);
        announce(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, announce, showError]);

  const fetchReviews = async () => {
    try {
      const { data } = await movieAPI.getReviews(id);
      setReviews(data);
    } catch {}
  };
  useEffect(() => { fetchReviews(); }, [id]);

  const handleAddFavorite = async () => {
    setFavLoading(true);
    setFavMsg('');
    try {
      const token = localStorage.getItem('token');
      await movieAPI.addToFavorites(id);
      const successMsg = `${movie?.title} added to favorites!`;
      setFavMsg(successMsg);
      announce(successMsg);
      showSuccess(successMsg);
    } catch (err) {
      const errorMsg = 'Failed to add to favorites';
      setFavMsg(errorMsg);
      announce(errorMsg);
      showError(errorMsg);
    } finally {
      setFavLoading(false);
    }
  };

  const fetchWatchlists = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await userAPI.getProfile();
      setWatchlists(data.watchlists || []);
    } catch {}
  };
  useEffect(() => { fetchWatchlists(); }, []);

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) return;
    setWlMsg('');
    try {
      const token = localStorage.getItem('token');
      await watchlistAPI.addToWatchlist(selectedWatchlist, id);
      const watchlistName = watchlists.find(wl => wl._id === selectedWatchlist)?.name || 'watchlist';
      const successMsg = `${movie?.title} added to ${watchlistName}!`;
      setWlMsg(successMsg);
      announce(successMsg);
      showSuccess(successMsg);
    } catch {
      const errorMsg = 'Failed to add to watchlist';
      setWlMsg(errorMsg);
      announce(errorMsg);
      showError(errorMsg);
    }
  };

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const { data } = await movieAPI.getTrailers(id);
        setTrailers(data || []);
      } catch {}
    };
    fetchTrailers();
  }, [id]);

  const handleOpenTrailer = () => setTrailerOpen(true);
  const handleCloseTrailer = () => setTrailerOpen(false);

  if (loading) return <LoadingState message="Loading movie details..." />;
  if (error) return (
    <Alert severity="error" sx={{ mt: 4 }} role="alert" aria-live="polite">
      {error}
    </Alert>
  );
  if (!movie) return null;

  return (
    <Box 
      component="main" 
      sx={{ mt: 4 }}
      role="main"
      aria-labelledby="movie-title"
    >
      {/* Movie Header Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined}
            alt={`${movie.title} movie poster`}
            style={{ width: 220, borderRadius: 8 }}
            loading="lazy"
          />
          <Box sx={{ flex: 1 }}>
            <Typography 
              id="movie-title"
              variant="h4" 
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {movie.title}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              gutterBottom
              aria-label={`Released ${movie.release_date}, rated ${movie.vote_average} out of 10`}
            >
              {movie.release_date} | {movie.vote_average}⭐
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 3 }}
              component="p"
              aria-label="Movie overview"
            >
              {movie.overview}
            </Typography>

            {/* Detailed Movie Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Movie Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Release Date:</strong> {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Rating:</strong> {movie.vote_average}/10 ({movie.vote_count} votes)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {movie.status || 'Unknown'}
                  </Typography>
                </Grid>
                {movie.genres && movie.genres.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" component="div">
                      <strong>Genres:</strong>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {movie.genres.map(genre => (
                          <Chip 
                            key={genre.id} 
                            label={genre.name} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Typography>
                  </Grid>
                )}
                {movie.production_countries && movie.production_countries.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Countries:</strong> {movie.production_countries.map(country => country.name).join(', ')}
                    </Typography>
                  </Grid>
                )}
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Production:</strong> {movie.production_companies.slice(0, 3).map(company => company.name).join(', ')}
                      {movie.production_companies.length > 3 && '...'}
                    </Typography>
                  </Grid>
                )}
                {movie.budget && movie.budget > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Budget:</strong> ${movie.budget.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {movie.revenue && movie.revenue > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Revenue:</strong> ${movie.revenue.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            {/* Action Buttons Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h2" gutterBottom>
              Actions
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={handleAddFavorite} 
              disabled={favLoading} 
              sx={{ mb: 2, mr: 2 }}
              aria-label={`Add ${movie.title} to favorites`}
              aria-describedby={favMsg ? 'fav-status' : undefined}
            >
              {favLoading ? 'Adding...' : 'Add to Favorites'}
            </Button>
            
            {favMsg && (
              <Typography 
                id="fav-status"
                color="primary" 
                sx={{ mt: 1, mb: 2 }}
                role="status"
                aria-live="polite"
              >
                {favMsg}
              </Typography>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="watchlist-select-label">Add to Watchlist</InputLabel>
              <Select
                labelId="watchlist-select-label"
                value={selectedWatchlist}
                label="Add to Watchlist"
                onChange={e => setSelectedWatchlist(e.target.value)}
                aria-describedby="watchlist-help"
              >
                <MenuItem value=""><em>Select a watchlist</em></MenuItem>
                {watchlists.map(wl => (
                  <MenuItem key={wl._id} value={wl._id}>{wl.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              onClick={handleAddToWatchlist} 
              sx={{ mb: 1 }} 
              disabled={!selectedWatchlist}
              aria-label="Add movie to selected watchlist"
              aria-describedby={wlMsg ? 'watchlist-status' : 'watchlist-help'}
            >
              Add to Watchlist
            </Button>
            
            <Typography 
              id="watchlist-help"
              variant="caption"
              sx={{ display: 'block', mt: 0.5 }}
              color="text.secondary"
            >
              {!selectedWatchlist && 'Please select a watchlist first'}
            </Typography>
            
            {wlMsg && (
              <Typography 
                id="watchlist-status"
                color="primary" 
                sx={{ mt: 1 }}
                role="status"
                aria-live="polite"
              >
                {wlMsg}
              </Typography>
            )}

            {/* Add Watch Trailer button if trailers exist */}
            {trailers.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                sx={{ mb: 2, mr: 2 }}
                onClick={handleOpenTrailer}
              >
                Watch Trailer
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>
      
      <section aria-labelledby="recommendations-heading">
        <Typography 
          id="recommendations-heading"
          variant="h5" 
          component="h2"
          sx={{ mb: 2 }}
        >
          Recommended Movies
        </Typography>
        <Grid container spacing={2} role="list" aria-label="Recommended movies">
          {recommendations.map(rec => (
            <Grid item key={rec.id} xs={12} sm={6} md={4} lg={3} role="listitem">
              <MovieCard movie={{
                id: rec.id,
                title: rec.title,
                poster_path: rec.poster_path,
                release_date: rec.release_date,
                vote_average: rec.vote_average,
                overview: rec.overview
              }} />
            </Grid>
          ))}
        </Grid>
        {recommendations.length === 0 && (
          <Typography color="text.secondary">No recommendations available.</Typography>
        )}
      </section>
      
      <section aria-labelledby="reviews-heading" sx={{ mt: 4 }}>
        <Typography 
          id="reviews-heading"
          variant="h5" 
          component="h2"
          sx={{ mb: 2 }}
        >
          Reviews
        </Typography>
        <ReviewForm tmdbId={id} onReview={fetchReviews} />
        <div role="list" aria-label="Movie reviews">
          {reviews.length > 0 ? reviews.map(r => (
            <Box 
              key={r._id} 
              sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}
              role="listitem"
              component="article"
            >
              <Typography 
                variant="subtitle2"
                component="header"
                aria-label={`Review by ${r.user?.username || 'User'}, rated ${r.rating} out of 5 stars`}
              >
                {r.user?.username || 'User'} - <b>{r.rating}⭐</b>
              </Typography>
              <Typography component="p">{r.comment}</Typography>
            </Box>
          )) : (
            <Typography role="listitem">No reviews yet.</Typography>
          )}
        </div>
      </section>

      {/* Trailer Dialog */}
      <Dialog open={trailerOpen} onClose={handleCloseTrailer} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {trailers.length > 0 && (
            <iframe
              width="100%"
              height="480"
              src={`https://www.youtube.com/embed/${trailers[0].key}`}
              title={trailers[0].name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MovieDetails;
