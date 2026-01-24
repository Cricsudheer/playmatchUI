/**
 * MVP API Service
 * Handles all API calls for GameTeam MVP features
 * 
 * Error Handling: Follows RFC 7807 Problem Details format
 * Response format: { code, title, status, detail }
 */

import { API_CONFIG } from '../../constants/config';
import { MVP_ENDPOINTS, MVP_AUTH_TOKEN_KEY, MVP_USER_KEY } from '../constants';

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
 * Handle 401 Unauthorized - clear auth and redirect
 */
function handleUnauthorized() {
  localStorage.removeItem(MVP_AUTH_TOKEN_KEY);
  localStorage.removeItem(MVP_USER_KEY);
  window.dispatchEvent(new CustomEvent('mvp-auth-change'));
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
async function apiFetch(endpoint, options = {}) {
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
    // Handle 401 Unauthorized
    if (response.status === 401) {
      handleUnauthorized();
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
