/**
 * My Requests List Component
 * Displays player's join requests across all teams
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyJoinRequests, useCancelJoinRequest } from '../../hooks/useJoinRequests';
import { PlayerRequestCard } from './RequestCard';
import { toast } from 'sonner';

export function MyRequestsList({ onViewTeam }) {
  const navigate = useNavigate();
  const { data: requests, isLoading, error } = useMyJoinRequests();
  const cancelMutation = useCancelJoinRequest();

  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(requestId);
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel request');
    }
  };

  const handleViewTeam = (teamId) => {
    if (onViewTeam) {
      onViewTeam(teamId);
    } else {
      // Default: navigate to home with team selected
      navigate('/app/home');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={styles.skeleton}>
            <div style={styles.skeletonHeader}>
              <div style={{ ...styles.skeletonBox, width: '40%' }} />
              <div style={{ ...styles.skeletonBox, width: '20%' }} />
            </div>
            <div style={{ ...styles.skeletonBox, width: '60%', marginTop: '12px' }} />
            <div style={{ ...styles.skeletonBox, width: '100%', height: '40px', marginTop: '12px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>⚠️</span>
        <h3 style={styles.emptyTitle}>Failed to load requests</h3>
        <p style={styles.emptyText}>{error.message}</p>
      </div>
    );
  }

  // Empty state
  if (!requests || requests.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>🏏</span>
        <h3 style={styles.emptyTitle}>No requests yet</h3>
        <p style={styles.emptyText}>Browse teams and request to join</p>
        <button
          style={styles.discoverButton}
          onClick={() => navigate('/onboarding/find-team')}
        >
          Find Teams
        </button>
      </div>
    );
  }

  // Group by status
  const pending = requests.filter((r) => r.requestStatus === 'PENDING');
  const approved = requests.filter((r) => r.requestStatus === 'APPROVED');
  const cancelled = requests.filter((r) => r.requestStatus === 'CANCELLED');

  return (
    <div style={styles.container}>
      {/* Pending Requests */}
      {pending.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Pending Requests <span style={styles.count}>({pending.length})</span>
          </h3>
          {pending.map((request) => (
            <PlayerRequestCard
              key={request.id}
              request={request}
              onCancel={handleCancel}
              isCancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Approved Requests */}
      {approved.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Approved <span style={styles.count}>({approved.length})</span>
          </h3>
          {approved.map((request) => (
            <PlayerRequestCard
              key={request.id}
              request={request}
              onViewTeam={handleViewTeam}
            />
          ))}
        </div>
      )}

      {/* Cancelled Requests */}
      {cancelled.length > 0 && (
        <div style={styles.section}>
          <h3 style={{ ...styles.sectionTitle, color: 'var(--text-muted)' }}>
            Cancelled <span style={styles.count}>({cancelled.length})</span>
          </h3>
          {cancelled.map((request) => (
            <PlayerRequestCard
              key={request.id}
              request={request}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-secondary, #cbd5e1)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  count: {
    fontWeight: 400,
    color: 'var(--text-muted, #9ca3af)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.9375rem',
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '24px',
  },
  discoverButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary, #1e88e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  skeleton: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
  },
  skeletonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  skeletonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    height: '20px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default MyRequestsList;
