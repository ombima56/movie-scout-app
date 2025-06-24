import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import Footer from "./components/Footer";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import Watchlist from "./pages/Watchlist";
import Trending from "./pages/Trending";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WatchlistProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/tv/:id" element={<TVDetails />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/trending" element={<Trending />} />
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
          </Router>
        </WatchlistProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
