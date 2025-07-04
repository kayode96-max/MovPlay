import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fade,
  Backdrop,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  PlaylistPlay as PlaylistPlayIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  MovieFilter as MovieFilterIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNotifications } from './NotificationProvider';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const menuButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const searchButtonRef = useRef(null);
  
  const { prefersReducedMotion, announce, manageFocus } = useAccessibility();
  const { notifications } = useNotifications();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // ESC key handling
      if (event.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
          searchButtonRef.current?.focus();
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        } else if (anchorEl) {
          handleProfileMenuClose();
          profileButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, mobileMenuOpen, anchorEl]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    announce('User menu opened');
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    announce('User menu closed');
  };

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    announce(newState ? 'Mobile menu opened' : 'Mobile menu closed');
  };

  const handleSearchToggle = () => {
    const newState = !searchOpen;
    setSearchOpen(newState);
    announce(newState ? 'Search opened' : 'Search closed');
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
    announce('Logged out successfully');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <HomeIcon />, public: true },
    { label: 'Discover', path: '/discover', icon: <MovieFilterIcon />, public: true },
    { label: 'Watchlists', path: '/watchlists', icon: <PlaylistPlayIcon />, public: false },
    { label: 'Profile', path: '/profile', icon: <PersonIcon />, public: false },
  ];

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: prefersReducedMotion ? 1 : 1.05,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    },
    tap: {
      scale: prefersReducedMotion ? 1 : 0.95
    }
  };

  const mobileMenuVariants = {
    hidden: {
      x: '-100%',
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: "easeInOut"
      }
    },
    visible: {
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: "easeInOut"
      }
    }
  };

  const UserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      role="menu"
      aria-labelledby="user-menu-button"
      PaperProps={{
        sx: {
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          minWidth: 200,
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      MenuListProps={{
        'aria-labelledby': 'user-menu-button',
        role: 'menu',
      }}
    >
      <MenuItem 
        onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}
        role="menuitem"
        sx={{
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&:focus': {
            background: 'rgba(255, 255, 255, 0.1)',
            outline: '2px solid var(--primary-color)',
            outlineOffset: '-2px',
          }
        }}
      >
        <PersonIcon sx={{ mr: 2, color: 'var(--primary-color)' }} aria-hidden="true" />
        Profile
      </MenuItem>
      <MenuItem 
        onClick={() => { navigate('/watchlists'); handleProfileMenuClose(); }}
        role="menuitem"
        sx={{
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&:focus': {
            background: 'rgba(255, 255, 255, 0.1)',
            outline: '2px solid var(--primary-color)',
            outlineOffset: '-2px',
          }
        }}
      >
        <PlaylistPlayIcon sx={{ mr: 2, color: 'var(--accent-color)' }} aria-hidden="true" />
        My Watchlists
      </MenuItem>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <MenuItem 
        onClick={handleLogout}
        role="menuitem"
        sx={{
          '&:hover': {
            background: 'rgba(240, 147, 251, 0.1)',
          },
          '&:focus': {
            background: 'rgba(240, 147, 251, 0.1)',
            outline: '2px solid var(--secondary-color)',
            outlineOffset: '-2px',
          }
        }}
      >
        <LogoutIcon sx={{ mr: 2, color: 'var(--secondary-color)' }} aria-hidden="true" />
        Logout
      </MenuItem>
    </Menu>
  );

  const MobileDrawer = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <Backdrop
            open={mobileMenuOpen}
            onClick={handleMobileMenuToggle}
            sx={{ 
              zIndex: theme.zIndex.drawer - 1,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
          />
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={handleMobileMenuToggle}
            variant="temporary"
            role="dialog"
            aria-labelledby="mobile-menu-title"
            aria-modal="true"
            PaperProps={{
              component: motion.div,
              variants: mobileMenuVariants,
              initial: "hidden",
              animate: "visible",
              exit: "hidden",
              sx: {
                width: 280,
                background: 'rgba(26, 26, 26, 0.98)',
                backdropFilter: 'blur(20px)',
                border: 'none',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <Typography 
                  id="mobile-menu-title"
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  🎬 MovPlay
                </Typography>
              </motion.div>
              <IconButton 
                onClick={handleMobileMenuToggle}
                aria-label="Close mobile menu"
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: prefersReducedMotion ? 'none' : 'rotate(90deg)',
                  },
                  '&:focus': {
                    outline: '2px solid var(--primary-color)',
                    outlineOffset: '2px',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mx: 2 }} />
            
            <nav role="navigation" aria-label="Mobile navigation">
              <List sx={{ px: 2, pt: 2 }}>
                {menuItems
                  .filter(item => item.public || isAuthenticated)
                  .map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.1 * (index + 1) }}
                    >
                      <ListItem
                        component={Link}
                        to={item.path}
                        onClick={handleMobileMenuToggle}
                        role="none"
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          background: isActive(item.path) 
                            ? 'rgba(102, 126, 234, 0.2)' 
                            : 'transparent',
                          border: isActive(item.path) 
                            ? '1px solid rgba(102, 126, 234, 0.3)' 
                            : '1px solid transparent',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: prefersReducedMotion ? 'none' : 'translateX(5px)',
                          },
                          '&:focus': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            outline: '2px solid var(--primary-color)',
                            outlineOffset: '2px',
                          },
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          display: 'flex',
                        }}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                      >
                        <ListItemIcon sx={{ 
                          color: isActive(item.path) 
                            ? 'var(--primary-color)' 
                            : 'var(--text-secondary)',
                          minWidth: 40
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: isActive(item.path) ? 600 : 400,
                              color: isActive(item.path) 
                                ? 'var(--text-primary)' 
                                : 'var(--text-secondary)',
                            }
                          }}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
              </List>
            </nav>

            {!isAuthenticated && (
              <Box sx={{ p: 2, mt: 'auto' }}>
                <Stack spacing={2}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
                  >
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      fullWidth
                      onClick={handleMobileMenuToggle}
                      sx={{
                        borderColor: 'var(--glass-border)',
                        color: 'var(--text-primary)',
                        '&:hover': {
                          borderColor: 'var(--primary-color)',
                          background: 'rgba(102, 126, 234, 0.1)',
                        },
                        '&:focus': {
                          outline: '2px solid var(--primary-color)',
                          outlineOffset: '2px',
                        }
                      }}
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
                  >
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      fullWidth
                      onClick={handleMobileMenuToggle}
                      sx={{
                        background: 'var(--primary-gradient)',
                        '&:hover': {
                          background: 'var(--primary-gradient)',
                          transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        },
                        '&:focus': {
                          outline: '2px solid white',
                          outlineOffset: '2px',
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </Stack>
              </Box>
            )}
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <AppBar 
          position="fixed" 
          elevation={0}
          role="banner"
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <IconButton
                  ref={menuButtonRef}
                  edge="start"
                  color="inherit"
                  aria-label="Open mobile menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls={mobileMenuOpen ? "mobile-menu" : undefined}
                  onClick={handleMobileMenuToggle}
                  sx={{ 
                    mr: 2,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:focus': {
                      outline: '2px solid var(--primary-color)',
                      outlineOffset: '2px',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </motion.div>
            )}

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  fontWeight: 800,
                  textDecoration: 'none',
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: prefersReducedMotion ? 'none' : 'scale(1.05)',
                  },
                  '&:focus': {
                    outline: '2px solid var(--primary-color)',
                    outlineOffset: '4px',
                    borderRadius: 1,
                  },
                  transition: 'transform 0.2s ease',
                }}
                aria-label="MovPlay - Go to homepage"
              >
                🎬 MovPlay
              </Typography>
            </motion.div>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav role="navigation" aria-label="Main navigation">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
                  {menuItems
                    .filter(item => item.public || isAuthenticated)
                    .map((item, index) => (
                      <motion.div
                        key={item.path}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: prefersReducedMotion ? 0 : 0.1 * (index + 1) }}
                      >
                        <Button
                          component={Link}
                          to={item.path}
                          startIcon={item.icon}
                          aria-current={isActive(item.path) ? 'page' : undefined}
                          sx={{
                            color: isActive(item.path) ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: isActive(item.path) ? 600 : 400,
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            background: isActive(item.path) 
                              ? 'rgba(102, 126, 234, 0.1)' 
                              : 'transparent',
                            border: isActive(item.path) 
                              ? '1px solid rgba(102, 126, 234, 0.3)' 
                              : '1px solid transparent',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-primary)',
                            },
                            '&:focus': {
                              outline: '2px solid var(--primary-color)',
                              outlineOffset: '2px',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {item.label}
                        </Button>
                      </motion.div>
                    ))}
                </Stack>
              </nav>
            )}

            {/* User Actions */}
            <Stack direction="row" spacing={1} alignItems="center">
              {!isMobile && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
                >
                  <IconButton
                    ref={searchButtonRef}
                    onClick={handleSearchToggle}
                    aria-label={searchOpen ? "Close search" : "Open search"}
                    aria-expanded={searchOpen}
                    aria-controls={searchOpen ? "search-container" : undefined}
                    sx={{
                      color: 'var(--text-secondary)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--primary-color)',
                        transform: prefersReducedMotion ? 'none' : 'scale(1.1)',
                      },
                      '&:focus': {
                        outline: '2px solid var(--primary-color)',
                        outlineOffset: '2px',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </motion.div>
              )}

              {isAuthenticated ? (
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
                >
                  <IconButton
                    ref={profileButtonRef}
                    id="user-menu-button"
                    onClick={handleProfileMenuOpen}
                    aria-label={`User menu for ${user?.username || 'user'}`}
                    aria-expanded={Boolean(anchorEl)}
                    aria-controls={Boolean(anchorEl) ? "user-menu" : undefined}
                    aria-haspopup="true"
                    sx={{
                      p: 0,
                      '&:hover': {
                        transform: prefersReducedMotion ? 'none' : 'scale(1.1)',
                      },
                      '&:focus': {
                        outline: '2px solid var(--primary-color)',
                        outlineOffset: '2px',
                      },
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <Badge
                      badgeContent={notifications?.length || 0}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: 'var(--accent-color)',
                          color: 'white',
                          fontSize: '0.7rem',
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'var(--primary-gradient)',
                          fontSize: '1rem',
                          fontWeight: 600,
                        }}
                        alt={`${user?.username || 'User'}'s avatar`}
                      >
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </Badge>
                  </IconButton>
                </motion.div>
              ) : !isMobile ? (
                <Stack direction="row" spacing={1}>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
                  >
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      startIcon={<LoginIcon />}
                      sx={{
                        borderColor: 'var(--glass-border)',
                        color: 'var(--text-primary)',
                        '&:hover': {
                          borderColor: 'var(--primary-color)',
                          background: 'rgba(102, 126, 234, 0.1)',
                        },
                        '&:focus': {
                          outline: '2px solid var(--primary-color)',
                          outlineOffset: '2px',
                        }
                      }}
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
                  >
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      sx={{
                        background: 'var(--primary-gradient)',
                        '&:hover': {
                          background: 'var(--primary-gradient)',
                          transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        },
                        '&:focus': {
                          outline: '2px solid white',
                          outlineOffset: '2px',
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </Stack>
              ) : null}
            </Stack>
          </Toolbar>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && !isMobile && (
              <motion.div
                id="search-container"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}>
                  <SearchBar onClose={() => setSearchOpen(false)} />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </AppBar>
      </motion.div>

      <UserMenu />
      <MobileDrawer />
      
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {mobileMenuOpen && "Mobile menu opened"}
        {searchOpen && "Search opened"}
      </div>
    </>
  );
};

export default Navbar;

