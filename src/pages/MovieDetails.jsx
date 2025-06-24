import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useWatchlist } from "../contexts/WatchlistContext";
import {
  StarIcon,
  PlayIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

function MovieDetails() {
  const { id } = useParams();
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((item) => item.id === Number(id));
  const [showPlayer, setShowPlayer] = useState(false);

  const fetchMovieDetails = async () => {
    const [movie, credits, videos, similar, reviews] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      ),
    ]);

    return {
      ...movie.data,
      credits: credits.data,
      videos: videos.data,
      similar: similar.data,
      reviews: reviews.data,
    };
  };

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: fetchMovieDetails,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(Number(id));
    } else {
      addToWatchlist(movie);
    }
  };

  const handleWatchNow = () => {
    setShowPlayer(true);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Player */}
      <div className="relative">
        {showPlayer ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://vidsrc.me/embed/movie?tmdb=${movie.id}`}
              className="w-full h-full"
              allowFullScreen
              title={`Watch ${movie.title}`}
            />
          </div>
        ) : (
          <div
            className="relative aspect-video bg-gradient-to-r from-black/70 to-transparent rounded-lg overflow-hidden cursor-pointer group"
            style={{
              backgroundImage: movie.backdrop_path
                ? `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={handleWatchNow}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <PlayIcon className="h-20 w-20 mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-2xl font-bold mb-2">Watch {movie.title}</h2>
                <p className="text-lg opacity-90">Click to start streaming</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Movie Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-md"
            />
          </div>

          <div className="lg:w-3/4 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {movie.title}
              </h1>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-sm ml-1">/ 10</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Overview
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleWatchlistToggle}
                className="flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
              {!showPlayer && (
                <button
                  onClick={handleWatchNow}
                  className="flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Cast & Crew
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movie.credits?.cast?.slice(0, 12).map((cast) => (
            <div key={cast.id} className="text-center">
              <img
                src={
                  cast.profile_path
                    ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
                    : "/placeholder-person.jpg"
                }
                alt={cast.name}
                className="w-full aspect-[2/3] object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {cast.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {cast.character}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Movies Section */}
      {movie.similar?.results?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Similar Movies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movie.similar.results.slice(0, 12).map((similarMovie) => (
              <div key={similarMovie.id} className="group cursor-pointer">
                <img
                  src={
                    similarMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`
                      : "/placeholder-movie.jpg"
                  }
                  alt={similarMovie.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {similarMovie.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(similarMovie.release_date).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {movie.reviews?.results?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reviews
          </h2>
          <div className="space-y-6">
            {movie.reviews.results.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
              >
                <div className="flex items-center mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {review.author}
                  </h3>
                  {review.author_details?.rating && (
                    <div className="ml-4 flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {review.author_details.rating}/10
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.content.length > 500
                    ? `${review.content.substring(0, 500)}...`
                    : review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
