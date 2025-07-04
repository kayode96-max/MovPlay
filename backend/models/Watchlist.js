// Enhanced Watchlist model for MovPlay
import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Watchlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  movies: [{
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    tmdbId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    watched: { type: Boolean, default: false },
    watchedAt: { type: Date, default: null },
    personalRating: { 
      type: Number, 
      min: 0.5, 
      max: 10,
      default: null
    },
    personalNotes: {
      type: String,
      maxlength: [1000, 'Personal notes cannot exceed 1000 characters'],
      default: ''
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    addedAt: { type: Date, default: Date.now }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
watchlistSchema.index({ user: 1, name: 1 });
watchlistSchema.index({ isPublic: 1, likes: -1 });
watchlistSchema.index({ tags: 1 });

// Ensure user has only one default watchlist
watchlistSchema.index({ user: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

// Virtual for movie count
watchlistSchema.virtual('movieCount').get(function() {
  return this.movies ? this.movies.length : 0;
});

// Virtual for watched movie count
watchlistSchema.virtual('watchedCount').get(function() {
  return this.movies ? this.movies.filter(m => m.watched).length : 0;
});

// Virtual for like count
watchlistSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for completion percentage
watchlistSchema.virtual('completionPercentage').get(function() {
  if (!this.movies || this.movies.length === 0) return 0;
  return Math.round((this.watchedCount / this.movieCount) * 100);
});

// Method to add movie to watchlist
watchlistSchema.methods.addMovie = function(movieData) {
  const { movieId, tmdbId } = movieData;
  
  // Check if movie already exists
  const existingMovie = this.movies.find(m => m.tmdbId === tmdbId);
  if (existingMovie) {
    throw new Error('Movie already in watchlist');
  }
  
  this.movies.push({
    movie: movieId,
    tmdbId: tmdbId,
    addedAt: new Date()
  });
  
  this.lastModified = new Date();
  return this.save();
};

// Method to remove movie from watchlist
watchlistSchema.methods.removeMovie = function(tmdbId) {
  this.movies = this.movies.filter(m => m.tmdbId !== tmdbId);
  this.lastModified = new Date();
  return this.save();
};

// Method to mark movie as watched
watchlistSchema.methods.markAsWatched = function(tmdbId, rating = null, notes = '') {
  const movie = this.movies.find(m => m.tmdbId === tmdbId);
  if (!movie) {
    throw new Error('Movie not found in watchlist');
  }
  
  movie.watched = true;
  movie.watchedAt = new Date();
  if (rating) movie.personalRating = rating;
  if (notes) movie.personalNotes = notes;
  
  this.lastModified = new Date();
  return this.save();
};

// Method to toggle like
watchlistSchema.methods.toggleLike = function(userId) {
  const userLikeIndex = this.likes.indexOf(userId);
  
  if (userLikeIndex > -1) {
    this.likes.splice(userLikeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  return this.save();
};

// Method to add collaborator
watchlistSchema.methods.addCollaborator = function(userId, permission = 'view') {
  const existingCollaborator = this.collaborators.find(c => 
    c.user.toString() === userId.toString()
  );
  
  if (existingCollaborator) {
    existingCollaborator.permission = permission;
  } else {
    this.collaborators.push({
      user: userId,
      permission: permission
    });
  }
  
  return this.save();
};

// Static method to find public watchlists
watchlistSchema.statics.findPublic = function(page = 1, limit = 20, sortBy = 'popular') {
  const skip = (page - 1) * limit;
  
  let sortOptions = { likes: -1, views: -1 }; // default: most popular
  
  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'updated':
      sortOptions = { lastModified: -1 };
      break;
    case 'mostMovies':
      // This would require aggregation
      sortOptions = { createdAt: -1 };
      break;
  }
  
  return this.find({ isPublic: true })
    .populate('user', 'username avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to search watchlists
watchlistSchema.statics.searchPublic = function(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    isPublic: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  })
    .populate('user', 'username avatar')
    .sort({ likes: -1, views: -1 })
    .skip(skip)
    .limit(limit);
};

// Middleware to update lastModified on save
watchlistSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('views')) {
    this.lastModified = new Date();
  }
  next();
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
