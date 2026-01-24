/**
 * Match utility functions for MVP
 */

import {
  MATCH_HEALTH,
  MIN_PLAYERS,
  RISK_THRESHOLD,
  CRITICAL_THRESHOLD,
  PARTICIPANT_STATUS,
  USER_ROLES,
  PARTICIPANT_ROLES,
} from '../constants';

/**
 * Calculate match health status based on confirmed players
 */
export function getMatchHealth(confirmedCount) {
  if (confirmedCount >= MIN_PLAYERS) {
    return MATCH_HEALTH.SAFE;
  }
  if (confirmedCount >= CRITICAL_THRESHOLD) {
    return MATCH_HEALTH.RISK;
  }
  return MATCH_HEALTH.CRITICAL;
}

/**
 * Get health status color class
 */
export function getHealthColorClass(health) {
  switch (health) {
    case MATCH_HEALTH.SAFE:
      return 'health-safe';
    case MATCH_HEALTH.RISK:
      return 'health-risk';
    case MATCH_HEALTH.CRITICAL:
      return 'health-critical';
    default:
      return '';
  }
}

/**
 * Get the user's role in a match context
 * Per FRONTEND.md: captain | participant | visitor
 */
export function getUserRole(match, userId) {
  if (!match || !userId) return USER_ROLES.VISITOR;
  
  // Captain = creator of match
  if (match.captainId === userId) {
    return USER_ROLES.CAPTAIN;
  }
  
  // Check if user is in participants (per FRONTEND.md)
  const participant = match.participants?.find(p => p.userId === userId);
  if (participant) {
    return USER_ROLES.PARTICIPANT;
  }
  
  return USER_ROLES.VISITOR;
}

/**
 * Get participant's role (TEAM, BACKUP, EMERGENCY)
 */
export function getParticipantRole(match, userId) {
  const participant = match?.participants?.find(p => p.userId === userId);
  return participant?.role || null;
}

/**
 * Check if user is captain of a match
 */
export function isCaptain(match, userId) {
  return match?.captainId === userId;
}

/**
 * Count confirmed players (per FRONTEND.md)
 */
export function getConfirmedCount(participants = []) {
  return participants.filter(p => p.status === PARTICIPANT_STATUS.CONFIRMED).length;
}

/**
 * Count backed out players
 */
export function getBackedOutCount(participants = []) {
  return participants.filter(p => 
    p.status === PARTICIPANT_STATUS.BACKED_OUT ||
    p.status === PARTICIPANT_STATUS.NO_SHOW
  ).length;
}

/**
 * Group participants by role (per FRONTEND.md: TEAM, BACKUP, EMERGENCY)
 */
export function groupParticipantsByRole(participants = []) {
  return {
    team: participants.filter(p => p.role === PARTICIPANT_ROLES.TEAM),
    backup: participants.filter(p => p.role === PARTICIPANT_ROLES.BACKUP),
    emergency: participants.filter(p => p.role === PARTICIPANT_ROLES.EMERGENCY),
  };
}

/**
 * Group participants by status
 */
export function groupParticipantsByStatus(participants = []) {
  return {
    confirmed: participants.filter(p => p.status === PARTICIPANT_STATUS.CONFIRMED),
    backedOut: participants.filter(p => p.status === PARTICIPANT_STATUS.BACKED_OUT),
    noShow: participants.filter(p => p.status === PARTICIPANT_STATUS.NO_SHOW),
  };
}

/**
 * Check if match can be completed
 */
export function canCompleteMatch(match) {
  const confirmedCount = getConfirmedCount(match?.participants || []);
  return confirmedCount >= MIN_PLAYERS;
}

/**
 * Format match date/time for display
 */
export function formatMatchDateTime(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  // Check if today
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${timeStr}`;
  }
  
  // Check if tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  }
  
  // Otherwise show full date
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  return `${dateStr}, ${timeStr}`;
}

/**
 * Format match date for cards
 */
export function formatMatchDateShort(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time only
 */
export function formatTimeOnly(dateTime) {
  if (!dateTime) return '';
  
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if match is in the past
 */
export function isMatchPast(dateTime) {
  if (!dateTime) return false;
  return new Date(dateTime) < new Date();
}

/**
 * Get days until match (0 = today, 1 = tomorrow, etc.)
 */
export function getDaysUntilMatch(dateTime) {
  if (!dateTime) return -1;
  
  const matchDate = new Date(dateTime);
  const now = new Date();
  
  // Reset times to midnight for accurate day comparison
  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = matchDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if match is upcoming (within next 24 hours)
 */
export function isMatchUpcoming(dateTime) {
  if (!dateTime) return false;
  
  const matchDate = new Date(dateTime);
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return matchDate > now && matchDate <= twentyFourHoursLater;
}

/**
 * Extract location info from Google Maps URL
 */
export function parseGoogleMapsUrl(url) {
  if (!url) return null;
  
  try {
    // Try to extract coordinates from various Google Maps URL formats
    const patterns = [
      // Format: @lat,lng
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Format: !3d lat!4d lng
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
      // Format: q=lat,lng
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Format: ll=lat,lng
      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
          url,
        };
      }
    }
    
    // If no coordinates found, still return the URL
    return { url };
  } catch {
    return { url };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = '₹') {
  if (amount === null || amount === undefined) return '';
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

/**
 * Generate shareable match invite URL
 */
export function getMatchInviteUrl(token) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/m/${token}`;
}

/**
 * Generate shareable emergency invite URL
 */
export function getEmergencyInviteUrl(token) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/e/${token}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
