/**
 * MVP Routes Configuration
 * GameTeam - Match Survival OS
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// MVP Pages
import {
  HomePage,
  CreateMatchPage,
  MatchControlPage,
  EmergencyApprovalPage,
  PaymentTrackingPage,
  ProfilePage,
  TeamInvitePage,
  EmergencyInvitePage,
} from './pages';

/**
 * Protected Route wrapper for MVP
 * Redirects to home with OTP modal trigger instead of login page
 */
function MvpProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="mvp-page-loader">
        <div className="mvp-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // For MVP, unauthenticated users on protected routes go to home
  // where they can take actions that trigger OTP
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * MVP Routes Component
 * Add this to your main router
 */
export function MvpRoutes() {
  return (
    <Routes>
      {/* Public Routes (No Auth Required) */}
      <Route path="/m/:token" element={<TeamInvitePage />} />
      <Route path="/e/:token" element={<EmergencyInvitePage />} />

      {/* Authenticated Routes */}
      <Route
        path="/home"
        element={
          <MvpProtectedRoute>
            <HomePage />
          </MvpProtectedRoute>
        }
      />
      <Route
        path="/matches/new"
        element={
          <MvpProtectedRoute>
            <CreateMatchPage />
          </MvpProtectedRoute>
        }
      />
      <Route
        path="/matches/:id"
        element={
          <MvpProtectedRoute>
            <MatchControlPage />
          </MvpProtectedRoute>
        }
      />
      <Route
        path="/matches/:id/payments"
        element={
          <MvpProtectedRoute>
            <PaymentTrackingPage />
          </MvpProtectedRoute>
        }
      />
      <Route
        path="/matches/:id/emergency"
        element={
          <MvpProtectedRoute>
            <EmergencyApprovalPage />
          </MvpProtectedRoute>
        }
      />
      <Route
        path="/mvp/profile"
        element={
          <MvpProtectedRoute>
            <ProfilePage />
          </MvpProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * MVP Route Definitions for integration
 */
export const MVP_ROUTES = {
  // Public (no auth)
  TEAM_INVITE: '/m/:token',
  EMERGENCY_INVITE: '/e/:token',
  
  // Protected
  HOME: '/home',
  CREATE_MATCH: '/matches/new',
  MATCH_CONTROL: '/matches/:id',
  MATCH_PAYMENTS: '/matches/:id/payments',
  MATCH_EMERGENCY: '/matches/:id/emergency',
  PROFILE: '/mvp/profile',
};

export default MvpRoutes;
