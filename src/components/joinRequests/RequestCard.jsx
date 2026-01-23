/**
 * Request Card Component
 * Displays a single join request (for both player and captain views)
 */

import React from 'react';
import { RequestStatusBadge } from './RequestStatusBadge';

/**
 * Format a timestamp to relative time (e.g., "3 hours ago")
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Player View Request Card
 * Shows team info, status, and cancel option for pending
 */
export function PlayerRequestCard({ 
  request, 
  onCancel, 
  onViewTeam,
  isCancelling = false,
}) {
  const { 
    id, 
    teamId, 
    teamName, 
    requestStatus, 
    requestMessage,
    requestedAt,
    responseMessage,
  } = request;

  const isPending = requestStatus === 'PENDING';
  const isApproved = requestStatus === 'APPROVED';

  return (
    <div className="request-card" style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.teamInfo}>
          <span style={styles.teamIcon}>🏏</span>
          <span style={styles.teamName}>{teamName || 'Unknown Team'}</span>
        </div>
        <RequestStatusBadge status={requestStatus} size="small" />
      </div>

      {/* Timestamp */}
      <div style={styles.meta}>
        <span style={styles.timestamp}>
          {isPending ? 'Requested' : requestStatus === 'APPROVED' ? 'Approved' : 'Cancelled'}: {formatRelativeTime(requestedAt)}
        </span>
      </div>

      {/* User's message (if any) */}
      {requestMessage && (
        <div style={styles.messageSection}>
          <p style={styles.messageLabel}>Your message:</p>
          <p style={styles.messageText}>"{requestMessage}"</p>
        </div>
      )}

      {/* Response message (if approved) */}
      {isApproved && responseMessage && (
        <div style={{ ...styles.messageSection, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
          <p style={{ ...styles.messageLabel, color: '#22c55e' }}>Welcome message:</p>
          <p style={styles.messageText}>"{responseMessage}"</p>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        {isPending && (
          <button
            style={styles.cancelButton}
            onClick={() => onCancel(id)}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : '✕ Cancel Request'}
          </button>
        )}
        {isApproved && onViewTeam && (
          <button
            style={styles.viewButton}
            onClick={() => onViewTeam(teamId)}
          >
            → View Team
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Captain View Request Card
 * Shows user info, message, and approve/reject actions
 */
export function CaptainRequestCard({
  request,
  onApprove,
  onReject,
  onViewProfile,
  isApproving = false,
  isRejecting = false,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}) {
  const {
    id,
    userId,
    userName,
    requestMessage,
    requestedAt,
  } = request;

  const isProcessing = isApproving || isRejecting;

  return (
    <div 
      className="request-card captain-view" 
      style={{
        ...styles.card,
        ...(isSelected ? styles.cardSelected : {}),
      }}
    >
      {/* Header with checkbox */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(id, e.target.checked)}
              style={styles.checkbox}
              disabled={isProcessing}
            />
          )}
          <span style={styles.userIcon}>👤</span>
          <span style={styles.userName}>{userName || `User #${userId}`}</span>
        </div>
        <span style={styles.timestamp}>{formatRelativeTime(requestedAt)}</span>
      </div>

      {/* Message */}
      {requestMessage ? (
        <div style={styles.messageSection}>
          <p style={styles.messageText}>"{requestMessage}"</p>
        </div>
      ) : (
        <div style={styles.noMessage}>
          <span style={{ color: 'var(--text-muted)' }}>(No message provided)</span>
        </div>
      )}

      {/* Actions */}
      <div style={styles.captainActions}>
        <button
          style={styles.approveButton}
          onClick={() => onApprove(id)}
          disabled={isProcessing}
        >
          {isApproving ? 'Approving...' : '✓ Approve'}
        </button>
        <button
          style={styles.rejectButton}
          onClick={() => onReject(id)}
          disabled={isProcessing}
        >
          {isRejecting ? 'Rejecting...' : '✕ Reject'}
        </button>
        {onViewProfile && (
          <button
            style={styles.profileButton}
            onClick={() => onViewProfile(userId)}
            disabled={isProcessing}
          >
            👁 Profile
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
  },
  cardSelected: {
    border: '2px solid var(--primary, #1e88e5)',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  teamInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  teamIcon: {
    fontSize: '1.25rem',
  },
  teamName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userIcon: {
    fontSize: '1.25rem',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
  },
  meta: {
    marginBottom: '12px',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #9ca3af)',
  },
  messageSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  },
  messageLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  messageText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #cbd5e1)',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  noMessage: {
    marginBottom: '12px',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  captainActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  cancelButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    borderRadius: '8px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'var(--primary, #1e88e5)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  approveButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  profileButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    borderRadius: '8px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
};

export default PlayerRequestCard;
