/**
 * Adapter for communicating with the Core Banking System (CBS) API.
 * Handles secure, transient requests for account and balance data.
 * Implements robust error handling and ensures no sensitive data is logged or exposed.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';

// CBS API configuration (should be set via environment variables)
const CBS_API_BASE_URL = process.env.CBS_API_BASE_URL || 'https://cbs.example.com/api';
const CBS_API_TIMEOUT_MS = process.env.CBS_API_TIMEOUT_MS
  ? Number(process.env.CBS_API_TIMEOUT_MS)
  : 1200; // < 1.5s latency constraint

// Axios instance for CBS API
const cbsClient: AxiosInstance = axios.create({
  baseURL: CBS_API_BASE_URL,
  timeout: CBS_API_TIMEOUT_MS,
  httpsAgent: undefined, // Use Node.js default agent (TLS 1.2+ enforced by server config)
  headers: {
    'Content-Type': 'application/json',
    // Add any required CBS API authentication headers here (e.g., API key, mTLS, etc.)
  },
});

/**
 * AccountBalanceRaw type for raw CBS response data.
 */
export interface AccountBalanceRaw {
  accountId: string;
  accountType: string;
  accountName: string;
  currency: string;
  balance: string | number;
  availableBalance: string | number;
  status: 'active' | 'closed' | 'pending';
  lastUpdated: string;
}

/**
 * Fetches all accounts and balances for a given user from the CBS.
 * @param userId - The unique identifier of the authenticated user.
 * @returns Promise<AccountBalanceRaw[]> - Array of raw account balance objects.
 * @throws Error with specific name for error handling upstream.
 */
export async function fetchAccountsAndBalances(
  userId: string
): Promise<AccountBalanceRaw[]> {
  try {
    // Construct CBS API endpoint (never log userId or sensitive data)
    const endpoint = `/users/${encodeURIComponent(userId)}/accounts`;

    // Make secure request to CBS API
    const response = await cbsClient.get(endpoint);

    // Validate response structure
    if (
      !response.data ||
      !Array.isArray(response.data.accounts)
    ) {
      logger.error('CBS API returned unexpected response structure');
      throw new Error('CBSDataError');
    }

    // Return raw account data (never log or expose sensitive fields)
    return response.data.accounts as AccountBalanceRaw[];
  } catch (err) {
    // Handle Axios/network errors
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError;
      if (axiosErr.code === 'ECONNABORTED') {
        logger.error('CBS API request timed out');
        const timeoutError = new Error('TimeoutError');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      if (axiosErr.response) {
        logger.error('CBS API responded with error', {
          status: axiosErr.response.status,
        });
        const cbsConnError = new Error('CBSConnectionError');
        cbsConnError.name = 'CBSConnectionError';
        throw cbsConnError;
      }
      logger.error('CBS API network error', { error: axiosErr.message });
      const cbsConnError = new Error('CBSConnectionError');
      cbsConnError.name = 'CBSConnectionError';
      throw cbsConnError;
    }
    // Unknown error
    logger.error('Unknown error during CBS API request');
    throw err;
  }
}