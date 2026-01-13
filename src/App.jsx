import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/app/HomePage';
import { StatsPage } from './pages/app/StatsPage';
import { TeamsPage } from './pages/app/TeamsPage';
import { EventsPage } from './pages/app/EventsPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { TeamProvider } from './contexts/TeamContext';
import { Toaster } from 'sonner';
import './styles/main.css';
import './styles/app.css';

/**
 * Login Redirect Component
 * Redirects authenticated users to app home, otherwise shows login
 */
function LoginRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/app/home" replace /> : <LoginPage />;
}

/**
 * Signup Redirect Component
 * Redirects authenticated users to app home, otherwise shows signup
 */
function SignupRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/app/home" replace /> : <SignupPage />;
}

/**
 * Main App Content with Protected Routes
 * New routing structure with AppShell layout
 */
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/signup" element={<SignupRedirect />} />

      {/* Root redirect to app home */}
      <Route path="/" element={<Navigate to="/app/home" replace />} />

      {/* Protected App Routes with AppShell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<HomePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Full Profile Edit Page (outside AppShell) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PlayerProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <AppContent />
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}

