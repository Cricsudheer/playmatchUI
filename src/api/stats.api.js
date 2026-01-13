/**
 * Stats API
 * Legacy stats API endpoints
 */

import { httpGet } from './http';

/**
 * Fetch all player stats from legacy API
 * Note: This uses a different base URL (VITE_API_BASE_URL)
 * @returns {Promise<Array>} Array of player stats
 */
export async function getAllPlayerStats() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://playmatch-preprod.onrender.com';

  // This endpoint doesn't require authentication
  // Using direct fetch here since it's a different API
  const response = await fetch(`${BASE_URL}/sigma/api/players/all/stats`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}
