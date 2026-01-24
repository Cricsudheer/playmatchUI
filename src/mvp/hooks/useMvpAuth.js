/**
 * MVP Auth Hook
 * 
 * Simple auth state management for MVP routes
 * Uses localStorage for token storage
 * Completely separate from the existing app's auth system
 * 
 * Features:
 * - Auto-repair incomplete user data on initialization
 * - Cross-tab synchronization
 * - Refresh token support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MVP_AUTH_TOKEN_KEY, MVP_REFRESH_TOKEN_KEY, MVP_USER_KEY } from '../constants';

/**
 * Check if user data is complete (has all required fields)
 */
function isUserDataComplete(user) {
  return user && typeof user.name === 'string' && user.name.trim().length > 0;
}

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
  const repairAttempted = useRef(false);

  // Auto-repair incomplete user data on mount
  // This handles users who logged in before we started storing 'name'
  useEffect(() => {
    const repairIfNeeded = async () => {
      // Only attempt repair once per session
      if (repairAttempted.current) return;
      
      const { token, user } = getAuthState();
      
      // If authenticated but user data is incomplete, repair it
      if (token && !isUserDataComplete(user)) {
        repairAttempted.current = true;
        console.log('[useMvpAuth] Detected incomplete user data, attempting repair...');
        
        try {
          // Dynamically import to avoid circular dependencies
          const { repairUserData } = await import('../services/api');
          const repaired = await repairUserData();
          
          if (repaired) {
            // State will update via mvp-auth-change event
            console.log('[useMvpAuth] User data repaired successfully');
          }
        } catch (error) {
          console.error('[useMvpAuth] Failed to repair user data:', error);
        }
      }
    };
    
    repairIfNeeded();
  }, []);

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

  const login = useCallback((token, user, refreshToken = null) => {
    try {
      localStorage.setItem(MVP_AUTH_TOKEN_KEY, token);
      localStorage.setItem(MVP_USER_KEY, JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem(MVP_REFRESH_TOKEN_KEY, refreshToken);
      }
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
      localStorage.removeItem(MVP_REFRESH_TOKEN_KEY);
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
