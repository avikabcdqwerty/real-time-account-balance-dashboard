/**
 * Structured logging utility using pino.
 * Excludes sensitive data from logs and provides a morgan stream for HTTP logging.
 */

import pino from 'pino';
import { StreamOptions } from 'morgan';

// Configure pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: [
    // Redact common sensitive fields
    'req.headers.authorization',
    'req.body.password',
    'req.body.token',
    'token',
    'password',
    'authorization',
    '*.token',
    '*.password',
    '*.authorization',
  ],
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Morgan stream for HTTP request logging, piped to pino.
 * Ensures no sensitive data is logged.
 */
const morganStream: StreamOptions = {
  write: (message: string) => {
    // Remove potential sensitive data from message before logging
    if (
      message.toLowerCase().includes('authorization') ||
      message.toLowerCase().includes('token')
    ) {
      logger.info('HTTP request received (authorization header redacted)');
    } else {
      logger.info(message.trim());
    }
  },
};

export { logger, morganStream };