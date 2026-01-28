/**
 * MVP API Service
 * Handles all API calls for GameTeam MVP features
 * 
 * Error Handling: Follows RFC 7807 Problem Details format
 * Response format: { code, title, status, detail }
 */

import { API_CONFIG, MVP_ENDPOINTS, MVP_AUTH_TOKEN_KEY, MVP_REFRESH_TOKEN_KEY, MVP_USER_KEY } from '../constants';

/**
 * Custom API Error class for RFC 7807 Problem Details
 */
export class ApiError extends Error {
  constructor(code, title, status, detail) {
    super(detail || title);
    this.code = code;
    this.title = title;
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

/**
 * User-friendly error messages per FRONTEND.md spec
 */
const FRIENDLY_ERROR_MESSAGES = {
  'MVP-AUTH-001': 'The OTP code you entered is incorrect. Please try again.',
  'MVP-AUTH-002': 'This OTP has expired. Please request a new one.',
  'MVP-AUTH-003': 'Too many attempts. Please request a new OTP.',
  'MVP-AUTH-004': 'Too many OTP requests. Please wait 10 minutes.',
  'MVP-AUTH-006': 'Please enter a valid phone number.',
  'MVP-AUTH-010': 'Only the match captain can perform this action.',
  'MVP-AUTH-011': 'Please login to continue.',
  'MVP-MATCH-001': 'Match not found.',
  'MVP-MATCH-002': 'This match is full. Try requesting as emergency player.',
  'MVP-MATCH-003': 'This match has already been completed.',
  'MVP-MATCH-005': 'Cannot perform this action on a completed or cancelled match.',
  'MVP-INVITE-001': 'This invite link is invalid or has been deleted.',
  'MVP-INVITE-002': 'This invite link has expired.',
  'MVP-EMERGENCY-001': 'Emergency request not found.',
  'MVP-EMERGENCY-002': 'You already have a pending emergency request.',
  'MVP-EMERGENCY-003': 'This emergency request has expired.',
  'MVP-EMERGENCY-004': 'Emergency requests are not enabled for this match.',
  'MVP-EMERGENCY-005': 'This request has already been processed.',
  'MVP-PARTICIPANT-001': 'Participant not found.',
};

/**
 * Get user-friendly error message
 */
export function getFriendlyErrorMessage(error) {
  if (error instanceof ApiError && error.code) {
    return FRIENDLY_ERROR_MESSAGES[error.code] || error.detail || error.message;
  }
  return error.message || 'Something went wrong. Please try again.';
}

/**
 * Get MVP auth token from localStorage
 */
function getMvpToken() {
  return localStorage.getItem(MVP_AUTH_TOKEN_KEY);
}

/**
 * Handle 401/403 Unauthorized - attempt refresh, then clear auth if failed
 */
async function handleUnauthorized() {
  // First, try to refresh the token
  const storedRefreshToken = localStorage.getItem(MVP_REFRESH_TOKEN_KEY);
  
  if (storedRefreshToken) {
    try {
      const result = await refreshToken();
      if (result?.accessToken) {
        // Save new tokens
        localStorage.setItem(MVP_AUTH_TOKEN_KEY, result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem(MVP_REFRESH_TOKEN_KEY, result.refreshToken);
        }
        // Update user data if provided
        if (result.userId) {
          const repairedUser = {
            id: result.userId,
            phone: result.phoneNumber,
            name: result.name,
          };
          localStorage.setItem(MVP_USER_KEY, JSON.stringify(repairedUser));
        }
        window.dispatchEvent(new CustomEvent('mvp-auth-change'));
        // Token refreshed successfully - caller should retry
        return { refreshed: true, newToken: result.accessToken };
      }
    } catch (refreshError) {
      console.log('[API] Token refresh failed:', refreshError.message);
    }
  }
  
  // Refresh failed or no refresh token - clear auth
  localStorage.removeItem(MVP_AUTH_TOKEN_KEY);
  localStorage.removeItem(MVP_REFRESH_TOKEN_KEY);
  localStorage.removeItem(MVP_USER_KEY);
  window.dispatchEvent(new CustomEvent('mvp-auth-change'));
  return { refreshed: false };
}

/**
 * Parse error response per RFC 7807
 */
async function parseErrorResponse(response) {
  try {
    const error = await response.json();
    // RFC 7807 format: { code, title, status, detail }
    return new ApiError(
      error.code || `HTTP-${response.status}`,
      error.title || response.statusText,
      error.status || response.status,
      error.detail || error.message
    );
  } catch {
    return new ApiError(
      `HTTP-${response.status}`,
      response.statusText,
      response.status,
      `Request failed with status ${response.status}`
    );
  }
}

/**
 * Base fetch wrapper with auth handling
 */
async function apiFetch(endpoint, options = {}, isRetry = false) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getMvpToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    // Handle 401 Unauthorized or 403 Forbidden (token expired/invalid)
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      const refreshResult = await handleUnauthorized();
      
      // If token was refreshed successfully, retry the request
      if (refreshResult.refreshed) {
        return apiFetch(endpoint, options, true);
      }
      
      // If not refreshed, throw appropriate error
      throw new ApiError(
        'MVP-AUTH-011',
        'Session Expired',
        response.status,
        'Your session has expired. Please login again.'
      );
    }
    
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

/**
 * Public fetch (no auth required)
 */
async function publicFetch(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// ============================================
// Auth/Profile API
// ============================================

/**
 * Refresh token to get new access token and user data
 * Returns: { accessToken, refreshToken, userId, phoneNumber, name }
 * Also used to repair stale user data in localStorage
 */
export async function refreshToken() {
  const storedRefreshToken = localStorage.getItem(MVP_REFRESH_TOKEN_KEY);
  
  if (!storedRefreshToken) {
    throw new ApiError('MVP-AUTH-011', 'No refresh token', 401, 'Please login again.');
  }
  
  const url = `${API_CONFIG.BASE_URL}${MVP_ENDPOINTS.REFRESH_TOKEN}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
}

/**
 * Repair user data in localStorage if incomplete
 * Uses refresh token to get fresh user data from API
 * Returns true if repair was needed and successful
 * 
 * NOTE: If user has no refresh token (logged in before this feature),
 * they will need to re-login once to get their name displayed.
 */
export async function repairUserData() {
  try {
    // First check if we have a refresh token - if not, skip repair
    const storedRefreshToken = localStorage.getItem(MVP_REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      console.log('[API] No refresh token available, skipping user data repair. User needs to re-login.');
      return false;
    }
    
    const userJson = localStorage.getItem(MVP_USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    
    // Check if user data is incomplete (missing name)
    if (!user || !user.name) {
      console.log('[API] User data incomplete, using refresh token to repair...');
      
      const result = await refreshToken();
      
      if (result) {
        // Update tokens
        if (result.accessToken) {
          localStorage.setItem(MVP_AUTH_TOKEN_KEY, result.accessToken);
        }
        if (result.refreshToken) {
          localStorage.setItem(MVP_REFRESH_TOKEN_KEY, result.refreshToken);
        }
        
        // Update localStorage with complete user data
        const repairedUser = {
          id: result.userId,
          phone: result.phoneNumber,
          name: result.name,
        };
        localStorage.setItem(MVP_USER_KEY, JSON.stringify(repairedUser));
        
        // Notify components of the update
        window.dispatchEvent(new Event('mvp-auth-change'));
        console.log('[API] User data repaired successfully:', repairedUser.name);
        return true;
      }
    }
    return false;
  } catch (error) {
    // If refresh token is invalid/expired (403), clear it so we don't retry
    if (error.status === 403 || error.status === 401) {
      console.log('[API] Refresh token invalid/expired, clearing it. User needs to re-login.');
      localStorage.removeItem(MVP_REFRESH_TOKEN_KEY);
    }
    console.error('[API] Failed to repair user data:', error);
    return false;
  }
}

// ============================================
// Match API
// ============================================

/**
 * Get user's games (requires auth)
 * Returns: { games: [...], totalCount, upcomingCount, completedCount, cancelledCount }
 */
export async function getMyGames() {
  return apiFetch(MVP_ENDPOINTS.MY_GAMES);
}

/**
 * Get match by ID (requires auth)
 * Captain sees full participant list, others see counts only
 */
export async function getMatchById(matchId) {
  return apiFetch(MVP_ENDPOINTS.MATCH_BY_ID(matchId));
}

/**
 * Resolve invite by token (public, no auth required)
 * Returns: { matchId, inviteType, teamName, startTime, ... }
 */
export async function resolveInvite(token) {
  return publicFetch(MVP_ENDPOINTS.RESOLVE_INVITE(token));
}

/**
 * Create a new match (requires auth)
 * Returns: { matchId, teamInviteUrl, emergencyInviteUrl }
 */
export async function createMatch(matchData) {
  return apiFetch(MVP_ENDPOINTS.MATCHES, {
    method: 'POST',
    body: JSON.stringify(matchData),
  });
}

/**
 * Mark match as completed (requires auth, captain only)
 * Records platform fee of ₹50
 */
export async function completeMatch(matchId) {
  return apiFetch(MVP_ENDPOINTS.COMPLETE_MATCH(matchId), {
    method: 'POST',
  });
}

/**
 * Cancel match (requires auth, captain only)
 */
export async function cancelMatch(matchId) {
  return apiFetch(MVP_ENDPOINTS.CANCEL_MATCH(matchId), {
    method: 'POST',
  });
}

// ============================================
// Player Response API
// ============================================

/**
 * Respond to match invite (requires auth)
 * @param {string} matchId
 * @param {string} response - 'YES' or 'NO'
 * Auto-assigns role (TEAM/BACKUP) based on availability
 */
export async function respondToMatch(matchId, response) {
  return apiFetch(MVP_ENDPOINTS.RESPOND(matchId), {
    method: 'POST',
    body: JSON.stringify({ response }),
  });
}

/**
 * Log backout for a player (requires auth, captain only)
 * @param {string} matchId
 * @param {number} userId - User ID of the player backing out
 * @param {string} reason - GENUINE | CONFLICT | COMMUNICATION | PAYMENT | NO_SHOW | CAPTAIN_DECISION
 * @param {string} notes - Optional notes
 */
export async function logBackout(matchId, userId, reason, notes = '') {
  return apiFetch(MVP_ENDPOINTS.LOG_BACKOUT(matchId), {
    method: 'POST',
    body: JSON.stringify({ userId, reason, notes }),
  });
}

// ============================================
// Emergency API
// ============================================

/**
 * Request emergency spot in a match (requires auth)
 * Creates a 60-minute soft lock
 */
export async function requestEmergencySlot(matchId) {
  return apiFetch(MVP_ENDPOINTS.EMERGENCY_REQUEST(matchId), {
    method: 'POST',
  });
}

/**
 * Get pending emergency requests for a match (requires auth, captain only)
 * Returns: [{ requestId, userName, area, trustScore, ... }]
 */
export async function getEmergencyRequests(matchId) {
  return apiFetch(MVP_ENDPOINTS.EMERGENCY_REQUESTS(matchId));
}

/**
 * Approve emergency request (requires auth, captain only)
 * Creates participant with EMERGENCY role
 */
export async function approveEmergencyRequest(matchId, requestId) {
  return apiFetch(MVP_ENDPOINTS.APPROVE_EMERGENCY(matchId, requestId), {
    method: 'POST',
  });
}

/**
 * Reject emergency request (requires auth, captain only)
 */
export async function rejectEmergencyRequest(matchId, requestId) {
  return apiFetch(MVP_ENDPOINTS.REJECT_EMERGENCY(matchId, requestId), {
    method: 'POST',
  });
}

// ============================================
// Payment API
// ============================================

/**
 * Get payment tracking for a match (requires auth)
 * Captain sees all players, regular players see only their own
 * @param {string} matchId
 * @param {string} filterStatus - Optional: 'PAID' or 'UNPAID'
 * Returns: { totalPlayers, paidCount, unpaidCount, totalCollected, totalPending, players: [...] }
 */
export async function getPaymentTracking(matchId, filterStatus = null) {
  const url = filterStatus
    ? `${MVP_ENDPOINTS.PAYMENT_TRACKING(matchId)}?filterStatus=${filterStatus}`
    : MVP_ENDPOINTS.PAYMENT_TRACKING(matchId);
  return apiFetch(url);
}

/**
 * Mark payment for a participant (requires auth, captain only)
 * @param {string} matchId
 * @param {number} userId - User ID of the player
 * @param {string} paymentMode - 'CASH' or 'UPI'
 */
export async function markPayment(matchId, userId, paymentMode) {
  return apiFetch(MVP_ENDPOINTS.MARK_PAYMENT(matchId), {
    method: 'POST',
    body: JSON.stringify({ userId, paymentMode }),
  });
}

// ============================================
// OTP Auth API
// ============================================

/**
 * Request OTP for phone number
 * Returns 204 on success (check console for hardcoded OTP: 123456)
 */
export async function sendOtp(phoneNumber) {
  return publicFetch(MVP_ENDPOINTS.REQUEST_OTP, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

/**
 * Verify OTP and get auth tokens
 * Returns: { accessToken, refreshToken, userId, phoneNumber, requiresProfile }
 */
export async function verifyOtp(phoneNumber, otpCode) {
  return publicFetch(MVP_ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otpCode }),
  });
}

/**
 * Update user profile (requires auth)
 * Required for new users after OTP verification
 */
export async function updateProfile(name, area) {
  return apiFetch(MVP_ENDPOINTS.UPDATE_PROFILE, {
    method: 'POST',
    body: JSON.stringify({ name, area }),
  });
}
