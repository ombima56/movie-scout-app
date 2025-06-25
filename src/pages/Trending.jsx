import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeProvider";
import MovieCard from "../components/MovieCard";
import ErrorBoundary from "../components/ErrorBoundary";
import Pagination from "../components/Pagination";
import { api } from "../utils/api";
import { showErrorNotification } from "../utils/errorNotifications";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { TrendingOfflineMessage } from "../components/OfflineMessage";

function Trending() {
  useTheme();

  const [moviesPage, setMoviesPage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const { isOnline } = useNetworkStatus();

  const fetchTrendingMovies = async () => {
    const response = await api.getTrending("movie", "week", moviesPage);
    return response;
  };

  const fetchTrendingTV = async () => {
    const response = await api.getTrending("tv", "week", tvPage);
    return response;
  };

  const {
    data: moviesData = { results: [], page: 1, totalPages: 1, totalResults: 0 },
    isLoading: moviesLoading,
    error: moviesError,
    isError: moviesIsError,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: ["trendingMovies", moviesPage],
    queryFn: fetchTrendingMovies,
    retry: (failureCount, error) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      showErrorNotification(error, "Failed to load trending movies");
    },
  });

  const {
    data: tvData = { results: [], page: 1, totalPages: 1, totalResults: 0 },
    isLoading: tvLoading,
    error: tvError,
    isError: tvIsError,
    refetch: refetchTV,
  } = useQuery({
    queryKey: ["trendingTV", tvPage],
    queryFn: fetchTrendingTV,
    retry: (failureCount, error) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      showErrorNotification(error, "Failed to load trending TV shows");
    },
  });

  const trendingMovies = moviesData.results || [];
  const trendingTV = tvData.results || [];

  const handleMoviesPageChange = (page) => {
    setMoviesPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTvPageChange = (page) => {
    setTvPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show offline message if completely offline
  if (!isOnline) {
    return <TrendingOfflineMessage />;
  }

  if (moviesLoading || tvLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading trending content...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if both queries failed
  if (moviesIsError && tvIsError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Trending Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load the trending movies and TV shows. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                refetchMovies();
                refetchTV();
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Trending This Week
      </h1>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Movies
          </h2>
          {!moviesIsError && (
            <p className="text-gray-600 dark:text-gray-400">
              Page {moviesData.page} of {moviesData.totalPages} (
              {moviesData.totalResults} total)
            </p>
          )}
        </div>

        {moviesIsError ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Movies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {moviesError?.message ||
                "We couldn't load trending movies. Please try again."}
            </p>
            <button
              onClick={() => refetchMovies()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry Movies
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingMovies.map((movie) => (
                <ErrorBoundary key={`movie-${movie.id}`}>
                  <MovieCard movie={movie} />
                </ErrorBoundary>
              ))}
            </div>
            {moviesData.totalPages > 1 && (
              <Pagination
                currentPage={moviesData.page}
                totalPages={moviesData.totalPages}
                onPageChange={handleMoviesPageChange}
                className="justify-center"
              />
            )}
          </>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            TV Shows
          </h2>
          {!tvIsError && (
            <p className="text-gray-600 dark:text-gray-400">
              Page {tvData.page} of {tvData.totalPages} ({tvData.totalResults}{" "}
              total)
            </p>
          )}
        </div>

        {tvIsError ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load TV Shows
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tvError?.message ||
                "We couldn't load trending TV shows. Please try again."}
            </p>
            <button
              onClick={() => refetchTV()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry TV Shows
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingTV.map((show) => (
                <ErrorBoundary key={`tv-${show.id}`}>
                  <MovieCard movie={show} />
                </ErrorBoundary>
              ))}
            </div>
            {tvData.totalPages > 1 && (
              <Pagination
                currentPage={tvData.page}
                totalPages={tvData.totalPages}
                onPageChange={handleTvPageChange}
                className="justify-center"
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Trending;
