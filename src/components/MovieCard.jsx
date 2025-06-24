import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import { StarIcon, FilmIcon, TvIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';

function MovieCard({ movie = null }) {
  // If no movie provided, return a placeholder
  if (!movie) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full animate-pulse">
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((item) => item?.id === movie?.id);
  const [isLoading, setIsLoading] = useState(false);

  try {
    // Safely extract properties with fallbacks
    const isTVShow = movie?.first_air_date !== undefined;
    const title = movie?.title || movie?.name || 'Untitled';
    const releaseYear = movie?.release_date 
      ? new Date(movie.release_date).getFullYear() 
      : movie?.first_air_date 
        ? new Date(movie.first_air_date).getFullYear() 
        : 'N/A';
    const voteAverage = movie?.vote_average?.toFixed(1) || 'N/A';
    const overview = movie?.overview || 'No description available';
    const posterPath = movie?.poster_path;
    const mediaId = movie?.id;

    const handleWatchlistToggle = async (e) => {
      if (!mediaId) return;
      
      e.preventDefault();
      e.stopPropagation();
      setIsLoading(true);
      try {
        if (isInWatchlist) {
          removeFromWatchlist(mediaId);
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
      <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
        <Link 
          to={mediaId ? (isTVShow ? `/tv/${mediaId}` : `/movie/${mediaId}`) : '#'} 
          className="block h-full"
          onClick={(e) => !mediaId ? e.preventDefault() : null}
        >
          {/* Media type indicator */}
          {mediaId && (
            <div className="absolute top-2 left-2 z-10 bg-black/70 rounded-full p-1.5">
              {isTVShow ? (
                <TvIcon className="h-4 w-4 text-white" />
              ) : (
                <FilmIcon className="h-4 w-4 text-white" />
              )}
            </div>
          )}

          {/* Poster image with fallback */}
          <div className="relative overflow-hidden w-full h-64">
            {posterPath ? (
              <img
                src={api.getImageUrl(posterPath, 'w500')}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/placeholder-poster.png';
                  e.target.onerror = null;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No image</span>
              </div>
            )}

            {/* Hover overlay with quick action */}
            {mediaId && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={handleWatchlistToggle}
                  disabled={isLoading || !mediaId}
                  className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-primary-500 text-white hover:bg-primary-600"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    isInWatchlist ? 'Remove' : '+ Watchlist'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Card content */}
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h3>
              <div className="flex items-center ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  {voteAverage}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {overview}
            </p>

            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {releaseYear}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {isTVShow ? 'TV Show' : 'Movie'}
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  } catch (error) {
    console.error('Error rendering MovieCard:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-300">
          Error displaying this content
        </p>
      </div>
    );
  }
}

export default MovieCard;
