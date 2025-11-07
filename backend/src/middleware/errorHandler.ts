/**
 * Centralized error handling middleware for API responses.
 * Ensures consistent, secure, and user-friendly error messages.
 * No sensitive data is exposed in responses or logs.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Express error handling middleware.
 * @param err - The error object thrown in the request pipeline.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Default error response
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please contact support.';

  // Handle known error types
  if (err instanceof Error) {
    switch (err.name) {
      case 'CBSConnectionError':
        statusCode = 503;
        message = 'Unable to retrieve account data. Please try again later.';
        break;
      case 'TimeoutError':
        statusCode = 504;
        message = 'Balance retrieval timed out. Please try again.';
        break;
      case 'TokenExpired':
        statusCode = 401;
        message = 'Your session has expired. Please log in again.';
        break;
      case 'InvalidToken':
        statusCode = 401;
        message = 'Invalid authentication token.';
        break;
      case 'CBSDataError':
        statusCode = 502;
        message = 'Received invalid data from core banking system.';
        break;
      default:
        // For other errors, keep default status and message
        break;
    }
    // Log error details (never log sensitive data)
    logger.error('API error', { name: err.name, message: err.message, path: req.path });
  } else {
    // Log unknown error
    logger.error('Unknown API error', { path: req.path });
  }

  // Respond with sanitized error message
  res.status(statusCode).json({ error: message });
}