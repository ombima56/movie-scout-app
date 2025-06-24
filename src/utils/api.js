// API Configuration
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const OMDB_BASE_URL = "http://www.omdbapi.com/";

// Get API keys from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

// TMDB API Endpoints
const tmdbEndpoints = {
  search: (query, page = 1) =>
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
  trending: (mediaType = "all", timeWindow = "day", page = 1) =>
    `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&page=${page}`,
  movieDetails: (id) => `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`,
  tvDetails: (id) => `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`,
  movieVideos: (id) =>
    `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
  tvVideos: (id) =>
    `${TMDB_BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
  movieWatchProviders: (id) =>
    `${TMDB_BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`,
  tvWatchProviders: (id) =>
    `${TMDB_BASE_URL}/tv/${id}/watch/providers?api_key=${TMDB_API_KEY}`,
  getImageUrl: (path, size = "w500") => `${TMDB_IMAGE_BASE_URL}${size}${path}`,
};

// OMDB API Endpoints
const omdbEndpoints = {
  searchByTitle: (title, year = "", plot = "full") =>
    `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}&plot=${plot}`,
  searchById: (imdbId) => `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}`,
};

// API Request Handler with Error Handling
const fetchWithTimeout = async (url, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(error.message || "API request failed");
  }
};

// Export all API functions
export const api = {
  // TMDB API Functions
  search: async (query, page = 1) => {
    const response = await fetchWithTimeout(tmdbEndpoints.search(query, page));
    return {
      results: response.results || [],
      page: response.page || page,
      totalPages: response.total_pages || 1,
      totalResults: response.total_results || 0,
    };
  },
  getTrending: async (mediaType = "movie", timeWindow = "week", page = 1) => {
    const response = await fetchWithTimeout(
      tmdbEndpoints.trending(mediaType, timeWindow, page)
    );
    return {
      results: response.results || [],
      page: response.page || page,
      totalPages: response.total_pages || 1,
      totalResults: response.total_results || 0,
    };
  },
  getMovieDetails: async (id) =>
    fetchWithTimeout(tmdbEndpoints.movieDetails(id)),
  getTvDetails: async (id) => fetchWithTimeout(tmdbEndpoints.tvDetails(id)),
  getMovieVideos: async (id) => fetchWithTimeout(tmdbEndpoints.movieVideos(id)),
  getTvVideos: async (id) => fetchWithTimeout(tmdbEndpoints.tvVideos(id)),
  getMovieWatchProviders: async (id) =>
    fetchWithTimeout(tmdbEndpoints.movieWatchProviders(id)),
  getTvWatchProviders: async (id) =>
    fetchWithTimeout(tmdbEndpoints.tvWatchProviders(id)),
  getImageUrl: (path, size = "w500") => tmdbEndpoints.getImageUrl(path, size),

  // OMDB API Functions
  searchByTitle: async (title, year = "", plot = "full") =>
    fetchWithTimeout(omdbEndpoints.searchByTitle(title, year, plot)),
  searchById: async (imdbId) =>
    fetchWithTimeout(omdbEndpoints.searchById(imdbId)),

  // Backward compatibility functions (return only results array)
  searchResults: async (query, page = 1) => {
    const response = await api.search(query, page);
    return response.results;
  },
  getTrendingResults: async (
    mediaType = "movie",
    timeWindow = "week",
    page = 1
  ) => {
    const response = await api.getTrending(mediaType, timeWindow, page);
    return response.results;
  },
};
