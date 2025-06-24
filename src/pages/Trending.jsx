import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeProvider";
import MovieCard from "../components/MovieCard";
import ErrorBoundary from "../components/ErrorBoundary";
import Pagination from "../components/Pagination";
import { api } from "../utils/api";

function Trending() {
  useTheme();

  const [moviesPage, setMoviesPage] = useState(1);
  const [tvPage, setTvPage] = useState(1);

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
  } = useQuery({
    queryKey: ["trendingMovies", moviesPage],
    queryFn: fetchTrendingMovies,
  });

  const {
    data: tvData = { results: [], page: 1, totalPages: 1, totalResults: 0 },
    isLoading: tvLoading,
  } = useQuery({
    queryKey: ["trendingTV", tvPage],
    queryFn: fetchTrendingTV,
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

  if (moviesLoading || tvLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
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
          <p className="text-gray-600 dark:text-gray-400">
            Page {moviesData.page} of {moviesData.totalPages} (
            {moviesData.totalResults} total)
          </p>
        </div>
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
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            TV Shows
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Page {tvData.page} of {tvData.totalPages} ({tvData.totalResults}{" "}
            total)
          </p>
        </div>
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
      </section>
    </div>
  );
}

export default Trending;
