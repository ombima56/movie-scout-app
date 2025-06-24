import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import MovieCard from '../components/MovieCard';

function Trending() {
  useTheme();

  const fetchTrendingMovies = async () => {
    const response = await api.getTrending();
    return response;
  };

  const { data: trendingMovies, isLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: fetchTrendingMovies
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Movies</h1>
      
      <div className="space-y-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trending;
