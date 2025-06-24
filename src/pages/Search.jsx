import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../utils/api';
import MovieCard from '../components/MovieCard';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchResults = async () => {
    if (!debouncedSearch) return [];
    const response = await api.search(debouncedSearch, page);
    return response;
  };

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedSearch, page],
    queryFn: fetchSearchResults,
    enabled: !!debouncedSearch,
    keepPreviousData: true
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search movies, TV shows, and people..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {debouncedSearch && searchResults && searchResults.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No results found for "{debouncedSearch}"
        </div>
      )}

      {debouncedSearch && searchResults && searchResults.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <button
          onClick={handleLoadMore}
          className="w-full max-w-md mx-auto px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Load More
        </button>
      )}
    </div>
  );
}

export default Search;
