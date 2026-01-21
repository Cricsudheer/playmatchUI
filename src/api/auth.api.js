/**
 * Auth API
 * All authentication-related API calls
 */

import { AUTH_ENDPOINTS } from '../constants/authConfig';
import { getRefreshToken } from '../utils/authUtils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export async function login(email, password) {
  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User full name
 * @param {string} userData.gender - User gender
 * @returns {Promise<Object>} Registered user object
 */
export async function register(userData) {
  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 * This is called directly without going through http.js to avoid circular dependency
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export async function refreshToken() {
  const token = getRefreshToken();

  if (!token) {
    const error = new Error('No refresh token available');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
