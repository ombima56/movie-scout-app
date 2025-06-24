import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '',
  size = 'default'
}) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const baseButtonClasses = `
    inline-flex items-center justify-center border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    transition-colors duration-200 font-medium
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800
    ${getSizeClasses()}
  `;

  const activeButtonClasses = `
    inline-flex items-center justify-center border border-blue-500 dark:border-blue-400
    bg-blue-500 dark:bg-blue-600 text-white
    hover:bg-blue-600 dark:hover:bg-blue-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    transition-colors duration-200 font-medium
    ${getSizeClasses()}
  `;

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const visiblePages = showPageNumbers ? getVisiblePages() : [];

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${baseButtonClasses} rounded-l-md`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="hidden sm:flex space-x-1">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === '...' || page === currentPage}
              className={
                page === currentPage
                  ? activeButtonClasses
                  : page === '...'
                  ? `${baseButtonClasses} cursor-default`
                  : baseButtonClasses
              }
              aria-label={page === '...' ? 'More pages' : `Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Mobile page indicator */}
      <div className="sm:hidden flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">{currentPage}</span>
        <span className="mx-1">of</span>
        <span className="font-medium">{totalPages}</span>
      </div>

      {/* Next button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${baseButtonClasses} rounded-r-md`}
        aria-label="Next page"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
