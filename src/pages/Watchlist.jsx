import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../contexts/WatchlistContext';

function Watchlist() {
  useTheme();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  if (!watchlist) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Watchlist</h1>
      
      <div className="space-y-4">
        <div className="max-w-7xl mx-auto">
          {watchlist.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              Your watchlist is empty. Add movies to start tracking them!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {watchlist.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRemove={() => removeFromWatchlist(movie.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
