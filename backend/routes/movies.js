// Enhanced Movie routes for MovPlay
import express from 'express';
import * as movieController from '../controllers/movieController.js';
import auth, { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public movie endpoints
router.get('/search', movieController.searchMovies);
router.get('/discover', movieController.discoverMovies);
router.get('/popular', movieController.getPopular);
router.get('/trending', movieController.getTrending);
router.get('/top-rated', movieController.getTopRated);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/upcoming', movieController.getUpcoming);
router.get('/genres', movieController.getGenres);

// Movie details (with optional user context)
router.get('/:tmdbId', optionalAuth, movieController.getMovieDetails);
router.get('/:tmdbId/recommendations', movieController.getRecommendations);
router.get('/:tmdbId/similar', movieController.getSimilarMovies);
router.get('/:tmdbId/trailers', movieController.getMovieTrailersController);

// User-specific movie endpoints (require authentication)
router.post('/favorites', auth, movieController.addToFavorites);
router.delete('/favorites/:tmdbId', auth, movieController.removeFromFavorites);
router.get('/favorites', auth, movieController.getFavorites);

// Movie reviews
router.get('/:tmdbId/reviews', optionalAuth, movieController.getMovieReviews);
router.post('/reviews', auth, movieController.addReview);
router.put('/reviews/:reviewId', auth, movieController.updateReview);
router.delete('/reviews/:reviewId', auth, movieController.deleteReview);
router.post('/reviews/:reviewId/helpful', auth, movieController.markReviewHelpful);
router.post('/reviews/:reviewId/report', auth, movieController.reportReview);

export default router;
