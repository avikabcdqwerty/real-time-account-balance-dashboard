/**
 * Business logic for fetching and aggregating account balances from the Core Banking System (CBS).
 * Ensures no sensitive data is logged or exposed, and all errors are handled gracefully.
 */

import { fetchAccountsAndBalances } from '../integrations/cbsAdapter';
import { logger } from '../utils/logger';

/**
 * AccountBalance type definition for aggregated account data.
 */
export interface AccountBalance {
  accountId: string;
  accountType: string;
  accountName: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: 'active' | 'closed' | 'pending';
  lastUpdated: string; // ISO 8601 timestamp
}

/**
 * Fetches and aggregates all account balances for a given user from the CBS.
 * @param userId - The unique identifier of the authenticated user.
 * @returns Promise<AccountBalance[]> - Array of account balance objects.
 * @throws Error if CBS is unreachable, times out, or returns invalid data.
 */
export async function getAggregatedBalances(userId: string): Promise<AccountBalance[]> {
  try {
    // Fetch accounts and balances from CBS via adapter
    const accounts = await fetchAccountsAndBalances(userId);

    // Validate and normalize data
    if (!Array.isArray(accounts)) {
      logger.error('CBS returned invalid account data structure');
      throw new Error('CBSDataError');
    }

    // Filter out closed accounts (if required by business logic)
    const filteredAccounts = accounts.filter(
      (acct) => acct.status === 'active' || acct.status === 'pending'
    );

    // Map and sanitize account data for response
    const result: AccountBalance[] = filteredAccounts.map((acct) => ({
      accountId: acct.accountId,
      accountType: acct.accountType,
      accountName: acct.accountName,
      currency: acct.currency,
      balance: Number(acct.balance),
      availableBalance: Number(acct.availableBalance),
      status: acct.status,
      lastUpdated: acct.lastUpdated,
    }));

    return result;
  } catch (err) {
    // Handle known error types from CBS adapter
    if (err instanceof Error) {
      if (err.name === 'CBSConnectionError') {
        logger.error('CBS connection error during balance aggregation');
        throw err;
      }
      if (err.name === 'TimeoutError') {
        logger.error('CBS request timed out during balance aggregation');
        throw err;
      }
      logger.error('Unexpected error during balance aggregation', { error: err.message });
    } else {
      logger.error('Unknown error during balance aggregation');
    }
    throw err;
  }
}