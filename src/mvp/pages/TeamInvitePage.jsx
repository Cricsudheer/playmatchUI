/**
 * Team Invite Page for MVP (Public)
 * /m/:token - Player flow to respond to match invite
 * Works WITHOUT login - auth only on action
 * 
 * API Response from GET /v2/mvp/invites/{token}:
 * {
 *   "matchId": "uuid-here",
 *   "inviteType": "TEAM",
 *   "teamName": "Warriors XI",
 *   "eventType": "TOURNAMENT",
 *   "ballCategory": "LEATHER",
 *   "ballVariant": "PINK",
 *   "overs": 20,
 *   "groundMapsUrl": "https://maps.google.com/...",
 *   "startTime": "2026-01-25T14:00:00Z",
 *   "requiresAuth": false,
 *   "matchFees": 500
 * }
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMatchByToken, useMatchMutations } from '../hooks/useMatch';
import { useAuthAction, usePendingAction } from '../hooks/useOtpAuth';
import { useMvpAuth } from '../hooks/useMvpAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  InvitePageSkeleton,
  ErrorState,
  ExpiredInviteError,
  AlreadyRespondedError,
  PrimaryButton,
  SecondaryButton,
  OtpAuthModal,
} from '../components';
import {
  formatMatchDateTime,
  formatCurrency,
  isMatchPast,
} from '../utils/matchUtils';
import { PENDING_ACTION_TYPES, RESPONSE_VALUES } from '../constants';

// Helper to format ball info
const formatBallInfo = (category, variant) => {
  if (!category) return null;
  const cat = category.charAt(0) + category.slice(1).toLowerCase();
  const var_ = variant ? ` (${variant.charAt(0) + variant.slice(1).toLowerCase()})` : '';
  return `${cat}${var_}`;
};

// Helper to format event type
const formatEventType = (eventType) => {
  if (!eventType) return null;
  const types = {
    'TOURNAMENT': 'Tournament',
    'FRIENDLY': 'Friendly',
    'LEAGUE': 'League',
    'PRACTICE': 'Practice',
  };
  return types[eventType] || eventType.charAt(0) + eventType.slice(1).toLowerCase();
};

// Ball variant colors for visual accent
const getBallVariantColor = (variant) => {
  const colors = {
    'RED': '#dc2626',
    'WHITE': '#e2e8f0',
    'PINK': '#ec4899',
    'ORANGE': '#f97316',
  };
  return colors[variant] || '#64748b';
};

export function TeamInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useMvpAuth();
  const { match, loading, error, refetch } = useMatchByToken(token);
  const { respondToMatch, loading: responding } = useMatchMutations();
  const { showOtpModal, setShowOtpModal } = useAuthAction();
  const { savePendingAction, getPendingAction, clearPendingAction } = usePendingAction();
  
  usePageTitle(match?.teamName ? `Join ${match.teamName}` : 'Match Invite');

  const [responded, setResponded] = useState(false);
  const [userResponse, setUserResponse] = useState(null);
  const [pendingResponse, setPendingResponse] = useState(null);

  // Check if user already responded
  const existingResponse = match?.players?.find(p => p.userId === user?.id);

  // Execute pending action after auth
  useEffect(() => {
    const executePending = async () => {
      if (!isAuthenticated || !match) return;

      const pending = getPendingAction();
      if (!pending || !pending.data?.matchId) return;

      // Only process if the pending action is for this match
      if (pending.data.matchId !== match.id) return;

      try {
        if (pending.type === PENDING_ACTION_TYPES.CONFIRM_PLAY) {
          await respondToMatch(match.matchId, RESPONSE_VALUES.YES);
          toast.success("You're in! See you at the match.");
          setResponded(true);
          setUserResponse('YES');
        } else if (pending.type === PENDING_ACTION_TYPES.DECLINE_PLAY) {
          await respondToMatch(match.matchId, RESPONSE_VALUES.NO);
          toast.info('Response recorded. Maybe next time!');
          setResponded(true);
          setUserResponse('NO');
        }
      } catch (err) {
        toast.error(err.message || 'Failed to respond');
      } finally {
        clearPendingAction();
      }
    };

    executePending();
  }, [isAuthenticated, match, getPendingAction, clearPendingAction, respondToMatch]);

  // Handle play response
  const handlePlay = useCallback(async () => {
    if (!match) return;

    if (isAuthenticated) {
      try {
        await respondToMatch(match.matchId, RESPONSE_VALUES.YES);
        toast.success("You're in! See you at the match.");
        setResponded(true);
        setUserResponse('YES');
      } catch (err) {
        toast.error(err.message || 'Failed to respond');
      }
    } else {
      // Save pending action and show OTP modal
      savePendingAction(PENDING_ACTION_TYPES.CONFIRM_PLAY, { matchId: match.matchId });
      setPendingResponse('YES');
      setShowOtpModal(true);
    }
  }, [isAuthenticated, match, respondToMatch, savePendingAction, setShowOtpModal]);

  // Handle can't play response
  const handleCantPlay = useCallback(async () => {
    if (!match) return;

    if (isAuthenticated) {
      try {
        await respondToMatch(match.matchId, RESPONSE_VALUES.NO);
        toast.info('Response recorded. Maybe next time!');
        setResponded(true);
        setUserResponse('NO');
      } catch (err) {
        toast.error(err.message || 'Failed to respond');
      }
    } else {
      // Save pending action and show OTP modal
      savePendingAction(PENDING_ACTION_TYPES.DECLINE_PLAY, { matchId: match.matchId });
      setPendingResponse('NO');
      setShowOtpModal(true);
    }
  }, [isAuthenticated, match, respondToMatch, savePendingAction, setShowOtpModal]);

  // Handle OTP success - the useEffect above will handle the actual action
  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Page will reload after OTP, useEffect will pick up pending action
  };

  if (loading) {
    return <InvitePageSkeleton />;
  }

  if (error) {
    // Check if it's an expired/invalid invite
    if (error.includes('expired') || error.includes('not found') || error.includes('invalid')) {
      return (
        <div className="mvp-page mvp-invite-page">
          <ExpiredInviteError onGoHome={() => navigate('/')} />
        </div>
      );
    }

    return (
      <div className="mvp-page mvp-invite-page">
        <ErrorState
          title="Failed to load invite"
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

  // Check if already responded
  if (existingResponse && !responded) {
    return (
      <div className="mvp-page mvp-invite-page">
        <AlreadyRespondedError response={existingResponse.status} />
        <div className="mvp-invite-footer">
          <SecondaryButton onClick={() => navigate('/')}>
            Go to Home
          </SecondaryButton>
        </div>
      </div>
    );
  }

  // Response confirmation state
  if (responded) {
    return (
      <div className="mvp-page mvp-invite-page mvp-invite-page--confirmed">
        <div className="mvp-invite-confirmation">
          <div className="mvp-invite-confirmation-icon">
            {userResponse === 'YES' ? '✓' : '✗'}
          </div>
          <h1 className="mvp-invite-confirmation-title">
            {userResponse === 'YES'
              ? "You're in!"
              : 'Got it!'}
          </h1>
          <p className="mvp-invite-confirmation-text">
            {userResponse === 'YES'
              ? 'See you at the match. Check your matches for details.'
              : "Maybe next time. We've recorded your response."}
          </p>
        </div>
        <div className="mvp-invite-footer">
          <PrimaryButton onClick={() => navigate('/')}>
            {isAuthenticated ? 'View My Matches' : 'Done'}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mvp-page mvp-invite-page">
      {/* Invite Header */}
      <header className="mvp-invite-header">
        <span className="mvp-invite-label">You're invited to play</span>
        <h1 className="mvp-invite-team">{match?.teamName || 'Cricket Match'}</h1>
        
        {/* Event & Invite Type Badges */}
        <div className="mvp-invite-badges">
          {match?.eventType && (
            <span className="mvp-invite-badge mvp-invite-badge--event">
              {formatEventType(match.eventType)}
            </span>
          )}
          {match?.inviteType && (
            <span className={`mvp-invite-badge mvp-invite-badge--${match.inviteType.toLowerCase()}`}>
              {match.inviteType === 'TEAM' ? 'Team Invite' : 'Emergency'}
            </span>
          )}
        </div>
      </header>

      {/* Match Details Card */}
      <section className="mvp-invite-card">
        {/* Date & Time - Primary Info */}
        <div className="mvp-invite-detail mvp-invite-detail--primary">
          <span className="mvp-invite-detail-icon">📅</span>
          <span className="mvp-invite-detail-text">
            {formatMatchDateTime(match?.startTime)}
          </span>
        </div>

        {/* Match Format - Overs & Ball */}
        {(match?.overs || match?.ballCategory) && (
          <div className="mvp-invite-detail-group">
            {match?.overs && (
              <div className="mvp-invite-detail">
                <span className="mvp-invite-detail-text">
                  {match.overs} overs
                </span>
              </div>
            )}
            
            {match?.ballCategory && (
              <div className="mvp-invite-detail">
                <span 
                  className="mvp-invite-ball-indicator"
                  style={{ backgroundColor: getBallVariantColor(match.ballVariant) }}
                />
                <span className="mvp-invite-detail-text">
                  {formatBallInfo(match.ballCategory, match.ballVariant)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        {match?.groundMapsUrl && (
          <div className="mvp-invite-detail">
            <span className="mvp-invite-detail-icon">📍</span>
            <a
              href={match.groundMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mvp-invite-detail-link"
            >
              View location
            </a>
          </div>
        )}

        {/* Match Fee - Highlighted */}
        <div className="mvp-invite-detail mvp-invite-detail--highlighted">
          <span className="mvp-invite-detail-icon">₹</span>
          <span className="mvp-invite-detail-text">
            {formatCurrency(match?.matchFees || 0)} per player
          </span>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="mvp-invite-actions">
        <PrimaryButton
          onClick={handlePlay}
          loading={responding && pendingResponse === 'YES'}
          variant="success"
        >
          I'm playing
        </PrimaryButton>
        <SecondaryButton
          onClick={handleCantPlay}
          loading={responding && pendingResponse === 'NO'}
        >
          Can't make it
        </SecondaryButton>
      </section>

      {/* OTP Modal */}
      <OtpAuthModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          clearPendingAction();
          setPendingResponse(null);
        }}
        onSuccess={handleOtpSuccess}
        title="Verify to respond"
        subtitle="Enter your phone number to confirm"
      />
    </div>
  );
}
