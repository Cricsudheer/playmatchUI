/**
 * HTTP Client
 * Base fetch wrapper with JWT auth and error handling
 */

import { getAccessToken } from '../utils/authUtils';
import { createLogger } from '../utils/logger';

const log = createLogger('HTTP');
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Get JWT token from localStorage
 * Uses the same utility as auth system for consistency
 */
function getToken() {
  return getAccessToken();
}

/**
 * HTTP fetch wrapper
 * @param {string} endpoint - API endpoint (e.g., '/api/teams')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 * @throws {Error} Error with .status and .payload properties
 */
export async function http(endpoint, options = {}) {
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

    // Handle non-2xx responses
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
