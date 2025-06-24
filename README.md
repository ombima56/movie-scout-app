# Movie Scout - Entertainment Discovery Platform

Movie Scout is a modern web application that helps you discover movies and TV shows. It provides a comprehensive entertainment discovery experience with features like search, trending content, watchlist management, and detailed movie information.

## Features

-  Search for movies and TV shows with real-time results
-  View trending content
-  Create and manage your personal watchlist
-  Detailed movie information including ratings, cast, and plot
-  Dark/Light theme support
-  Responsive design for all devices
-  Fast loading with caching and pagination
-  Genre-based filtering
-  Multiple ratings sources (IMDb, Rotten Tomatoes, TMDB)

## Tech Stack

- React 18 with Vite
- TanStack Query v5 for state management
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- localStorage for data persistence
- React Hot Toast for notifications

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- TMDB API Key
- OMDB API Key

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/movie-scout.git
cd movie-scout
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your API keys:
```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_OMDB_API_KEY=your_omdb_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── utils/          # Utility functions and API integrations
├── App.jsx         # Main application component
└── index.css       # Global styles
```

## API Integration

The application uses two main APIs:

1. TMDB (The Movie Database) - Primary source for:
   - Movie/TV show data
   - Images and posters
   - Trending content
   - Search functionality

2. OMDB (Open Movie Database) - Additional data source for:
   - Detailed movie information
   - Ratings from multiple sources
   - Plot summaries

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_OMDB_API_KEY=your_omdb_api_key
```

## Development

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running Tests

```bash
npm run test
# or
yarn test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- TMDB API for movie data
- OMDB API for additional movie information
- React Icons for SVG icons
- React Hot Toast for notifications
- TanStack Query for efficient data fetching
- Vite for blazing fast development experience
