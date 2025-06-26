import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  FilmIcon,
  TvIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function SearchBar({
  searchQuery,
  handleSearch,
  clearSearch,
  searchInputRef,
  showFilters,
  selectedFilter,
  setSelectedFilter,
  searchResultsLength, // Pass count for filters
  hasApiKeyError,
}) {
  return (
    <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 mb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search movies, TV shows, actors, directors..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-12 py-4 text-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {showFilters && searchQuery && !hasApiKeyError && (
          <div className="flex flex-wrap gap-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { key: "all", label: "All", icon: MagnifyingGlassIcon },
              { key: "movie", label: "Movies", icon: FilmIcon },
              { key: "tv", label: "TV Shows", icon: TvIcon },
              { key: "person", label: "People", icon: UserIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === key
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {key !== "all" && searchResultsLength > 0 && (
                  <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-1 rounded-full">
                    {
                      searchResultsLength.filter((item) => {
                        if (key === "movie")
                          return item.media_type === "movie" || !item.media_type;
                        if (key === "tv") return item.media_type === "tv";
                        if (key === "person")
                          return item.media_type === "person";
                        return true;
                      }).length
                    }
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;