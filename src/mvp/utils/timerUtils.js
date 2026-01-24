/**
 * Timer utility functions for MVP
 * Used for emergency countdown and other time-sensitive features
 */

import { EMERGENCY_LOCK_DURATION } from '../constants';

/**
 * Calculate remaining time in minutes and seconds
 */
export function getRemainingTime(expiresAt) {
  if (!expiresAt) return null;
  
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  
  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { minutes, seconds, expired: false };
}

/**
 * Format remaining time as MM:SS
 */
export function formatRemainingTime(expiresAt) {
  const time = getRemainingTime(expiresAt);
  
  if (!time || time.expired) {
    return '00:00';
  }
  
  const mins = String(time.minutes).padStart(2, '0');
  const secs = String(time.seconds).padStart(2, '0');
  
  return `${mins}:${secs}`;
}

/**
 * Format remaining time as human readable
 */
export function formatRemainingTimeHuman(expiresAt) {
  const time = getRemainingTime(expiresAt);
  
  if (!time || time.expired) {
    return 'Expired';
  }
  
  if (time.minutes > 0) {
    return `${time.minutes}m ${time.seconds}s remaining`;
  }
  
  return `${time.seconds}s remaining`;
}

/**
 * Calculate expiry time from now
 */
export function getExpiryTime(durationMinutes = EMERGENCY_LOCK_DURATION) {
  const now = new Date();
  return new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
}

/**
 * Check if time has expired
 */
export function isExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt) <= new Date();
}

/**
 * Get progress percentage for countdown
 */
export function getCountdownProgress(createdAt, expiresAt) {
  if (!createdAt || !expiresAt) return 0;
  
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  
  const total = end - start;
  const elapsed = now - start;
  
  if (elapsed >= total) return 100;
  if (elapsed <= 0) return 0;
  
  return Math.round((elapsed / total) * 100);
}

/**
 * Format time ago (e.g., "5 minutes ago")
 */
export function formatTimeAgo(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
