import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { AwardsPage } from './pages/AwardsPage';
import './styles/main.css';

/**
 * Main App Component
 * Handles routing between Dashboard and Awards pages with URL-based navigation
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  return (
    <>
      <Navigation
        currentPage={currentPage}
        onNavigateDashboard={handleNavigateHome}
        onNavigateAwards={handleNavigateToAwards}
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

