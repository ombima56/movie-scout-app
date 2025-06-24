import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeProvider";
import { useClientPagination } from "../hooks/usePagination";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import { useWatchlist } from "../contexts/WatchlistContext";

function Watchlist() {
  useTheme();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  // Pagination with 12 items per page
  const pagination = useClientPagination(watchlist || [], 12);

  if (!watchlist) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-8 pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Watchlist
        </h1>
        {watchlist.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            {watchlist.length} item{watchlist.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          {watchlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your watchlist is empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add movies and TV shows to start tracking them!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pagination.items.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onRemove={() => removeFromWatchlist(movie.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.goToPage}
                    className="justify-center"
                  />
                  <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {pagination.startItem} to {pagination.endItem} of{" "}
                    {pagination.totalItems} items
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
