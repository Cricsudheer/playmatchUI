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
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';
import { OnboardingRoute } from './routes/OnboardingRoute';
import { AuthProvider } from './hooks/useAuth.jsx';
import { TeamProvider } from './contexts/TeamContext';
import { BootstrapGate } from './components/BootstrapGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import './styles/main.css';
import './styles/app.css';

// Lazy load onboarding
const OnboardingHub = React.lazy(() => import('./pages/OnboardingHub'));

/**
 * Main App
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TeamProvider>
          <Router>
            <Toaster position="top-right" richColors />
            <BootstrapGate>
            <React.Suspense
              fallback={
                <div className="loading-screen">
                  <div>Loading...</div>
                </div>
              }
            >
              <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <SignupPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Onboarding Route */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingRoute>
                      <OnboardingHub />
                    </OnboardingRoute>
                  </ProtectedRoute>
                }
              />

              {/* Profile Setup */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PlayerProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected App Routes (requires team) */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute requireTeam>
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

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/app/home" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
          </BootstrapGate>
        </Router>
      </TeamProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
