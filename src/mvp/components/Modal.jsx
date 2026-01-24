/**
 * Modal component for MVP
 * Used for OTP auth, backout reasons, confirmations
 */

import React, { useEffect, useRef } from 'react';
import { GhostButton } from './Button';

/**
 * Base modal component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
  size = 'default', // 'default' | 'small' | 'large'
}) {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mvp-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`mvp-modal mvp-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="mvp-modal-header">
            <h2 id="modal-title" className="mvp-modal-title">{title}</h2>
            {showClose && (
              <button
                type="button"
                className="mvp-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="mvp-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation modal
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default' | 'danger'
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p className="mvp-modal-message">{message}</p>
      <div className="mvp-modal-actions">
        <GhostButton onClick={onClose} disabled={loading}>
          {cancelLabel}
        </GhostButton>
        <button
          type="button"
          className={`mvp-btn mvp-btn-primary ${variant === 'danger' ? 'mvp-btn-primary--danger' : ''}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/**
 * Alert/Info modal
 */
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonLabel = 'OK',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p className="mvp-modal-message">{message}</p>
      <div className="mvp-modal-actions mvp-modal-actions--center">
        <button
          type="button"
          className="mvp-btn mvp-btn-primary"
          onClick={onClose}
        >
          {buttonLabel}
        </button>
      </div>
    </Modal>
  );
}

/**
 * Bottom sheet modal (mobile-friendly)
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mvp-bottomsheet-backdrop" onClick={onClose}>
      <div
        className="mvp-bottomsheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mvp-bottomsheet-handle" />
        {title && <h3 className="mvp-bottomsheet-title">{title}</h3>}
        <div className="mvp-bottomsheet-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Share Link Modal - shown after match creation
 * Converts backend API URLs to frontend shareable URLs
 * Backend: http://localhost:8080/v2/mvp/invites/ABC123
 * Frontend: http://localhost:5173/m/ABC123 (team) or /e/ABC123 (emergency)
 */
export function ShareLinkModal({
  isOpen,
  onClose,
  teamInviteUrl,
  emergencyInviteUrl,
  matchId,
  teamName,
  emergencyEnabled,
  onNavigate,
}) {
  const [copiedTeam, setCopiedTeam] = React.useState(false);
  const [copiedEmergency, setCopiedEmergency] = React.useState(false);

  // Extract invite code from backend URL and create frontend shareable URL
  const extractInviteCode = (backendUrl) => {
    if (!backendUrl) return '';
    // Backend URL format: http://localhost:8080/v2/mvp/invites/ABC123
    // Extract the code after /invites/
    const match = backendUrl.match(/\/invites\/([A-Za-z0-9]+)$/);
    return match ? match[1] : '';
  };

  // Generate frontend URLs for sharing
  const teamInviteCode = extractInviteCode(teamInviteUrl);
  const emergencyInviteCode = extractInviteCode(emergencyInviteUrl);
  
  // Use current origin for frontend URLs
  const frontendOrigin = window.location.origin;
  const shareableTeamUrl = teamInviteCode ? `${frontendOrigin}/m/${teamInviteCode}` : '';
  const shareableEmergencyUrl = emergencyInviteCode ? `${frontendOrigin}/e/${emergencyInviteCode}` : '';

  const handleCopyTeam = async () => {
    try {
      await navigator.clipboard.writeText(shareableTeamUrl);
      setCopiedTeam(true);
      setTimeout(() => setCopiedTeam(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyEmergency = async () => {
    try {
      await navigator.clipboard.writeText(shareableEmergencyUrl);
      setCopiedEmergency(true);
      setTimeout(() => setCopiedEmergency(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTeam = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${teamName} for cricket!`,
          text: `You've been invited to join ${teamName} for a cricket match. Tap the link to respond!`,
          url: shareableTeamUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyTeam();
        }
      }
    } else {
      handleCopyTeam();
    }
  };

  const handleWhatsAppTeam = () => {
    const message = encodeURIComponent(`🏏 Join *${teamName}* for cricket!\n\nTap to respond: ${shareableTeamUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleWhatsAppEmergency = () => {
    const message = encodeURIComponent(`🚨 *${teamName}* needs emergency players!\n\nTap to join: ${shareableEmergencyUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleGoToMatch = () => {
    onNavigate?.();
  };

  if (!isOpen) return null;

  return (
    <div className="mvp-modal-backdrop">
      <div className="mvp-modal mvp-modal--large mvp-share-modal">
        <div className="mvp-share-modal-header">
          <div className="mvp-share-success-icon">🎉</div>
          <h2 className="mvp-share-modal-title">Match Created!</h2>
          <p className="mvp-share-modal-subtitle">
            Share the links with your team
          </p>
        </div>

        <div className="mvp-share-modal-content">
          {/* Team Name */}
          <div className="mvp-share-team-name">
            <span className="mvp-share-team-icon">🏏</span>
            <span>{teamName}</span>
          </div>

          {/* Team Invite Section */}
          <div className="mvp-share-section">
            <div className="mvp-share-section-header">
              <span className="mvp-share-section-icon">👥</span>
              <span className="mvp-share-section-title">Team Invite Link</span>
            </div>
            <p className="mvp-share-section-desc">Share with your regular team members</p>
            
            <div className="mvp-share-url-box">
              <input
                type="text"
                value={shareableTeamUrl}
                readOnly
                className="mvp-share-url-input"
              />
              <button
                type="button"
                onClick={handleCopyTeam}
                className={`mvp-share-copy-btn ${copiedTeam ? 'copied' : ''}`}
              >
                {copiedTeam ? '✓' : '📋'}
              </button>
            </div>

            <div className="mvp-share-buttons">
              <button
                type="button"
                className="mvp-share-btn mvp-share-btn--whatsapp"
                onClick={handleWhatsAppTeam}
              >
                📱 WhatsApp
              </button>
              <button
                type="button"
                className="mvp-share-btn mvp-share-btn--share"
                onClick={handleShareTeam}
              >
                📤 Share
              </button>
            </div>
          </div>

          {/* Emergency Invite Section (if enabled) */}
          {emergencyEnabled && shareableEmergencyUrl && (
            <div className="mvp-share-section mvp-share-section--emergency">
              <div className="mvp-share-section-header">
                <span className="mvp-share-section-icon">🚨</span>
                <span className="mvp-share-section-title">Emergency Invite Link</span>
              </div>
              <p className="mvp-share-section-desc">For external players when you need backups</p>
              
              <div className="mvp-share-url-box">
                <input
                  type="text"
                  value={shareableEmergencyUrl}
                  readOnly
                  className="mvp-share-url-input"
                />
                <button
                  type="button"
                  onClick={handleCopyEmergency}
                  className={`mvp-share-copy-btn ${copiedEmergency ? 'copied' : ''}`}
                >
                  {copiedEmergency ? '✓' : '📋'}
                </button>
              </div>

              <button
                type="button"
                className="mvp-share-btn mvp-share-btn--emergency"
                onClick={handleWhatsAppEmergency}
              >
                📱 Share Emergency Link
              </button>
            </div>
          )}

          {/* Tip */}
          <div className="mvp-share-tip">
            💡 <strong>Tip:</strong> Share the team link in your WhatsApp group so everyone can respond!
          </div>
        </div>

        <div className="mvp-share-modal-footer">
          <button
            type="button"
            className="mvp-btn mvp-btn-primary mvp-btn--full"
            onClick={handleGoToMatch}
          >
            Go to Match Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
