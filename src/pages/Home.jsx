import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import MovieCard from '../components/MovieCard';
import { api } from '../utils/api';

function Home() {
  useTheme();

  const fetchPopularMovies = async () => {
    return await api.getTrending('movie', 'week');
  };

  const { data: popularMovies, isLoading, error } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: fetchPopularMovies
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
    </div>;
  }

  if (error) {
    console.error('Error fetching popular movies:', error);
    return <div className="flex justify-center items-center h-64 text-red-500">
      Error loading movies. Please check your API key in .env file.
    </div>;
  }

  if (!popularMovies || !Array.isArray(popularMovies)) {
    return <div className="flex justify-center items-center h-64 text-gray-500">
      No movies found
    </div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Movie Scout</h1>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Popular Movies</h2>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
