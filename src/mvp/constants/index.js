/**
 * MVP Constants for GameTeam
 * Match Survival OS for sports captains
 */

// Event types
export const EVENT_TYPES = {
  PRACTICE: 'PRACTICE',
  TOURNAMENT: 'TOURNAMENT',
  NETS: 'NETS',
};

export const EVENT_TYPE_OPTIONS = [
  { value: EVENT_TYPES.PRACTICE, label: 'Practice Match' },
  { value: EVENT_TYPES.TOURNAMENT, label: 'Tournament' },
  { value: EVENT_TYPES.NETS, label: 'Nets Session' },
];

// Ball categories and variants
export const BALL_CATEGORIES = {
  LEATHER: 'LEATHER',
  TENNIS: 'TENNIS',
};

export const BALL_VARIANTS = {
  LEATHER: {
    WHITE: 'WHITE',
    RED: 'RED',
    PINK: 'PINK',
  },
  TENNIS: {
    HARD: 'HARD',
    SOFT: 'SOFT',
  },
};

export const BALL_CATEGORY_OPTIONS = [
  { value: BALL_CATEGORIES.LEATHER, label: 'Leather Ball' },
  { value: BALL_CATEGORIES.TENNIS, label: 'Tennis Ball' },
];

export const BALL_VARIANT_OPTIONS = {
  [BALL_CATEGORIES.LEATHER]: [
    { value: BALL_VARIANTS.LEATHER.WHITE, label: 'White' },
    { value: BALL_VARIANTS.LEATHER.RED, label: 'Red' },
    { value: BALL_VARIANTS.LEATHER.PINK, label: 'Pink' },
  ],
  [BALL_CATEGORIES.TENNIS]: [
    { value: BALL_VARIANTS.TENNIS.HARD, label: 'Hard Tennis' },
    { value: BALL_VARIANTS.TENNIS.SOFT, label: 'Soft Tennis' },
  ],
};

// Match status (per FRONTEND.md spec)
export const MATCH_STATUS = {
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Player response values (for API calls)
export const RESPONSE_VALUES = {
  YES: 'YES',
  NO: 'NO',
};

// Participant status (returned from API)
export const PARTICIPANT_STATUS = {
  CONFIRMED: 'CONFIRMED',
  BACKED_OUT: 'BACKED_OUT',
  NO_SHOW: 'NO_SHOW',
};

// Emergency request status (per FRONTEND.md spec)
export const EMERGENCY_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

// Payment status (per FRONTEND.md spec)
export const PAYMENT_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
};

// Payment modes
export const PAYMENT_MODES = {
  CASH: 'CASH',
  UPI: 'UPI',
};

export const PAYMENT_MODE_OPTIONS = [
  { value: PAYMENT_MODES.CASH, label: 'Cash' },
  { value: PAYMENT_MODES.UPI, label: 'UPI' },
];

// Backout reasons (per FRONTEND.md spec)
export const BACKOUT_REASONS = {
  GENUINE: 'GENUINE',
  CONFLICT: 'CONFLICT',
  COMMUNICATION: 'COMMUNICATION',
  PAYMENT: 'PAYMENT',
  NO_SHOW: 'NO_SHOW',
  CAPTAIN_DECISION: 'CAPTAIN_DECISION',
};

export const BACKOUT_REASON_OPTIONS = [
  { value: BACKOUT_REASONS.GENUINE, label: 'Genuine emergency' },
  { value: BACKOUT_REASONS.CONFLICT, label: 'Scheduling conflict' },
  { value: BACKOUT_REASONS.COMMUNICATION, label: 'Miscommunication' },
  { value: BACKOUT_REASONS.PAYMENT, label: 'Payment issue' },
  { value: BACKOUT_REASONS.NO_SHOW, label: 'No-show' },
  { value: BACKOUT_REASONS.CAPTAIN_DECISION, label: 'Captain decision' },
];

