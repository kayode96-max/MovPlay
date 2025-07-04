import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  ToggleButton, 
  ToggleButtonGroup, 
  Typography,
  Divider
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon
} from '@mui/icons-material';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'title.asc', label: 'A to Z' },
  { value: 'title.desc', label: 'Z to A' }
];

const ResultsHeader = ({ 
  resultCount, 
  sortBy, 
  onSortChange, 
  viewMode = 'grid', 
  onViewModeChange,
  searchTerm,
  showViewToggle = true 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: { xs: 'flex-start', sm: 'center' },
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      mb: 3,
      p: 2,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Movies'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {resultCount} movies found
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        width: { xs: '100%', sm: 'auto' }
      }}>
        {/* Sort Control */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => onSortChange(e.target.value)}
            startAdornment={<SortIcon sx={{ mr: 1, fontSize: 18 }} />}
          >
            {SORT_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* View Mode Toggle */}
        {showViewToggle && (
          <>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResultsHeader;
