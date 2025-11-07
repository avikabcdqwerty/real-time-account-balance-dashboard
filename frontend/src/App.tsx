/**
 * Main React app entry point.
 * Sets up routing and renders the real-time account balance dashboard.
 * Ensures accessibility, error boundaries, and responsive layout.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';

// Optional: import global styles or TailwindCSS base styles here
import './index.css';

/**
 * ErrorBoundary component for catching rendering errors.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to monitoring service if needed (never log sensitive data)
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
          <div
            role="alert"
            aria-live="assertive"
            className="p-6 bg-red-100 text-red-800 rounded shadow"
          >
            <h1 className="text-xl font-bold mb-2">Something went wrong.</h1>
            <p>
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

/**
 * App component: sets up router and renders the dashboard.
 */
const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Redirect all unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;