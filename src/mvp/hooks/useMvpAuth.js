/**
 * MVP Auth Hook
 * 
 * Simple auth state management for MVP routes
 * Uses localStorage for token storage
 * Completely separate from the existing app's auth system
 */

import { useState, useEffect, useCallback } from 'react';
import { MVP_AUTH_TOKEN_KEY, MVP_USER_KEY } from '../constants';

/**
 * Get current MVP auth state from localStorage
 */
function getAuthState() {
  try {
    const token = localStorage.getItem(MVP_AUTH_TOKEN_KEY);
    const userJson = localStorage.getItem(MVP_USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user, isAuthenticated: !!token };
  } catch (error) {
    console.error('[useMvpAuth] Error reading auth state:', error);
    return { token: null, user: null, isAuthenticated: false };
  }
}

/**
 * Hook for MVP authentication
 */
export function useMvpAuth() {
  const [authState, setAuthState] = useState(getAuthState);

  // Listen for storage changes (in case auth happens in another tab/component)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === MVP_AUTH_TOKEN_KEY || e.key === MVP_USER_KEY) {
        setAuthState(getAuthState());
      }
    };

    // Also listen for custom auth event
    const handleAuthChange = () => {
      setAuthState(getAuthState());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mvp-auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mvp-auth-change', handleAuthChange);
    };
  }, []);

  const login = useCallback((token, user) => {
    try {
      localStorage.setItem(MVP_AUTH_TOKEN_KEY, token);
      localStorage.setItem(MVP_USER_KEY, JSON.stringify(user));
      setAuthState({ token, user, isAuthenticated: true });
      // Dispatch event for other components
      window.dispatchEvent(new Event('mvp-auth-change'));
    } catch (error) {
      console.error('[useMvpAuth] Error saving auth state:', error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(MVP_AUTH_TOKEN_KEY);
      localStorage.removeItem(MVP_USER_KEY);
      setAuthState({ token: null, user: null, isAuthenticated: false });
      // Dispatch event for other components
      window.dispatchEvent(new Event('mvp-auth-change'));
    } catch (error) {
      console.error('[useMvpAuth] Error clearing auth state:', error);
    }
  }, []);

  const refreshUser = useCallback(() => {
    setAuthState(getAuthState());
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshUser,
  };
}

export default useMvpAuth;
