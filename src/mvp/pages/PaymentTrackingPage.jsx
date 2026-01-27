/**
 * Payment Tracking Page for MVP
 * Captain screen to track and mark player payments
 * Uses dedicated /payments/tracking API endpoint
 */

import React, { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMatch, usePayments } from '../hooks/useMatch';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  PageLoader,
  ErrorState,
  GhostButton,
} from '../components';
import { formatCurrency, formatMatchDateTime } from '../utils/matchUtils';
import { PAYMENT_STATUS, PARTICIPANT_ROLES } from '../constants';

// Format role for display
function formatRole(role) {
  const roleLabels = {
    [PARTICIPANT_ROLES.TEAM]: 'Team',
    [PARTICIPANT_ROLES.BACKUP]: 'Backup',
    [PARTICIPANT_ROLES.EMERGENCY]: 'Emergency',
  };
  return roleLabels[role] || role;
}

// Format date for payment time
function formatPaymentTime(paidAt) {
  if (!paidAt) return null;
  const date = new Date(paidAt);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PaymentTrackingPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { match, loading: matchLoading, error: matchError } = useMatch(matchId);
  const { paymentData, loading: paymentsLoading, error: paymentsError, refetch, markPayment } = usePayments(matchId);
  
  usePageTitle('Payment Tracking');

  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null); // null = all, 'PAID', 'UNPAID'

  // Handle filter change
  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
    refetch(status);
  }, [refetch]);

  // Mark payment with specific mode
  const handleMarkWithMode = useCallback(async (player, mode) => {
    if (player.paymentStatus === PAYMENT_STATUS.PAID) {
      toast.info('Payment already recorded');
      return;
    }

    try {
      setUpdatingId(player.userId);
      await markPayment(player.userId, mode);
      toast.success(`${player.playerName} marked as paid (${mode})`);
    } catch (err) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setUpdatingId(null);
    }
  }, [markPayment]);

  const loading = matchLoading || paymentsLoading;
  const error = matchError || paymentsError;

  if (loading && !paymentData) {
    return <PageLoader message="Loading payments..." />;
  }

  if (error) {
    return (
      <div className="mvp-page">
        <ErrorState
          title="Failed to load payments"
          message={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const players = paymentData?.players || [];

  return (
    <div className="mvp-page mvp-payments">
      <header className="mvp-page-header">
        <GhostButton onClick={() => navigate(`/matches/${matchId}`)}>
          ← Back to match
        </GhostButton>
        <h1 className="mvp-page-title">Payment tracking</h1>
      </header>

      {/* Match info */}
      <section className="mvp-match-mini-card">
        <div className="mvp-match-mini-info">
          <span className="mvp-match-mini-name">{match?.teamName}</span>
          <span className="mvp-match-mini-date">{formatMatchDateTime(match?.startTime)}</span>
        </div>
        {match?.matchFees > 0 && (
          <span className="mvp-match-mini-fee">
            {formatCurrency(match.matchFees)}/person
          </span>
        )}
      </section>

      {/* Summary */}
      <section className="mvp-payment-summary">
        <div className="mvp-payment-stat">
          <span className="mvp-payment-stat-value">
            {paymentData?.paidCount || 0}/{paymentData?.totalPlayers || 0}
          </span>
          <span className="mvp-payment-stat-label">Players paid</span>
        </div>
        <div className="mvp-payment-stat">
          <span className="mvp-payment-stat-value mvp-payment-stat-value--collected">
            {formatCurrency(paymentData?.totalCollected || 0)}
          </span>
          <span className="mvp-payment-stat-label">Collected</span>
        </div>
        <div className="mvp-payment-stat">
          <span className="mvp-payment-stat-value mvp-payment-stat-value--pending">
            {formatCurrency(paymentData?.totalPending || 0)}
          </span>
          <span className="mvp-payment-stat-label">Pending</span>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="mvp-payment-filters">
        <button
          type="button"
          className={`mvp-filter-tab ${filterStatus === null ? 'mvp-filter-tab--active' : ''}`}
          onClick={() => handleFilterChange(null)}
        >
          All
        </button>
        <button
          type="button"
          className={`mvp-filter-tab ${filterStatus === 'PAID' ? 'mvp-filter-tab--active' : ''}`}
          onClick={() => handleFilterChange('PAID')}
        >
          Paid ({paymentData?.paidCount || 0})
        </button>
        <button
          type="button"
          className={`mvp-filter-tab ${filterStatus === 'UNPAID' ? 'mvp-filter-tab--active' : ''}`}
          onClick={() => handleFilterChange('UNPAID')}
        >
          Unpaid ({paymentData?.unpaidCount || 0})
        </button>
      </div>

      {/* Player list */}
      <section className="mvp-payment-list">
        {players.length === 0 ? (
          <div className="mvp-empty-state">
            <p className="mvp-empty-title">No players found</p>
            <p>
              {filterStatus === 'PAID' && 'No payments recorded yet'}
              {filterStatus === 'UNPAID' && 'All payments collected'}
              {!filterStatus && 'No confirmed players yet'}
            </p>
          </div>
        ) : (
          players.map(player => (
            <div key={player.userId} className="mvp-payment-item">
              <div className="mvp-payment-player">
                <div className="mvp-player-avatar">
                  {player.playerName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="mvp-payment-player-info">
                  <div className="mvp-payment-player-name-row">
                    <span className="mvp-payment-player-name">{player.playerName}</span>
                    <span className="mvp-payment-role-tag">{formatRole(player.role)}</span>
                  </div>
                  <div className="mvp-payment-player-details">
                    <span className="mvp-payment-amount">{formatCurrency(player.feeAmount)}</span>
                    {player.phoneNumber && (
                      <a href={`tel:${player.phoneNumber}`} className="mvp-payment-phone">
                        {player.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mvp-payment-controls">
                {player.paymentStatus === PAYMENT_STATUS.PAID ? (
                  <div className="mvp-payment-paid-info">
                    <span className="mvp-payment-mode-badge">
                      {player.paymentMode || 'Paid'}
                    </span>
                    {player.paidAt && (
                      <span className="mvp-payment-time">
                        {formatPaymentTime(player.paidAt)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mvp-payment-actions">
                    <button
                      type="button"
                      className="mvp-payment-btn mvp-payment-btn--cash"
                      onClick={() => handleMarkWithMode(player, 'CASH')}
                      disabled={updatingId === player.userId}
                    >
                      {updatingId === player.userId ? '...' : 'Cash'}
                    </button>
                    <button
                      type="button"
                      className="mvp-payment-btn mvp-payment-btn--upi"
                      onClick={() => handleMarkWithMode(player, 'UPI')}
                      disabled={updatingId === player.userId}
                    >
                      {updatingId === player.userId ? '...' : 'UPI'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}