import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { theme } from './theme/theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import Profile from './pages/Profile';
import Watchlists from './pages/Watchlists';
import Discover from './pages/Discover';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationProvider from './components/NotificationProvider';
import './App.css';

// Page animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: 'var(--dark-gradient)'
          }}
        >
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        {/* Skip navigation link */}
        <a 
          href="#main-content" 
          className="skip-link"
          onFocus={(e) => e.target.classList.add('visible')}
          onBlur={(e) => e.target.classList.remove('visible')}
        >
          Skip to main content
        </a>
        
        {/* Screen reader announcements */}
        <div 
          id="sr-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
        
        <Box className="app-container" sx={{ minHeight: '100vh' }}>
          <Navbar />
          <main id="main-content" className="main-content">
            <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    key="home"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Home />
                  </motion.div>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <motion.div
                    key="login"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login />
                  </motion.div>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <motion.div
                    key="register"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register />
                  </motion.div>
                } 
              />
              <Route 
                path="/discover" 
                element={
                  <motion.div
                    key="discover"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Discover />
                  </motion.div>
                } 
              />
              <Route 
                path="/movie/:id" 
                element={
                  <motion.div
                    key="movie-details"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <MovieDetails />
                  </motion.div>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="profile"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Profile />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/watchlists" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="watchlists"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Watchlists />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AnimatePresence>
          </main>
        </Box>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;


