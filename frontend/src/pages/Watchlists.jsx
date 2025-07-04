import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Paper, CircularProgress, IconButton, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import API from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingState from '../components/LoadingState';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotification } from '../hooks/useNotification';
import { useFormValidation } from '../hooks/useFormValidation';

const Watchlists = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const { announce, manageFocus } = useAccessibility();
  const { showNotification } = useNotification();
  const { validateField, getFieldError, isFieldValid } = useFormValidation();

  const fetchWatchlists = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlists(data.watchlists || []);
      announce(`${data.watchlists?.length || 0} watchlists loaded`);
    } catch (err) {
      const errorMsg = 'Failed to load watchlists';
      setError(errorMsg);
      announce(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const handleCreate = async () => {
    const nameValidation = validateField('name', name, { required: true, minLength: 1, maxLength: 50 });
    if (!nameValidation.isValid) {
      announce(`Validation error: ${nameValidation.error}`);
      return;
    }
    
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await API.post('/user/watchlists', { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const successMsg = `Watchlist "${name}" created successfully`;
      setName('');
      announce(successMsg);
      showNotification(successMsg, 'success');
      fetchWatchlists();
    } catch (err) {
      const errorMsg = 'Failed to create watchlist';
      setError(errorMsg);
      announce(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveMovie = async (watchlistId, tmdbId) => {
    setRemoving(tmdbId);
    try {
      const token = localStorage.getItem('token');
      await API.post('/user/watchlists/remove', { watchlistId, tmdbId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const watchlist = watchlists.find(wl => wl._id === watchlistId);
      const movie = watchlist?.movies?.find(m => m.tmdbId === tmdbId);
      const successMsg = `${movie?.title || 'Movie'} removed from ${watchlist?.name || 'watchlist'}`;
      announce(successMsg);
      showNotification(successMsg, 'success');
      fetchWatchlists();
    } catch (err) {
      const errorMsg = 'Failed to remove movie from watchlist';
      announce(errorMsg);
      showNotification(errorMsg, 'error');
    }
    setRemoving('');
    setConfirmDelete(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !creating && name.trim()) {
      handleCreate();
    }
  };

  return (
    <Box component="main" sx={{ mt: 4 }} role="main" aria-labelledby="watchlists-heading">
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography 
          id="watchlists-heading"
          variant="h5" 
          component="h1"
          gutterBottom
        >
          My Watchlists ({watchlists.length})
        </Typography>
        
        <Box 
          sx={{ display: 'flex', gap: 2, mb: 2 }}
          component="form"
          onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
          role="group"
          aria-labelledby="create-watchlist-group"
        >
          <Typography 
            id="create-watchlist-group"
            component="h2"
            variant="h6"
            sx={{ sr: true }}
          >
            Create New Watchlist
          </Typography>
          
          <TextField 
            label="New Watchlist Name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!isFieldValid('name', name)}
            helperText={getFieldError('name', name) || 'Enter a name for your watchlist'}
            disabled={creating}
            required
            fullWidth
            inputProps={{
              'aria-describedby': 'watchlist-name-help',
              maxLength: 50
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={creating || !name.trim()}
            aria-label="Create new watchlist"
            sx={{ minWidth: 120 }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </Box>
        
        {loading ? (
          <LoadingState message="Loading watchlists..." />
        ) : (
          <List role="list" aria-label="Your watchlists">
            {watchlists.length > 0 ? watchlists.map(wl => (
              <ListItem 
                key={wl._id} 
                alignItems="flex-start" 
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                role="listitem"
                component="section"
                aria-labelledby={`watchlist-${wl._id}-name`}
              >
                <Typography 
                  id={`watchlist-${wl._id}-name`}
                  variant="h6"
                  component="h3"
                  sx={{ mb: 1 }}
                >
                  {wl.name} ({wl.movies?.length || 0} movies)
                </Typography>
                
                <List 
                  sx={{ width: '100%', pl: 2 }}
                  role="list"
                  aria-label={`Movies in ${wl.name}`}
                >
                  {wl.movies && wl.movies.length > 0 ? wl.movies.map(m => (
                    <ListItem 
                      key={m._id} 
                      role="listitem"
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label={`Remove ${m.title || m.tmdbId} from ${wl.name}`}
                          onClick={() => setConfirmDelete({ watchlistId: wl._id, tmdbId: m.tmdbId, movie: m, watchlistName: wl.name })}
                          disabled={removing === m.tmdbId}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={m.title || m.tmdbId}
                        primaryTypographyProps={{
                          'aria-label': `Movie: ${m.title || m.tmdbId}`
                        }}
                      />
                    </ListItem>
                  )) : (
                    <ListItem role="listitem">
                      <ListItemText 
                        primary="No movies yet."
                        primaryTypographyProps={{
                          color: 'text.secondary',
                          style: { fontStyle: 'italic' }
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </ListItem>
            )) : (
              <ListItem role="listitem">
                <ListItemText 
                  primary="No watchlists yet. Create your first watchlist above!"
                  primaryTypographyProps={{
                    color: 'text.secondary',
                    style: { fontStyle: 'italic' }
                  }}
                />
              </ListItem>
            )}
          </List>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert" aria-live="polite">
            {error}
          </Alert>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        aria-labelledby="confirm-remove-title"
        aria-describedby="confirm-remove-description"
      >
        <DialogTitle id="confirm-remove-title">
          Remove Movie from Watchlist
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-remove-description">
            Are you sure you want to remove "{confirmDelete?.movie?.title || confirmDelete?.movie?.tmdbId}" 
            from "{confirmDelete?.watchlistName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDelete(null)}
            aria-label="Cancel removal"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleRemoveMovie(confirmDelete?.watchlistId, confirmDelete?.tmdbId)}
            color="error"
            variant="contained"
            disabled={removing === confirmDelete?.tmdbId}
            aria-label="Confirm removal from watchlist"
          >
            {removing === confirmDelete?.tmdbId ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Watchlists;
