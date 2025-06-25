import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const WatchlistContext = createContext(null);

// Storage key constant
const STORAGE_KEY = "movieScoutWatchlist";

// Utility functions for safe localStorage operations
const safeGetFromStorage = (key, defaultValue = []) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      console.warn("localStorage is not available");
      return defaultValue;
    }

    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);

    // Validate that the parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn("Invalid watchlist data format, resetting to empty array");
      return defaultValue;
    }

    return parsed;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    toast.error("Failed to load watchlist from storage");
    return defaultValue;
  }
};

const safeSetToStorage = (key, value) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      console.warn("localStorage is not available");
      return false;
    }

    // Validate that value is serializable
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);

    // Handle specific localStorage errors
    if (error.name === "QuotaExceededError") {
      toast.error("Storage quota exceeded. Please clear some data.");
    } else if (error.name === "SecurityError") {
      toast.error("Storage access denied. Please check your browser settings.");
    } else {
      toast.error("Failed to save watchlist");
    }
    return false;
  }
};

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const savedWatchlist = safeGetFromStorage(STORAGE_KEY, []);
      setWatchlist(savedWatchlist);
    } catch (error) {
      console.error("Error initializing watchlist:", error);
      setError("Failed to load watchlist");
      toast.error("Failed to load your watchlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    // Don't save during initial load
    if (isLoading) return;

    try {
      const success = safeSetToStorage(STORAGE_KEY, watchlist);
      if (!success) {
        setError("Failed to save watchlist");
      } else {
        // Clear any previous errors if save was successful
        if (error) setError(null);
      }
    } catch (error) {
      console.error("Error saving watchlist:", error);
      setError("Failed to save watchlist");
    }
  }, [watchlist, isLoading, error]);

  const addToWatchlist = (movie) => {
    try {
      // Validate movie object
      if (!movie || typeof movie !== "object") {
        toast.error("Invalid movie data");
        return false;
      }

      if (!movie.id) {
        toast.error("Movie ID is required");
        return false;
      }

      const existingMovie = watchlist.find((item) => item?.id === movie.id);
      if (existingMovie) {
        toast.info("Movie is already in your watchlist");
        return false;
      }

      // Add movie with error handling
      const updatedWatchlist = [
        ...watchlist,
        { ...movie, addedAt: new Date().toISOString() },
      ];
      setWatchlist(updatedWatchlist);
      toast.success(
        `Added "${movie.title || movie.name || "Unknown"}" to watchlist`
      );
      return true;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast.error("Failed to add movie to watchlist");
      return false;
    }
  };

  const removeFromWatchlist = (movieId) => {
    try {
      if (!movieId) {
        toast.error("Movie ID is required");
        return false;
      }

      const movieToRemove = watchlist.find((movie) => movie?.id === movieId);
      if (!movieToRemove) {
        toast.error("Movie not found in watchlist");
        return false;
      }

      const updatedWatchlist = watchlist.filter(
        (movie) => movie?.id !== movieId
      );
      setWatchlist(updatedWatchlist);
      toast.success(
        `Removed "${movieToRemove.title || movieToRemove.name || "Unknown"}" from watchlist`
      );
      return true;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove movie from watchlist");
      return false;
    }
  };

  const markAsWatched = (movieId) => {
    try {
      if (!movieId) {
        toast.error("Movie ID is required");
        return false;
      }

      const movieExists = watchlist.some((movie) => movie?.id === movieId);
      if (!movieExists) {
        toast.error("Movie not found in watchlist");
        return false;
      }

      const updatedWatchlist = watchlist.map((movie) =>
        movie?.id === movieId
          ? { ...movie, watched: true, watchedAt: new Date().toISOString() }
          : movie
      );

      setWatchlist(updatedWatchlist);

      const watchedMovie = updatedWatchlist.find(
        (movie) => movie?.id === movieId
      );
      toast.success(
        `Marked "${watchedMovie?.title || watchedMovie?.name || "Unknown"}" as watched`
      );
      return true;
    } catch (error) {
      console.error("Error marking as watched:", error);
      toast.error("Failed to mark movie as watched");
      return false;
    }
  };

  const clearWatchlist = () => {
    try {
      setWatchlist([]);
      toast.success("Watchlist cleared");
      return true;
    } catch (error) {
      console.error("Error clearing watchlist:", error);
      toast.error("Failed to clear watchlist");
      return false;
    }
  };

  const getWatchlistStats = () => {
    try {
      const total = watchlist.length;
      const watched = watchlist.filter((movie) => movie?.watched).length;
      const unwatched = total - watched;

      return { total, watched, unwatched };
    } catch (error) {
      console.error("Error getting watchlist stats:", error);
      return { total: 0, watched: 0, unwatched: 0 };
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isLoading,
        error,
        addToWatchlist,
        removeFromWatchlist,
        markAsWatched,
        clearWatchlist,
        getWatchlistStats,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
}
