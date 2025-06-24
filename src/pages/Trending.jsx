import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import MovieCard from '../components/MovieCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { api } from '../utils/api';

function Trending() {
  useTheme();

  const fetchTrendingMovies = async () => {
    const response = await api.getTrending('movie', 'week');
    return response || []; // Ensure we always return an array
  };

  const fetchTrendingTV = async () => {
    const response = await api.getTrending('tv', 'week');
    return response || []; // Ensure we always return an array
  };

  const { data: trendingMovies = [], isLoading: moviesLoading, error: moviesError } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: fetchTrendingMovies
  });

  const { data: trendingTV = [], isLoading: tvLoading, error: tvError } = useQuery({
    queryKey: ['trendingTV'],
    queryFn: fetchTrendingTV
  });

  if (moviesLoading || tvLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trending This Week</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingMovies.map((movie) => (
            <ErrorBoundary key={`movie-${movie.id}`}>
              <MovieCard movie={movie} />
            </ErrorBoundary>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">TV Shows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingTV.map((show) => (
            <ErrorBoundary key={`tv-${show.id}`}>
              <MovieCard movie={show} />
            </ErrorBoundary>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Trending;
