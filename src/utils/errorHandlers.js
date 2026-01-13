import { clearAuth } from './authUtils';
import { ROUTES } from '../constants/routes';
import { createLogger } from './logger';

const log = createLogger('ErrorHandlers');

/**
 * Global handler for 401 Unauthorized errors
 * Clears auth state and redirects to login
 */
export function handle401Error(navigate, returnTo = null) {
  log.warn('Unauthorized - clearing auth and redirecting to login');

  // Clear all auth data
  clearAuth();

  // Redirect to login with return path
  const state = returnTo ? { returnTo } : undefined;
  navigate(ROUTES.LOGIN, { state });
}

/**
 * Check if an error is a 401 Unauthorized error
 */
export function is401Error(error) {
  return error?.message === 'UNAUTHORIZED' || error?.status === 401;
}

/**
 * Generic error handler for React Query
 * Returns appropriate error message for display
 */
export function getErrorMessage(error) {
  if (is401Error(error)) {
    return 'Session expired. Please log in again.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
