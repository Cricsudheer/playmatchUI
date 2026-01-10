import { API_CONFIG } from '../constants/config';
import { AUTH_ENDPOINTS, ERROR_MESSAGES } from '../constants/authConfig';
import { getAccessToken, saveTokens, saveUser } from '../utils/authUtils';
import { getAPIErrorMessage } from '../utils/validationUtils';

/**
 * Login user with email and password
 */
export async function login(email, password) {
  const url = `${API_CONFIG.AUTH_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    // Handle error responses
    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = getAPIErrorMessage(response.status);
      try {
        const errorData = await response.json();
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (parseError) {
        // If parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    const data = await response.json();

    // Validate login response has required data
    if (!data || !data.accessToken || !data.user) {
      throw new Error('Invalid login response from server');
    }

    // Save tokens and user data ONLY after validation
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Register new user
 */
export async function register(userData) {
  const url = `${API_CONFIG.AUTH_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`;

  try {
    console.log('[authService] Sending registration request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    console.log('[authService] Registration response status:', response.status);

    // Handle error responses
    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = getAPIErrorMessage(response.status);
      try {
        const errorData = await response.json();
        console.error('[authService] Registration error response:', errorData);
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (parseError) {
        // If parsing fails, use default error message
        console.error('[authService] Failed to parse error response');
      }
      console.error('[authService] Registration failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // Parse successful response
    const registeredUser = await response.json();
    console.log('[authService] User registered successfully:', registeredUser.email);

    // Validate registration response has expected data
    if (!registeredUser || !registeredUser.id || !registeredUser.email) {
      console.error('[authService] Invalid registration response structure');
      throw new Error('Invalid registration response from server');
    }

    // Auto-login after SUCCESSFUL registration only
    console.log('[authService] Attempting auto-login after registration...');
    const loginData = await login(userData.email, userData.password);

    console.log('[authService] Auto-login successful');
    return loginData;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[authService] Network error during registration');
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    // Re-throw other errors
    console.error('[authService] Registration error:', error.message);
    throw error;
  }
}

/**
 * Refresh access token using refresh token cookie
 */
export async function refreshToken() {
  const url = `${API_CONFIG.AUTH_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    // Validate refresh token response has required data
    if (!data || !data.accessToken || !data.user) {
      throw new Error('Invalid refresh token response from server');
    }

    // Save new tokens and user data ONLY after validation
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);

    return data;
  } catch (error) {
    // Clear any stored auth data on refresh failure
    const { clearAuth } = require('../utils/authUtils');
    clearAuth();
    throw new Error('Session expired. Please login again.');
  }
}

/**
 * Fetch with authentication - automatically adds auth header and handles 401
 */
export async function fetchWithAuth(url, options = {}) {
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
