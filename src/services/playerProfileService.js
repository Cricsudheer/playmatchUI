/**
 * Player Profile Service
 * Business logic layer for player profiles
 * Orchestrates API calls from api/players.api.js
 */

import {
  getPlayerProfile as apiGetPlayerProfile,
  createOrUpdatePlayerProfile as apiCreateOrUpdatePlayerProfile,
} from '../api/players.api';
import { createLogger } from '../utils/logger';

const log = createLogger('PlayerProfileService');

/**
 * Create or update player profile
 * Uses POST for creation, PUT for updates
 * Note: Email is managed separately and should not be included in profile data
 *
 * @param {Object} profileData - Profile data
 * @param {boolean} isUpdate - Whether this is an update (true) or create (false)
 * @returns {Promise<Object>} Created/updated profile
 */
export async function createOrUpdateProfile(profileData, isUpdate = false) {
  try {
    const method = isUpdate ? 'PUT' : 'POST';
    log.debug('Creating/updating profile', { method, isUpdate });

    const profile = await apiCreateOrUpdatePlayerProfile(profileData, isUpdate);

    log.info('Profile created/updated successfully');
    return profile;
  } catch (error) {
    log.error('Profile creation/update failed', { error: error.message });
    throw error;
  }
}

/**
 * Get player profile by userId
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Player profile or null if not found
 */
export async function getPlayerProfile(userId) {
  try {
    log.debug('Fetching profile', { userId });
    const profile = await apiGetPlayerProfile(userId);

    if (profile) {
      log.info('Profile fetched successfully');
    } else {
      log.debug('Profile not found (404)');
    }

    return profile;
  } catch (error) {
    log.error('Get profile error', { userId, error: error.message });
    throw error;
  }
}
