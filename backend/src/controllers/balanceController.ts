/**
 * Controller for handling account balance API requests.
 * Validates JWT authentication, invokes business logic, and manages error responses.
 * Ensures no sensitive data is exposed in logs or responses.
 */

import { Request, Response, NextFunction } from 'express';
import { getAggregatedBalances } from '../services/balanceService';
import { verifyJWT } from '../services/authService';
import { logger } from '../utils/logger';

/**
 * GET /api/balances
 * Returns real-time balances for all linked customer accounts.
 * Requires JWT authentication.
 */
export const getBalances = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract and verify JWT from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or malformed Authorization header');
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let userId: string;
    try {
      // Only extract userId (sub) from JWT, do not log or expose token
      const payload = verifyJWT(token);
      userId = payload.sub;
      if (!userId) {
        logger.warn('JWT missing subject (sub) claim');
        res.status(401).json({ error: 'Invalid authentication token.' });
        return;
      }
    } catch (err) {
      logger.warn('JWT verification failed', { error: err instanceof Error ? err.message : err });
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    // Fetch and aggregate balances for the authenticated user
    const balances = await getAggregatedBalances(userId);

    // Respond with balances (never log or expose sensitive data)
    res.status(200).json({ accounts: balances });
  } catch (err) {
    // Handle known errors gracefully, log only non-sensitive details
    if (err instanceof Error) {
      logger.error('Balance retrieval failed', { error: err.message });
      if (err.name === 'CBSConnectionError') {
        res.status(503).json({ error: 'Unable to retrieve account data. Please try again later.' });
        return;
      }
      if (err.name === 'TimeoutError') {
        res.status(504).json({ error: 'Balance retrieval timed out. Please try again.' });
        return;
      }
    }
    // Fallback for unexpected errors
    res.status(500).json({ error: 'An unexpected error occurred. Please contact support.' });
    next(err);
  }
};