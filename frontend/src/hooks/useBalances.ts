/**
 * Custom React hook for fetching and polling account balances.
 * Handles loading, error, and refetch logic.
 * Ensures no sensitive data is exposed in logs or browser storage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getBalances } from '../api/balanceApi';
import { Account } from '../components/AccountList';

// Polling interval in ms (e.g., 10s for real-time updates)
const POLL_INTERVAL_MS = 10000;

interface UseBalancesResult {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useBalances hook: fetches and polls account balances from backend.
 */
const useBalances = (): UseBalancesResult => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch balances from API
  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBalances();
      setAccounts(data.accounts || []);
      setLoading(false);
    } catch (err: any) {
      // Only display user-friendly error messages, never log sensitive data
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Unable to retrieve account balances. Please try again.'
      );
      setAccounts([]);
      setLoading(false);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    fetchBalances();

    // Set up polling for real-time updates
    pollRef.current = setInterval(fetchBalances, POLL_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchBalances]);

  // Manual refetch handler
  const refetch = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { accounts, loading, error, refetch };
};

export default useBalances;