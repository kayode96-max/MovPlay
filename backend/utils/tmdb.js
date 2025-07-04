// Enhanced TMDB API utility for MovPlay
import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';

dotenv.config();
console.log('TMDB_API_KEY loaded:', process.env.TMDB_API_KEY ? 'YES' : 'NO');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Request interceptor for logging
tmdbApi.interceptors.request.use(
  (config) => {
    console.log(`🎬 TMDB API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ TMDB API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new AppError('Invalid TMDB API key', 500);
    }
    
    if (error.response?.status === 404) {
      throw new AppError('Movie not found in TMDB', 404);
    }
    
    if (error.response?.status === 429) {
      throw new AppError('TMDB API rate limit exceeded', 429);
    }
    
    throw new AppError('External movie service unavailable', 503);
  }
);

// Utility functions for image URLs
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Search movies with advanced filters
export const searchMovies = async (query, filters = {}) => {
  try {
    const params = {
      query,
      page: filters.page || 1,
      include_adult: filters.includeAdult || false,
      region: filters.region || 'US',
      year: filters.year,
      primary_release_year: filters.primaryReleaseYear,
    };

    const response = await tmdbApi.get('/search/movie', { params });
    
    // Enhance results with full image URLs
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get detailed movie information
export const getMovieDetails = async (tmdbId, appendToResponse = 'credits,videos,keywords,recommendations,similar') => {
  try {
    const params = { append_to_response: appendToResponse };
    const response = await tmdbApi.get(`/movie/${tmdbId}`, { params });
    
    const movie = response.data;
    
    // Enhance with full image URLs
    const enhancedMovie = {
      ...movie,
      poster_url: getImageUrl(movie.poster_path),
      backdrop_url: getBackdropUrl(movie.backdrop_path),
      credits: movie.credits ? {
        ...movie.credits,
        cast: movie.credits.cast?.map(person => ({
          ...person,
          profile_url: getImageUrl(person.profile_path, 'w185')
        })),
        crew: movie.credits.crew?.map(person => ({
          ...person,
          profile_url: getImageUrl(person.profile_path, 'w185')
        }))
      } : undefined,
      production_companies: movie.production_companies?.map(company => ({
        ...company,
        logo_url: getImageUrl(company.logo_path, 'w185')
      })),
      recommendations: movie.recommendations ? {
        ...movie.recommendations,
        results: movie.recommendations.results?.map(rec => ({
          ...rec,
          poster_url: getImageUrl(rec.poster_path),
          backdrop_url: getBackdropUrl(rec.backdrop_path)
        }))
      } : undefined,
      similar: movie.similar ? {
        ...movie.similar,
        results: movie.similar.results?.map(sim => ({
          ...sim,
          poster_url: getImageUrl(sim.poster_path),
          backdrop_url: getBackdropUrl(sim.backdrop_path)
        }))
      } : undefined
    };

    return enhancedMovie;
  } catch (error) {
    throw error;
  }
};

// Get movie recommendations
export const getRecommendations = async (tmdbId, page = 1) => {
  try {
    const params = { page };
    const response = await tmdbApi.get(`/movie/${tmdbId}/recommendations`, { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get similar movies
export const getSimilarMovies = async (tmdbId, page = 1) => {
  try {
    const params = { page };
    const response = await tmdbApi.get(`/movie/${tmdbId}/similar`, { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (page = 1, region = 'US') => {
  try {
    const params = { page, region };
    const response = await tmdbApi.get('/movie/popular', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1, region = 'US') => {
  try {
    const params = { page, region };
    const response = await tmdbApi.get('/movie/top_rated', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get now playing movies
export const getNowPlayingMovies = async (page = 1, region = 'US') => {
  try {
    const params = { page, region };
    const response = await tmdbApi.get('/movie/now_playing', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get upcoming movies
export const getUpcomingMovies = async (page = 1, region = 'US') => {
  try {
    const params = { page, region };
    const response = await tmdbApi.get('/movie/upcoming', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Discover movies with filters
export const discoverMovies = async (filters = {}) => {
  try {
    const params = {
      page: filters.page || 1,
      sort_by: filters.sortBy || 'popularity.desc',
      include_adult: filters.includeAdult || false,
      include_video: filters.includeVideo || false,
      with_genres: filters.genres,
      without_genres: filters.excludeGenres,
      'vote_average.gte': filters.minRating,
      'vote_average.lte': filters.maxRating,
      'vote_count.gte': filters.minVotes || 10,
      'primary_release_date.gte': filters.fromDate,
      'primary_release_date.lte': filters.toDate,
      year: filters.year,
      with_runtime_gte: filters.minRuntime,
      with_runtime_lte: filters.maxRuntime,
      region: filters.region || 'US',
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const response = await tmdbApi.get('/discover/movie', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Get movie genres
export const getGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get trending movies
export const getTrendingMovies = async (timeWindow = 'day', page = 1) => {
  try {
    const params = { page };
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path),
        backdrop_url: getBackdropUrl(movie.backdrop_path),
      }))
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

// Multi search (movies, people, TV shows)
export const multiSearch = async (query, page = 1) => {
  try {
    const params = { query, page };
    const response = await tmdbApi.get('/search/multi', { params });
    
    const enhancedResults = {
      ...response.data,
      results: response.data.results.map(item => {
        if (item.media_type === 'movie') {
          return {
            ...item,
            poster_url: getImageUrl(item.poster_path),
            backdrop_url: getBackdropUrl(item.backdrop_path),
          };
        } else if (item.media_type === 'person') {
          return {
            ...item,
            profile_url: getImageUrl(item.profile_path, 'w185'),
          };
        }
        return item;
      })
    };

    return enhancedResults;
  } catch (error) {
    throw error;
  }
};

export { tmdbApi };
