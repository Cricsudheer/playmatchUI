/**
 * OTP Authentication Modal for MVP
 * Handles phone-based OTP authentication flow
 * Shows on action, not as a login wall
 * 
 * Design: Stripe/Linear inspired - clean, minimal, professional
 * 
 * Flow:
 * 1. Phone input -> sendOtp
 * 2. OTP input -> verifyOtp
 * 3. If requiresProfile -> Profile input -> updateProfile
 */

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { PrimaryButton } from './Button';
import { useOtpAuth } from '../hooks/useOtpAuth';

/**
 * Step indicator component
 */
function StepIndicator({ currentStep, totalSteps = 3 }) {
  const steps = ['Phone', 'Verify', 'Profile'];
  const currentIndex = currentStep === 'phone' ? 0 : currentStep === 'otp' ? 1 : 2;
  
  return (
    <div className="otp-steps">
      {steps.slice(0, totalSteps).map((label, index) => (
        <div 
          key={label}
          className={`otp-step ${index === currentIndex ? 'otp-step--active' : ''} ${index < currentIndex ? 'otp-step--completed' : ''}`}
        >
          <div className="otp-step-dot">
            {index < currentIndex ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          {index < totalSteps - 1 && <div className="otp-step-line" />}
        </div>
      ))}
    </div>
  );
}

/**
 * Refined phone input for auth flow
 */
function AuthPhoneInput({ value, onChange, disabled, autoFocus }) {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="otp-phone-field">
      <label className="otp-field-label">Mobile number</label>
      <div className="otp-phone-input-container">
        <div className="otp-phone-prefix">
          <span className="otp-phone-flag">🇮🇳</span>
          <span className="otp-phone-code">+91</span>
        </div>
        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={onChange}
          placeholder="10-digit number"
          maxLength={10}
          pattern="[0-9]{10}"
          disabled={disabled}
          className="otp-phone-input"
          inputMode="numeric"
          autoComplete="tel-national"
        />
      </div>
    </div>
  );
}

/**
 * Individual OTP digit input
 */
function OtpDigitInput({ value, onChange, onKeyDown, onPaste, inputRef, disabled }) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      disabled={disabled}
      className="otp-digit-input"
      autoComplete="one-time-code"
    />
  );
}

/**
 * 6-digit OTP input with individual boxes
 */
