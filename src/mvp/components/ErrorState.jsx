/**
 * Error state components for MVP
 * Professional, minimal error displays
 * No emojis - uses simple geometric shapes/text
 */

import React from 'react';
import { SecondaryButton } from './Button';

/**
 * Generic error display
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon">!</div>
      <h3 className="mvp-error-title">{title}</h3>
      {message && <p className="mvp-error-message">{message}</p>}
      {onRetry && (
        <SecondaryButton onClick={onRetry} fullWidth={false}>
          {retryLabel}
        </SecondaryButton>
      )}
    </div>
  );
}

/**
 * Expired invite error
 */
export function ExpiredInviteError({ onGoHome }) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon mvp-error-icon--muted">—</div>
      <h3 className="mvp-error-title">Invite expired</h3>
      <p className="mvp-error-message">
        This match invite has expired or is no longer valid.
      </p>
      {onGoHome && (
        <SecondaryButton onClick={onGoHome} fullWidth={false}>
          Go to home
        </SecondaryButton>
      )}
    </div>
  );
}

/**
 * Already responded error
 */
export function AlreadyRespondedError({ response }) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon mvp-error-icon--success">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="mvp-error-title">Already responded</h3>
      <p className="mvp-error-message">
        You have already responded to this match invitation.
        {response && ` Your response: ${response}`}
      </p>
    </div>
  );
}

/**
 * Permission denied error
 */
export function PermissionDeniedError({ message }) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="mvp-error-title">Access denied</h3>
      <p className="mvp-error-message">
        {message || "You don't have permission to view this page."}
      </p>
    </div>
  );
}

/**
 * Not found error
 */
export function NotFoundError({ entity = 'Page', onGoHome }) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon mvp-error-icon--muted">?</div>
      <h3 className="mvp-error-title">{entity} not found</h3>
      <p className="mvp-error-message">
        The {entity.toLowerCase()} you're looking for doesn't exist or has been removed.
      </p>
      {onGoHome && (
        <SecondaryButton onClick={onGoHome} fullWidth={false}>
          Go to home
        </SecondaryButton>
      )}
    </div>
  );
}

/**
 * Network error
 */
export function NetworkError({ onRetry }) {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2V10M10 14V18M2 10H10M10 10H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="mvp-error-title">Connection error</h3>
      <p className="mvp-error-message">
        Please check your internet connection and try again.
      </p>
      {onRetry && (
        <SecondaryButton onClick={onRetry} fullWidth={false}>
          Retry
        </SecondaryButton>
      )}
    </div>
  );
}

/**
 * Emergency request expired error
 */
export function EmergencyExpiredError() {
  return (
    <div className="mvp-error-state">
      <div className="mvp-error-icon mvp-error-icon--muted">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 5V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="mvp-error-title">Request expired</h3>
      <p className="mvp-error-message">
        Your emergency request has expired. The captain did not approve in time.
      </p>
    </div>
  );
}
