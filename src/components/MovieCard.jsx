import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import { StarIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';

function MovieCard({ movie }) {
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((item) => item.id === movie.id);
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchlistToggle = async () => {
    setIsLoading(true);
    try {
      if (isInWatchlist) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={api.getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {movie.title}
        </h3>
        <div className="flex items-center mt-2">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
          {movie.overview || 'No description available'}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleWatchlistToggle}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-primary-500 text-white hover:bg-primary-600"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'
            )}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
