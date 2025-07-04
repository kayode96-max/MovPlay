// Enhanced Movie model for MovPlay
import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  originalTitle: {
    type: String,
    trim: true,
  },
  genres: [{
    id: Number,
    name: String,
  }],
  year: {
    type: Number,
    index: true,
  },
  releaseDate: {
    type: Date,
  },
  runtime: {
    type: Number, // in minutes
  },
  rating: {
    tmdb: {
      average: { type: Number, min: 0, max: 10 },
      count: { type: Number, min: 0 },
    },
    imdb: {
      id: String,
      rating: { type: Number, min: 0, max: 10 },
    },
    local: {
      average: { type: Number, min: 0, max: 10, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
  },
  poster: {
    path: String,
    url: String,
  },
  backdrop: {
    path: String,
    url: String,
  },
  overview: {
    type: String,
    maxlength: 2000,
  },
  tagline: {
    type: String,
    maxlength: 300,
  },
  status: {
    type: String,
    enum: ['Released', 'In Production', 'Post Production', 'Planned', 'Canceled'],
    default: 'Released',
  },
  budget: {
    type: Number,
    min: 0,
  },
  revenue: {
    type: Number,
    min: 0,
  },
  popularity: {
    type: Number,
    min: 0,
    index: true,
  },
  spokenLanguages: [{
    iso_639_1: String,
    name: String,
  }],
  productionCompanies: [{
    id: Number,
    name: String,
    logoPath: String,
    originCountry: String,
  }],
  productionCountries: [{
    iso_3166_1: String,
    name: String,
  }],
  videos: [mongoose.Schema.Types.Mixed],
  credits: {
    cast: [{
      id: Number,
      name: String,
      character: String,
      profilePath: String,
      order: Number,
    }],
    crew: [{
      id: Number,
      name: String,
      job: String,
      department: String,
      profilePath: String,
    }],
  },
  keywords: [{
    id: Number,
    name: String,
  }],
  adult: {
    type: Boolean,
    default: false,
  },
  localData: {
    viewCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    watchlistCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
movieSchema.index({ 'genres.name': 1 });
movieSchema.index({ 'rating.tmdb.average': -1 });
movieSchema.index({ 'rating.local.average': -1 });
movieSchema.index({ title: 'text', overview: 'text' });

// Virtual for formatted release year
movieSchema.virtual('formattedYear').get(function() {
  return this.releaseDate ? this.releaseDate.getFullYear() : this.year;
});

// Method to get average rating (prioritizing local, falling back to TMDB)
movieSchema.methods.getAverageRating = function() {
  if (this.rating.local.count > 0) {
    return this.rating.local.average;
  }
  return this.rating.tmdb.average || 0;
};

// Method to increment view count
movieSchema.methods.incrementViewCount = function() {
  this.localData.viewCount += 1;
  this.localData.lastUpdated = new Date();
  return this.save();
};

// Static method to find popular movies
movieSchema.statics.findPopular = function(limit = 20) {
  return this.find({})
    .sort({ popularity: -1, 'rating.tmdb.average': -1 })
    .limit(limit);
};

// Static method to find by genre
movieSchema.statics.findByGenre = function(genreName, limit = 20) {
  return this.find({ 'genres.name': { $regex: genreName, $options: 'i' } })
    .sort({ 'rating.tmdb.average': -1 })
    .limit(limit);
};

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
