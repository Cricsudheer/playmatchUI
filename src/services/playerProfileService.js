import { API_CONFIG } from '../constants/config';
import { fetchWithAuth } from './authService';
import { getAPIErrorMessage } from '../utils/validationUtils';

const PROFILE_ENDPOINTS = {
  CREATE_OR_UPDATE: '/api/players/profile',
  GET_PROFILE: '/api/players/profile',
};

/**
 * Create or update player profile
 * Uses POST for creation, PUT for updates
 * Note: Email is managed separately and should not be included in profile data
 */
export async function createOrUpdateProfile(profileData, isUpdate = false) {
  const url = `${API_CONFIG.AUTH_BASE_URL}${PROFILE_ENDPOINTS.CREATE_OR_UPDATE}`;

  // Remove email if it exists in the payload (email cannot be updated via profile)
  const { email, ...profilePayload } = profileData;

  // Use POST for creation, PUT for updates
  const method = isUpdate ? 'PUT' : 'POST';

  try {
    console.log('[playerProfileService] Creating/updating profile...');
    console.log('[playerProfileService] HTTP Method:', method);
    console.log('[playerProfileService] Is Update?', isUpdate);
    console.log('[playerProfileService] RAW PAYLOAD BEFORE SENDING:', JSON.stringify(profilePayload, null, 2));
    const response = await fetchWithAuth(url, {
      method: method,
      body: JSON.stringify(profilePayload),
    });

    console.log('[playerProfileService] Profile response status:', response.status);

    // Handle error responses
    if (!response.ok) {
      let errorMessage = getAPIErrorMessage(response.status);
      try {
        const errorData = await response.json();
        console.error('[playerProfileService] Profile error response:', errorData);
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (parseError) {
        console.error('[playerProfileService] Failed to parse error response');
      }
      console.error('[playerProfileService] Profile creation/update failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // Parse successful response
    const profileResponse = await response.json();
    console.log('[playerProfileService] Profile created/updated successfully');

    return profileResponse;
  } catch (error) {
    console.error('[playerProfileService] Profile error:', error.message);
    throw error;
  }
}

/**
 * Get player profile by userId
 */
export async function getPlayerProfile(userId) {
  const url = `${API_CONFIG.AUTH_BASE_URL}${PROFILE_ENDPOINTS.GET_PROFILE}/${userId}`;

  try {
    console.log('[playerProfileService] Fetching profile for userId:', userId);
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      // 404 means profile doesn't exist yet
      if (response.status === 404) {
        return null;
      }

      let errorMessage = getAPIErrorMessage(response.status);
      try {
        const errorData = await response.json();
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (parseError) {
        // Ignore parse error
      }
      throw new Error(errorMessage);
    }

    const profile = await response.json();
    console.log('[playerProfileService] Profile fetched successfully');
    return profile;
  } catch (error) {
    console.error('[playerProfileService] Get profile error:', error.message);
    throw error;
  }
}
