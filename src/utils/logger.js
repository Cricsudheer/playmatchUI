 /**
 * Logger Utility
 *
 * Provides DEV-only logging to avoid polluting production console.
 * In production, all logs are automatically disabled.
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Failed to fetch', error);
 */

const isDev = import.meta.env.DEV;

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Format log message with timestamp and context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @returns {Array} Formatted arguments for console
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;

  if (data !== undefined) {
    return [prefix, message, data];
  }
  return [prefix, message];
}

/**
 * Logger object
 * Only logs in development mode
 */
export const logger = {
  /**
   * Debug log - for detailed debugging
   * @param {string} message
   * @param {any} [data]
   */
  debug(message, data) {
    if (!isDev) return;
    console.log(...formatLog(LogLevel.DEBUG, message, data));
  },

  /**
   * Info log - for general information
   * @param {string} message
   * @param {any} [data]
   */
  info(message, data) {
    if (!isDev) return;
    console.info(...formatLog(LogLevel.INFO, message, data));
  },

  /**
   * Warning log - for warnings
   * @param {string} message
   * @param {any} [data]
   */
  warn(message, data) {
    if (!isDev) return;
    console.warn(...formatLog(LogLevel.WARN, message, data));
  },

  /**
   * Error log - for errors (always logs, even in production)
   * @param {string} message
   * @param {any} [data]
   */
  error(message, data) {
    // Always log errors, even in production
    console.error(...formatLog(LogLevel.ERROR, message, data));
  },
};

/**
 * Helper: Create a namespaced logger
 * @param {string} namespace - Namespace for logs (e.g., 'Auth', 'Teams')
 * @returns {Object} Namespaced logger
 *
 * @example
 * const log = createLogger('Auth');
 * log.info('User logged in');  // [12:34:56] INFO: [Auth] User logged in
 */
export function createLogger(namespace) {
  return {
    debug: (msg, data) => logger.debug(`[${namespace}] ${msg}`, data),
    info: (msg, data) => logger.info(`[${namespace}] ${msg}`, data),
    warn: (msg, data) => logger.warn(`[${namespace}] ${msg}`, data),
    error: (msg, data) => logger.error(`[${namespace}] ${msg}`, data),
  };
}
