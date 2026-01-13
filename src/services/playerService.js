/**
 * Player Service
 * Business logic layer for player stats
 * Orchestrates API calls from api/stats.api.js
 */

import { getAllPlayerStats } from '../api/stats.api';
import { enrichPlayers } from '../utils/playerUtils';
import { createLogger } from '../utils/logger';

const log = createLogger('PlayerService');

/**
 * Fetch player stats from the backend API
 * Enriches player data with calculated fields
 *
 * @returns {Promise<Array>} Enriched player data
 * @throws {Error} If fetch or API call fails
 */
export async function fetchPlayerStats() {
  try {
    log.debug('Fetching player stats');
    const data = await getAllPlayerStats();
    const enrichedData = enrichPlayers(data);

    log.info('Player stats fetched and enriched', { count: enrichedData.length });
    return enrichedData;
  } catch (error) {
    log.error('Failed to fetch player stats', { error: error.message });
    throw error;
  }
}
