import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import {
  NetworkStatusProvider,
  OfflineIndicator,
  OfflinePage,
  useNetworkStatusContext,
} from "./hooks/useNetworkStatus";
import Footer from "./components/Footer";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import Watchlist from "./pages/Watchlist";
import Trending from "./pages/Trending";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests, but not when offline
      retry: (failureCount, error) => {
        // Don't retry if we're offline
        if (!navigator.onLine) return false;
        // Don't retry on 404 errors
        if (error?.status === 404) return false;
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Stale time to reduce unnecessary requests
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time for offline access
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Refetch on window focus only if online
      refetchOnWindowFocus: () => navigator.onLine,
      // Don't refetch on reconnect if we have cached data
      refetchOnReconnect: "always",
    },
  },
});

// Component to handle initial offline state
function AppContent() {
  const { isOnline } = useNetworkStatusContext();

  // If offline on initial load, show the offline page
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <Router>
      <NavigationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <OfflineIndicator />
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv/:id" element={<TVDetails />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/trending" element={<Trending />} />
              {/* Catch-all route for 404 pages */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </div>
      </NavigationProvider>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkStatusProvider>
        <ThemeProvider>
          <WatchlistProvider>
            <AppContent />
          </WatchlistProvider>
        </ThemeProvider>
      </NetworkStatusProvider>
    </QueryClientProvider>
  );
}

export default App;
