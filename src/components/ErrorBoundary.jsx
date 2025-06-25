import { Component } from "react";
import toast from "react-hot-toast";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId:
        Date.now().toString(36) + Math.random().toString(36).substring(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Show toast notification for user feedback
    toast.error("Something went wrong. Please try refreshing the page.");

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // This is where you would send error reports to your monitoring service
    // For example: Sentry, LogRocket, Bugsnag, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Log to console for development
    console.group("🚨 Error Boundary Report");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Full Report:", errorReport);
    console.groupEnd();

    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      errorId: null,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback: CustomFallback, showDetails = false } = this.props;

      // If a custom fallback component is provided, use it
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            retryCount={retryCount}
          />
        );
      }

      // Default error UI
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 m-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                We encountered an unexpected error. This has been logged and
                we'll look into it.
              </p>

              {showDetails && error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200">
                    Show technical details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded border text-xs font-mono text-red-800 dark:text-red-200 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3
                    ? "Max retries reached"
                    : `Try again ${retryCount > 0 ? `(${retryCount}/3)` : ""}`}
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Reload page
                </button>
              </div>

              {retryCount > 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  If the problem persists, try reloading the page or contact
                  support.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