function AuthOtpInput({ value, onChange, disabled, autoFocus }) {
  const inputRefs = useRef([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join('').replace(/\s/g, '');
    onChange(newValue);
    
    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-code-field">
      <label className="otp-field-label">Verification code</label>
      <div className="otp-digit-container">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <OtpDigitInput
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digits[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * OTP Authentication Modal
 * Used when user takes an action requiring authentication
 */
export function OtpAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign in to continue',
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
      setLocalError('Please enter the 6-digit code');
      return;
    }

    try {
      const result = await verifyOtp(otpInput);
      if (!result.requiresProfile) {
        onSuccess?.(result);
      }
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

  // Format phone for display
  const formatPhoneDisplay = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '').slice(-10);
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const displayError = localError || error;
  const showProfileStep = step === 'profile' || requiresProfile;
  const totalSteps = showProfileStep ? 3 : 2;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="small" showClose={true}>
      <div className="otp-auth-container">
        {/* Header */}
        <div className="otp-auth-header">
          <h2 className="otp-auth-title">{step === 'profile' ? 'Complete your profile' : title}</h2>
          {step === 'phone' && (
            <p className="otp-auth-subtitle">
              {subtitle || `Enter your phone number to ${actionLabel}`}
            </p>
          )}
          {step === 'otp' && (
            <p className="otp-auth-subtitle">
              We sent a code to <strong>+91 {formatPhoneDisplay(phone)}</strong>
            </p>
          )}
          {step === 'profile' && (
            <p className="otp-auth-subtitle">
              Just a few details to get you started
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        {/* Error Message */}
        {displayError && (
          <div className="otp-error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* Step 1: Phone number input */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="otp-form">
            <AuthPhoneInput
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              autoFocus
            />
            
            <div className="otp-form-actions">
              <PrimaryButton type="submit" loading={loading} fullWidth>
                Continue
              </PrimaryButton>
            </div>
          </form>
        )}

        {/* Step 2: OTP verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="otp-form">
            <AuthOtpInput
              value={otpInput}
              onChange={setOtpInput}
              disabled={loading}
              autoFocus
            />

            {/* Dev hint - styled subtly */}
            <div className="otp-dev-hint">
              For testing, use code: <code>123456</code>
            </div>
            
            <div className="otp-form-actions">
              <PrimaryButton type="submit" loading={loading} fullWidth>
                Verify
              </PrimaryButton>
            </div>

            <div className="otp-secondary-actions">
              <button 
                type="button" 
                className="otp-link-button"
                onClick={() => reset()}
                disabled={loading}
              >
                Change number
              </button>
              <span className="otp-action-divider">·</span>
              <button 
                type="button" 
                className="otp-link-button"
                onClick={() => sendOtp(phone)}
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Profile setup (for new users) */}
        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="otp-form">
            <div className="otp-profile-fields">
              <div className="otp-text-field">
                <label className="otp-field-label">Your name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="otp-text-input"
                  autoFocus
                />
              </div>
              <div className="otp-text-field">
                <label className="otp-field-label">Area / Locality</label>
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="Koramangala, Bangalore"
                  className="otp-text-input"
                />
              </div>
            </div>
            
            <div className="otp-form-actions">
              <PrimaryButton type="submit" loading={loading} fullWidth>
                Get Started
              </PrimaryButton>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="otp-auth-footer">
          <p>By continuing, you agree to our <a href="/terms" className="otp-footer-link">Terms</a> and <a href="/privacy" className="otp-footer-link">Privacy Policy</a></p>
        </div>
      </div>
    </Modal>
  );
}

/**
 * OTP Page (full screen version for routes)
 * Stripe/Linear inspired - minimal, professional
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
      setLocalError('Please enter the 6-digit code');
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

  // Format phone for display
  const formatPhoneDisplay = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '').slice(-10);
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const displayError = localError || error;
  const showProfileStep = step === 'profile' || requiresProfile;
  const totalSteps = showProfileStep ? 3 : 2;

  return (
    <div className="otp-page">
      <div className="otp-page-container">
        {/* Logo/Brand */}
        <div className="otp-page-brand">
          <div className="otp-page-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
              <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="otp-page-brand-name">GameTeam</span>
        </div>

        {/* Card */}
        <div className="otp-page-card">
          {/* Header */}
          <div className="otp-auth-header">
            <h1 className="otp-page-title">
              {step === 'phone' && 'Sign in to your account'}
              {step === 'otp' && 'Check your phone'}
              {step === 'profile' && 'Complete your profile'}
            </h1>
            <p className="otp-auth-subtitle">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && (
                <>We sent a verification code to <strong>+91 {formatPhoneDisplay(phone)}</strong></>
              )}
              {step === 'profile' && 'Just a few details to get you started'}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} totalSteps={totalSteps} />

          {/* Error */}
          {displayError && (
            <div className="otp-error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
              </svg>
              <span>{displayError}</span>
            </div>
          )}

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="otp-form">
              <AuthPhoneInput
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
              />
              <div className="otp-form-actions">
                <PrimaryButton type="submit" loading={loading} fullWidth>
                  Continue
                </PrimaryButton>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="otp-form">
              <AuthOtpInput
                value={otpInput}
                onChange={setOtpInput}
                disabled={loading}
                autoFocus
              />

              <div className="otp-dev-hint">
                For testing, use code: <code>123456</code>
              </div>

              <div className="otp-form-actions">
                <PrimaryButton type="submit" loading={loading} fullWidth>
                  Verify
                </PrimaryButton>
              </div>

              <div className="otp-secondary-actions">
                <button 
                  type="button" 
                  className="otp-link-button"
                  onClick={() => reset()}
                  disabled={loading}
                >
                  Change number
                </button>
                <span className="otp-action-divider">·</span>
                <button 
                  type="button" 
                  className="otp-link-button"
                  onClick={() => sendOtp(phone)}
                  disabled={loading}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Profile */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="otp-form">
              <div className="otp-profile-fields">
                <div className="otp-text-field">
                  <label className="otp-field-label">Your name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="otp-text-input"
                    autoFocus
                  />
                </div>
                <div className="otp-text-field">
                  <label className="otp-field-label">Area / Locality</label>
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    placeholder="Koramangala, Bangalore"
                    className="otp-text-input"
                  />
                </div>
              </div>
              
              <div className="otp-form-actions">
                <PrimaryButton type="submit" loading={loading} fullWidth>
                  Get Started
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="otp-page-footer">
          <p>By continuing, you agree to our <a href="/terms" className="otp-footer-link">Terms</a> and <a href="/privacy" className="otp-footer-link">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
}
