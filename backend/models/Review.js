// Enhanced Review model for MovPlay
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  movie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true,
    index: true
  },
  tmdbId: {
    type: String,
    required: true,
    index: true
  },
  rating: { 
    type: Number, 
    required: true,
    min: 0.5,
    max: 10,
    validate: {
      validator: function(v) {
        return v >= 0.5 && v <= 10 && (v * 2) % 1 === 0; // Allow half ratings
      },
      message: 'Rating must be between 0.5 and 10 in 0.5 increments'
    }
  },
  title: {
    type: String,
    maxlength: [200, 'Review title cannot exceed 200 characters'],
    trim: true
  },
  comment: { 
    type: String,
    maxlength: [2000, 'Review comment cannot exceed 2000 characters'],
    trim: true
  },
  spoilerWarning: {
    type: Boolean,
    default: false
  },
  helpful: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isHelpful: { type: Boolean, required: true }
  }],
  reported: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { 
      type: String, 
      enum: ['spam', 'inappropriate', 'spoiler', 'offensive', 'other'],
      required: true 
    },
    reportedAt: { type: Date, default: Date.now }
  }],
  isVisible: {
    type: Boolean,
    default: true
  },
  editedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });
reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Virtual for helpful score
reviewSchema.virtual('helpfulScore').get(function() {
  if (!this.helpful || this.helpful.length === 0) return 0;
  
  const helpfulCount = this.helpful.filter(h => h.isHelpful).length;
  const notHelpfulCount = this.helpful.filter(h => !h.isHelpful).length;
  
  return helpfulCount - notHelpfulCount;
});

// Virtual for total helpful votes
reviewSchema.virtual('totalVotes').get(function() {
  return this.helpful ? this.helpful.length : 0;
});

// Method to mark as helpful/unhelpful
reviewSchema.methods.markHelpful = function(userId, isHelpful) {
  const existingVote = this.helpful.find(h => h.user.toString() === userId.toString());
  
  if (existingVote) {
    existingVote.isHelpful = isHelpful;
  } else {
    this.helpful.push({ user: userId, isHelpful });
  }
  
  return this.save();
};

// Method to remove helpful vote
reviewSchema.methods.removeHelpfulVote = function(userId) {
  this.helpful = this.helpful.filter(h => h.user.toString() !== userId.toString());
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function(userId, reason) {
  const existingReport = this.reported.find(r => r.user.toString() === userId.toString());
  
  if (!existingReport) {
    this.reported.push({ user: userId, reason });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to get reviews for a movie
reviewSchema.statics.getMovieReviews = function(movieId, page = 1, limit = 10, sortBy = 'newest') {
  const skip = (page - 1) * limit;
  
  let sortOptions = { createdAt: -1 }; // default: newest first
  
  switch (sortBy) {
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'highest':
      sortOptions = { rating: -1, createdAt: -1 };
      break;
    case 'lowest':
      sortOptions = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
      // This would require aggregation for helpful score
      sortOptions = { createdAt: -1 };
      break;
  }
  
  return this.find({ movie: movieId, isVisible: true })
    .populate('user', 'username avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to get user's reviews
reviewSchema.statics.getUserReviews = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId, isVisible: true })
    .populate('movie', 'title poster year')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Review = mongoose.model('Review', reviewSchema);
export default Review;
