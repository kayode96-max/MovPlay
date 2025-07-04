import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Rating, 
  Typography, 
  Alert,
  FormControl,
  FormLabel,
  FormHelperText,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  StarRate as StarIcon,
  Send as SendIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import { useFormValidation } from '../hooks/useFormValidation';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from './NotificationProvider';
import LoadingState from './LoadingState';

const ReviewForm = ({ tmdbId, onReview, movieTitle = "this movie" }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(-1);
  
  const formRef = useRef(null);
  const ratingRef = useRef(null);
  const commentRef = useRef(null);
  
  const { prefersReducedMotion, announce, manageFocus } = useAccessibility();
  const { showError, showSuccess } = useNotifications();

  // Rating labels for accessibility
  const ratingLabels = {
    0.5: 'Terrible',
    1: 'Very Poor',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Fair',
    3: 'Fair+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Very Good',
    5: 'Excellent'
  };

  const validationRules = {
    rating: {
      required: true,
      min: 0.5,
      custom: (value) => {
        if (value < 0.5) return 'Please provide a rating of at least 0.5 stars';
        if (value > 5) return 'Rating cannot exceed 5 stars';
        return null;
      }
    },
    comment: {
      required: true,
      minLength: 10,
      maxLength: 500,
      custom: (value) => {
        if (!value.trim()) return 'Please enter a comment about your experience';
        if (value.trim().length < 10) return 'Comment must be at least 10 characters long';
        if (value.trim().length > 500) return 'Comment must be 500 characters or less';
        return null;
      }
    }
  };

  const {
    values,
    errors,
    isValid,
    validateField,
    validateForm,
    setValue,
    setFieldError,
    clearErrors
  } = useFormValidation({ rating, comment }, validationRules);

  useEffect(() => {
    setValue('rating', rating);
  }, [rating, setValue]);

  useEffect(() => {
    setValue('comment', comment);
  }, [comment, setValue]);

  const handleRatingChange = (event, newValue) => {
    if (newValue !== null) {
      setRating(newValue);
      validateField('rating', newValue);
      const label = ratingLabels[newValue] || `${newValue} stars`;
      announce(`Rating set to ${newValue} out of 5 stars: ${label}`);
    }
  };

  const handleCommentChange = (event) => {
    const newValue = event.target.value;
    setComment(newValue);
    validateField('comment', newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError === 'rating') {
        ratingRef.current?.focus();
        showError('Please provide a valid rating');
      } else if (firstError === 'comment') {
        commentRef.current?.focus();
        showError('Please check your comment');
      }
      return;
    }

    setLoading(true);
    announce('Submitting review...');
    
    try {
      const token = localStorage.getItem('token');
      await API.post('/user/reviews', { 
        tmdbId, 
        rating, 
        comment: comment.trim() 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setRating(0);
      setComment('');
      setSubmitted(true);
      clearErrors();
      
      showSuccess('Review submitted successfully!');
      announce(`Review for ${movieTitle} submitted successfully`);
      
      if (onReview) onReview();
      
      // Reset submitted state after animation
      setTimeout(() => setSubmitted(false), 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setFieldError('submit', errorMessage);
      showError(errorMessage);
      announce(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 }
    },
    success: {
      scale: prefersReducedMotion ? 1 : 1.02,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="initial"
      animate={submitted ? "success" : "animate"}
    >
      <Card 
        sx={{ 
          maxWidth: 500, 
          mx: 'auto', 
          mt: 3,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {loading && (
            <LinearProgress 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderRadius: '12px 12px 0 0',
                '& .MuiLinearProgress-bar': {
                  background: 'var(--primary-gradient)',
                }
              }} 
            />
          )}
          
          <Box
            component="form"
            ref={formRef}
            onSubmit={handleSubmit}
            role="form"
            aria-labelledby="review-form-title"
            aria-describedby="review-form-description"
            noValidate
          >
            <Typography 
              id="review-form-title"
              variant="h5" 
              component="h2"
              mb={1} 
              fontWeight={700} 
              align="center"
              sx={{ color: 'var(--text-primary)' }}
            >
              Leave a Review
            </Typography>
            
            <Typography 
              id="review-form-description"
              variant="body2" 
              align="center"
              sx={{ color: 'var(--text-secondary)', mb: 3 }}
            >
              Share your thoughts about {movieTitle}
            </Typography>

            {/* Rating Section */}
            <FormControl 
              fullWidth 
              sx={{ mb: 3 }}
              error={!!errors.rating}
              required
            >
              <FormLabel 
                id="rating-label"
                sx={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  mb: 1,
                  '&.Mui-focused': { color: 'var(--primary-color)' }
                }}
              >
                Your Rating
              </FormLabel>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  ref={ratingRef}
                  name="movie-rating"
                  value={rating}
                  onChange={handleRatingChange}
                  onChangeActive={(event, newHover) => {
                    setHoverRating(newHover);
                  }}
                  precision={0.5}
                  max={5}
                  size="large"
                  icon={<StarIcon fontSize="large" />}
                  emptyIcon={<StarIcon fontSize="large" />}
                  aria-labelledby="rating-label"
                  aria-describedby={errors.rating ? "rating-error" : "rating-helper"}
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: 'var(--accent-color)',
                    },
                    '& .MuiRating-iconHover': {
                      color: 'var(--primary-color)',
                    },
                    '& .MuiRating-iconEmpty': {
                      color: 'var(--text-muted)',
                    }
                  }}
                />
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    minWidth: 80,
                    fontWeight: 500
                  }}
                >
                  {rating > 0 && (
                    <span>
                      {rating}/5 - {ratingLabels[rating] || 'Good'}
                    </span>
                  )}
                  {hoverRating > 0 && hoverRating !== rating && (
                    <span style={{ color: 'var(--primary-color)' }}>
                      {hoverRating}/5 - {ratingLabels[hoverRating] || 'Good'}
                    </span>
                  )}
                </Typography>
              </Box>
              
              {errors.rating ? (
                <FormHelperText id="rating-error" sx={{ color: 'var(--error-color)' }}>
                  {errors.rating}
                </FormHelperText>
              ) : (
                <FormHelperText id="rating-helper">
                  Rate from 0.5 to 5 stars
                </FormHelperText>
              )}
            </FormControl>

            {/* Comment Section */}
            <FormControl 
              fullWidth 
              sx={{ mb: 3 }}
              error={!!errors.comment}
              required
            >
              <TextField
                ref={commentRef}
                label="Your Review"
                value={comment}
                onChange={handleCommentChange}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                required
                aria-describedby={errors.comment ? "comment-error" : "comment-helper"}
                placeholder="Share your thoughts about this movie..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--glass-bg)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-color)',
                      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                    },
                    '&.Mui-error fieldset': {
                      borderColor: 'var(--error-color)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--primary-color)',
                    },
                    '&.Mui-error': {
                      color: 'var(--error-color)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)',
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {errors.comment ? (
                  <FormHelperText id="comment-error" sx={{ color: 'var(--error-color)' }}>
                    {errors.comment}
                  </FormHelperText>
                ) : (
                  <FormHelperText id="comment-helper">
                    Share your honest opinion (10-500 characters)
                  </FormHelperText>
                )}
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: comment.length > 400 ? 'var(--warning-color)' : 'var(--text-secondary)',
                    fontWeight: 500
                  }}
                >
                  {comment.length}/500
                </Typography>
              </Box>
            </FormControl>

            {/* Error Display */}
            <AnimatePresence>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      '& .MuiAlert-icon': {
                        color: 'var(--error-color)',
                      }
                    }}
                  >
                    {errors.submit}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !isValid}
              startIcon={
                loading ? (
                  <LoadingState type="spinner" size="small" />
                ) : submitted ? (
                  <CheckIcon />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                background: submitted 
                  ? 'var(--success-color)' 
                  : loading || !isValid 
                    ? 'var(--text-muted)' 
                    : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: submitted 
                    ? 'var(--success-color)' 
                    : loading || !isValid 
                      ? 'var(--text-muted)' 
                      : 'var(--primary-gradient)',
                  transform: prefersReducedMotion || loading || !isValid ? 'none' : 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                },
                '&:disabled': {
                  background: 'var(--text-muted)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all var(--transition-normal)',
              }}
              aria-describedby={loading ? "submit-status" : undefined}
            >
              {loading ? 'Submitting Review...' : submitted ? 'Review Submitted!' : 'Submit Review'}
            </Button>
            
            {/* Status for screen readers */}
            <div 
              id="submit-status"
              aria-live="polite" 
              aria-atomic="true"
              className="sr-only"
            >
              {loading && 'Submitting your review, please wait...'}
              {submitted && 'Review submitted successfully!'}
            </div>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReviewForm;
