/**
 * HTTP Client
 * Base fetch wrapper with JWT auth, automatic token refresh, and error handling
 */

import { getAccessToken, saveTokens, clearAuth } from '../utils/authUtils';
import { refreshToken as apiRefreshToken } from './auth.api';
import { createLogger } from '../utils/logger';

const log = createLogger('HTTP');
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Token refresh state management
 * Prevents multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise = null;

/**
 * Attempt to refresh the access token
 * Uses a singleton pattern to prevent multiple concurrent refresh calls
 * @returns {Promise<string>} New access token
 */
async function tryRefreshToken() {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    log.debug('Token refresh already in progress, waiting...');
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      log.debug('Attempting to refresh token');
      const data = await apiRefreshToken();

      if (!data || !data.accessToken) {
        throw new Error('Invalid refresh token response');
      }

      // Save new tokens
      saveTokens(data.accessToken, data.refreshToken);
      log.info('Token refreshed successfully');

      return data.accessToken;
    } catch (error) {
      log.error('Token refresh failed', { error: error.message });
      // Clear auth and redirect to login
      clearAuth();
      window.location.href = '/login';
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Get JWT token from localStorage
 * Uses the same utility as auth system for consistency
 */
function getToken() {
  return getAccessToken();
}

/**
 * HTTP fetch wrapper with automatic token refresh
 * @param {string} endpoint - API endpoint (e.g., '/api/teams')
 * @param {object} options - Fetch options
 * @param {boolean} isRetry - Whether this is a retry after token refresh
 * @returns {Promise<any>} Response data
 * @throws {Error} Error with .status and .payload properties
 */
export async function http(endpoint, options = {}, isRetry = false) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const url = `${BASE_URL}${endpoint}`;

  // Log request (DEV only)
  log.debug(`${options.method || 'GET'} ${endpoint}`, {
    hasToken: !!token,
    url,
  });

  try {
    const response = await fetch(url, config);

    // Log response (DEV only)
    log.debug(`Response ${response.status}`, { endpoint, statusText: response.statusText });

    // Handle empty body (204 No Content, etc.)
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');

    let data = null;
    if (hasJsonContent) {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    }

    // Handle 401/403 - attempt token refresh (only once)
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      log.debug(`Received ${response.status}, attempting token refresh`);

      try {
        await tryRefreshToken();
        // Retry the original request with new token
        log.debug('Retrying original request with new token');
        return http(endpoint, options, true);
      } catch (refreshError) {
        // Refresh failed, error handling done in tryRefreshToken
        throw refreshError;
      }
    }

    // Handle other non-2xx responses
    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.payload = data;

      // Log error (always logged, even in production)
      log.error(`Request failed: ${endpoint}`, {
        status: response.status,
        message: error.message,
        payload: data,
      });

      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw with status if not already set
    if (!error.status) {
      error.status = 500;
      error.payload = null;
    }
    throw error;
  }
}

/**
 * HTTP GET
 */
export function httpGet(endpoint, options = {}) {
  return http(endpoint, { ...options, method: 'GET' });
}

/**
 * HTTP POST
 */
export function httpPost(endpoint, data, options = {}) {
  return http(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * HTTP PUT
 */
export function httpPut(endpoint, data, options = {}) {
  return http(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * HTTP DELETE
 */
export function httpDelete(endpoint, options = {}) {
  return http(endpoint, { ...options, method: 'DELETE' });
}
