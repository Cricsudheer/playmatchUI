import React, { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { AwardsPage } from './pages/AwardsPage';
import './styles/main.css';

/**
 * Main App Component
 * Handles routing between Dashboard and Awards pages
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigateToAwards = () => {
    setCurrentPage('awards');
    window.scrollTo(0, 0);
  };

  const handleNavigateHome = () => {
    setCurrentPage('dashboard');
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentPage === 'dashboard' && (
        <DashboardPage onNavigateToAwards={handleNavigateToAwards} />
      )}
      {currentPage === 'awards' && <AwardsPage onNavigateHome={handleNavigateHome} />}
    </>
  );
}

