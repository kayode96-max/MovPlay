# 🚀 MovPlay Development Guide

## Quick Start

### 1. Prerequisites Setup

**Required:**
- Node.js v18+ ([Download here](https://nodejs.org/))
- MongoDB ([Install locally](https://www.mongodb.com/docs/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/atlas))
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

**Optional:**
- Git for version control
- VS Code with recommended extensions

### 2. Environment Configuration

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/movplay
JWT_SECRET=movplay_super_secret_jwt_key_2024_development
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MovPlay
```

### 3. Quick Start Commands

**Option 1: Manual Start (Recommended for development)**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

**Option 2: Automated Start (Windows)**
```powershell
# Run from project root
.\start.ps1
```

**Option 3: Automated Start (Unix/Linux/Mac)**
```bash
# Run from project root
chmod +x start.sh
./start.sh
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000

## 🛠️ Development Workflow

### Project Structure Overview
```
movplay/
├── backend/           # Express.js API server
├── frontend/          # React application
├── README.md         # Project documentation
├── start.ps1         # Windows startup script
└── start.sh          # Unix startup script
```

### Key Features Implemented

#### ✅ Authentication System
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Protected routes and middleware
- User profile management

#### ✅ Movie Features
- Integration with TMDB API
- Movie search and discovery
- Detailed movie information
- Trending, popular, and top-rated movies
- Movie recommendations

#### ✅ User Features
- Personal watchlists
- Favorite movies
- Movie reviews and ratings
- User profiles and preferences

#### ✅ Modern UI/UX
- Material-UI component library
- Dark theme optimized for movies
- Responsive design (mobile-first)
- Smooth animations with Framer Motion
- Advanced search and filtering

### Development Best Practices

#### Code Organization
- **Backend:** MVC pattern with proper separation of concerns
- **Frontend:** Component-based architecture with custom hooks
- **API:** RESTful endpoints with consistent response format
- **Database:** Mongoose schemas with validation

#### Security Measures
- JWT token authentication
- Password hashing and salting
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Error handling without data leaks

#### Performance Optimizations
- Database indexing
- Image lazy loading
- API response caching
- Code splitting (Vite)
- Efficient MongoDB queries

## 🧪 Testing & Debugging

### Backend Testing
```bash
cd backend
npm test                    # Run tests
npm run test:watch         # Watch mode
npm run lint              # Code linting
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run tests
npm run test:coverage     # Coverage report
npm run lint              # ESLint check
```

### Common Development Issues

#### 1. Database Connection Issues
```bash
# Check MongoDB status
mongosh
# Or check if process is running
ps aux | grep mongod
```

#### 2. TMDB API Issues
- Verify API key in backend/.env
- Check API quotas and limits
- Test API key: `curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY"`

#### 3. CORS Issues
- Ensure FRONTEND_URL matches your frontend port
- Check browser developer tools for CORS errors

#### 4. Port Conflicts
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process (Windows)
taskkill /PID <PID> /F
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### Movie Endpoints
```
GET  /api/movies/search         # Search movies
GET  /api/movies/popular        # Popular movies
GET  /api/movies/trending       # Trending movies
GET  /api/movies/:id            # Movie details
POST /api/movies/favorites      # Add to favorites
```

### User Endpoints
```
GET  /api/user/watchlists      # Get watchlists
POST /api/user/watchlists      # Create watchlist
PUT  /api/user/watchlists/:id  # Update watchlist
```

## 🚀 Deployment Guide

### Backend Deployment (Render/Railway/Heroku)
1. Create new service
2. Connect GitHub repository
3. Set environment variables:
   ```
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   TMDB_API_KEY=your_tmdb_api_key
   NODE_ENV=production
   FRONTEND_URL=your_frontend_domain
   ```
4. Deploy backend folder

### Frontend Deployment (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables:
   ```
   VITE_API_URL=your_backend_api_url
   ```
4. Configure redirects for SPA

### Database Setup (Production)
1. Use MongoDB Atlas for cloud database
2. Create database user and password
3. Whitelist deployment server IPs
4. Update connection string

## 🔧 Advanced Configuration

### Custom Themes
Edit `frontend/src/App.jsx` theme configuration:
```javascript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});
```

### API Rate Limiting
Modify `backend/index.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
});
```

### Database Indexes
Add custom indexes in MongoDB:
```javascript
// In MongoDB shell
db.movies.createIndex({ "title": "text", "overview": "text" })
db.users.createIndex({ "email": 1 }, { unique: true })
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow code style guidelines
4. Add tests for new features
5. Update documentation
6. Submit pull request

## 📞 Support

- **Issues:** Create GitHub issue with detailed description
- **Questions:** Check existing documentation first
- **Feature Requests:** Use GitHub discussions

---

**Happy coding! 🎬✨**

---

### Month 4: Fullstack Integration & Deployment

#### Learning Objectives
- Connect frontend and backend systems  
- Implement authentication flows  
- Deploy fullstack applications  
- Work with external APIs  

#### Technical Skills Coverage

##### Fullstack Integration
- Making API requests from React frontend  
- Handling authentication & user sessions  
- Managing state in a Fullstack app  

##### Authentication & Deployment
- Implementing JWT authentication  
- Deploying frontend (Netlify/Vercel)  
- Deploying backend (Render/Heroku)  

#### Hands-On Projects
1. Connect React frontend to Express backend  
2. Implement authentication in a Fullstack app  

---

### 🎬 Capstone Project: Movie Recommendation App

#### Project Overview
Build a full-featured movie recommendation platform where users can discover, search, and save their favorite movies.  

#### Core Features

1. User Authentication
   - User registration and login  
   - Secure password handling  
   - JWT token-based authentication  

2. Movie Discovery
   - Search movies by title, genre, or year  
   - Filter by rating, release date, and popularity  
   - View detailed movie information  
   - Get personalized recommendations  

3. User Features
   - Save favorite movies  
   - Create custom watchlists  
   - Rate and review movies  
   - User profile management  

4. Technical Requirements
   - React frontend with modern UI components  
   - Express.js backend with RESTful API  
   - MongoDB database for user data  
   - Integration with external movie API (e.g., TMDB)  
   - Responsive design for mobile and desktop  

#### Timeline (Weeks 14-16)
- Week 14: Setup & Basic Features  
- Week 15: Advanced Features & Authentication  
- Week 16: Polish & Deployment  

#### Deployment
- Frontend: Deploy to Netlify/Vercel  
- Backend: Deploy to Render/Heroku  
- Set up CI/CD pipeline  

#### Stretch Goals
- Social features (follow other users, share lists)  
- Advanced recommendation algorithm  
- Movie trailer integration  
- PWA implementation  

---
