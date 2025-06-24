import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing pagination state and logic
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.itemsPerPage - Number of items per page (default: 20)
 * @param {number} options.totalItems - Total number of items
 * @param {Function} options.onPageChange - Callback when page changes
 * @returns {Object} Pagination state and methods
 */
export function usePagination({
  initialPage = 1,
  itemsPerPage = 20,
  totalItems = 0,
  onPageChange
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  // Calculate current page bounds
  const pageInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = totalItems > 0 ? endIndex + 1 : 0;

    return {
      startIndex,
      endIndex,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [currentPage, itemsPerPage, totalItems, totalPages]);

  // Handle page change
  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  }, [currentPage, totalPages, onPageChange]);

  // Navigation methods
  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  // Reset to first page (useful when filters change)
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    if (onPageChange) {
      onPageChange(1);
    }
  }, [onPageChange]);

  // Get items for current page (for client-side pagination)
  const getPageItems = useCallback((items = []) => {
    const { startIndex, endIndex } = pageInfo;
    return items.slice(startIndex, endIndex + 1);
  }, [pageInfo]);

  return {
    // State
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    
    // Page info
    ...pageInfo,
    
    // Navigation methods
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetToFirstPage,
    
    // Utility methods
    getPageItems,
    
    // For direct state updates (use with caution)
    setCurrentPage
  };
}

/**
 * Hook for client-side pagination of an array of items
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @param {Object} options - Additional options
 * @returns {Object} Pagination state and paginated items
 */
export function useClientPagination(items = [], itemsPerPage = 20, options = {}) {
  const pagination = usePagination({
    itemsPerPage,
    totalItems: items.length,
    ...options
  });

  const paginatedItems = useMemo(() => {
    return pagination.getPageItems(items);
  }, [items, pagination]);

  return {
    ...pagination,
    items: paginatedItems
  };
}

/**
 * Hook for server-side pagination
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination state for server-side pagination
 */
export function useServerPagination(options = {}) {
  return usePagination(options);
}
