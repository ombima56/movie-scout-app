import React from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

export function WelcomeContent({
  popularSuggestions,
  recentSuggestions,
  handleSuggestionClick,
  trendingMovies,
  trendingTV,
}) {
  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center py-12 space-y-8">
        <div className="space-y-4">
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search through millions of movies, TV shows, and celebrities. Find
            your next favorite watch!
          </p>
        </div>

        {/* Popular Suggestions */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Popular Searches
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Suggestions */}
          {recentSuggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Searches
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {recentSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Movies Section */}
      {trendingMovies && trendingMovies.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trending Movies This Week
            </h2>
            <Link
              to="/trending"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingMovies.slice(0, 10).map((movie) => (
              <div
                key={movie.id}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending TV Shows Section */}
      {trendingTV && trendingTV.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trending TV Shows This Week
            </h2>
            <Link
              to="/trending"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingTV.slice(0, 10).map((show) => (
              <div
                key={show.id}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <MovieCard movie={show} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeContent;
