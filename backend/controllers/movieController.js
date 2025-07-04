// Enhanced Movies controller for MovPlay
import * as tmdbAPI from '../utils/tmdb.js';
import { getMovieTrailers } from '../utils/tmdbTrailers.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// Search movies
export const searchMovies = asyncHandler(async (req, res) => {
  const { query, page = 1, ...filters } = req.query;
  
  if (!query) {
    throw new AppError('Search query is required', 400);
  }

  const data = await tmdbAPI.searchMovies(query, { page, ...filters });
  res.json({
    success: true,
    data: data,
    message: `Found ${data.total_results} movies`
  });
});

// Discover movies with filters
export const discoverMovies = asyncHandler(async (req, res) => {
  const filters = req.query;
  const data = await tmdbAPI.discoverMovies(filters);
  
  res.json({
    success: true,
    data: data
  });
});

// Get popular movies
export const getPopular = asyncHandler(async (req, res) => {
  const { page = 1, region } = req.query;
  const data = await tmdbAPI.getPopularMovies(page, region);
  res.json({
    success: true,
    results: data.results || [],
    total_results: data.total_results,
    page: data.page,
    total_pages: data.total_pages
  });
});

// Get trending movies
export const getTrending = asyncHandler(async (req, res) => {
  const { timeWindow = 'day', page = 1 } = req.query;
  const data = await tmdbAPI.getTrendingMovies(timeWindow, page);
  res.json({
    success: true,
    results: data.results || [],
    total_results: data.total_results,
    page: data.page,
    total_pages: data.total_pages
  });
});

// Get top rated movies
export const getTopRated = asyncHandler(async (req, res) => {
  const { page = 1, region } = req.query;
  const data = await tmdbAPI.getTopRatedMovies(page, region);
  res.json({
    success: true,
    results: data.results || [],
    total_results: data.total_results,
    page: data.page,
    total_pages: data.total_pages
  });
});

// Get now playing movies
export const getNowPlaying = asyncHandler(async (req, res) => {
  const { page = 1, region } = req.query;
  const data = await tmdbAPI.getNowPlayingMovies(page, region);
  
  res.json({
    success: true,
    data: data
  });
});

// Get upcoming movies
export const getUpcoming = asyncHandler(async (req, res) => {
  const { page = 1, region } = req.query;
  const data = await tmdbAPI.getUpcomingMovies(page, region);
  
  res.json({
    success: true,
    data: data
  });
});

// Get movie genres
export const getGenres = asyncHandler(async (req, res) => {
  const data = await tmdbAPI.getGenres();
  
  res.json({
    success: true,
    data: data
  });
});

// Get movie details
export const getMovieDetails = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  
  // Get movie details from TMDB
  const tmdbData = await tmdbAPI.getMovieDetails(tmdbId);
  
  // Get or create movie in our database
  let movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    movie = new Movie({
      tmdbId,
      title: tmdbData.title,
      originalTitle: tmdbData.original_title,
      genres: tmdbData.genres,
      year: new Date(tmdbData.release_date).getFullYear(),
      releaseDate: new Date(tmdbData.release_date),
      runtime: tmdbData.runtime,
      rating: {
        tmdb: {
          average: tmdbData.vote_average,
          count: tmdbData.vote_count
        }
      },
      poster: {
        path: tmdbData.poster_path,
        url: tmdbData.poster_url
      },
      backdrop: {
        path: tmdbData.backdrop_path,
        url: tmdbData.backdrop_url
      },
      overview: tmdbData.overview,
      tagline: tmdbData.tagline,
      status: tmdbData.status,
      budget: tmdbData.budget,
      revenue: tmdbData.revenue,
      popularity: tmdbData.popularity,
      spokenLanguages: tmdbData.spoken_languages,
      productionCompanies: tmdbData.production_companies,
      productionCountries: tmdbData.production_countries,
      videos: tmdbData.videos?.results,
      credits: tmdbData.credits,
      keywords: tmdbData.keywords?.keywords
    });
    await movie.save();
  }

  // Increment view count
  await movie.incrementViewCount();

  // Check if user has favorited this movie
  let isFavorited = false;
  if (req.user) {
    isFavorited = req.user.favorites.includes(movie._id);
  }

  res.json({
    success: true,
    data: {
      ...tmdbData,
      localData: movie.localData,
      isFavorited,
      movieId: movie._id
    }
  });
});

// Get movie recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
  
  const data = await tmdbAPI.getRecommendations(tmdbId, page);
  
  res.json({
    success: true,
    data: data
  });
});

// Get similar movies
export const getSimilarMovies = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
  
  const data = await tmdbAPI.getSimilarMovies(tmdbId, page);
  
  res.json({
    success: true,
    data: data
  });
});

// Add movie to favorites
export const addToFavorites = asyncHandler(async (req, res) => {
  const { tmdbId } = req.body;
  const userId = req.user._id;

  if (!tmdbId) {
    throw new AppError('Movie TMDB ID is required', 400);
  }

  // Get or create movie in database
  let movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    const tmdbData = await tmdbAPI.getMovieDetails(tmdbId);
    movie = new Movie({
      tmdbId,
      title: tmdbData.title,
      // ... other movie data
    });
    await movie.save();
  }

  // Add to user's favorites if not already there
  const user = await User.findById(userId);
  if (!user.favorites.includes(movie._id)) {
    user.favorites.push(movie._id);
    await user.save();
    
    // Update movie favorite count
    movie.localData.favoriteCount += 1;
    await movie.save();
  }

  res.json({
    success: true,
    message: 'Movie added to favorites',
    data: { movieId: movie._id, tmdbId }
  });
});

