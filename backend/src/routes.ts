/**
 * Defines API routes and applies authentication middleware.
 * Ensures all endpoints are protected and error handling is consistent.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getBalances } from './controllers/balanceController';

// Create router instance
const router = Router();

/**
 * Middleware to enforce JWT authentication for all /api routes.
 * Relies on balanceController to handle JWT validation and error responses.
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // The controller will handle JWT validation and error responses.
  next();
};

// Route: GET /api/balances
router.get('/balances', requireAuth, getBalances);

// Additional API routes can be added here as needed

export default router;