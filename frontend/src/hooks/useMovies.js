import { useState, useEffect } from 'react';
import { movieAPI } from '../api';

export const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchMovies = async (query, filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.search(query, filters);
      setMovies(response.data.results || []);
      return response.data;
    } catch (err) {
      setError('Failed to fetch movies');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTrendingMovies = async (timeWindow = 'day', page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getTrending(timeWindow, page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch trending movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPopularMovies = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getPopular(page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch popular movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTopRatedMovies = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getTopRated(page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch top rated movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getNowPlayingMovies = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getNowPlaying(page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch now playing movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingMovies = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getUpcoming(page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch upcoming movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const discoverMovies = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.discover(filters);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to discover movies');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (tmdbId) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getDetails(tmdbId);
      return response.data;
    } catch (err) {
      setError('Failed to fetch movie details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (tmdbId) => {
    try {
      await movieAPI.addToFavorites(tmdbId);
      return true;
    } catch (err) {
      setError('Failed to add to favorites');
      return false;
    }
  };

  const removeFromFavorites = async (tmdbId) => {
    try {
      await movieAPI.removeFromFavorites(tmdbId);
      return true;
    } catch (err) {
      setError('Failed to remove from favorites');
      return false;
    }
  };

  const getFavorites = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await movieAPI.getFavorites(page);
      const movies = response.data.results || [];
      setMovies(movies);
      return movies;
    } catch (err) {
      setError('Failed to fetch favorites');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return {
    movies,
    loading,
    error,
    searchMovies,
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getNowPlayingMovies,
    getUpcomingMovies,
    discoverMovies,
    getMovieDetails,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    clearError,
    setMovies,
  };
};
