/**
 * Match Control Dashboard Page for MVP
 * THE MOST IMPORTANT SCREEN
 * Shows match status, player list, actions for captain
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMvpAuth } from '../hooks/useMvpAuth';
import { useMatch, useMatchMutations, useEmergency } from '../hooks/useMatch';
import {
  MatchDetailSkeleton,
  ErrorState,
  NotFoundError,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  ShareButton,
  StatusBadge,
  RoleBadge,
  EventTypeBadge,
  BallTypeBadge,
  PlayerList,
  PlayerCount,
  BackoutReasonModal,
  ConfirmModal,
} from '../components';
import {
  formatMatchDateTime,
  formatCurrency,
  getMatchHealth,
  getConfirmedCount,
  getUserRole,
  isCaptain,
  getMatchInviteUrl,
  copyToClipboard,
} from '../utils/matchUtils';
import {
  MATCH_STATUS,
  EMERGENCY_REQUEST_STATUS,
  USER_ROLES,
  MIN_PLAYERS,
} from '../constants';

export function MatchControlPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useMvpAuth();
  const { match, loading, error, refetch, setMatch } = useMatch(matchId);
  const { logBackout, completeMatch, cancelMatch, loading: mutationLoading } = useMatchMutations();
  const { requests, requestSlot, approveRequest, rejectRequest, loading: emergencyLoading } = useEmergency(matchId);

  // Local state
  const [showBackoutModal, setShowBackoutModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Derived state
  const userRole = useMemo(() => {
    return match && user ? getUserRole(match, user.id) : null;
  }, [match, user]);

  const isUserCaptain = userRole === USER_ROLES.CAPTAIN;

  const confirmedCount = useMemo(() => {
    return getConfirmedCount(match?.participants || []);
  }, [match]);

  const matchHealth = useMemo(() => {
    return getMatchHealth(confirmedCount);
  }, [confirmedCount]);

  const inviteUrl = useMemo(() => {
    return match?.inviteToken ? getMatchInviteUrl(match.inviteToken) : '';
  }, [match]);

  const canLock = confirmedCount >= MIN_PLAYERS;
  const isCompleted = match?.status === MATCH_STATUS.COMPLETED;
  const isCancelled = match?.status === MATCH_STATUS.CANCELLED;
  const isEmergencyEnabled = match?.emergencyEnabled === true;

  // Handle share
  const handleShare = async (result) => {
    if (result === 'copied') {
      toast.success('Link copied to clipboard!');
    } else if (result === 'shared') {
      toast.success('Shared successfully!');
    }
  };

  // Handle player removal
  const handleRemovePlayer = useCallback((player) => {
    setSelectedPlayer(player);
    setShowBackoutModal(true);
  }, []);

  const handleConfirmRemoval = async (reason) => {
    if (!selectedPlayer) return;

    try {
      // Use logBackout per FRONTEND.md spec
      await logBackout(matchId, selectedPlayer.userId, reason);
      toast.success(`${selectedPlayer.name} marked as backed out`);
      setShowBackoutModal(false);
      setSelectedPlayer(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to log backout');
    }
  };

  // Handle mark complete (per FRONTEND.md spec)
  const handleMarkComplete = async () => {
    try {
      await completeMatch(matchId);
      toast.success('Match marked as completed! Platform fee: ₹50');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to complete match');
    }
  };

  // Handle cancel match (per FRONTEND.md spec)
  const handleCancelMatch = async () => {
    try {
      await cancelMatch(matchId);
      toast.success('Match cancelled');
      setShowCancelModal(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel match');
    }
  };

  // Navigate to payments
  const handlePayments = () => {
    navigate(`/matches/${matchId}/payments`);
  };

  // Navigate to emergency approvals
  const handleEmergencyApprovals = () => {
    navigate(`/matches/${matchId}/emergency`);
  };

  if (loading) {
    return <MatchDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="mvp-page">
        <ErrorState
          title="Failed to load match"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mvp-page">
        <NotFoundError entity="Match" onGoHome={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="mvp-page mvp-match-control">
      {/* Header */}
      <header className="mvp-page-header">
        <GhostButton onClick={() => navigate('/')}>← Back</GhostButton>
        {userRole && <RoleBadge role={userRole} />}
      </header>

      {/* Match Summary */}
      <section className="mvp-match-summary">
        <div className="mvp-match-summary-header">
          <h1 className="mvp-match-title">{match.teamName || 'Match'}</h1>
          <StatusBadge health={matchHealth} />
        </div>

        <div className="mvp-match-meta">
          <div className="mvp-match-meta-item">
            <span className="mvp-meta-icon">📅</span>
            <span>{formatMatchDateTime(match.startTime)}</span>
          </div>
          {match.groundMapsUrl && (
            <div className="mvp-match-meta-item">
              <span className="mvp-meta-icon">📍</span>
              <a href={match.groundMapsUrl} target="_blank" rel="noopener noreferrer">
                View Location
              </a>
            </div>
          )}
          <div className="mvp-match-meta-item">
            <span className="mvp-meta-icon">🏏</span>
            <span>{match.overs} overs</span>
          </div>
          <div className="mvp-match-meta-item">
            <span className="mvp-meta-icon">💰</span>
            <span>{formatCurrency(match.feePerPerson)}/person</span>
          </div>
        </div>

        <div className="mvp-match-badges">
          <EventTypeBadge eventType={match.eventType} />
          <BallTypeBadge
            category={match.ballCategory}
            variant={match.ballVariant}
          />
        </div>
      </section>

      {/* Player Count Progress */}
      <section className="mvp-match-section">
        <PlayerCount confirmed={confirmedCount} total={MIN_PLAYERS} />
      </section>

      {/* Share Button */}
      {inviteUrl && !isCompleted && (
        <section className="mvp-match-section">
          <ShareButton url={inviteUrl} onShare={handleShare} />
        </section>
      )}

      {/* Emergency Section (Captain only) */}
      {isUserCaptain && isEmergencyEnabled && !isCompleted && (
        <section className="mvp-match-section mvp-emergency-section">
          <div className="mvp-emergency-header">
            <h3 className="mvp-section-title">🚨 Emergency Players</h3>
            <span className="mvp-emergency-status mvp-emergency-status--active">
              Enabled
            </span>
          </div>
          <div className="mvp-emergency-actions">
            <SecondaryButton onClick={handleEmergencyApprovals}>
              View Requests ({requests?.filter(r => r.status === EMERGENCY_REQUEST_STATUS.REQUESTED).length || 0})
            </SecondaryButton>
            <p className="mvp-emergency-hint">
              Emergency Fee: {formatCurrency(match.emergencyFee)}
            </p>
          </div>
        </section>
      )}

      {/* Player List (participants for captain view per FRONTEND.md) */}
      <section className="mvp-match-section">
        <h3 className="mvp-section-title">Players</h3>
        <PlayerList
          players={match.participants || []}
          groupByStatus
          showPayment={isUserCaptain}
          showActions={isUserCaptain && !isCompleted}
          onRemove={handleRemovePlayer}
          isCaptain={isUserCaptain}
        />
      </section>

      {/* Captain Actions */}
      {isUserCaptain && !isCompleted && !isCancelled && (
        <section className="mvp-match-section mvp-captain-actions">
          {/* Payments shortcut */}
          <SecondaryButton onClick={handlePayments}>
            💳 Track Payments
          </SecondaryButton>

          {/* Mark Complete */}
          <PrimaryButton onClick={handleMarkComplete} loading={mutationLoading}>
            ✓ Complete Match
          </PrimaryButton>

          {/* Cancel Match */}
          <SecondaryButton
            onClick={() => setShowCancelModal(true)}
            variant="danger"
          >
            Cancel Match
          </SecondaryButton>
        </section>
      )}

      {/* Completed State */}
      {isCompleted && (
        <section className="mvp-match-section mvp-completed-banner">
          <span className="mvp-completed-icon">✓</span>
          <span>This match has been completed</span>
        </section>
      )}

      {/* Modals */}
      <BackoutReasonModal
        isOpen={showBackoutModal}
        onClose={() => {
          setShowBackoutModal(false);
          setSelectedPlayer(null);
        }}
        onConfirm={handleConfirmRemoval}
        playerName={selectedPlayer?.name}
        loading={mutationLoading}
      />

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelMatch}
        title="Cancel Match?"
        message="Are you sure you want to cancel this match? This action cannot be undone."
        confirmLabel="Cancel Match"
        variant="danger"
        loading={mutationLoading}
      />
    </div>
  );
}
