import React from "react";
import { API_ERROR_TYPES } from "../utils/api";

export function ServiceErrorMessage({ error, onRetry }) {
  const isApiKeyError = error?.type === API_ERROR_TYPES.API_KEY_MISSING;

  return (
    <div className="text-center py-16">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-lg mx-auto">
        <div className="text-red-500 text-5xl mb-4">
          {isApiKeyError ? "🔑" : "⚠️"}
        </div>
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
          {isApiKeyError ? "" : "Service Unavailable"}
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-6">
          {isApiKeyError
            ? "Our movie database service is temporarily unavailable due to configuration issues. We're working to resolve this as quickly as possible."
            : "Unable to load content at the moment. Please try again."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}
        {isApiKeyError && (
          <div className="mt-4 text-sm text-red-500 dark:text-red-400">
            <p>Expected resolution time: A few minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceErrorMessage;
