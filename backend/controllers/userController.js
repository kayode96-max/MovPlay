// User controller
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Watchlist from '../models/Watchlist.js';
import Review from '../models/Review.js';
import { getMovieDetails } from '../utils/tmdb.js';

// Helper function to create/find a movie with TMDB data
const findOrCreateMovie = async (tmdbId) => {
  let movie = await Movie.findOne({ tmdbId });
  if (!movie) {
    // Fetch movie details from TMDB API
    const tmdbMovie = await getMovieDetails(tmdbId);
    movie = new Movie({ 
      tmdbId,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      genres: tmdbMovie.genres,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
      runtime: tmdbMovie.runtime,
      rating: {
        tmdb: {
          average: tmdbMovie.vote_average,
          count: tmdbMovie.vote_count
        }
      },
      poster: {
        path: tmdbMovie.poster_path,
        url: tmdbMovie.poster_url
      },
      backdrop: {
        path: tmdbMovie.backdrop_path,
        url: tmdbMovie.backdrop_url
      },
      overview: tmdbMovie.overview,
      tagline: tmdbMovie.tagline,
      status: tmdbMovie.status,
      popularity: tmdbMovie.popularity,
      budget: tmdbMovie.budget,
      revenue: tmdbMovie.revenue,
      spokenLanguages: tmdbMovie.spoken_languages,
      productionCountries: tmdbMovie.production_countries,
      productionCompanies: tmdbMovie.production_companies
    });
    await movie.save();
  }
  return movie;
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('favorites').populate('watchlists');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    const movie = await findOrCreateMovie(tmdbId);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: movie._id } },
      { new: true }
    ).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    const movie = await Movie.findOne({ tmdbId });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: movie._id } },
      { new: true }
    ).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    next(err);
  }
};

export const createWatchlist = async (req, res, next) => {
  try {
    const { name } = req.body;
    const watchlist = new Watchlist({ name, user: req.user.id, movies: [] });
    await watchlist.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { watchlists: watchlist._id } });
    res.status(201).json(watchlist);
  } catch (err) {
    next(err);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const { watchlistId, tmdbId } = req.body;
    const movie = await findOrCreateMovie(tmdbId);
    const watchlist = await Watchlist.findByIdAndUpdate(
      watchlistId,
      { $addToSet: { movies: movie._id } },
      { new: true }
    ).populate('movies');
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { watchlistId, tmdbId } = req.body;
    const movie = await Movie.findOne({ tmdbId });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const watchlist = await Watchlist.findByIdAndUpdate(
      watchlistId,
      { $pull: { movies: movie._id } },
      { new: true }
    ).populate('movies');
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { tmdbId, rating, comment } = req.body;
    const movie = await findOrCreateMovie(tmdbId);
    const review = new Review({ user: req.user.id, movie: movie._id, tmdbId, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.user && err.keyPattern.movie) {
      return res.status(400).json({ message: 'You have already reviewed this movie.' });
    }
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const movie = await Movie.findOne({ tmdbId });
    if (!movie) {
      // If movie not found, return empty array and message
      return res.json({ reviews: [], message: 'No reviews yet for this movie.' });
    }
    const reviews = await Review.find({ movie: movie._id }).populate('user', 'username');
    if (reviews.length === 0) {
      return res.json({ reviews: [], message: 'No reviews yet for this movie.' });
    }
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// Follow a user
export const followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(userId);
  if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
  if (currentUser.following.includes(userId)) return res.status(400).json({ success: false, message: 'Already following' });
  currentUser.following.push(userId);
  targetUser.followers.push(currentUser._id);
  await currentUser.save();
  await targetUser.save();
  res.json({ success: true, message: 'Followed user' });
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(userId);
  if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
  currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
  targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
  await currentUser.save();
  await targetUser.save();
  res.json({ success: true, message: 'Unfollowed user' });
};
