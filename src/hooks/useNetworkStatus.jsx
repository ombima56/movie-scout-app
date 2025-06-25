import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Connection restored! You're back online.", {
          duration: 3000,
          icon: "🌐",
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error("You're offline. Some features may not work properly.", {
        duration: 5000,
        icon: "📡",
      });
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  // Function to check network connectivity by making a test request
  const checkConnectivity = async () => {
    try {
      const response = await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-cache",
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return {
    isOnline,
    wasOffline,
    checkConnectivity,
  };
}

// Network status context for global state management
import { createContext, useContext } from "react";

const NetworkStatusContext = createContext(null);

export function NetworkStatusProvider({ children }) {
  const networkStatus = useNetworkStatus();

  return (
    <NetworkStatusContext.Provider value={networkStatus}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatusContext() {
  const context = useContext(NetworkStatusContext);

  if (!context) {
    throw new Error(
      "useNetworkStatusContext must be used within a NetworkStatusProvider"
    );
  }

  return context;
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <span>📡</span>
        <span>You're offline. Some features may not work properly.</span>
      </div>
    </div>
  );
}

// Full page offline component for when the app loads offline
export function OfflinePage() {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  const [isChecking, setIsChecking] = useState(false);

  const handleRetryConnection = async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        window.location.reload();
      } else {
        toast.error("Still offline. Please check your internet connection.");
      }
    } catch (error) {
      toast.error("Unable to check connection. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  if (isOnline) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Offline Icon */}
          <div className="text-6xl mb-6">📡</div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You're Offline
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Movie Scout requires an internet connection to load movie and TV
            show data. Please check your connection and try again.
          </p>

          {/* Features that don't work offline */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Features unavailable offline:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Search movies and TV shows</li>
              <li>• View movie/TV details</li>
              <li>• Browse trending content</li>
              <li>• Load movie posters and images</li>
            </ul>
          </div>

          {/* Retry Button */}
          <button
            onClick={handleRetryConnection}
            disabled={isChecking}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking connection...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Try Again</span>
              </>
            )}
          </button>

          {/* Tips */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              💡 <strong>Tips:</strong>
            </p>
            <ul className="text-left space-y-1">
              <li>• Check your WiFi or mobile data connection</li>
              <li>• Try refreshing the page</li>
              <li>
                • Contact your internet service provider if issues persist
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
