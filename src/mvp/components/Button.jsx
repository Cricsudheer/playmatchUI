/**
 * Button components for MVP
 * Mobile-first, single primary CTA per screen
 */

import React from 'react';

/**
 * Primary action button
 * Only ONE per screen for main action
 */
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = true,
  variant = 'default', // 'default' | 'success' | 'danger'
}) {
  const variantClass = variant !== 'default' ? `mvp-btn-primary--${variant}` : '';
  
  return (
    <button
      type={type}
      className={`mvp-btn mvp-btn-primary ${variantClass} ${fullWidth ? 'mvp-btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="mvp-btn-loading">
          <span className="mvp-spinner-small" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Secondary action button
 */
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = true,
  variant = 'default', // 'default' | 'danger'
}) {
  const variantClass = variant !== 'default' ? `mvp-btn-secondary--${variant}` : '';
  
  return (
    <button
      type={type}
      className={`mvp-btn mvp-btn-secondary ${variantClass} ${fullWidth ? 'mvp-btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="mvp-btn-loading">
          <span className="mvp-spinner-small" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Ghost/text button
 */
export function GhostButton({
  children,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="mvp-btn mvp-btn-ghost"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Icon button
 */
export function IconButton({
  icon,
  onClick,
  disabled = false,
  label,
  variant = 'default', // 'default' | 'danger' | 'success'
}) {
  const variantClass = variant !== 'default' ? `mvp-btn-icon--${variant}` : '';
  
  return (
    <button
      type="button"
      className={`mvp-btn-icon ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

/**
 * Floating action button (FAB)
 */
export function FloatingButton({
  children,
  onClick,
  label,
}) {
  return (
    <button
      type="button"
      className="mvp-fab"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/**
 * Share button with copy to clipboard
 */
export function ShareButton({ url, onShare }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url });
        onShare?.('shared');
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(url);
          onShare?.('copied');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      onShare?.('copied');
    }
  };

  return (
    <SecondaryButton onClick={handleShare} fullWidth>
      📤 Share Match Link
    </SecondaryButton>
  );
}
