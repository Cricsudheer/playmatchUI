/**
 * Emergency Invite Page for MVP (Public)
 * /e/:token - Emergency player flow to request spot
 * Works WITHOUT login - auth only on action
 * 
 * API: GET /v2/mvp/invites/{token}
 * Response: { matchId, inviteType, teamName, groundMapsUrl, startTime, requiresAuth, matchFees }
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMatchByEmergencyToken, useEmergency } from '../hooks/useMatch';
import { useAuthAction, usePendingAction } from '../hooks/useOtpAuth';
import { useMvpAuth } from '../hooks/useMvpAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  InvitePageSkeleton,
  ErrorState,
  ExpiredInviteError,
  EmergencyExpiredError,
  PrimaryButton,
  SecondaryButton,
  OtpAuthModal,
  CircularCountdown,
} from '../components';
import {
  formatMatchDateTime,
  formatCurrency,
  isMatchPast,
} from '../utils/matchUtils';
import { PENDING_ACTION_TYPES, EMERGENCY_REQUEST_STATUS } from '../constants';

export function EmergencyInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useMvpAuth();
  const { match, loading, error, refetch } = useMatchByEmergencyToken(token);
  const { requestSlot, loading: requesting } = useEmergency(match?.matchId);
  const { showOtpModal, setShowOtpModal } = useAuthAction();
  const { savePendingAction, getPendingAction, clearPendingAction } = usePendingAction();
  
  usePageTitle(match?.teamName ? `Emergency - ${match.teamName}` : 'Emergency Invite');

  const [requested, setRequested] = useState(false);
  const [requestData, setRequestData] = useState(null);

  // Check if user already has a request
  const existingRequest = match?.emergencyRequests?.find(r => r.userId === user?.id);

  // Execute pending action after auth
  useEffect(() => {
    const executePending = async () => {
      if (!isAuthenticated || !match) return;

      const pending = getPendingAction();
      if (!pending || pending.type !== PENDING_ACTION_TYPES.REQUEST_EMERGENCY) return;
      if (pending.data?.matchId !== match.matchId) return;

      try {
        const result = await requestSlot();
        toast.success('Request submitted! Waiting for captain approval.');
        setRequested(true);
        setRequestData(result);
      } catch (err) {
        toast.error(err.message || 'Failed to submit request');
      } finally {
        clearPendingAction();
      }
    };

    executePending();
  }, [isAuthenticated, match, getPendingAction, clearPendingAction, requestSlot]);

  // Handle request to play
  const handleRequestToPlay = useCallback(async () => {
    if (!match) return;

    if (isAuthenticated) {
      try {
        const result = await requestSlot();
        toast.success('Request submitted! Waiting for captain approval.');
        setRequested(true);
        setRequestData(result);
      } catch (err) {
        toast.error(err.message || 'Failed to submit request');
      }
    } else {
      // Save pending action and show OTP modal
      savePendingAction(PENDING_ACTION_TYPES.REQUEST_EMERGENCY, { matchId: match.matchId });
      setShowOtpModal(true);
    }
  }, [isAuthenticated, match, requestSlot, savePendingAction, setShowOtpModal]);

  // Handle OTP success
  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Page will reload after OTP, useEffect will pick up pending action
  };

  // Handle countdown expire
  const handleCountdownExpire = () => {
    setRequestData(prev => prev ? { ...prev, status: EMERGENCY_REQUEST_STATUS.EXPIRED } : null);
  };

  if (loading) {
    return <InvitePageSkeleton />;
  }

  if (error) {
    if (error.includes('expired') || error.includes('not found') || error.includes('inactive')) {
      return (
        <div className="mvp-page mvp-invite-page">
          <ExpiredInviteError onGoHome={() => navigate('/')} />
        </div>
      );
    }

    return (
      <div className="mvp-page mvp-invite-page">
        <ErrorState
          title="Failed to load"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Check if match is in the past
  if (match && isMatchPast(match.startTime)) {
    return (
      <div className="mvp-page mvp-invite-page">
        <ExpiredInviteError onGoHome={() => navigate('/')} />
      </div>
    );
  }

  // Check if user already has a pending request
  if (existingRequest && !requested) {
    const isPending = existingRequest.status === EMERGENCY_REQUEST_STATUS.PENDING;
    const isApproved = existingRequest.status === EMERGENCY_REQUEST_STATUS.APPROVED;
    const isExpired = existingRequest.status === EMERGENCY_REQUEST_STATUS.EXPIRED;

    if (isExpired) {
      return (
        <div className="mvp-page mvp-invite-page">
          <EmergencyExpiredError />
        </div>
      );
    }

    return (
      <div className="mvp-page mvp-invite-page mvp-invite-page--waiting">
        <div className="mvp-emergency-waiting">
          {isApproved ? (
            <>
              <div className="mvp-emergency-approved-icon">✓</div>
              <h1 className="mvp-emergency-title">You're Approved!</h1>
              <p className="mvp-emergency-text">
                The captain approved your request. You're playing!
              </p>
            </>
          ) : isPending ? (
            <>
              {existingRequest.expiresAt && (
                <CircularCountdown
                  expiresAt={existingRequest.expiresAt}
                  createdAt={existingRequest.createdAt}
                  onExpire={() => refetch()}
                  size={120}
                />
              )}
              <h1 className="mvp-emergency-title">Waiting for Approval</h1>
              <p className="mvp-emergency-text">
                Your request has been sent to the captain. You'll be notified once approved.
              </p>
            </>
          ) : (
            <>
              <div className="mvp-emergency-rejected-icon">✗</div>
              <h1 className="mvp-emergency-title">Request Not Approved</h1>
              <p className="mvp-emergency-text">
                The captain did not approve your request. Better luck next time!
              </p>
            </>
          )}
        </div>
        <div className="mvp-invite-footer">
          <SecondaryButton onClick={() => navigate('/')}>
            {isAuthenticated ? 'View My Matches' : 'Done'}
          </SecondaryButton>
        </div>
      </div>
    );
  }

  // Request submitted state
  if (requested && requestData) {
    const isPending = requestData.status === EMERGENCY_REQUEST_STATUS.PENDING;
    const isExpired = requestData.status === EMERGENCY_REQUEST_STATUS.EXPIRED;

    if (isExpired) {
      return (
        <div className="mvp-page mvp-invite-page">
          <EmergencyExpiredError />
        </div>
      );
    }

    return (
      <div className="mvp-page mvp-invite-page mvp-invite-page--waiting">
        <div className="mvp-emergency-waiting">
          {requestData.expiresAt && (
            <CircularCountdown
              expiresAt={requestData.expiresAt}
              createdAt={requestData.createdAt}
              onExpire={handleCountdownExpire}
              size={120}
            />
          )}
          <h1 className="mvp-emergency-title">Request Submitted</h1>
          <p className="mvp-emergency-text">
            Waiting for captain approval. You'll be notified once approved.
          </p>
        </div>
        <div className="mvp-invite-footer">
          <SecondaryButton onClick={() => navigate('/')}>
            Done
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mvp-page mvp-invite-page mvp-emergency-invite">
      {/* Emergency Header */}
      <header className="mvp-invite-header mvp-invite-header--emergency">
        <span className="mvp-invite-label mvp-invite-label--emergency">
          🚨 Emergency Request
        </span>
        <h1 className="mvp-invite-team">{match?.teamName || 'Match'}</h1>
      </header>

      {/* Match Details Card */}
      <section className="mvp-invite-card">
        <div className="mvp-invite-detail">
          <span className="mvp-invite-detail-icon">📅</span>
          <span className="mvp-invite-detail-text">
            {formatMatchDateTime(match?.startTime)}
          </span>
        </div>

        {match?.groundMapsUrl && (
          <div className="mvp-invite-detail">
            <span className="mvp-invite-detail-icon">📍</span>
            <a
              href={match.groundMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mvp-invite-detail-link"
            >
              View Location
            </a>
          </div>
        )}

        {match?.matchFees > 0 && (
          <div className="mvp-invite-detail mvp-invite-detail--highlighted">
            <span className="mvp-invite-detail-icon">💰</span>
            <span className="mvp-invite-detail-text">
              <strong>{formatCurrency(match.matchFees)}</strong> match fee
            </span>
          </div>
        )}
      </section>

      {/* Warning */}
      <section className="mvp-emergency-warning">
        <span className="mvp-emergency-warning-icon">⚠️</span>
        <p className="mvp-emergency-warning-text">
          Requesting does not guarantee selection. Captain approval required.
        </p>
      </section>

      {/* Action Button */}
      <section className="mvp-invite-actions">
        <PrimaryButton
          onClick={handleRequestToPlay}
          loading={requesting}
        >
          Request to Play
        </PrimaryButton>
      </section>

      {/* OTP Modal */}
      <OtpAuthModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          clearPendingAction();
        }}
        onSuccess={handleOtpSuccess}
        title="Verify to Request"
        subtitle="Enter your phone number to submit your emergency request"
      />
    </div>
  );
}
