/**
 * Badge components for MVP
 * Status indicators with semantic colors
 * Per FRONTEND.md spec for data models
 */

import React from 'react';
import { 
  MATCH_HEALTH, 
  USER_ROLES, 
  PARTICIPANT_ROLES,
  PARTICIPANT_STATUS, 
  EMERGENCY_REQUEST_STATUS, 
  PAYMENT_STATUS 
} from '../constants';

/**
 * Match health status badge
 */
export function StatusBadge({ health }) {
  const config = {
    [MATCH_HEALTH.SAFE]: { label: 'Safe', className: 'mvp-badge-safe' },
    [MATCH_HEALTH.RISK]: { label: 'At Risk', className: 'mvp-badge-risk' },
    [MATCH_HEALTH.CRITICAL]: { label: 'Critical', className: 'mvp-badge-critical' },
  };

  const { label, className } = config[health] || config[MATCH_HEALTH.RISK];

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * User role badge (captain / participant per FRONTEND.md)
 */
export function RoleBadge({ role }) {
  const config = {
    [USER_ROLES.CAPTAIN]: { label: 'Captain', className: 'mvp-badge-captain' },
    [USER_ROLES.PARTICIPANT]: { label: 'Player', className: 'mvp-badge-player' },
  };

  const { label, className } = config[role] || {};
  if (!label) return null;

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * Participant role badge (TEAM, BACKUP, EMERGENCY per FRONTEND.md)
 */
export function ParticipantRoleBadge({ role }) {
  const config = {
    [PARTICIPANT_ROLES.TEAM]: { label: 'Team', className: 'mvp-badge-safe' },
    [PARTICIPANT_ROLES.BACKUP]: { label: 'Backup', className: 'mvp-badge-risk' },
    [PARTICIPANT_ROLES.EMERGENCY]: { label: 'Emergency', className: 'mvp-badge-emergency' },
  };

  const { label, className } = config[role] || {};
  if (!label) return null;

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * Participant status badge (CONFIRMED, BACKED_OUT, NO_SHOW per FRONTEND.md)
 */
export function ParticipantStatusBadge({ status }) {
  const config = {
    [PARTICIPANT_STATUS.CONFIRMED]: { label: 'Confirmed', className: 'mvp-badge-safe' },
    [PARTICIPANT_STATUS.BACKED_OUT]: { label: 'Backed Out', className: 'mvp-badge-critical' },
    [PARTICIPANT_STATUS.NO_SHOW]: { label: 'No Show', className: 'mvp-badge-muted' },
  };

  const { label, className } = config[status] || { label: 'Unknown', className: 'mvp-badge-muted' };

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * Emergency request status badge (per FRONTEND.md)
 */
export function EmergencyRequestBadge({ status }) {
  const config = {
    [EMERGENCY_REQUEST_STATUS.REQUESTED]: { label: 'Pending', className: 'mvp-badge-risk' },
    [EMERGENCY_REQUEST_STATUS.APPROVED]: { label: 'Approved', className: 'mvp-badge-safe' },
    [EMERGENCY_REQUEST_STATUS.REJECTED]: { label: 'Rejected', className: 'mvp-badge-critical' },
    [EMERGENCY_REQUEST_STATUS.EXPIRED]: { label: 'Expired', className: 'mvp-badge-muted' },
  };

  const { label, className } = config[status] || { label: 'Unknown', className: 'mvp-badge-muted' };

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * Payment status badge (PAID, UNPAID per FRONTEND.md)
 */
export function PaymentBadge({ status }) {
  const config = {
    [PAYMENT_STATUS.PAID]: { label: 'Paid', className: 'mvp-badge-safe' },
    [PAYMENT_STATUS.UNPAID]: { label: 'Unpaid', className: 'mvp-badge-risk' },
  };

  const { label, className } = config[status] || { label: 'Unpaid', className: 'mvp-badge-risk' };

  return <span className={`mvp-badge ${className}`}>{label}</span>;
}

/**
 * Event type badge
 */
export function EventTypeBadge({ eventType }) {
  return <span className="mvp-badge mvp-badge-muted">{eventType}</span>;
}

/**
 * Ball type badge
 */
export function BallTypeBadge({ category, variant }) {
  const label = variant ? `${category} - ${variant}` : category;
  return <span className="mvp-badge mvp-badge-muted">{label}</span>;
}
