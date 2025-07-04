# Movie Recommendation App Backend

This is the backend for the Movie Recommendation App, built with Express.js, MongoDB, and TMDB API integration.

## Features
- User authentication (JWT)
- Movie search, details, and recommendations (TMDB)
- User favorites, watchlists, and reviews
- RESTful API endpoints

## Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
```

### 3. Run the Server
For development (with nodemon):
```bash
npm run dev
```
For production:
```bash
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Movies
- `GET /api/movies/search?query=...` — Search movies
- `GET /api/movies/:tmdbId` — Get movie details
- `GET /api/movies/:tmdbId/recommendations` — Get recommendations

### User
- `GET /api/user/profile` — Get user profile (auth required)
- `POST /api/user/favorites` — Add favorite movie (auth required)
- `DELETE /api/user/favorites` — Remove favorite movie (auth required)
- `POST /api/user/watchlists` — Create watchlist (auth required)
- `POST /api/user/watchlists/add` — Add to watchlist (auth required)
- `POST /api/user/watchlists/remove` — Remove from watchlist (auth required)
- `POST /api/user/reviews` — Add review (auth required)
- `GET /api/user/reviews/:tmdbId` — Get reviews for a movie

## Error Handling
All errors are returned in the format:
```json
{
  "message": "Error message here"
}
```

## License
MIT
