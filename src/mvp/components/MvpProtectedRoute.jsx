import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { MVP_AUTH_TOKEN_KEY } from '../constants';

/**
 * MVP Protected Route
 * 
 * Simple auth check for MVP routes - only checks for MVP token
 * Does NOT use the existing app's auth system
 * 
 * If not authenticated, redirects to /home which will show
 * the OTP modal when needed (action-first UX)
 */
export function MvpProtectedRoute({ children }) {
  const location = useLocation();
  
  // Check for MVP token in localStorage
  const token = localStorage.getItem(MVP_AUTH_TOKEN_KEY);
  const isAuthenticated = !!token;
  
  if (!isAuthenticated) {
    // Redirect to home - the OTP modal will appear when they try to take action
    // Store intended destination for after auth
    return <Navigate to="/home" state={{ from: location.pathname }} replace />;
  }
  
  return children;
}

export default MvpProtectedRoute;
