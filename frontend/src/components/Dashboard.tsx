/**
 * Dashboard component displaying real-time account balances.
 * Handles loading, error, and empty states.
 * Ensures accessibility and responsive design.
 */

import React from 'react';
import useBalances from '../hooks/useBalances';
import AccountList from './AccountList';
import ErrorBanner from './ErrorBanner';

const Dashboard: React.FC = () => {
  const { accounts, loading, error, refetch } = useBalances();

  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2"
      aria-label="Account Balance Dashboard"
    >
      <section className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" tabIndex={0}>
            Account Balances
          </h1>
          <p className="text-gray-600" id="dashboard-description">
            View your real-time balances for all linked accounts.
          </p>
        </header>

        {error && (
          <ErrorBanner message={error} onRetry={refetch} />
        )}

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center py-8"
          >
            <svg
              className="animate-spin h-6 w-6 text-blue-600 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-blue-700 font-medium">Loading account balances...</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {accounts && accounts.length > 0 ? (
              <AccountList accounts={accounts} />
            ) : (
              <div
                className="text-gray-700 py-8 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="mb-2">No linked accounts found.</p>
                <p>
                  Link a new account to see your balances here.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Dashboard;