/**
 * Service for JWT validation and session management.
 * Ensures secure authentication for all API endpoints.
 * No sensitive data is logged or exposed.
 */

import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { logger } from '../utils/logger';

// JWT secret or public key (should be set via environment variables)
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

/**
 * Decoded JWT payload type.
 */
export interface AuthPayload extends JwtPayload {
  sub: string; // User ID
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Verifies and decodes a JWT.
 * @param token - JWT string from Authorization header.
 * @returns AuthPayload - Decoded JWT payload.
 * @throws Error if token is invalid or expired.
 */
export function verifyJWT(token: string): AuthPayload {
  try {
    // Verify JWT signature and claims
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as AuthPayload;

    // Ensure subject (sub) claim exists
    if (!payload.sub) {
      logger.warn('JWT missing subject (sub) claim');
      throw new Error('InvalidToken');
    }

    return payload;
  } catch (err) {
    // Log only non-sensitive error details
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn('JWT expired');
      throw new Error('TokenExpired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT verification failed');
      throw new Error('InvalidToken');
    }
    logger.error('Unexpected JWT verification error');
    throw new Error('InvalidToken');
  }
}