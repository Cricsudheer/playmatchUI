/**
 * Teams API
 * All team-related API calls
 */

import { httpGet, httpPost } from './http';

/**
 * Get current user's teams
 * @returns {Promise<Array>} Array of team objects
 */
export async function getMyTeams() {
  const response = await httpGet('/api/teams/user');
  return response?.teams || [];
}

/**
 * Create a new team
 * @param {object} payload - Team data
 * @param {string} payload.name - Team name (required)
 * @param {string} payload.city - Team city (required)
 * @param {string} [payload.description] - Team description (optional)
 * @param {string} [payload.logoUrl] - Team logo URL (optional)
 * @returns {Promise<object>} Created team object
 */
export async function createTeam(payload) {
  return await httpPost('/api/teams', payload);
}

/**
 * Join a team via invite code
 * @param {string} inviteCode - Invite code
 * @returns {Promise<object>} Joined team object
 */
export async function joinTeam(inviteCode) {
  return await httpPost('/api/teams/join', { inviteCode });
}
