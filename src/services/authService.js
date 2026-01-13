/**
 * Auth Service
 * Business logic layer for authentication
 * Orchestrates API calls and manages auth state persistence
 */

import { login as apiLogin, register as apiRegister, refreshToken as apiRefreshToken } from '../api/auth.api';
import { saveTokens, saveUser, clearAuth } from '../utils/authUtils';
import { createLogger } from '../utils/logger';

const log = createLogger('AuthService');

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export async function login(email, password) {
  try {
    const data = await apiLogin(email, password);

    // Validate login response has required data
    if (!data || !data.accessToken || !data.user) {
      throw new Error('Invalid login response from server');
    }

    // Save tokens and user data ONLY after validation
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);

    log.info('User logged in successfully', { email: data.user.email });
    return data;
  } catch (error) {
    log.error('Login failed', { email, error: error.message });
    throw error;
  }
}

/**
 * Register new user
 * Automatically logs in after successful registration
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Login data { accessToken, refreshToken, user }
 */
export async function register(userData) {
  try {
    log.info('Sending registration request');
    const registeredUser = await apiRegister(userData);

    // Validate registration response
    if (!registeredUser || !registeredUser.id || !registeredUser.email) {
      log.error('Invalid registration response structure');
      throw new Error('Invalid registration response from server');
    }

    log.info('User registered successfully', { email: registeredUser.email });

    // Auto-login after successful registration
    log.debug('Attempting auto-login after registration');
    const loginData = await login(userData.email, userData.password);

    log.info('Auto-login successful');
    return loginData;
  } catch (error) {
    log.error('Registration error', { error: error.message });
    throw error;
  }
}

/**
 * Refresh access token using refresh token cookie
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export async function refreshToken() {
  try {
    const data = await apiRefreshToken();

    // Validate refresh token response
    if (!data || !data.accessToken || !data.user) {
      throw new Error('Invalid refresh token response from server');
    }

    // Save new tokens and user data
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);

    log.debug('Token refreshed successfully');
    return data;
  } catch (error) {
    // Clear any stored auth data on refresh failure
    clearAuth();
    log.error('Token refresh failed - cleared auth', { error: error.message });
    throw new Error('Session expired. Please login again.');
  }
}

/**
 * @deprecated Use http.js directly instead
 * Fetch with authentication - automatically adds auth header and handles 401
 * This function is kept for backwards compatibility but should not be used
 * for new code. Use the centralized http.js client instead.
 */
export async function fetchWithAuth(url, options = {}) {
  const { getAccessToken } = require('../utils/authUtils');
  const token = getAccessToken();

  const authHeaders = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers: authHeaders,
      credentials: 'include',
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      try {
        const refreshData = await refreshToken();

        // Retry original request with new token
        authHeaders['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers: authHeaders,
          credentials: 'include',
        });
      } catch (refreshError) {
        // If refresh fails, throw error to force logout
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}
