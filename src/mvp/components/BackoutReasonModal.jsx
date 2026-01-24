/**
 * Backout reason modal for MVP
 * Used when captain removes a confirmed player
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import { RadioGroup } from './Input';
import { PrimaryButton, GhostButton } from './Button';
import { BACKOUT_REASON_OPTIONS } from '../constants';

export function BackoutReasonModal({
  isOpen,
  onClose,
  onConfirm,
  playerName,
  loading = false,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Remove Player"
      size="default"
    >
      <div className="mvp-backout-modal">
        <p className="mvp-backout-subtitle">
          Why is <strong>{playerName}</strong> backing out?
        </p>

        <RadioGroup
          name="backoutReason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError('');
          }}
          options={BACKOUT_REASON_OPTIONS}
          error={error}
        />

        <div className="mvp-modal-actions">
          <GhostButton onClick={handleClose} disabled={loading}>
            Cancel
          </GhostButton>
          <PrimaryButton
            onClick={handleConfirm}
            loading={loading}
            fullWidth={false}
            variant="danger"
          >
            Remove Player
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
