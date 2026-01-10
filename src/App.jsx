import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { AwardsPage } from './pages/AwardsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import './styles/main.css';

/**
 * Main App Content with Protected Routes
 * Handles routing between Dashboard and Awards pages with authentication
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout } = useAuth();

  // Update current page based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/awards')) {
      setCurrentPage('awards');
    } else {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const handleNavigateToAwards = () => {
    navigate('/awards');
    window.scrollTo(0, 0);
  };

  const handleNavigateHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Navigation
                currentPage={currentPage}
                onNavigateDashboard={handleNavigateHome}
                onNavigateAwards={handleNavigateToAwards}
                user={user}
                onLogout={handleLogout}
              />
              <DashboardPage onNavigateToAwards={handleNavigateToAwards} />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/awards"
        element={
          <ProtectedRoute>
            <>
              <Navigation
                currentPage={currentPage}
                onNavigateDashboard={handleNavigateHome}
                onNavigateAwards={handleNavigateToAwards}
                user={user}
                onLogout={handleLogout}
              />
              <AwardsPage />
            </>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

