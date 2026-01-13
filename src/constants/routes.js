/**
 * Route Constants
 *
 * Centralized route paths to avoid magic strings and typos.
 * Use these constants instead of hardcoding paths.
 *
 * @example
 * import { ROUTES } from '../constants/routes';
 * navigate(ROUTES.LOGIN);
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Onboarding
  ONBOARDING: '/onboarding',

  // Profile
  PROFILE: '/profile',

  // App routes (protected)
  APP: {
    HOME: '/app/home',
    STATS: '/app/stats',
    TEAMS: '/app/teams',
    EVENTS: '/app/events',
    PROFILE: '/app/profile',
  },

  // Root
  ROOT: '/',
};

/**
 * Check if path is a public route (no auth required)
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function isPublicRoute(path) {
  return path === ROUTES.LOGIN || path === ROUTES.SIGNUP;
}

/**
 * Check if path is an app route (requires auth + team)
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function isAppRoute(path) {
  return path.startsWith('/app/');
}
