/**
 * Pending Requests List Component
 * Captain view for managing pending join requests
 */

import React, { useState } from 'react';
import {
  usePendingJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useBulkApproveRequests,
  useBulkRejectRequests,
} from '../../hooks/useJoinRequests';
import { CaptainRequestCard } from './RequestCard';
import { toast } from 'sonner';

export function PendingRequestsList({ 
  teamId, 
  teamName,
  onViewProfile,
  showBulkActions = true,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [approveMessage, setApproveMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

  const { data, isLoading, error, refetch } = usePendingJoinRequests(teamId);
  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();
  const bulkApproveMutation = useBulkApproveRequests();
  const bulkRejectMutation = useBulkRejectRequests();

  const requests = data?.content || [];
  const totalCount = data?.totalElements || 0;

  // Handle individual approve
  const handleApprove = async (requestId) => {
    try {
      await approveMutation.mutateAsync({
        teamId,
        requestId,
        message: null,
      });
      toast.success('Request approved! Player added to team.');
    } catch (err) {
      if (err.message?.includes('already processed')) {
        toast.info('This request was already processed');
        refetch();
      } else {
        toast.error(err.message || 'Failed to approve request');
      }
    }
  };

  // Handle individual reject
  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        teamId,
        requestId,
        message: null,
      });
      toast.success('Request rejected');
    } catch (err) {
      if (err.message?.includes('already processed')) {
        toast.info('This request was already processed');
        refetch();
      } else {
        toast.error(err.message || 'Failed to reject request');
      }
    }
  };

  // Handle selection
  const handleSelect = (requestId, isSelected) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(requestId);
      } else {
        next.delete(requestId);
      }
      return next;
    });
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map((r) => r.id)));
    }
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;

    const requestIds = Array.from(selectedIds);
    try {
      const results = await bulkApproveMutation.mutateAsync({
        teamId,
        requestIds,
        message: approveMessage || null,
      });
      
      const successCount = results.filter((r) => r.success).length;
      toast.success(`Approved ${successCount} of ${requestIds.length} requests`);
      setSelectedIds(new Set());
      setApproveMessage('');
      setShowMessageInput(false);
    } catch (err) {
      toast.error('Bulk approve failed');
    }
  };

  // Bulk reject
  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to reject ${selectedIds.size} requests?`)) {
      return;
    }

    const requestIds = Array.from(selectedIds);
    try {
      const results = await bulkRejectMutation.mutateAsync({
        teamId,
        requestIds,
        message: null,
      });
      
      const successCount = results.filter((r) => r.success).length;
      toast.success(`Rejected ${successCount} of ${requestIds.length} requests`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error('Bulk reject failed');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Pending Join Requests</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={styles.skeleton}>
            <div style={styles.skeletonHeader}>
              <div style={{ ...styles.skeletonBox, width: '40%' }} />
              <div style={{ ...styles.skeletonBox, width: '20%' }} />
            </div>
            <div style={{ ...styles.skeletonBox, width: '80%', marginTop: '12px' }} />
            <div style={styles.skeletonActions}>
              <div style={{ ...styles.skeletonBox, width: '45%', height: '40px' }} />
              <div style={{ ...styles.skeletonBox, width: '45%', height: '40px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={styles.errorTitle}>Failed to load requests</h3>
          <p style={styles.errorText}>{error.message}</p>
          <button style={styles.retryButton} onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Pending Join Requests</h3>
        </div>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>✅</span>
          <h3 style={styles.emptyTitle}>All caught up!</h3>
          <p style={styles.emptyText}>No pending join requests for {teamName || 'this team'}</p>
        </div>
      </div>
    );
  }

  const isProcessing = approveMutation.isPending || rejectMutation.isPending || 
                       bulkApproveMutation.isPending || bulkRejectMutation.isPending;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          Pending Join Requests <span style={styles.count}>({totalCount})</span>
        </h3>
        <button style={styles.refreshButton} onClick={() => refetch()} disabled={isLoading}>
          ↻ Refresh
        </button>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && requests.length > 1 && (
        <div style={styles.bulkActions}>
          <div style={styles.selectAllRow}>
            <label style={styles.selectAllLabel}>
              <input
                type="checkbox"
                checked={selectedIds.size === requests.length}
                onChange={handleSelectAll}
                style={styles.checkbox}
              />
              Select All ({selectedIds.size} selected)
            </label>
          </div>

          {selectedIds.size > 0 && (
            <div style={styles.bulkButtons}>
              {showMessageInput ? (
                <div style={styles.messageInputRow}>
                  <input
                    type="text"
                    placeholder="Welcome message (optional)"
                    value={approveMessage}
                    onChange={(e) => setApproveMessage(e.target.value)}
                    style={styles.messageInput}
                  />
                  <button
                    style={styles.bulkApproveButton}
                    onClick={handleBulkApprove}
                    disabled={isProcessing}
                  >
                    ✓ Approve {selectedIds.size}
                  </button>
                  <button
                    style={styles.cancelMessageButton}
                    onClick={() => setShowMessageInput(false)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    style={styles.bulkApproveButton}
                    onClick={() => setShowMessageInput(true)}
                    disabled={isProcessing}
                  >
                    ✓ Approve Selected ({selectedIds.size})
                  </button>
                  <button
                    style={styles.bulkRejectButton}
                    onClick={handleBulkReject}
                    disabled={isProcessing}
                  >
                    ✕ Reject Selected
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Request List */}
      <div style={styles.list}>
        {requests.map((request) => (
          <CaptainRequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewProfile={onViewProfile}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
            showCheckbox={showBulkActions && requests.length > 1}
            isSelected={selectedIds.has(request.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Pagination hint */}
      {totalCount > requests.length && (
        <p style={styles.paginationHint}>
          Showing {requests.length} of {totalCount} requests
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
    margin: 0,
  },
  count: {
    fontWeight: 400,
    color: 'var(--text-muted, #9ca3af)',
  },
  refreshButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    borderRadius: '6px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  bulkActions: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
  },
  selectAllRow: {
    marginBottom: '12px',
  },
  selectAllLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #cbd5e1)',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  bulkButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  messageInputRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  messageInput: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: '6px',
    color: 'var(--text-primary, #fff)',
    fontSize: '0.875rem',
  },
  bulkApproveButton: {
    padding: '8px 16px',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  bulkRejectButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  cancelMessageButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    borderRadius: '6px',
    color: 'var(--text-muted, #9ca3af)',
    cursor: 'pointer',
  },
  list: {},
  paginationHint: {
    textAlign: 'center',
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #9ca3af)',
    marginTop: '16px',
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
  },
  errorState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  errorIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#ef4444',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '0.9375rem',
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '16px',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary, #1e88e5)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
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
  },
  skeletonActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
};

export default PendingRequestsList;
