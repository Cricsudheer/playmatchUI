/**
 * Request Status Badge Component
 * Displays colored badge based on request status
 */

import React from 'react';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: '#f59e0b', // Amber
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: '⏳',
  },
  APPROVED: {
    label: 'Approved',
    color: '#22c55e', // Green
    bgColor: 'rgba(34, 197, 94, 0.15)',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: '❌',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#6b7280', // Gray
    bgColor: 'rgba(107, 114, 128, 0.15)',
    icon: '🚫',
  },
};

export function RequestStatusBadge({ status, showIcon = true, size = 'default' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const sizeStyles = {
    small: { padding: '2px 8px', fontSize: '0.7rem' },
    default: { padding: '4px 12px', fontSize: '0.75rem' },
    large: { padding: '6px 16px', fontSize: '0.875rem' },
  };

  return (
    <span
      className="request-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: config.color,
        backgroundColor: config.bgColor,
        borderRadius: '9999px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        ...sizeStyles[size],
      }}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}

export default RequestStatusBadge;
