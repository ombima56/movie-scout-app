import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation state
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [searchState, setSearchState] = useState({
    query: "",
    filter: "all",
    page: 1,
    hasResults: false,
  });
  const [previousRoute, setPreviousRoute] = useState(null);

  // Track navigation history
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    setNavigationHistory(prev => {
      // Don't add duplicate consecutive entries
      if (prev.length > 0 && prev[prev.length - 1].path === currentPath) {
        return prev;
      }
      
      // Keep only last 10 entries to prevent memory issues
      const newHistory = [...prev, {
        path: currentPath,
        pathname: location.pathname,
        search: location.search,
        timestamp: Date.now(),
      }].slice(-10);
      
      return newHistory;
    });
  }, [location]);

  // Update previous route when location changes
  useEffect(() => {
    if (navigationHistory.length >= 2) {
      const previous = navigationHistory[navigationHistory.length - 2];
      setPreviousRoute(previous);
    }
  }, [navigationHistory]);

  // Save search state when on home page with search
  const saveSearchState = (query, filter = "all", page = 1, hasResults = false) => {
    setSearchState({
      query: query || "",
      filter: filter || "all", 
      page: page || 1,
      hasResults: hasResults || false,
    });
  };

  // Navigate back to search results with preserved state
  const goBackToSearch = () => {
    if (searchState.query) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', searchState.query);
      if (searchState.filter !== 'all') {
        searchParams.set('filter', searchState.filter);
      }
      if (searchState.page > 1) {
        searchParams.set('page', searchState.page.toString());
      }
      
      navigate(`/?${searchParams.toString()}`);
    } else {
      navigate('/');
    }
  };

  // Smart back navigation
  const goBack = () => {
    // If we have search state and came from home, go back to search
    if (searchState.query && previousRoute?.pathname === '/') {
      goBackToSearch();
      return;
    }
    
    // If we have previous route, navigate to it
    if (previousRoute) {
      navigate(previousRoute.path);
      return;
    }
    
    // Fallback to browser back or home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  // Check if we can show smart back button
  const canGoBack = () => {
    return Boolean(
      searchState.query || 
      previousRoute || 
      window.history.length > 1
    );
  };

  // Get back button context info
  const getBackButtonInfo = () => {
    if (searchState.query && previousRoute?.pathname === '/') {
      return {
        text: `Back to search results`,
        subtitle: `"${searchState.query}"`,
        icon: 'search'
      };
    }
    
    if (previousRoute?.pathname === '/') {
      return {
        text: 'Back to Home',
        subtitle: null,
        icon: 'home'
      };
    }
    
    if (previousRoute?.pathname === '/trending') {
      return {
        text: 'Back to Trending',
        subtitle: null,
        icon: 'trending'
      };
    }
    
    if (previousRoute?.pathname === '/watchlist') {
      return {
        text: 'Back to Watchlist',
        subtitle: null,
        icon: 'watchlist'
      };
    }
    
    return {
      text: 'Go Back',
      subtitle: null,
      icon: 'back'
    };
  };

  const value = {
    navigationHistory,
    searchState,
    previousRoute,
    saveSearchState,
    goBack,
    goBackToSearch,
    canGoBack,
    getBackButtonInfo,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  
  return context;
}
