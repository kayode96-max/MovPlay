import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText, IconButton, Stack, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import API, { userAPI } from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingState from '../components/LoadingState';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotification } from '../hooks/useNotification';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  
  const { announce, manageFocus } = useAccessibility();
  const { showNotification } = useNotification();

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data);
      announce(`Profile loaded for ${data.username}`);
    } catch (err) {
      const errorMsg = 'Failed to load profile';
      setError(errorMsg);
      announce(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchSocial = async () => {
    if (!profile?._id) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        userAPI.getFollowers(profile._id),
        userAPI.getFollowing(profile._id)
      ]);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
    } catch {}
  };

  useEffect(() => { if (profile) fetchSocial(); }, [profile]);

  const handleFollow = async (userId) => {
    setFollowLoading(true);
    try {
      await userAPI.followUser(userId);
      fetchSocial();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setFollowLoading(true);
    try {
      await userAPI.unfollowUser(userId);
      fetchSocial();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRemoveFavorite = async (tmdbId) => {
    setRemoving(tmdbId);
    try {
      const token = localStorage.getItem('token');
      await API.delete('/user/favorites', {
        data: { tmdbId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const movie = profile.favorites.find(f => f.tmdbId === tmdbId);
      const successMsg = `${movie?.title || 'Movie'} removed from favorites`;
      announce(successMsg);
      showNotification(successMsg, 'success');
      fetchProfile();
    } catch (err) {
      const errorMsg = 'Failed to remove from favorites';
      announce(errorMsg);
      showNotification(errorMsg, 'error');
    }
    setRemoving('');
    setConfirmDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    announce('Logged out successfully');
    showNotification('Logged out successfully', 'info');
    window.location.href = '/login';
  };

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error) return (
    <Alert severity="error" sx={{ mt: 4 }} role="alert" aria-live="polite">
      {error}
    </Alert>
  );
  if (!profile) return null;

  return (
    <Box component="main" sx={{ mt: 4 }} role="main" aria-labelledby="profile-heading">
      <Paper sx={{ p: 3 }} elevation={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            id="profile-heading"
            variant="h5" 
            component="h1"
            gutterBottom
          >
            Welcome, {profile.username}!
          </Typography>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            Logout
          </Button>
        </Stack>
        
        <Typography 
          variant="subtitle1"
          component="p"
          aria-label={`Email address: ${profile.email}`}
        >
          Email: {profile.email}
        </Typography>
        
        <section aria-labelledby="favorites-heading">
          <Typography 
            id="favorites-heading"
            variant="h6" 
            component="h2"
            sx={{ mt: 3 }}
          >
            Favorites ({profile.favorites?.length || 0})
          </Typography>
          
          <List role="list" aria-label="Favorite movies">
            {profile.favorites && profile.favorites.length > 0 ? (
              profile.favorites.map(movie => (
                <ListItem 
                  key={movie._id} 
                  role="listitem"
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label={`Remove ${movie.title || movie.tmdbId} from favorites`}
                      onClick={() => setConfirmDelete(movie)} 
                      disabled={removing === movie.tmdbId}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={movie.title || movie.tmdbId}
                    primaryTypographyProps={{
                      'aria-label': `Movie: ${movie.title || movie.tmdbId}`
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem role="listitem">
                <ListItemText 
                  primary="No favorites yet."
                  primaryTypographyProps={{
                    color: 'text.secondary',
                    style: { fontStyle: 'italic' }
                  }}
                />
              </ListItem>
            )}
          </List>
        </section>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Followers ({followers.length})</Typography>
          <List>
            {followers.map(f => (
              <ListItem key={f._id} secondaryAction={
                <Button disabled={followLoading} onClick={() => handleUnfollow(f._id)} size="small">Unfollow</Button>
              }>
                <ListItemText primary={f.username} />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6">Following ({following.length})</Typography>
          <List>
            {following.map(f => (
              <ListItem key={f._id} secondaryAction={
                <Button disabled={followLoading} onClick={() => handleUnfollow(f._id)} size="small">Unfollow</Button>
              }>
                <ListItemText primary={f.username} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <DialogTitle id="confirm-delete-title">
          Remove from Favorites
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-delete-description">
            Are you sure you want to remove "{confirmDelete?.title || confirmDelete?.tmdbId}" from your favorites?
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
            onClick={() => handleRemoveFavorite(confirmDelete?.tmdbId)}
            color="error"
            variant="contained"
            disabled={removing === confirmDelete?.tmdbId}
            aria-label="Confirm removal from favorites"
          >
            {removing === confirmDelete?.tmdbId ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
