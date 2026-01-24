import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// MVP GameTeam imports only
import {
  HomePage,
  CreateMatchPage,
  MatchControlPage,
  EmergencyApprovalPage,
  PaymentTrackingPage,
  ProfilePage,
  TeamInvitePage,
  EmergencyInvitePage,
} from './mvp/pages';
import { MvpProtectedRoute } from './mvp/components';
import './mvp/styles/mvp.css';

/**
 * GameTeam MVP App
 * Match Survival OS for Cricket Captains
 * 
 * Public Routes:
 * - /home - Landing page (shows OTP modal on action)
 * - /m/:token - Team invite link
 * - /e/:token - Emergency invite link
 * 
 * Protected Routes (require OTP auth):
 * - /matches/new - Create new match
 * - /matches/:id - Match control dashboard
 * - /matches/:id/payments - Payment tracking
 * - /matches/:id/emergency - Emergency approvals
 * - /profile - User profile
 */
function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* ================================================
            Public Routes - No Auth Required
            ================================================ */}
        
        {/* Home/Landing - OTP modal appears when action requires auth */}
        <Route path="/home" element={<HomePage />} />
        
        {/* Invite Links (shareable, public) */}
        <Route path="/m/:token" element={<TeamInvitePage />} />
        <Route path="/e/:token" element={<EmergencyInvitePage />} />

        {/* ================================================
            Protected Routes - Require MVP OTP Auth
            ================================================ */}
        
        {/* Create Match */}
        <Route
          path="/matches/new"
          element={
            <MvpProtectedRoute>
              <CreateMatchPage />
            </MvpProtectedRoute>
          }
        />
        
        {/* Match Control Dashboard (THE MOST IMPORTANT SCREEN) */}
        <Route
          path="/matches/:id"
          element={
            <MvpProtectedRoute>
              <MatchControlPage />
            </MvpProtectedRoute>
          }
        />
        
        {/* Payment Tracking (Captain only) */}
        <Route
          path="/matches/:id/payments"
          element={
            <MvpProtectedRoute>
              <PaymentTrackingPage />
            </MvpProtectedRoute>
          }
        />
        
        {/* Emergency Approvals (Captain only) */}
        <Route
          path="/matches/:id/emergency"
          element={
            <MvpProtectedRoute>
              <EmergencyApprovalPage />
            </MvpProtectedRoute>
          }
        />
        
        {/* User Profile */}
        <Route
          path="/profile"
          element={
            <MvpProtectedRoute>
              <ProfilePage />
            </MvpProtectedRoute>
          }
        />

        {/* ================================================
            Fallback - Redirect everything else to /home
            ================================================ */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

