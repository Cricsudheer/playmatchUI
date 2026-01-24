/**
 * OTP Authentication Hook for MVP
 * Handles OTP flow and pending action resumption
 * 
 * Flow:
 * 1. sendOtp(phoneNumber) -> returns 204
 * 2. verifyOtp(phoneNumber, otpCode) -> returns { accessToken, userId, requiresProfile }
 * 3. If requiresProfile, call updateProfile(name, area)
 */

import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { useMvpAuth } from './useMvpAuth';
import { MVP_STORAGE_KEYS, PENDING_ACTION_TYPES } from '../constants';

/**
 * Hook for OTP authentication flow
 */
export function useOtpAuth() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requiresProfile, setRequiresProfile] = useState(false);
  const [tempAuthData, setTempAuthData] = useState(null);
  const { isAuthenticated, login } = useMvpAuth();

  /**
   * Request OTP for phone number
   * Returns 204 on success
   */
  const sendOtp = useCallback(async (phoneNumber) => {
    try {
      setLoading(true);
      setError(null);
      await api.sendOtp(phoneNumber);
      setPhone(phoneNumber);
      setStep('otp');
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify OTP and check if profile is needed
   * Returns: { accessToken, refreshToken, userId, phoneNumber, requiresProfile }
   */
  const verifyOtp = useCallback(async (otpCode) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.verifyOtp(phone, otpCode);
      
      if (result.requiresProfile) {
        // Store auth data temporarily, will complete login after profile
        setTempAuthData(result);
        setRequiresProfile(true);
        setStep('profile');
        return result;
      }
      
      // Complete login immediately if profile not required
      if (result.accessToken) {
        const user = {
          id: result.userId,
          phone: result.phoneNumber,
        };
        login(result.accessToken, user);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phone, login]);

  /**
   * Update profile for new users
   */
  const updateProfile = useCallback(async (name, area) => {
    try {
      setLoading(true);
      setError(null);
      
      // First complete the login with temp auth data
      if (tempAuthData?.accessToken) {
        const user = {
          id: tempAuthData.userId,
          phone: tempAuthData.phoneNumber,
          name,
          area,
        };
        login(tempAuthData.accessToken, user);
      }
      
      // Then update profile on backend
      await api.updateProfile(name, area);
      
      setTempAuthData(null);
      setRequiresProfile(false);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tempAuthData, login]);

  /**
   * Reset OTP flow
   */
  const reset = useCallback(() => {
    setPhone('');
    setStep('phone');
    setError(null);
    setRequiresProfile(false);
    setTempAuthData(null);
  }, []);

  return {
    phone,
    step,
    loading,
    error,
    requiresProfile,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    updateProfile,
    reset,
  };
}

/**
 * Hook for managing pending actions (to resume after OTP)
 */
export function usePendingAction() {
  /**
   * Save pending action before OTP flow
   */
  const savePendingAction = useCallback((actionType, actionData) => {
    const pending = {
      type: actionType,
      data: actionData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(MVP_STORAGE_KEYS.PENDING_ACTION, JSON.stringify(pending));
  }, []);

  /**
   * Get pending action after OTP success
   */
  const getPendingAction = useCallback(() => {
    try {
      const stored = localStorage.getItem(MVP_STORAGE_KEYS.PENDING_ACTION);
      if (!stored) return null;
      
      const pending = JSON.parse(stored);
      
      // Check if action is still valid (within 10 minutes)
      const savedAt = new Date(pending.savedAt);
      const now = new Date();
      const tenMinutes = 10 * 60 * 1000;
      
      if (now - savedAt > tenMinutes) {
        clearPendingAction();
        return null;
      }
      
      return pending;
    } catch {
      return null;
    }
  }, []);

  /**
   * Clear pending action
   */
  const clearPendingAction = useCallback(() => {
    localStorage.removeItem(MVP_STORAGE_KEYS.PENDING_ACTION);
  }, []);

  /**
   * Execute pending action
   */
  const executePendingAction = useCallback(async (mutations) => {
    const pending = getPendingAction();
    if (!pending) return null;

    try {
      switch (pending.type) {
        case PENDING_ACTION_TYPES.CONFIRM_PLAY:
          await mutations.respondToMatch(pending.data.matchId, 'YES');
          break;
        case PENDING_ACTION_TYPES.DECLINE_PLAY:
          await mutations.respondToMatch(pending.data.matchId, 'NO');
          break;
        case PENDING_ACTION_TYPES.REQUEST_EMERGENCY:
          await mutations.requestSlot(pending.data.matchId);
          break;
        case PENDING_ACTION_TYPES.CREATE_MATCH:
          return await mutations.createMatch(pending.data.matchData);
        default:
          break;
      }
    } finally {
      clearPendingAction();
    }
  }, [getPendingAction, clearPendingAction]);

  return {
    savePendingAction,
    getPendingAction,
    clearPendingAction,
    executePendingAction,
  };
}

/**
 * Hook to check auth and trigger OTP modal if needed
 */
export function useAuthAction() {
  const { isAuthenticated, user } = useMvpAuth();
  const { savePendingAction } = usePendingAction();
  const [showOtpModal, setShowOtpModal] = useState(false);

  /**
   * Execute action if authenticated, otherwise show OTP modal
   */
  const executeWithAuth = useCallback(async (actionFn, pendingActionType, pendingActionData) => {
    if (isAuthenticated) {
      // User is logged in, execute immediately
      return await actionFn();
    }

    // Save pending action and show OTP modal
    if (pendingActionType && pendingActionData) {
      savePendingAction(pendingActionType, pendingActionData);
    }
    setShowOtpModal(true);
    return null;
  }, [isAuthenticated, savePendingAction]);

  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  return {
    isAuthenticated,
    user,
    showOtpModal,
    setShowOtpModal,
    closeOtpModal,
    executeWithAuth,
  };
}
