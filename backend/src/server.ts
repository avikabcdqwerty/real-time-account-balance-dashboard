/**
 * Entry point for the Real-Time Account Balance Dashboard backend API server.
 * Sets up Express app, middleware, routes, error handling, and logging.
 * Ensures secure configuration and seamless integration with controllers, services, and middleware.
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import https from 'https';
import fs from 'fs';
import path from 'path';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger, morganStream } from './utils/logger';

// Environment variables and configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 443;
const NODE_ENV = process.env.NODE_ENV || 'production';

// TLS/HTTPS configuration (required for all traffic)
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || '/etc/ssl/private/server.key';
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || '/etc/ssl/certs/server.crt';

// Rate limiting configuration (10 requests/min/user)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => {
    // Use JWT subject or IP as key for rate limiting
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Decode JWT without verifying signature (rate limit only)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.sub || req.ip;
      } catch {
        return req.ip;
      }
    }
    return req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait before making more requests.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Express app setup
const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json({ limit: '1mb' }));

// Structured logging (no sensitive data)
app.use(morgan('combined', { stream: morganStream }));

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// API routes
app.use('/api', routes);

// Health check endpoint (no sensitive data)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Centralized error handling
app.use(errorHandler);

// HTTPS server setup
const httpsOptions = {
  key: fs.readFileSync(TLS_KEY_PATH),
  cert: fs.readFileSync(TLS_CERT_PATH),
  minVersion: 'TLSv1.2',
};

const server = https.createServer(httpsOptions, app);

// Start server
server.listen(PORT, () => {
  logger.info(`API server running securely on port ${PORT} [${NODE_ENV}]`);
});

// Export for testing and integration
export { app, server };