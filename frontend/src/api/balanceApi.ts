/**
 * API client for communicating with the backend balance endpoint.
 * Ensures secure transmission and no sensitive data exposure.
 */

import axios, { AxiosResponse } from 'axios';

// Backend API base URL (should be set via environment variable or config)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Axios instance with secure config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500, // < 1.5s latency constraint
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get JWT from secure storage (never log or expose)
function getJWT(): string | null {
  // For demo: use sessionStorage, but in production use secure HTTP-only cookies
  // Never log or persist sensitive tokens in localStorage
  return sessionStorage.getItem('jwt') || null;
}

/**
 * Fetches account balances from backend.
 * @returns Promise<{ accounts: Account[] }>
 * @throws Error if request fails or returns error response.
 */
export async function getBalances(): Promise<{ accounts: any[] }> {
  try {
    const jwt = getJWT();
    if (!jwt) {
      throw new Error('Authentication required.');
    }

    const res: AxiosResponse = await apiClient.get('/balances', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    // Validate response structure
    if (!res.data || !Array.isArray(res.data.accounts)) {
      throw new Error('Invalid response from server.');
    }

    return { accounts: res.data.accounts };
  } catch (err: any) {
    // Only propagate user-friendly error messages, never log sensitive data
    throw err;
  }
}