/**
 * Authentication Service
 * Handles user signup, login, and token management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https:// localhost:8080';

/**
 * Sign up a new user
 * @param {Object} userData - User signup data {name, gender, email, password}
 * @returns {Promise<Object>} User object
 */
export async function signupUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        gender: userData.gender,
        email: userData.email,
        password: userData.password,
        reEnterPassword: userData.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Signup request failed');
  }
}

/**
 * Login a user
 * @param {Object} credentials - Login credentials {email, password}
 * @returns {Promise<Object>} Auth response with tokens and user object
 */
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Login request failed');
  }
}

/**
 * Get the current access token from localStorage
 * @returns {string|null} Access token or null
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Get the current user from localStorage
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Logout the current user
 */
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  return !!getAccessToken();
}
