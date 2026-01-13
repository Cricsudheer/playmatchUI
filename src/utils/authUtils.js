import { STORAGE_KEYS } from '../constants/authConfig';

/**
 * Save authentication tokens to localStorage
 */
export function saveTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }
  // refreshToken is managed via httpOnly cookie by backend
}

/**
 * Get access token from localStorage
 */
export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Save user data to localStorage
 */
export function saveUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

/**
 * Get user data from localStorage
 */
export function getUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Clear all authentication data from localStorage
 * Also clears team context to prevent data leaks between users
 */
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  // Clear team context (prevents previous user's team showing for new user)
  localStorage.removeItem('selectedTeamId');

  // Clear any other user-specific data
  // Add more here if needed in the future
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated() {
  const token = getAccessToken();
  return !!token;
}
