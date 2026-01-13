/**
 * Auth API
 * All authentication-related API calls
 */

import { httpPost } from './http';
import { AUTH_ENDPOINTS } from '../constants/authConfig';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export async function login(email, password) {
  return await httpPost(AUTH_ENDPOINTS.LOGIN, { email, password });
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
  return await httpPost(AUTH_ENDPOINTS.REGISTER, userData);
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<Object>} { accessToken }
 */
export async function refreshToken() {
  return await httpPost(AUTH_ENDPOINTS.REFRESH_TOKEN);
}
