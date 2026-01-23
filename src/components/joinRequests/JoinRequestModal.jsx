/**
 * Join Request Modal Component
 * Modal for submitting a join request with optional message
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 500;

export function JoinRequestModal({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  isSubmitting = false,
}) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message.trim() || null);
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const charactersRemaining = MAX_MESSAGE_LENGTH - message.length;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Request to Join</h2>
          <button style={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Team Info */}
        <div style={styles.teamInfo}>
          <span style={styles.teamIcon}>🏏</span>
          <span style={styles.teamName}>{teamName}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Message to Team Admin <span style={styles.optional}>(Optional)</span>
            </label>
            <textarea
              style={styles.textarea}
              placeholder="Introduce yourself... e.g., I'm an all-rounder with 5 years of cricket experience. Looking forward to playing with the team!"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              rows={4}
              disabled={isSubmitting}
            />
            <div style={styles.charCount}>
              <span style={{ color: charactersRemaining < 50 ? '#f59e0b' : 'inherit' }}>
                {charactersRemaining} characters remaining
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span style={styles.spinner} />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <p style={styles.note}>
          💡 The team admin will review your request and respond. You'll be notified when they respond.
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary, #fff)',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #9ca3af)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  teamInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  teamIcon: {
    fontSize: '2rem',
  },
  teamName: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
    marginBottom: '8px',
  },
  optional: {
    fontWeight: 400,
    color: 'var(--text-muted, #9ca3af)',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: '10px',
    color: 'var(--text-primary, #fff)',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '0.75rem',
    color: 'var(--text-muted, #9ca3af)',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
    borderRadius: '10px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'var(--primary, #1e88e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  note: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #9ca3af)',
    marginTop: '16px',
    lineHeight: 1.5,
    textAlign: 'center',
  },
};

// Add keyframes for spinner animation via style tag
if (typeof document !== 'undefined' && !document.getElementById('modal-spinner-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'modal-spinner-styles';
  styleTag.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}

export default JoinRequestModal;
