/**
 * OTP Authentication Modal for MVP
 * Handles phone-based OTP authentication flow
 * Shows on action, not as a login wall
 * 
 * Flow:
 * 1. Phone input -> sendOtp
 * 2. OTP input -> verifyOtp
 * 3. If requiresProfile -> Profile input -> updateProfile
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { PhoneInput, OtpInput, Input } from './Input';
import { PrimaryButton, GhostButton } from './Button';
import { useOtpAuth } from '../hooks/useOtpAuth';

/**
 * OTP Authentication Modal
 * Used when user takes an action requiring authentication
 */
export function OtpAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Verify Your Number',
  subtitle,
  actionLabel = 'continue',
}) {
  const {
    phone,
    step,
    loading,
    error,
    requiresProfile,
    sendOtp,
    verifyOtp,
    updateProfile,
    reset,
  } = useOtpAuth();

  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [localError, setLocalError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setPhoneInput('');
      setOtpInput('');
      setNameInput('');
      setAreaInput('');
      setLocalError('');
    }
  }, [isOpen, reset]);

  // Validate phone number (Indian 10 digits)
  const validatePhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  };

  // Handle phone submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const phoneError = validatePhone(phoneInput);
    if (phoneError) {
      setLocalError(phoneError);
      return;
    }

    try {
      // Format phone as +91XXXXXXXXXX
      const formattedPhone = `+91${phoneInput}`;
      await sendOtp(formattedPhone);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Handle OTP submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (otpInput.length !== 6) {
      setLocalError('Please enter the 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOtp(otpInput);
      // If profile not required, auth is complete
      if (!result.requiresProfile) {
        onSuccess?.(result);
      }
      // Otherwise, step will change to 'profile'
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Handle profile submit (for new users)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setLocalError('Please enter your name (at least 2 characters)');
      return;
    }

    if (!areaInput.trim()) {
      setLocalError('Please enter your area');
      return;
    }

    try {
      await updateProfile(nameInput.trim(), areaInput.trim());
      onSuccess?.({ name: nameInput.trim(), area: areaInput.trim() });
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Handle close
  const handleClose = () => {
    reset();
    setPhoneInput('');
    setOtpInput('');
    setNameInput('');
    setAreaInput('');
    setLocalError('');
    onClose?.();
  };

  const displayError = localError || error;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="small">
      {subtitle && <p className="mvp-modal-subtitle">{subtitle}</p>}

      {displayError && (
        <div className="mvp-otp-error">{displayError}</div>
      )}

      {/* Step 1: Phone number input */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit}>
          <div className="mvp-otp-info">
            <p>Enter your phone number to {actionLabel}</p>
          </div>
          <PhoneInput
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
            error={localError}
            autoFocus
          />
          <div className="mvp-otp-actions-stacked">
            <PrimaryButton type="submit" loading={loading} fullWidth>
              Send OTP
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* Step 2: OTP verification */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit}>
          <div className="mvp-otp-info">
            <p>
              OTP sent to <strong>{phone}</strong>
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              💡 Test OTP: <strong>123456</strong>
            </p>
          </div>
          <OtpInput
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            error={localError}
            autoFocus
          />
          <div className="mvp-otp-actions">
            <GhostButton type="button" onClick={() => reset()}>
              Change Number
            </GhostButton>
            <PrimaryButton type="submit" loading={loading} fullWidth={false}>
              Verify
            </PrimaryButton>
          </div>
          <div className="mvp-otp-resend">
            <GhostButton 
              type="button" 
              onClick={() => sendOtp(phone)} 
              disabled={loading}
            >
              Resend OTP
            </GhostButton>
          </div>
        </form>
      )}

      {/* Step 3: Profile setup (for new users) */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          <div className="mvp-otp-info">
            <p>Welcome! Please complete your profile</p>
          </div>
          <div className="mvp-form">
            <Input
              label="Your Name"
              name="name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g., Rahul Sharma"
              required
              autoFocus
            />
            <Input
              label="Your Area"
              name="area"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              placeholder="e.g., Koramangala"
              required
            />
          </div>
          <div className="mvp-otp-actions-stacked" style={{ marginTop: '16px' }}>
            <PrimaryButton type="submit" loading={loading} fullWidth>
              Complete Setup
            </PrimaryButton>
          </div>
        </form>
      )}

      <div className="mvp-otp-footer">
        <p className="mvp-otp-terms">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </Modal>
  );
}

/**
 * OTP Page (full screen version for routes)
 */
export function OtpAuthPage({ onSuccess, returnPath }) {
  const {
    phone,
    step,
    loading,
    error,
    requiresProfile,
    sendOtp,
    verifyOtp,
    updateProfile,
    reset,
  } = useOtpAuth();

  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [localError, setLocalError] = useState('');

  // Validate phone number
  const validatePhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  };

  // Handle phone submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const phoneError = validatePhone(phoneInput);
    if (phoneError) {
      setLocalError(phoneError);
      return;
    }

    try {
      const formattedPhone = `+91${phoneInput}`;
      await sendOtp(formattedPhone);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Handle OTP submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (otpInput.length !== 6) {
      setLocalError('Please enter the 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOtp(otpInput);
      if (!result.requiresProfile) {
        onSuccess?.();
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Handle profile submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setLocalError('Please enter your name (at least 2 characters)');
      return;
    }

    if (!areaInput.trim()) {
      setLocalError('Please enter your area');
      return;
    }

    try {
      await updateProfile(nameInput.trim(), areaInput.trim());
      onSuccess?.();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="mvp-page mvp-otp-page">
      <div className="mvp-otp-container">
        <h1 className="mvp-otp-title">Verify Your Number</h1>

        {displayError && (
          <div className="mvp-otp-error">{displayError}</div>
        )}

        {/* Step 1: Phone number input */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit}>
            <PhoneInput
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <PrimaryButton type="submit" loading={loading} fullWidth>
              Send OTP
            </PrimaryButton>
          </form>
        )}

        {/* Step 2: OTP verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div className="mvp-otp-info">
              <p>
                OTP sent to <strong>{phone}</strong>
              </p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                💡 Test OTP: <strong>123456</strong>
              </p>
            </div>
            <OtpInput
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <PrimaryButton type="submit" loading={loading} fullWidth>
              Verify OTP
            </PrimaryButton>
            <div className="mvp-otp-links">
              <GhostButton type="button" onClick={() => reset()}>
                Change Number
              </GhostButton>
              <GhostButton type="button" onClick={() => sendOtp(phone)} disabled={loading}>
                Resend OTP
              </GhostButton>
            </div>
          </form>
        )}

        {/* Step 3: Profile setup (for new users) */}
        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="mvp-otp-info">
              <p>Welcome! Please complete your profile</p>
            </div>
            <div className="mvp-form">
              <Input
                label="Your Name"
                name="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g., Rahul Sharma"
                required
                autoFocus
              />
              <Input
                label="Your Area"
                name="area"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                placeholder="e.g., Koramangala"
                required
              />
            </div>
            <PrimaryButton type="submit" loading={loading} fullWidth style={{ marginTop: '16px' }}>
              Complete Setup
            </PrimaryButton>
          </form>
        )}

        <div className="mvp-otp-footer">
          <p className="mvp-otp-terms">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
