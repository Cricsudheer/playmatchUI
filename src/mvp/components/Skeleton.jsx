/**
 * Skeleton loading component for MVP
 * Mobile-first, minimal loading states
 */

import React from 'react';

/**
 * Base skeleton element with shimmer animation
 */
export function Skeleton({ className = '', width, height, rounded = false }) {
  const style = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: rounded ? '50%' : '8px',
  };

  return <div className={`mvp-skeleton ${className}`} style={style} />;
}

/**
 * Skeleton for match card
 */
export function MatchCardSkeleton() {
  return (
    <div className="mvp-match-card mvp-skeleton-card">
      <div className="mvp-match-card-header">
        <Skeleton width="60%" height="1.25rem" />
        <Skeleton width="4rem" height="1.5rem" />
      </div>
      <div className="mvp-match-card-body">
        <Skeleton width="80%" height="0.875rem" />
        <Skeleton width="50%" height="0.875rem" />
      </div>
      <div className="mvp-match-card-footer">
        <Skeleton width="5rem" height="1.75rem" />
        <Skeleton width="6rem" height="1rem" />
      </div>
    </div>
  );
}

/**
 * Skeleton for match detail page
 */
export function MatchDetailSkeleton() {
  return (
    <div className="mvp-page">
      <div className="mvp-skeleton-detail">
        <Skeleton height="2rem" width="70%" />
        <div className="mvp-skeleton-meta">
          <Skeleton width="40%" height="1rem" />
          <Skeleton width="30%" height="1rem" />
        </div>
        <div className="mvp-skeleton-status">
          <Skeleton width="100%" height="4rem" />
        </div>
        <div className="mvp-skeleton-list">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width="100%" height="3rem" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for invite page
 */
export function InvitePageSkeleton() {
  return (
    <div className="mvp-page mvp-invite-page">
      <div className="mvp-skeleton-invite">
        <Skeleton width="80%" height="1.5rem" />
        <Skeleton width="100%" height="8rem" />
        <div className="mvp-skeleton-actions">
          <Skeleton width="100%" height="3.5rem" />
          <Skeleton width="100%" height="3rem" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="mvp-page">
      <div style={{ marginBottom: '32px' }}>
        <Skeleton width="30%" height="0.875rem" />
        <div style={{ marginTop: '8px' }}>
          <Skeleton width="50%" height="1.5rem" />
        </div>
      </div>
      <div style={{ marginBottom: '32px' }}>
        <Skeleton width="100%" height="44px" />
      </div>
      <div>
        <Skeleton width="25%" height="0.75rem" />
        <div style={{ marginTop: '16px' }}>
          {[1, 2].map(i => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for player list
 */
export function PlayerListSkeleton({ count = 5 }) {
  return (
    <div className="mvp-skeleton-player-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mvp-skeleton-player-item">
          <Skeleton width="2.5rem" height="2.5rem" rounded />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.75rem" />
          </div>
          <Skeleton width="3rem" height="1.5rem" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageLoader({ message }) {
  return (
    <div className="mvp-page-loader">
      <div className="mvp-spinner" />
      {message && <p>{message}</p>}
    </div>
  );
}
