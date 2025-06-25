// API Configuration
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const OMDB_BASE_URL = "http://www.omdbapi.com/";

// Get API keys from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

// Error types for better error handling
export const API_ERROR_TYPES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

// Custom API Error class
export class APIError extends Error {
  constructor(
    message,
    type = API_ERROR_TYPES.UNKNOWN_ERROR,
    status = null,
    originalError = null
  ) {
    super(message);
    this.name = "APIError";
    this.type = type;
    this.status = status;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

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

// Enhanced API Request Handler with comprehensive error handling
const fetchWithTimeout = async (url, timeout = 10000, retries = 2) => {
  const controller = new AbortController();
  let timeoutId;

  const makeRequest = async (attempt = 1) => {
    try {
      // Validate API key before making request
      if (
        url.includes("api_key=") &&
        (url.includes("undefined") || url.includes("null"))
      ) {
        throw new APIError(
          "API key is missing. Please check your environment variables.",
          API_ERROR_TYPES.AUTHENTICATION_ERROR,
          401
        );
      }

      timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorType = API_ERROR_TYPES.UNKNOWN_ERROR;
        let errorMessage = `Request failed with status ${response.status}`;

        switch (response.status) {
          case 401:
            errorType = API_ERROR_TYPES.AUTHENTICATION_ERROR;
            errorMessage = "Invalid API key or authentication failed";
            break;
          case 404:
            errorType = API_ERROR_TYPES.NOT_FOUND_ERROR;
            errorMessage = "The requested resource was not found";
            break;
          case 429:
            errorType = API_ERROR_TYPES.RATE_LIMIT_ERROR;
            errorMessage = "Rate limit exceeded. Please try again later";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorType = API_ERROR_TYPES.SERVER_ERROR;
            errorMessage = "Server error. Please try again later";
            break;
          default:
            if (response.status >= 400 && response.status < 500) {
              errorType = API_ERROR_TYPES.VALIDATION_ERROR;
              errorMessage = "Invalid request parameters";
            } else if (response.status >= 500) {
              errorType = API_ERROR_TYPES.SERVER_ERROR;
              errorMessage = "Server error occurred";
            }
        }

        throw new APIError(errorMessage, errorType, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle AbortError (timeout)
      if (error.name === "AbortError") {
        throw new APIError(
          "Request timed out. Please check your internet connection.",
          API_ERROR_TYPES.TIMEOUT_ERROR,
          null,
          error
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new APIError(
          "Network error. Please check your internet connection.",
          API_ERROR_TYPES.NETWORK_ERROR,
          null,
          error
        );
      }

      // If it's already an APIError, re-throw it
      if (error instanceof APIError) {
        throw error;
      }

      // Handle JSON parsing errors
      if (error.message.includes("JSON")) {
        throw new APIError(
          "Invalid response format from server",
          API_ERROR_TYPES.SERVER_ERROR,
          null,
          error
        );
      }

      // Retry logic for certain error types
      if (
        attempt < retries &&
        (error.type === API_ERROR_TYPES.NETWORK_ERROR ||
          error.type === API_ERROR_TYPES.TIMEOUT_ERROR ||
          error.type === API_ERROR_TYPES.SERVER_ERROR)
      ) {
        console.warn(
          `API request failed (attempt ${attempt}/${retries}), retrying...`,
          error.message
        );
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        ); // Exponential backoff
        return makeRequest(attempt + 1);
      }

      // Default error handling
      throw new APIError(
        error.message || "An unexpected error occurred",
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  };

  return makeRequest();
};

// Utility function to validate required parameters
const validateParams = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (
      !params[field] ||
      params[field] === "undefined" ||
      params[field] === "null"
    ) {
      throw new APIError(
        `Missing required parameter: ${field}`,
        API_ERROR_TYPES.VALIDATION_ERROR
      );
    }
  }
};

// Export all API functions
export const api = {
  // TMDB API Functions
  search: async (query, page = 1) => {
    try {
      validateParams({ query }, ["query"]);

      if (typeof query !== "string" || query.trim().length === 0) {
        throw new APIError(
          "Search query must be a non-empty string",
          API_ERROR_TYPES.VALIDATION_ERROR
        );
      }

      const response = await fetchWithTimeout(
        tmdbEndpoints.search(query.trim(), page)
      );
      return {
        results: response.results || [],
        page: response.page || page,
        totalPages: response.total_pages || 1,
        totalResults: response.total_results || 0,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Search failed: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getTrending: async (mediaType = "movie", timeWindow = "week", page = 1) => {
    try {
      const validMediaTypes = ["all", "movie", "tv", "person"];
      const validTimeWindows = ["day", "week"];

      if (!validMediaTypes.includes(mediaType)) {
        throw new APIError(
          `Invalid media type. Must be one of: ${validMediaTypes.join(", ")}`,
          API_ERROR_TYPES.VALIDATION_ERROR
        );
      }

      if (!validTimeWindows.includes(timeWindow)) {
        throw new APIError(
          `Invalid time window. Must be one of: ${validTimeWindows.join(", ")}`,
          API_ERROR_TYPES.VALIDATION_ERROR
        );
      }

      const response = await fetchWithTimeout(
        tmdbEndpoints.trending(mediaType, timeWindow, page)
      );
      return {
        results: response.results || [],
        page: response.page || page,
        totalPages: response.total_pages || 1,
        totalResults: response.total_results || 0,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get trending content: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getMovieDetails: async (id) => {
    try {
      validateParams({ id }, ["id"]);

      if (isNaN(id) || parseInt(id) <= 0) {
        throw new APIError(
          "Movie ID must be a positive number",
          API_ERROR_TYPES.VALIDATION_ERROR
        );
      }

      return await fetchWithTimeout(tmdbEndpoints.movieDetails(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get movie details: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getTvDetails: async (id) => {
    try {
      validateParams({ id }, ["id"]);

      if (isNaN(id) || parseInt(id) <= 0) {
        throw new APIError(
          "TV show ID must be a positive number",
          API_ERROR_TYPES.VALIDATION_ERROR
        );
      }

      return await fetchWithTimeout(tmdbEndpoints.tvDetails(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get TV show details: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getMovieVideos: async (id) => {
    try {
      validateParams({ id }, ["id"]);
      return await fetchWithTimeout(tmdbEndpoints.movieVideos(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get movie videos: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getTvVideos: async (id) => {
    try {
      validateParams({ id }, ["id"]);
      return await fetchWithTimeout(tmdbEndpoints.tvVideos(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get TV show videos: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getMovieWatchProviders: async (id) => {
    try {
      validateParams({ id }, ["id"]);
      return await fetchWithTimeout(tmdbEndpoints.movieWatchProviders(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get movie watch providers: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getTvWatchProviders: async (id) => {
    try {
      validateParams({ id }, ["id"]);
      return await fetchWithTimeout(tmdbEndpoints.tvWatchProviders(id));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `Failed to get TV show watch providers: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  getImageUrl: (path, size = "w500") => {
    if (!path) return null;
    return tmdbEndpoints.getImageUrl(path, size);
  },

  // OMDB API Functions
  searchByTitle: async (title, year = "", plot = "full") => {
    try {
      validateParams({ title }, ["title"]);
      return await fetchWithTimeout(
        omdbEndpoints.searchByTitle(title, year, plot)
      );
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `OMDB search by title failed: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  searchById: async (imdbId) => {
    try {
      validateParams({ imdbId }, ["imdbId"]);
      return await fetchWithTimeout(omdbEndpoints.searchById(imdbId));
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        `OMDB search by ID failed: ${error.message}`,
        API_ERROR_TYPES.UNKNOWN_ERROR,
        null,
        error
      );
    }
  },

  // Backward compatibility functions (return only results array)
  searchResults: async (query, page = 1) => {
    try {
      const response = await api.search(query, page);
      return response.results;
    } catch (error) {
      console.error("Search results error:", error);
      return [];
    }
  },

  getTrendingResults: async (
    mediaType = "movie",
    timeWindow = "week",
    page = 1
  ) => {
    try {
      const response = await api.getTrending(mediaType, timeWindow, page);
      return response.results;
    } catch (error) {
      console.error("Trending results error:", error);
      return [];
    }
  },
};
