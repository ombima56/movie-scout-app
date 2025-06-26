import toast from 'react-hot-toast';
import { API_ERROR_TYPES } from './api';

// Error notification configurations
const ERROR_CONFIGS = {
  [API_ERROR_TYPES.NETWORK_ERROR]: {
    icon: '🌐',
    duration: 5000,
    style: {
      background: '#ef4444',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.TIMEOUT_ERROR]: {
    icon: '⏱️',
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.AUTHENTICATION_ERROR]: {
    icon: '🔐',
    duration: 6000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.RATE_LIMIT_ERROR]: {
    icon: '🚦',
    duration: 8000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.NOT_FOUND_ERROR]: {
    icon: '🔍',
    duration: 4000,
    style: {
      background: '#6b7280',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.SERVER_ERROR]: {
    icon: '🔧',
    duration: 5000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.VALIDATION_ERROR]: {
    icon: '⚠️',
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.API_KEY_MISSING]: {
    icon: '🔑',
    duration: 8000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
    },
  },
  [API_ERROR_TYPES.UNKNOWN_ERROR]: {
    icon: '❌',
    duration: 5000,
    style: {
      background: '#ef4444',
      color: '#ffffff',
    },
  },
};

// Default error configuration
const DEFAULT_ERROR_CONFIG = {
  icon: '❌',
  duration: 4000,
  style: {
    background: '#ef4444',
    color: '#ffffff',
  },
};

// Success notification configurations
const SUCCESS_CONFIGS = {
  watchlist: {
    icon: '✅',
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#ffffff',
    },
  },
  default: {
    icon: '✅',
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#ffffff',
    },
  },
};

// Info notification configurations
const INFO_CONFIGS = {
  default: {
    icon: 'ℹ️',
    duration: 3000,
    style: {
      background: '#3b82f6',
      color: '#ffffff',
    },
  },
};

// Main error notification function
export const showErrorNotification = (error, customMessage = null) => {
  let message = customMessage;
  let config = DEFAULT_ERROR_CONFIG;

  // Handle different error types
  if (error && typeof error === 'object') {
    // Handle API errors
    if (error.type && ERROR_CONFIGS[error.type]) {
      config = ERROR_CONFIGS[error.type];
      message = message || error.message || getDefaultErrorMessage(error.type);
    }
    // Handle standard Error objects
    else if (error.message) {
      message = message || error.message;
    }
    // Handle HTTP response errors
    else if (error.status) {
      const errorType = getErrorTypeFromStatus(error.status);
      config = ERROR_CONFIGS[errorType] || DEFAULT_ERROR_CONFIG;
      message = message || getDefaultErrorMessage(errorType);
    }
  }
  // Handle string errors
  else if (typeof error === 'string') {
    message = error;
  }

  // Fallback message
  if (!message) {
    message = 'An unexpected error occurred';
  }

  return toast.error(message, config);
};

// Success notification function
export const showSuccessNotification = (message, type = 'default') => {
  const config = SUCCESS_CONFIGS[type] || SUCCESS_CONFIGS.default;
  return toast.success(message, config);
};

// Info notification function
export const showInfoNotification = (message, type = 'default') => {
  const config = INFO_CONFIGS[type] || INFO_CONFIGS.default;
  return toast(message, config);
};

// Warning notification function
export const showWarningNotification = (message) => {
  return toast(message, {
    icon: '⚠️',
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
    },
  });
};

// Get error type from HTTP status code
const getErrorTypeFromStatus = (status) => {
  switch (status) {
    case 401:
    case 403:
      return API_ERROR_TYPES.AUTHENTICATION_ERROR;
    case 404:
      return API_ERROR_TYPES.NOT_FOUND_ERROR;
    case 429:
      return API_ERROR_TYPES.RATE_LIMIT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return API_ERROR_TYPES.SERVER_ERROR;
    default:
      if (status >= 400 && status < 500) {
        return API_ERROR_TYPES.VALIDATION_ERROR;
      }
      return API_ERROR_TYPES.UNKNOWN_ERROR;
  }
};

// Get default error messages for different error types
const getDefaultErrorMessage = (errorType) => {
  switch (errorType) {
    case API_ERROR_TYPES.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection.';
    case API_ERROR_TYPES.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';
    case API_ERROR_TYPES.AUTHENTICATION_ERROR:
      return 'Service authentication failed. Please try again later.';
    case API_ERROR_TYPES.RATE_LIMIT_ERROR:
      return 'Too many requests. Please wait a moment and try again.';
    case API_ERROR_TYPES.NOT_FOUND_ERROR:
      return 'The requested resource was not found.';
    case API_ERROR_TYPES.SERVER_ERROR:
      return 'Service temporarily unavailable. Please try again later.';
    case API_ERROR_TYPES.VALIDATION_ERROR:
      return 'Invalid request. Please check your input.';
    case API_ERROR_TYPES.API_KEY_MISSING:
      return 'Service temporarily unavailable due to configuration issues. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};

// Utility function to dismiss all toasts
export const dismissAllNotifications = () => {
  toast.dismiss();
};

// Utility function to show loading toast
export const showLoadingNotification = (message = 'Loading...') => {
  return toast.loading(message, {
    style: {
      background: '#374151',
      color: '#ffffff',
    },
  });
};

// Utility function to update loading toast to success
export const updateLoadingToSuccess = (toastId, message) => {
  toast.success(message, {
    id: toastId,
    ...SUCCESS_CONFIGS.default,
  });
};

// Utility function to update loading toast to error
export const updateLoadingToError = (toastId, error, customMessage = null) => {
  const config = error?.type && ERROR_CONFIGS[error.type] 
    ? ERROR_CONFIGS[error.type] 
    : DEFAULT_ERROR_CONFIG;
  
  const message = customMessage || error?.message || 'Operation failed';
  
  toast.error(message, {
    id: toastId,
    ...config,
  });
};
