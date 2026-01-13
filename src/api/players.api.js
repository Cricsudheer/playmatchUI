/**
 * Players API
 * All player-related API calls
 */

import { httpGet, httpPost, httpPut } from './http';

/**
 * Get player profile by userId
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Player profile or null if not found
 */
export async function getPlayerProfile(userId) {
  try {
    return await httpGet(`/api/players/profile/${userId}`);
  } catch (error) {
    // 404 means profile doesn't exist yet
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create player profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created profile
 */
export async function createPlayerProfile(profileData) {
  // Remove email if it exists (email cannot be updated via profile)
  const { email, ...cleanedData } = profileData;
  return await httpPost('/api/players/profile', cleanedData);
}

/**
 * Update player profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Updated profile
 */
export async function updatePlayerProfile(profileData) {
  // Remove email if it exists (email cannot be updated via profile)
  const { email, ...cleanedData } = profileData;
  return await httpPut('/api/players/profile', cleanedData);
}

/**
 * Create or update player profile (convenience method)
 * @param {Object} profileData - Profile data
 * @param {boolean} isUpdate - Whether this is an update or create
 * @returns {Promise<Object>} Created/updated profile
 */
export async function createOrUpdatePlayerProfile(profileData, isUpdate = false) {
  if (isUpdate) {
    return await updatePlayerProfile(profileData);
  }
  return await createPlayerProfile(profileData);
}
