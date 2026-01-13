import { ROUTES, isPublicRoute } from '../constants/routes';

/**
 * Determines where to redirect user after successful login
 * Priority order:
 * 1. returnTo parameter (e.g., from deep link)
 * 2. Pending invite code → /invite/:code
 * 3. Team count check → /onboarding or /app/home
 *
 * @param {string} returnTo - Optional return path
 * @param {Array} teams - User's teams array
 * @returns {string} Redirect path
 */
export function getPostLoginRedirect(returnTo = null, teams = []) {
  // Priority 1: Explicit return path (e.g., deep link)
  if (returnTo && !isPublicRoute(returnTo)) {
    return returnTo;
  }

  // Priority 2: Pending invite code
  const pendingInvite = localStorage.getItem('invitePendingCode');
  if (pendingInvite) {
    localStorage.removeItem('invitePendingCode');
    return `/invite/${pendingInvite}`;
  }

  // Priority 3: Team count check
  if (teams.length === 0) {
    return ROUTES.ONBOARDING;
  }

  return ROUTES.APP.HOME;
}
