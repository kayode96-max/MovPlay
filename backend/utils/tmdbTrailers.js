// Get movie trailer videos from TMDB
import { tmdbApi } from './tmdb.js';

export const getMovieTrailers = async (tmdbId) => {
  try {
    const response = await tmdbApi.get(`/movie/${tmdbId}/videos`);
    // Filter for YouTube trailers
    const trailers = response.data.results.filter(
      (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
    );
    return trailers;
  } catch (error) {
    throw error;
  }
};
