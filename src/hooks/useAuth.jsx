import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { getAccessToken, getUser, clearAuth } from '../utils/authUtils';

/**
 * Authentication Context
 */
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the app to provide shared auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const storedUser = getUser();

      if (token && storedUser) {
        // User has token and user data
        setUser(storedUser);
        setIsAuthenticated(true);
        setLoading(false);
      } else if (storedUser) {
        // User data exists but no token - try to refresh
        try {
          const data = await authService.refreshToken();
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Refresh failed - clear everything
          clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      } else {
        // No auth data
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const loginUser = async (email, password) => {
    try {
      setError('');
      const data = await authService.login(email, password);

      // Only set authenticated state after successful login
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      // Ensure auth state is cleared on error
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Register new user and auto-login
   */
  const registerUser = async (userData) => {
    try {
      setError('');

      // Clear any existing auth state before registration
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);

      const data = await authService.register(userData);

      // Only set authenticated state after successful registration AND login
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      // Ensure auth state is cleared on error
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Logout user
   */
  const logoutUser = () => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setError('');
  };

  /**
   * Refresh authentication token
   */
  const refreshAuth = async () => {
    try {
      const data = await authService.refreshToken();
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      logoutUser();
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * This ensures all components share the same auth state
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
