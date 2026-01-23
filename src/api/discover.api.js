/**
 * Team Discovery API
 * API calls for browsing and searching teams
 */

import { httpGet } from './http';

/**
 * Search/browse teams for discovery
 * @param {Object} params - Search parameters
 * @param {string} [params.name] - Team name search query
 * @param {string} [params.city] - City filter
 * @param {number} [params.limit=10] - Number of results
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<Object>} { total, items: Team[] }
 */
export async function discoverTeams({ name, city, limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams();
  
  if (name) params.append('name', name);
  if (city) params.append('city', city);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  const queryString = params.toString();
  return await httpGet(`/api/teams?${queryString}`);
}

/**
 * Get team details by ID
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Team details
 */
export async function getTeamById(teamId) {
  return await httpGet(`/api/teams/${teamId}`);
}

/**
 * Get list of available cities for filtering
 * This is a client-side constant for now, can be API-driven later
 * @returns {Array<string>} List of cities
 */
export function getAvailableCities() {
  return [
    'Bengaluru',
    'Mumbai',
    'Chennai',
    'Delhi',
    'Hyderabad',
    'Kolkata',
    'Pune',
  ];
}
