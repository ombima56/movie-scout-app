import { useNetworkStatus } from "../hooks/useNetworkStatus";

// Reusable offline message component for individual sections
export default function OfflineMessage({ 
  title = "Content Unavailable Offline",
  message = "This content requires an internet connection to load.",
  showRetry = true,
  onRetry = null,
  className = ""
}) {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  
  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - check connectivity and reload if online
      const isConnected = await checkConnectivity();
      if (isConnected) {
        window.location.reload();
      }
    }
  };

  // Don't show if we're online
  if (isOnline) return null;

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-gray-400 text-4xl mb-4">📡</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      {showRetry && (
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Check Connection
        </button>
      )}
    </div>
  );
}

// Specific offline message for search results
export function SearchOfflineMessage() {
  return (
    <OfflineMessage
      title="Search Unavailable Offline"
      message="Movie and TV show search requires an internet connection. Please connect to the internet and try again."
      className="max-w-md mx-auto"
    />
  );
}

// Specific offline message for trending content
export function TrendingOfflineMessage() {
  return (
    <OfflineMessage
      title="Trending Content Unavailable"
      message="Trending movies and TV shows require an internet connection to load the latest data."
      className="max-w-md mx-auto"
    />
  );
}

// Specific offline message for movie/TV details
export function DetailsOfflineMessage({ type = "content" }) {
  return (
    <OfflineMessage
      title={`${type === "movie" ? "Movie" : type === "tv" ? "TV Show" : "Content"} Details Unavailable`}
      message="Detailed information requires an internet connection to load from our database."
      className="max-w-md mx-auto"
    />
  );
}
