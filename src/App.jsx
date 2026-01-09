import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LoginModal from './components/LoginModal';
import { DashboardPage } from './pages/DashboardPage';
import { AwardsPage } from './pages/AwardsPage';
import { getCurrentUser } from './services/authService';
import './styles/main.css';

/**
 * Main App Component
 * Handles routing between Dashboard and Awards pages with URL-based navigation
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

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

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <Navigation
        currentPage={currentPage}
        onNavigateDashboard={handleNavigateHome}
        onNavigateAwards={handleNavigateToAwards}
        user={user}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <Routes>
        <Route path="/" element={<DashboardPage onNavigateToAwards={handleNavigateToAwards} />} />
        <Route path="/awards" element={<AwardsPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

