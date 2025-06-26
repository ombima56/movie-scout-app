import React from "react";
import MovieCard from "./MovieCard";
import Pagination from "./Pagination";
import { SearchOfflineMessage } from "./OfflineMessage";

export function SearchResultsDisplay({
  isLoading,
  isOnline,
  error,
  filteredResults,
  searchData,
  searchQuery,
  handlePageChange,
  handleSuggestionClick,
  popularSuggestions,
}) {
  if (!isOnline) {
    return <SearchOfflineMessage />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Search Error
          </h3>
          <p className="text-red-600 dark:text-red-300">
            Unable to search at the moment. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Try searching with different keywords or check your spelling
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Try "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {searchData.totalResults} result
          {searchData.totalResults !== 1 ? "s" : ""} for "{searchQuery}"
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredResults.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="transform hover:scale-105 transition-transform duration-200"
          >
            <MovieCard movie={item} />
          </div>
        ))}
      </div>

      {searchData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={searchData.page}
            totalPages={searchData.totalPages}
            onPageChange={handlePageChange}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
}

export default SearchResultsDisplay;
