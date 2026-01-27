/**
 * MVP Home Dashboard Page
 * Main landing page for MVP
 * Shows: Create Match CTA, Needs Attention, Your Matches
 * 
 * Public page - shows welcome state if not authenticated
 * OTP modal appears when user tries to create match or view their matches
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMyMatches } from '../hooks/useMatch';
import { useMvpAuth } from '../hooks/useMvpAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  PrimaryButton,
  GhostButton,
  MatchCard,
  MatchCardCompact,
  NoMatches,
  DashboardSkeleton,
  ErrorState,
  OtpAuthModal,
  ConfirmModal,
} from '../components';
import {
  getMatchHealth,
  isMatchPast,
} from '../utils/matchUtils';
import {
  MATCH_STATUS,
  MATCH_HEALTH,
  MIN_PLAYERS,
  PENDING_ACTION_TYPES,
} from '../constants';

export function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useMvpAuth();
  const { matches, stats, loading, error, refetch } = useMyMatches();
  
  usePageTitle(isAuthenticated ? 'My Matches' : null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  // Categorize matches based on API response
  // API returns: matchId, teamName, status, startTime, userRole, isCaptain, teamCount, backupCount, emergencyCount, etc.
  const { upcomingMatches, pastMatches, needsAttention } = useMemo(() => {
    if (!matches || matches.length === 0) {
      return { upcomingMatches: [], pastMatches: [], needsAttention: [] };
    }

    const upcoming = [];
    const past = [];
    const attention = [];

    matches.forEach(match => {
      const isPast = match.status === MATCH_STATUS.COMPLETED || 
                     match.status === MATCH_STATUS.CANCELLED ||
                     isMatchPast(match.startTime);

      if (isPast) {
        past.push(match);
      } else {
        upcoming.push(match);

        // Check if match needs attention
        // API provides: teamCount, backupCount, emergencyCount, isCaptain
        const confirmedCount = (match.teamCount || 0) + (match.backupCount || 0) + (match.emergencyCount || 0);
        const health = getMatchHealth(confirmedCount);

        // Captain attention items
        if (match.isCaptain) {
          // Match at risk (not enough players)
          if (health === MATCH_HEALTH.RISK || health === MATCH_HEALTH.CRITICAL) {
            attention.push({
              match,
              type: 'at_risk',
              label: `Only ${confirmedCount}/${match.requiredPlayers || MIN_PLAYERS} confirmed`,
            });
          }
        }
      }
    });

    // Sort upcoming by date (soonest first)
    upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Sort past by date (most recent first)
    past.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return {
      upcomingMatches: upcoming,
      pastMatches: past,
      needsAttention: attention,
    };
  }, [matches]);

  const handleCreateMatch = () => {
    if (!isAuthenticated) {
      // Show OTP modal to authenticate first
      setShowOtpModal(true);
      return;
    }
    navigate('/matches/new');
  };

  const handleOtpSuccess = (authUser) => {
    setShowOtpModal(false);
    // After auth, navigate to create match
    navigate('/matches/new');
  };

  const handleAttentionClick = (item) => {
    switch (item.type) {
      case 'emergency_approvals':
        navigate(`/matches/${item.match.id}/emergency`);
        break;
      case 'payments_pending':
        navigate(`/matches/${item.match.id}/payments`);
        break;
      default:
        navigate(`/matches/${item.match.id}`);
    }
  };

  // Show loading only if authenticated (otherwise show welcome)
  if (isAuthenticated && loading) {
    return <DashboardSkeleton />;
  }

  // Show error only if authenticated
  if (isAuthenticated && error) {
    return (
      <div className="mvp-page">
        <ErrorState
          title="Failed to load matches"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Welcome state for unauthenticated users - Landing Page
  if (!isAuthenticated) {
    return (
      <div className="mvp-page mvp-landing">
        {/* Hero Section */}
        <section className="mvp-landing-hero">
          <p className="mvp-landing-welcome">Welcome to GameTeam</p>
          
          <h1 className="mvp-landing-headline">
            Organise Matches.
            <br />
            <span className="mvp-landing-headline-accent">Not WhatsApp Groups.</span>
          </h1>

          <div className="mvp-landing-cta-group">
            <PrimaryButton onClick={handleCreateMatch} className="mvp-landing-cta">
              Create your match
            </PrimaryButton>
          </div>
        </section>

        {/* OTP Modal */}
        <OtpAuthModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          actionLabel="create a match"
        />
      </div>
    );
  }

  return (
    <div className="mvp-page mvp-dashboard">
      {/* Header */}
      <header className="mvp-dashboard-header">
        <div className="mvp-dashboard-header-top">
          <div>
            <p className="mvp-dashboard-greeting">Welcome back</p>
            <h1 className="mvp-dashboard-title">
              {user?.name?.split(' ')[0] || 'Captain'}
            </h1>
          </div>
          <button
            className="mvp-header-logout-btn"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Primary CTA - Always visible */}
      <section className="mvp-dashboard-cta">
        <PrimaryButton onClick={handleCreateMatch}>
          Create match
        </PrimaryButton>
      </section>

      {/* Needs Attention Section - Conditional */}
      {needsAttention.length > 0 && (
        <section className="mvp-dashboard-section">
          <h2 className="mvp-section-title mvp-section-title--attention">
            Needs attention
          </h2>
          <div className="mvp-attention-list">
            {needsAttention.slice(0, 5).map((item, index) => (
              <MatchCardCompact
                key={`${item.match.id}-${item.type}-${index}`}
                match={item.match}
                label={item.label}
                onClick={() => handleAttentionClick(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Your Matches Section */}
      <section className="mvp-dashboard-section">
        <h2 className="mvp-section-title">Your matches</h2>

        {upcomingMatches.length === 0 && pastMatches.length === 0 ? (
          <NoMatches message="No matches yet" />
        ) : (
          <>
            {/* Upcoming matches */}
            {upcomingMatches.length > 0 && (
              <div className="mvp-match-list">
                {upcomingMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userId={user?.id}
                  />
                ))}
              </div>
            )}

            {/* Past matches - collapsed */}
            {pastMatches.length > 0 && (
              <details className="mvp-past-matches">
                <summary className="mvp-past-matches-toggle">
                  Past matches ({pastMatches.length})
                </summary>
                <div className="mvp-match-list mvp-match-list--past">
                  {pastMatches.slice(0, 10).map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      userId={user?.id}
                    />
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </section>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        confirmVariant="danger"
      />
    </div>
  );
}
