// Enhanced Auth controller with comprehensive authentication features
import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import { generateToken } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';

// Validation rules
export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(errorMessages.join('. '), 400);
  }
};

// Helper function to create and send token response
const createSendToken = async (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  // Update last login
  await user.updateLastLogin();
  
  // Get user profile without sensitive data
  const userProfile = user.getPublicProfile();
  
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userProfile
  });
};

// Register new user
export const register = asyncHandler(async (req, res, next) => {
  handleValidationErrors(req);
  
  const { username, email, password, favoriteGenres } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    throw new AppError(`User with this ${field} already exists`, 400);
  }

  // Create new user (password will be hashed by pre-save middleware)
  const user = await User.create({
    username,
    email,
    password,
    favoriteGenres: favoriteGenres || []
  });

  // Create default watchlist for the user
  await Watchlist.create({
    name: 'My Watchlist',
    description: 'Movies I want to watch',
    user: user._id,
    isDefault: true,
    isPublic: false
  });

  await createSendToken(user, 201, res, 'Account created successfully');
});

// Login user
export const login = asyncHandler(async (req, res, next) => {
  handleValidationErrors(req);
  
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  await createSendToken(user, 200, res, 'Logged in successfully');
});

// Logout user (client-side token removal, but we can track it)
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user profile
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('favorites', 'tmdbId title poster year rating')
    .populate('watchlists', 'name description movieCount isPublic');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user: user.getPublicProfile()
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio, favoriteGenres, preferences, avatar } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if username is already taken (if changed)
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new AppError('Username already taken', 400);
    }
    user.username = username;
  }

  // Update allowed fields
  if (bio !== undefined) user.bio = bio;
  if (favoriteGenres) user.favoriteGenres = favoriteGenres;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Verify token (useful for frontend to check if token is still valid)
export const verifyToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user.getPublicProfile()
  });
});

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password is required to delete account', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect password', 401);
  }

  // Delete user's watchlists and reviews
  await Watchlist.deleteMany({ user: user._id });
  // Note: You might want to keep reviews but mark them as from "Deleted User"
  
  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Get user's stats
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Aggregate user statistics
  const stats = await User.aggregate([
    {
      $match: { _id: userId }
    },
    {
      $lookup: {
        from: 'watchlists',
        localField: '_id',
        foreignField: 'user',
        as: 'watchlists'
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'user',
        as: 'reviews'
      }
    },
    {
      $project: {
        favoriteCount: { $size: '$favorites' },
        watchlistCount: { $size: '$watchlists' },
        reviewCount: { $size: '$reviews' },
        joinedAt: '$createdAt',
        lastLogin: '$lastLogin'
      }
    }
  ]);

  if (stats.length === 0) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    stats: stats[0]
  });
});
