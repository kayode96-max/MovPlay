// Enhanced API utility for MovPlay backend requests
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiry
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Only redirect if not on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: (data) => api.delete('/auth/account', { data }),
  getUserStats: () => api.get('/auth/stats'),
  verifyToken: () => api.get('/auth/verify'),
};

export const movieAPI = {
  // Search and discovery
  search: (query, filters = {}) => api.get('/movies/search', { params: { query, ...filters } }),
  discover: (filters = {}) => api.get('/movies/discover', { params: filters }),
  getPopular: (page = 1) => api.get('/movies/popular', { params: { page } }),
  getTrending: (timeWindow = 'day', page = 1) => api.get('/movies/trending', { params: { timeWindow, page } }),
  getTopRated: (page = 1) => api.get('/movies/top-rated', { params: { page } }),
  getNowPlaying: (page = 1) => api.get('/movies/now-playing', { params: { page } }),
  getUpcoming: (page = 1) => api.get('/movies/upcoming', { params: { page } }),
  
  // Movie details
  getDetails: (tmdbId) => api.get(`/movies/${tmdbId}`),
  getRecommendations: (tmdbId, page = 1) => api.get(`/movies/${tmdbId}/recommendations`, { params: { page } }),
  getSimilar: (tmdbId, page = 1) => api.get(`/movies/${tmdbId}/similar`, { params: { page } }),
  getTrailers: (tmdbId) => api.get(`/movies/${tmdbId}/trailers`),
  
  // User interactions (updated to match backend)
  addToFavorites: (tmdbId) => api.post('/user/favorites', { tmdbId }),
  removeFromFavorites: (tmdbId) => api.delete('/user/favorites', { data: { tmdbId } }),
  getFavorites: () => api.get('/user/profile'), // favorites are part of profile

  // Reviews (updated to match backend)
  getReviews: (tmdbId) => api.get(`/user/reviews/${tmdbId}`),
  addReview: (reviewData) => api.post('/user/reviews', reviewData),
  // updateReview, deleteReview, markReviewHelpful, reportReview not implemented in backend routes

  // Genres
  getGenres: () => api.get('/movies/genres'),
};

export const userAPI = {
  // Profile management (updated to match backend)
  getProfile: () => api.get('/user/profile'),
  getPublicProfiles: (page = 1, search = '') => api.get('/user/public', { params: { page, search } }),
  followUser: (userId) => api.post(`/user/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/user/${userId}/follow`),
  getFollowers: (userId, page = 1) => api.get(`/user/${userId}/followers`, { params: { page } }),
  getFollowing: (userId, page = 1) => api.get(`/user/${userId}/following`, { params: { page } }),
  
  // User content
  getUserReviews: (userId, page = 1) => api.get(`/user/${userId}/reviews`, { params: { page } }),
  getUserWatchlists: (userId, page = 1) => api.get(`/user/${userId}/watchlists`, { params: { page } }),
  getUserFavorites: (userId, page = 1) => api.get(`/user/${userId}/favorites`, { params: { page } }),
};

export const watchlistAPI = {
  // Watchlist management (updated to match backend)
  getWatchlists: () => api.get('/user/watchlists'),
  createWatchlist: (data) => api.post('/user/watchlists', data),
  // No getWatchlist, updateWatchlist, deleteWatchlist in backend routes

  // Movie management in watchlists (updated to match backend)
  addToWatchlist: (watchlistId, tmdbId) => api.post('/user/watchlists/add', { watchlistId, tmdbId }),
  removeFromWatchlist: (watchlistId, tmdbId) => api.post('/user/watchlists/remove', { watchlistId, tmdbId }),
  markAsWatched: (watchlistId, tmdbId, data = {}) => api.put(`/user/watchlists/${watchlistId}/movies/${tmdbId}/watched`, data),
  
  // Public watchlists
  getPublicWatchlists: (page = 1, sortBy = 'popular') => api.get('/user/watchlists/public', { params: { page, sortBy } }),
  searchWatchlists: (query, page = 1) => api.get('/user/watchlists/search', { params: { query, page } }),
  likeWatchlist: (watchlistId) => api.post(`/user/watchlists/${watchlistId}/like`),
  unlikeWatchlist: (watchlistId) => api.delete(`/user/watchlists/${watchlistId}/like`),
  
  // Collaboration
  addCollaborator: (watchlistId, userId, permission = 'view') => api.post(`/user/watchlists/${watchlistId}/collaborators`, { userId, permission }),
  removeCollaborator: (watchlistId, userId) => api.delete(`/user/watchlists/${watchlistId}/collaborators/${userId}`),
  updateCollaboratorPermission: (watchlistId, userId, permission) => api.put(`/user/watchlists/${watchlistId}/collaborators/${userId}`, { permission }),
};

export default api;
