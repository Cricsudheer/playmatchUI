import { API_CONFIG } from '../constants/config';
import { enrichPlayers } from '../utils/playerUtils';

/**
 * Fetch player stats from the backend API
 * @returns {Promise<Array>} - Enriched player data
 * @throws {Error} - If fetch or API call fails
 */
export async function fetchPlayerStats() {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATS}`;
  
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return enrichPlayers(data);
}
