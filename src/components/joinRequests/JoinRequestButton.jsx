/**
 * Join Request Button Component
 * Smart button that handles different states:
 * - Not authenticated: "Login to Join"
 * - Already member: "Member" badge
 * - Pending request: "Request Pending" (disabled)
 * - Can request: "Request to Join"
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePendingRequestForTeam } from '../../hooks/useJoinRequests';

export function JoinRequestButton({
  teamId,
  teamName,
  isMember = false,
  onRequestJoin,
  onCancelRequest,
  size = 'default',
  fullWidth = false,
  disabled = false,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const pendingRequest = usePendingRequestForTeam(teamId);

  const hasPendingRequest = !!pendingRequest;

  // Size styles
  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '0.75rem' },
    default: { padding: '10px 20px', fontSize: '0.875rem' },
    large: { padding: '14px 28px', fontSize: '1rem' },
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <button
        style={{
          ...styles.button,
          ...styles.loginButton,
          ...sizeStyles[size],
          ...(fullWidth ? { width: '100%' } : {}),
        }}
        onClick={() => navigate('/login', { state: { returnTo: `/teams/${teamId}` } })}
      >
        🔒 Login to Join
      </button>
    );
  }

  // Already a member
  if (isMember) {
    return (
      <span
        style={{
          ...styles.badge,
          ...styles.memberBadge,
          ...sizeStyles[size],
        }}
      >
        ✅ Member
      </span>
    );
  }

  // Has pending request
  if (hasPendingRequest) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...(fullWidth ? { width: '100%' } : {}) }}>
        <span
          style={{
            ...styles.badge,
            ...styles.pendingBadge,
            ...sizeStyles[size],
            ...(fullWidth ? { width: '100%', textAlign: 'center' } : {}),
          }}
        >
          ⏳ Request Pending
        </span>
        {onCancelRequest && (
          <button
            style={{
              ...styles.cancelLink,
              fontSize: sizeStyles[size].fontSize,
            }}
            onClick={() => onCancelRequest(pendingRequest.id)}
          >
            Cancel Request
          </button>
        )}
      </div>
    );
  }

  // Can request to join
  return (
    <button
      style={{
        ...styles.button,
        ...styles.joinButton,
        ...sizeStyles[size],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(disabled ? styles.disabled : {}),
      }}
      onClick={() => onRequestJoin?.({ teamId, teamName })}
      disabled={disabled}
    >
      🏏 Request to Join
    </button>
  );
}

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  joinButton: {
    backgroundColor: 'var(--primary, #1e88e5)',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    color: 'var(--text-secondary, #cbd5e1)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: '8px',
    fontWeight: 600,
  },
  memberBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  cancelLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #9ca3af)',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default JoinRequestButton;
