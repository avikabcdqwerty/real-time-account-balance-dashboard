/**
 * Displays user-friendly error messages on the dashboard.
 * Offers a retry button for recoverable errors.
 * Ensures accessibility and does not expose sensitive data.
 */

import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="mb-6 p-4 rounded bg-red-100 border border-red-300 text-red-800 flex items-center justify-between"
    tabIndex={0}
  >
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Retry"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorBanner;