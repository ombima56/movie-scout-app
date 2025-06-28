import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { api, API_ERROR_TYPES } from "../utils/api";
import { showErrorNotification } from "../utils/errorNotifications";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useNavigation } from "../contexts/NavigationContext";

// Import new components
import { ServiceErrorMessage } from "../components/ServiceErrorMessage";
import { SearchBar } from "../components/SearchBar";
import { SearchResultsDisplay } from "../components/SearchResultsDisplay";
import { WelcomeContent } from "../components/WelcomeContent";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { saveSearchState } = useNavigation();
  const searchInputRef = useRef(null);
  const { isOnline } = useNetworkStatus();

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [selectedFilter, setSelectedFilter] = useState(
    () => searchParams.get("filter") || "all"
  );
  const [searchPage, setSearchPage] = useState(
    () => parseInt(searchParams.get("page")) || 1
  );
  const [showResults, setShowResults] = useState(() =>
    Boolean(searchParams.get("q"))
  );

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dynamic recentSuggestions from localStorage
  const [recentSuggestions, setRecentSuggestions] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch trending movies and TV shows
  const { data: trendingMovies, error: moviesError } = useQuery({
    queryKey: ["trendingMovies"],
    queryFn: () => api.getTrendingResults("movie", "week"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: trendingTV, error: tvError } = useQuery({
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
    data: searchData = {
      results: [],
      page: 1,
      totalPages: 1,
      totalResults: 0,
    },
    isLoading,
    error,
    // isError, // isError is already covered by 'error' object check
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

  // Update URL parameters when search state changes
  const updateSearchParams = (query, filter, page) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter && filter !== "all") params.set("filter", filter);
    if (page && page > 1) params.set("page", page.toString());

    setSearchParams(params);

    // Save to navigation context
    saveSearchState(query, filter, page, Boolean(query));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(Boolean(value));
    setSearchPage(1);
    updateSearchParams(value, selectedFilter, 1);
  };

  const handlePageChange = (page) => {
    setSearchPage(page);
    updateSearchParams(searchQuery, selectedFilter, page);
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    setSearchPage(1);
    setSearchParams(new URLSearchParams()); // Clear URL params
    saveSearchState("", "all", 1, false); // Clear navigation state
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowResults(true);
    setSearchPage(1);
    updateSearchParams(suggestion, selectedFilter, 1);

    // Add to recent suggestions
    setRecentSuggestions((prev) => {
      const newRecent = [
        suggestion,
        ...prev.filter((item) => item !== suggestion),
      ].slice(0, 5); // Keep last 5
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));
      return newRecent;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setSearchPage(1); // Reset to first page when filter changes
    updateSearchParams(searchQuery, filter, 1);
  };

  // Sync URL params with state on mount and URL changes
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page")) || 1;

    // Only update state if values actually changed to prevent loops
    if (query !== searchQuery) setSearchQuery(query);
    if (filter !== selectedFilter) setSelectedFilter(filter);
    if (page !== searchPage) setSearchPage(page);
    if (Boolean(query) !== showResults) setShowResults(Boolean(query));

    // Always save to navigation context when URL changes
    saveSearchState(query, filter, page, Boolean(query));
  }, [
    searchParams,
    searchQuery,
    selectedFilter,
    searchPage,
    showResults,
    saveSearchState,
  ]);

  // Focus search input on component mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Check for API key errors in trending data
  const hasApiKeyError =
    moviesError?.type === API_ERROR_TYPES.API_KEY_MISSING ||
    tvError?.type === API_ERROR_TYPES.API_KEY_MISSING ||
    error?.type === API_ERROR_TYPES.API_KEY_MISSING;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SearchBar
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        searchInputRef={searchInputRef}
        showFilters={showResults}
        selectedFilter={selectedFilter}
        setSelectedFilter={handleFilterChange}
        searchResultsLength={searchResults}
        hasApiKeyError={hasApiKeyError}
      />
      <div className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {hasApiKeyError ? (
            <ServiceErrorMessage
              error={moviesError || tvError || error}
              onRetry={() => window.location.reload()}
            />
          ) : showResults && searchQuery ? (
            <SearchResultsDisplay
              isLoading={isLoading}
              isOnline={isOnline}
              error={error}
              filteredResults={filteredResults}
              searchData={searchData}
              searchQuery={searchQuery}
              handlePageChange={handlePageChange}
              handleSuggestionClick={handleSuggestionClick}
              popularSuggestions={popularSuggestions}
            />
          ) : (
            <WelcomeContent
              popularSuggestions={popularSuggestions}
              recentSuggestions={recentSuggestions}
              handleSuggestionClick={handleSuggestionClick}
              trendingMovies={trendingMovies}
              trendingTV={trendingTV}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
