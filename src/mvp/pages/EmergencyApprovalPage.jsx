/**
 * Emergency Approval Page for MVP
 * Captain screen to approve/reject emergency player requests
 */

import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEmergency, useMatch } from '../hooks/useMatch';
import {
  PageLoader,
  ErrorState,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  EmergencyRequestBadge,
  CountdownBadge,
} from '../components';
import { formatCurrency, formatMatchDateTime } from '../utils/matchUtils';
import { EMERGENCY_REQUEST_STATUS } from '../constants';

export function EmergencyApprovalPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { match, loading: matchLoading } = useMatch(matchId);
  const {
    requests,
    loading,
    error,
    refetch,
    approveRequest,
    rejectRequest,
  } = useEmergency(matchId);

  const handleApprove = useCallback(async (requestId) => {
    try {
      await approveRequest(requestId);
      toast.success('Player approved!');
    } catch (err) {
      toast.error(err.message || 'Failed to approve request');
    }
  }, [approveRequest]);

  const handleReject = useCallback(async (requestId) => {
    try {
      await rejectRequest(requestId);
      toast.info('Request rejected');
    } catch (err) {
      toast.error(err.message || 'Failed to reject request');
    }
  }, [rejectRequest]);

  if (matchLoading || loading) {
    return <PageLoader message="Loading requests..." />;
  }

  if (error) {
    return (
      <div className="mvp-page">
        <ErrorState
          title="Failed to load requests"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === EMERGENCY_REQUEST_STATUS.PENDING);
  const processedRequests = requests.filter(r => r.status !== EMERGENCY_REQUEST_STATUS.PENDING);

  return (
    <div className="mvp-page mvp-emergency-approval">
      <header className="mvp-page-header">
        <GhostButton onClick={() => navigate(`/matches/${matchId}`)}>
          ← Back to Match
        </GhostButton>
        <h1 className="mvp-page-title">Emergency Requests</h1>
      </header>

      {/* Match info */}
      <section className="mvp-match-mini-card">
        <div className="mvp-match-mini-info">
          <span className="mvp-match-mini-name">{match?.teamName}</span>
          <span className="mvp-match-mini-date">{formatMatchDateTime(match?.dateTime)}</span>
        </div>
        <span className="mvp-match-mini-fee">
          Emergency fee: {formatCurrency(match?.emergencyFee)}
        </span>
      </section>

      {/* Pending requests */}
      <section className="mvp-emergency-section">
        <h2 className="mvp-section-title">
          Pending ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="mvp-empty-state mvp-empty-state--small">
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="mvp-emergency-list">
            {pendingRequests.map(request => (
              <div key={request.id} className="mvp-emergency-request-card">
                <div className="mvp-emergency-request-header">
                  <div className="mvp-emergency-player-info">
                    <span className="mvp-emergency-player-name">{request.playerName}</span>
                    <span className="mvp-emergency-player-phone">
                      +91 {request.phone?.slice(-4).padStart(10, '*')}
                    </span>
                  </div>
                  {request.expiresAt && (
                    <CountdownBadge expiresAt={request.expiresAt} />
                  )}
                </div>

                <div className="mvp-emergency-request-meta">
                  <span>Fee: {formatCurrency(match?.emergencyFee)}</span>
                </div>

                <div className="mvp-emergency-request-actions">
                  <SecondaryButton
                    onClick={() => handleReject(request.id)}
                    variant="danger"
                    fullWidth={false}
                  >
                    Reject
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => handleApprove(request.id)}
                    variant="success"
                    fullWidth={false}
                  >
                    Approve
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Processed requests */}
      {processedRequests.length > 0 && (
        <section className="mvp-emergency-section">
          <h2 className="mvp-section-title mvp-section-title--muted">
            Processed ({processedRequests.length})
          </h2>

          <div className="mvp-emergency-list mvp-emergency-list--processed">
            {processedRequests.map(request => (
              <div key={request.id} className="mvp-emergency-request-card mvp-emergency-request-card--processed">
                <div className="mvp-emergency-request-header">
                  <span className="mvp-emergency-player-name">{request.playerName}</span>
                  <EmergencyRequestBadge status={request.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
