# 🎬 MovPlay - Movie Recommendation Platform

A full-featured movie recommendation platform where users can discover, search, and save their favorite movies. Built with React, Express.js, MongoDB, and The Movie Database (TMDB) API.

## ✨ Features

### 🔐 User Authentication
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- User profile management
- Account settings and preferences

### 🎭 Movie Discovery
- Search movies by title, genre, or year
- Filter by rating, release date, and popularity
- View detailed movie information
- Get personalized recommendations
- Browse trending, popular, and top-rated movies
- Advanced filtering options

### 👤 User Features
- Save favorite movies
- Create custom watchlists
- Rate and review movies
- Mark movies as watched
- User profile with statistics
- Social features (follow users, share lists)

### 🎨 Modern UI/UX
- Beautiful, responsive design
- Dark theme optimized for movie viewing
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Material-UI components
- Interactive movie cards and details

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### External APIs
- **TMDB API** - Movie data and images

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movplay.git
   cd movplay
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/movplay
   JWT_SECRET=your_super_secret_jwt_key_here
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
movplay/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── movieController.js # Movie operations
│   │   └── userController.js  # User operations
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Error handling
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Movie.js          # Movie schema
│   │   ├── Review.js         # Review schema
│   │   └── Watchlist.js      # Watchlist schema
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── movies.js         # Movie routes
│   │   └── user.js           # User routes
│   ├── utils/
│   │   └── tmdb.js           # TMDB API utilities
│   ├── index.js              # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js      # API configuration
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useAuth.js    # Authentication hook
│   │   │   └── useMovies.js  # Movies hook
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Watchlists.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/movplay
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MovPlay
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Movie Endpoints
- `GET /api/movies/search` - Search movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies/favorites` - Add to favorites
- `GET /api/movies/favorites` - Get user favorites

### User Endpoints
- `GET /api/user/watchlists` - Get user watchlists
- `POST /api/user/watchlists` - Create watchlist
- `PUT /api/user/watchlists/:id` - Update watchlist
- `DELETE /api/user/watchlists/:id` - Delete watchlist

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Create a new service on Render or Heroku
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify or Vercel
3. Set environment variables
4. Update API URL in production

## 🎯 Roadmap

### Phase 1 - Core Features ✅
- [x] User authentication
- [x] Movie search and discovery
- [x] Watchlists and favorites
- [x] Basic reviews and ratings

### Phase 2 - Enhanced Features 🚧
- [ ] Advanced recommendation algorithm
- [ ] Social features (follow users)
- [ ] Movie trailer integration
- [ ] Advanced filtering
- [ ] User statistics dashboard

### Phase 3 - Advanced Features 📋
- [ ] PWA implementation
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Social sharing
- [ ] Admin panel
- [ ] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie data API
- [Material-UI](https://mui.com/) for the beautiful React components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or contact the development team.

---

**Happy movie discovering! 🍿**
