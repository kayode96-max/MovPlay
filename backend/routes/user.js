// User routes
import express from 'express';
import auth from '../middleware/auth.js';
import {
  getProfile,
  addFavorite,
  removeFavorite,
  createWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  addReview,
  getReviews,
  followUser,
  unfollowUser
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.post('/favorites', auth, addFavorite);
router.delete('/favorites', auth, removeFavorite);
router.post('/watchlists', auth, createWatchlist);
router.post('/watchlists/add', auth, addToWatchlist);
router.post('/watchlists/remove', auth, removeFromWatchlist);
router.post('/reviews', auth, addReview);
router.get('/reviews/:tmdbId', getReviews);
router.post('/follow/:userId', auth, followUser);
router.post('/unfollow/:userId', auth, unfollowUser);

export default router;
