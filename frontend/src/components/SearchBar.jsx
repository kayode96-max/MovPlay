import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Autocomplete,
  Typography,
  Paper,
  Chip,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  MovieFilter as MovieIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardNavigation, useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from './NotificationProvider';

const SearchBar = ({ compact = false, placeholder = "Search movies, actors, directors...", value = "", onChange, onSearch, onClose }) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const liveRegionRef = useRef(null);
  const { prefersReducedMotion, announce, manageFocus } = useAccessibility();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();
  
  const [suggestions] = useState([
    'Action Movies',
    'Comedy Movies', 
    'Horror Movies',
    'Sci-Fi Movies',
    'Drama Movies',
    'Marvel Movies',
    'DC Comics',
    'Christopher Nolan',
    'Leonardo DiCaprio',
    'Top Rated 2024'
  ]);

  // Filter suggestions based on search input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase()) && 
    suggestion.toLowerCase() !== searchValue.toLowerCase()
  );

  // Keyboard navigation for suggestions
  const { 
    currentIndex: highlightedIndex, 
    handleKeyDown: handleSuggestionKeyDown,
    resetIndex 
  } = useKeyboardNavigation({
    items: filteredSuggestions,
    onSelect: (index) => {
      if (index >= 0 && index < filteredSuggestions.length) {
        handleSuggestionClick(filteredSuggestions[index]);
      }
    },
    onEscape: () => {
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  });

  // Announce search results to screen reader
  const announceSearchResults = useCallback((query, resultCount) => {
    const message = resultCount 
      ? `Found ${resultCount} results for ${query}`
      : `No results found for ${query}`;
    announce(message);
  }, [announce]);

  const searchVariants = {
    initial: { scale: 1, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
    hover: { 
      scale: prefersReducedMotion ? 1 : 1.02, 
      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    },
    focus: { 
      scale: prefersReducedMotion ? 1 : 1.03, 
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    }
  };

  const handleSearch = async () => {
    if (searchValue.trim()) {
      setIsSearching(true);
      announce(`Searching for ${searchValue.trim()}`);
      
      try {
        navigate(`/discover?q=${encodeURIComponent(searchValue.trim())}`);
        if (onSearch) onSearch(searchValue.trim());
        if (onClose) onClose();
        showSuccess(`Searching for "${searchValue.trim()}" in discover`);
        
        // Add to search history
        setSearchHistory(prev => {
          const newHistory = [searchValue.trim(), ...prev.filter(item => item !== searchValue.trim())];
          return newHistory.slice(0, 5); // Keep only last 5 searches
        });
      } catch (error) {
        showError('Search failed. Please try again.');
        announce('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      handleSuggestionKeyDown(event);
    } else {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
      if (event.key === 'ArrowDown' && filteredSuggestions.length > 0) {
        event.preventDefault();
        setShowSuggestions(true);
        resetIndex();
      }
    }
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    setShowSuggestions(newValue.length > 0);
    resetIndex();
    
    if (onChange) {
      onChange(event);
    }

    // Announce live updates for screen readers
    if (newValue.length > 2) {
      const matchCount = filteredSuggestions.length;
      announce(`${matchCount} suggestions available`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    navigate(`/discover?q=${encodeURIComponent(suggestion)}`);
    if (onClose) onClose();
    announce(`Selected ${suggestion}`);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(searchValue.length > 0);
  };

  const handleBlur = (event) => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestions(false);
      }
    }, 150);
  };

  const clearSearch = () => {
    setSearchValue('');
    setShowSuggestions(false);
    resetIndex();
    inputRef.current?.focus();
    announce('Search cleared');
  };

  if (compact) {
    return (
      <motion.div
        variants={searchVariants}
        initial="initial"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        role="search"
        aria-label="Movie search"
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 3, 
            px: 2, 
            py: 1.5,
            transition: 'all var(--transition-normal)',
            '&:hover': {
              border: '1px solid var(--primary-color)',
              background: 'var(--surface-hover)',
            },
            '&:focus-within': {
              border: '1px solid var(--primary-color)',
              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
            }
          }}
        >
          <SearchIcon 
            sx={{ color: 'var(--text-secondary)', mr: 1 }} 
            aria-hidden="true"
          />
          <TextField
            ref={inputRef}
            variant="standard"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isSearching}
            aria-label={placeholder}
            aria-describedby="search-instructions"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
            InputProps={{
              disableUnderline: true,
              sx: {
                color: 'var(--text-primary)',
                fontSize: '1rem',
                '&::placeholder': {
                  color: 'var(--text-secondary)',
                  opacity: 1,
                }
              }
            }}
            sx={{ 
              flex: 1,
              '& .MuiInputBase-input': {
                padding: 0,
              }
            }}
          />
          {searchValue && (
            <IconButton 
              size="small" 
              onClick={clearSearch}
              aria-label="Clear search"
              sx={{ 
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--text-primary)',
                  background: 'var(--surface-hover)',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton 
            onClick={handleSearch} 
            disabled={!searchValue.trim() || isSearching}
            aria-label={`Search for ${searchValue || 'movies'}`}
            sx={{
              color: searchValue.trim() ? 'var(--primary-color)' : 'var(--text-muted)',
              '&:hover': {
                background: 'var(--surface-hover)',
                transform: prefersReducedMotion ? 'none' : 'scale(1.1)',
              },
              '&:disabled': {
                color: 'var(--text-muted)',
              },
              transition: 'all var(--transition-fast)',
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
        
        {/* Hidden instructions for screen readers */}
        <div id="search-instructions" className="sr-only">
          Use arrow keys to navigate suggestions, Enter to search, Escape to close
        </div>
        
        {/* Live region for announcements */}
        <div 
          ref={liveRegionRef}
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        />
      </motion.div>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', my: 2 }} role="search" aria-label="Movie search">
      <motion.div
        variants={searchVariants}
        initial="initial"
        whileHover="hover"
        animate={isFocused ? "focus" : "initial"}
      >
        <TextField
          ref={inputRef}
          fullWidth
          label={placeholder}
          variant="outlined"
          value={searchValue}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isSearching}
          aria-label={placeholder}
          aria-describedby="search-instructions search-status"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
          role="combobox"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'var(--primary-color)' }} aria-hidden="true" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <AnimatePresence>
                  {searchValue && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={clearSearch}
                        aria-label="Clear search"
                        sx={{ 
                          mr: 1,
                          '&:hover': {
                            background: 'var(--surface-hover)',
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </motion.div>
                  )}
                </AnimatePresence>
                <IconButton 
                  onClick={handleSearch} 
                  disabled={!searchValue.trim() || isSearching}
                  aria-label={`Search for ${searchValue || 'movies'}`}
                  sx={{
                    background: searchValue.trim() ? 'var(--primary-gradient)' : 'transparent',
                    color: searchValue.trim() ? 'white' : 'var(--text-muted)',
                    '&:hover': {
                      background: searchValue.trim() ? 'var(--primary-gradient)' : 'var(--surface-hover)',
                      transform: prefersReducedMotion ? 'none' : 'scale(1.05)',
                    },
                    '&:disabled': {
                      background: 'transparent',
                      color: 'var(--text-muted)',
                    },
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              transition: 'all var(--transition-normal)',
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
            },
            '& .MuiInputLabel-root': {
              color: 'var(--text-secondary)',
              '&.Mui-focused': {
                color: 'var(--primary-color)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'var(--text-primary)',
              fontSize: '1rem',
            },
          }}
        />
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <Paper
              sx={{
                background: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 3,
                mt: 1,
                maxHeight: 300,
                overflow: 'auto',
              }}
              role="listbox"
              aria-label="Search suggestions"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    backgroundColor: 'var(--surface-hover)',
                    x: prefersReducedMotion ? 0 : 5,
                    transition: { duration: prefersReducedMotion ? 0 : 0.2 }
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => resetIndex(index)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: index < filteredSuggestions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                    backgroundColor: index === highlightedIndex ? 'var(--surface-hover)' : 'transparent',
                  }}
                >
                  <TrendingIcon sx={{ color: 'var(--accent-color)', fontSize: 20 }} aria-hidden="true" />
                  <Typography variant="body1" sx={{ color: 'var(--text-primary)' }}>
                    {suggestion}
                  </Typography>
                </motion.div>
              ))}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Search Chips */}
      <AnimatePresence>
        {isFocused && !searchValue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Typography 
                variant="caption" 
                sx={{ color: 'var(--text-secondary)', width: '100%', textAlign: 'center', mb: 1 }}
                id="popular-searches-label"
              >
                Popular searches:
              </Typography>
              <div role="group" aria-labelledby="popular-searches-label">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <motion.div
                    key={suggestion}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  >
                    <Chip
                      label={suggestion}
                      size="small"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Search for ${suggestion}`}
                      sx={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        '&:hover, &:focus': {
                          background: 'var(--surface-hover)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-primary)',
                          transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
                          outline: 'none',
                        },
                        '&:focus': {
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.5)',
                        },
                        transition: 'all var(--transition-fast)',
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search instructions and status */}
      <div id="search-instructions" className="sr-only">
        Use arrow keys to navigate suggestions, Enter to search, Escape to close. 
        {filteredSuggestions.length > 0 && `${filteredSuggestions.length} suggestions available.`}
      </div>
      
      <div 
        id="search-status"
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {isSearching && 'Searching...'}
      </div>

      {onClose && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
            Press ESC to close
          </Typography>
        </Box>
      )}
      
      {/* Live region for announcements */}
      <div 
        ref={liveRegionRef}
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      />
    </Box>
  );
};

export default SearchBar;

