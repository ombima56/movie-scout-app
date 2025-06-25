import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../utils/api";
import { showErrorNotification } from "../utils/errorNotifications";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { SearchOfflineMessage } from "../components/OfflineMessage";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FilmIcon,
  TvIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchPage, setSearchPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchInputRef = useRef(null);
  const { isOnline } = useNetworkStatus();

  // Dynamic recentSuggestions from localStorage
  const [recentSuggestions, setRecentSuggestions] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch trending movies and TV shows
  const { data: trendingMovies } = useQuery({
    queryKey: ["trendingMovies"],
    queryFn: () => api.getTrendingResults("movie", "week"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: trendingTV } = useQuery({
    queryKey: ["trendingTV"],
    queryFn: () => api.getTrendingResults("tv", "week"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate dynamic popularSuggestions from trending data
  const popularSuggestions = Array.from(
    new Set([
      ...(trendingMovies || []).map((item) => item.title || item.name),
      ...(trendingTV || []).map((item) => item.title || item.name),
    ])
  ).slice(0, 10);

  const fetchSearchResults = async () => {
    if (!debouncedSearch.trim())
      return { results: [], page: 1, totalPages: 1, totalResults: 0 };
    try {
      const response = await api.search(debouncedSearch.trim(), searchPage);
      return response;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  };

  const {
    data: searchData = { results: [], page: 1, totalPages: 1, totalResults: 0 },
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["search", debouncedSearch, searchPage],
    queryFn: fetchSearchResults,
    enabled: !!debouncedSearch.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors or validation errors
      if (error?.status === 404 || error?.type === "VALIDATION_ERROR")
        return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      showErrorNotification(error, "Failed to search. Please try again.");
    },
  });

  const searchResults = searchData.results || [];

  // Filter results based on selected filter
  const filteredResults = searchResults.filter((item) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "movie")
      return item.media_type === "movie" || !item.media_type;
    if (selectedFilter === "tv") return item.media_type === "tv";
    if (selectedFilter === "person") return item.media_type === "person";
    return true;
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
    setSearchPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page) => {
    setSearchPage(page);
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowResults(true);
  };

  // Focus search input on component mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header - positioned below fixed navbar */}
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
          {showResults && searchQuery && (
            <div className="flex flex-wrap gap-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {[
                { key: "all", label: "All", icon: MagnifyingGlassIcon },
                { key: "movie", label: "Movies", icon: FilmIcon },
                { key: "tv", label: "TV Shows", icon: TvIcon },
                { key: "person", label: "People", icon: UserIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedFilter(key);
                    setSearchPage(1); // Reset to first page when filter changes
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === key
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {key !== "all" && searchResults.length > 0 && (
                    <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-1 rounded-full">
                      {
                        searchResults.filter((item) => {
                          if (key === "movie")
                            return (
                              item.media_type === "movie" || !item.media_type
                            );
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

      {/* Main Content - with proper spacing for navbar */}
      <div className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Results Section */}
          {showResults && searchQuery && (
            <>
              {/* Offline State */}
              {!isOnline && <SearchOfflineMessage />}

              {/* Loading State */}
              {isLoading && isOnline && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Searching...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
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
              )}

              {/* Search Results */}
              {!isLoading && !error && isOnline && (
                <div className="space-y-6">
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Try searching with different keywords or check your
                        spelling
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
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Search Results
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchData.totalResults} result
                          {searchData.totalResults !== 1 ? "s" : ""} for "
                          {searchQuery}"
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

                      {/* Pagination */}
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
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Default Content (when no search is active) */}
          {!showResults && !searchQuery && (
            <div className="space-y-12">
              {/* Welcome Section */}
              <div className="text-center py-12 space-y-8">
                <div className="space-y-4">
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Search through millions of movies, TV shows, and
                    celebrities. Find your next favorite watch!
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

                  <div className="space-y-4">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