// Participant roles (per FRONTEND.md spec)
export const PARTICIPANT_ROLES = {
  TEAM: 'TEAM',
  BACKUP: 'BACKUP',
  EMERGENCY: 'EMERGENCY',
};

// User role in match context (derived)
export const USER_ROLES = {
  CAPTAIN: 'CAPTAIN',
  PARTICIPANT: 'PARTICIPANT',
  VISITOR: 'VISITOR',
};

// Match health status
export const MATCH_HEALTH = {
  SAFE: 'SAFE',        // 11+ confirmed
  RISK: 'RISK',        // 8-10 confirmed
  CRITICAL: 'CRITICAL', // <8 confirmed
};

// Minimum players required
export const MIN_PLAYERS = 11;
export const RISK_THRESHOLD = 10;
export const CRITICAL_THRESHOLD = 8;

// Emergency lock duration (in minutes)
export const EMERGENCY_LOCK_DURATION = 60;

// Overs range
export const OVERS_MIN = 1;
export const OVERS_MAX = 50;

// API endpoints for MVP (matching backend /v2/mvp/ routes)
export const MVP_ENDPOINTS = {
  // Auth endpoints
  REQUEST_OTP: '/v2/mvp/auth/otp/request',
  VERIFY_OTP: '/v2/mvp/auth/otp/verify',
  UPDATE_PROFILE: '/v2/mvp/auth/profile',
  REFRESH_TOKEN: '/v2/mvp/auth/refresh-token',
  
  // Match endpoints
  MATCHES: '/v2/mvp/matches',
  MY_GAMES: '/v2/mvp/matches/my-games',
  MATCH_BY_ID: (id) => `/v2/mvp/matches/${id}`,
  RESPOND: (matchId) => `/v2/mvp/matches/${matchId}/respond`,
  COMPLETE_MATCH: (matchId) => `/v2/mvp/matches/${matchId}/complete`,
  CANCEL_MATCH: (matchId) => `/v2/mvp/matches/${matchId}/cancel`,
  
  // Invite endpoints (public, no auth required)
  RESOLVE_INVITE: (token) => `/v2/mvp/invites/${token}`,
  
  // Emergency endpoints
  EMERGENCY_REQUEST: (matchId) => `/v2/mvp/matches/${matchId}/emergency/request`,
  EMERGENCY_REQUESTS: (matchId) => `/v2/mvp/matches/${matchId}/emergency/requests`,
  APPROVE_EMERGENCY: (matchId, requestId) => `/v2/mvp/matches/${matchId}/emergency/${requestId}/approve`,
  REJECT_EMERGENCY: (matchId, requestId) => `/v2/mvp/matches/${matchId}/emergency/${requestId}/reject`,
  
  // Backout endpoint
  LOG_BACKOUT: (matchId) => `/v2/mvp/matches/${matchId}/backout`,
  
  // Payment endpoints
  MARK_PAYMENT: (matchId) => `/v2/mvp/matches/${matchId}/payments/mark`,
  PAYMENT_TRACKING: (matchId) => `/v2/mvp/matches/${matchId}/payments/tracking`,
};

// Storage keys for MVP
export const MVP_AUTH_TOKEN_KEY = 'gameteam_auth_token';
export const MVP_REFRESH_TOKEN_KEY = 'gameteam_refresh_token';
export const MVP_USER_KEY = 'gameteam_user';

export const MVP_STORAGE_KEYS = {
  AUTH_TOKEN: MVP_AUTH_TOKEN_KEY,
  REFRESH_TOKEN: MVP_REFRESH_TOKEN_KEY,
  USER: MVP_USER_KEY,
  PENDING_ACTION: 'gameteam_pending_action',
  INVITE_DATA: 'gameteam_invite_data',
};

// Action types for pending actions after OTP
export const PENDING_ACTION_TYPES = {
  CONFIRM_PLAY: 'CONFIRM_PLAY',
  DECLINE_PLAY: 'DECLINE_PLAY',
  REQUEST_EMERGENCY: 'REQUEST_EMERGENCY',
  CREATE_MATCH: 'CREATE_MATCH',
};
