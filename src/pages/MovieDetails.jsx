import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useWatchlist } from '../contexts/WatchlistContext';
import { StarIcon, PlayIcon } from '@heroicons/react/24/outline';

function MovieDetails() {
  const { id } = useParams();
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((item) => item.id === Number(id));

  const fetchMovieDetails = async () => {
    const [movie, credits] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      ),
    ]);

    return {
      ...movie.data,
      credits: credits.data,
    };
  };

  const { data: movie, isLoading } = useQuery(['movie', id], fetchMovieDetails);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(Number(id));
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative h-96">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-4 text-white">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">{movie.runtime} min</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
              <p className="text-gray-600 dark:text-gray-400">{movie.overview}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cast</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {movie.credits.cast.slice(0, 6).map((cast) => (
                  <div key={cast.id} className="flex items-center space-x-3">
                    <img
                      src={`https://image.tmdb.org/t/p/w185${cast.profile_path}`}
                      alt={cast.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {cast.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {cast.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Production Companies
              </h2>
              <div className="flex flex-wrap gap-3">
                {movie.production_companies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2"
                  >
                    {company.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleWatchlistToggle}
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600"
          >
            {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
          <a
            href={`https://www.imdb.com/title/${movie.imdb_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Watch on IMDb
          </a>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