// Remove movie from favorites
export const removeFromFavorites = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const userId = req.user._id;

  const movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  // Remove from user's favorites
  const user = await User.findById(userId);
  user.favorites = user.favorites.filter(fav => !fav.equals(movie._id));
  await user.save();

  // Update movie favorite count
  if (movie.localData.favoriteCount > 0) {
    movie.localData.favoriteCount -= 1;
    await movie.save();
  }

  res.json({
    success: true,
    message: 'Movie removed from favorites'
  });
});

// Get user's favorite movies
export const getFavorites = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: 'favorites',
    options: {
      limit: limit * page,
      skip: (page - 1) * limit
    }
  });

  res.json({
    success: true,
    data: {
      results: user.favorites,
      page: parseInt(page),
      total_pages: Math.ceil(user.favorites.length / limit),
      total_results: user.favorites.length
    }
  });
});

// Get movie reviews
export const getMovieReviews = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

  const movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    return res.json({
      success: true,
      data: { results: [], page: 1, total_pages: 0, total_results: 0 }
    });
  }

  const reviews = await Review.getMovieReviews(movie._id, page, limit, sortBy);
  const totalReviews = await Review.countDocuments({ movie: movie._id, isVisible: true });

  res.json({
    success: true,
    data: {
      results: reviews,
      page: parseInt(page),
      total_pages: Math.ceil(totalReviews / limit),
      total_results: totalReviews
    }
  });
});

// Add movie review
export const addReview = asyncHandler(async (req, res) => {
  const { tmdbId, rating, title, comment, spoilerWarning = false } = req.body;
  const userId = req.user._id;

  if (!tmdbId || !rating) {
    throw new AppError('Movie ID and rating are required', 400);
  }

  if (rating < 0.5 || rating > 10) {
    throw new AppError('Rating must be between 0.5 and 10', 400);
  }

  // Get or create movie
  let movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    const tmdbData = await tmdbAPI.getMovieDetails(tmdbId);
    movie = new Movie({
      tmdbId,
      title: tmdbData.title,
      // ... other movie data
    });
    await movie.save();
  }

  // Check if user already reviewed this movie
  const existingReview = await Review.findOne({ user: userId, movie: movie._id });
  if (existingReview) {
    throw new AppError('You have already reviewed this movie', 400);
  }

  // Create review
  const review = new Review({
    user: userId,
    movie: movie._id,
    tmdbId,
    rating,
    title,
    comment,
    spoilerWarning
  });

  await review.save();

  // Update movie local rating
  const allReviews = await Review.find({ movie: movie._id, isVisible: true });
  const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
  
  movie.rating.local.average = avgRating;
  movie.rating.local.count = allReviews.length;
  await movie.save();

  // Populate user data for response
  await review.populate('user', 'username avatar');

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
});

// Update movie review
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, spoilerWarning } = req.body;
  const userId = req.user._id;

  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    throw new AppError('Review not found or unauthorized', 404);
  }

  // Update review
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (spoilerWarning !== undefined) review.spoilerWarning = spoilerWarning;
  review.editedAt = new Date();

  await review.save();

  // Recalculate movie rating
  const movie = await Movie.findById(review.movie);
  const allReviews = await Review.find({ movie: movie._id, isVisible: true });
  const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
  
  movie.rating.local.average = avgRating;
  movie.rating.local.count = allReviews.length;
  await movie.save();

  await review.populate('user', 'username avatar');

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

// Delete movie review
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    throw new AppError('Review not found or unauthorized', 404);
  }

  await Review.findByIdAndDelete(reviewId);

  // Recalculate movie rating
  const movie = await Movie.findById(review.movie);
  const allReviews = await Review.find({ movie: movie._id, isVisible: true });
  
  if (allReviews.length > 0) {
    const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    movie.rating.local.average = avgRating;
    movie.rating.local.count = allReviews.length;
  } else {
    movie.rating.local.average = 0;
    movie.rating.local.count = 0;
  }
  
  await movie.save();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// Mark review as helpful
export const markReviewHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { isHelpful } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await review.markHelpful(userId, isHelpful);

  res.json({
    success: true,
    message: 'Review marked as helpful',
    data: {
      helpfulScore: review.helpfulScore,
      totalVotes: review.totalVotes
    }
  });
});

// Report review
export const reportReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  if (!reason) {
    throw new AppError('Report reason is required', 400);
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await review.reportReview(userId, reason);

  res.json({
    success: true,
    message: 'Review reported successfully'
  });
});

// Get movie trailers (YouTube)
export const getMovieTrailersController = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const trailers = await getMovieTrailers(tmdbId);
  res.json({ success: true, data: trailers });
});

// Legacy exports for compatibility
export const search = searchMovies;
export const details = getMovieDetails;
export const recommendations = getRecommendations;
