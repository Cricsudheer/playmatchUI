/**
 * Team Utilities
 *
 * Helper functions for working with team data.
 * Normalizes inconsistent API responses (teamId vs id).
 */

/**
 * Get team ID from team object
 * Handles both `teamId` and `id` fields from API
 *
 * @param {Object} team - Team object
 * @returns {number|null} Team ID
 *
 * @example
 * const id = getTeamId({ teamId: 123 });  // 123
 * const id = getTeamId({ id: 456 });      // 456
 */
export function getTeamId(team) {
  if (!team) return null;
  return team.teamId || team.id || null;
}

/**
 * Normalize team object to have consistent `id` field
 * Converts API response to use `id` instead of `teamId`
 *
 * @param {Object} team - Raw team object from API
 * @returns {Object} Normalized team object with `id` field
 *
 * @example
 * const team = normalizeTeam({ teamId: 123, teamName: 'Warriors' });
 * // { id: 123, teamName: 'Warriors' }
 */
export function normalizeTeam(team) {
  if (!team) return null;

  const { teamId, id, ...rest } = team;

  return {
    id: teamId || id,
    ...rest,
  };
}

/**
 * Normalize array of teams
 *
 * @param {Array} teams - Array of team objects
 * @returns {Array} Normalized team objects
 */
export function normalizeTeams(teams) {
  if (!Array.isArray(teams)) return [];
  return teams.map(normalizeTeam);
}

/**
 * Find team by ID in array
 * Handles both `teamId` and `id` fields
 *
 * @param {Array} teams - Array of teams
 * @param {number} teamId - Team ID to find
 * @returns {Object|null} Found team or null
 */
export function findTeamById(teams, teamId) {
  if (!Array.isArray(teams) || !teamId) return null;

  return teams.find((team) => getTeamId(team) === teamId) || null;
}

/**
 * Get role label for display
 *
 * @param {string} role - Role from API (ADMIN, COORDINATOR, PLAYER)
 * @returns {string} Display label
 */
export function getRoleLabel(role) {
  const labels = {
    ADMIN: 'Admin',
    COORDINATOR: 'Coordinator',
    PLAYER: 'Player',
  };
  return labels[role] || role;
}

/**
 * Get role emoji
 *
 * @param {string} role - Role from API
 * @returns {string} Emoji
 */
export function getRoleEmoji(role) {
  const emojis = {
    ADMIN: '👑',
    COORDINATOR: '⭐',
    PLAYER: '🏏',
  };
  return emojis[role] || '🏏';
}
