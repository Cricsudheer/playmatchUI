import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { TeamSelector } from './TeamSelector';
import { useTeam } from '../../contexts/TeamContext';

export const Header = () => {
  const location = useLocation();
  const { selectedTeam } = useTeam();
  const [notificationCount] = useState(3); // Mock notification count

  // Don't show team selector on profile page
  const isProfilePage = location.pathname === '/app/profile';

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Admin',
      COORDINATOR: 'Coordinator',
      PLAYER: 'Player'
    };
    return labels[role] || role;
  };

  return (
    <header className="app-header">
      <div className="app-header-container">
        <div className="app-header-content">
          {/* Left side - Team Selector or App Name */}
          <div className="app-header-left">
            {!isProfilePage && selectedTeam ? (
              <div className="app-header-context">
                <TeamSelector />
              </div>
            ) : !isProfilePage ? (
              <div className="app-header-context">
                <TeamSelector />
              </div>
            ) : (
              <div className="app-header-title-wrapper">
                <h1 className="app-header-title">PlayMatch</h1>
              </div>
            )}
          </div>

          {/* Right side - Icons */}
          <div className="app-header-right">
            <button className="app-header-icon-btn" aria-label="Notifications">
              <Bell size={20} strokeWidth={2} />
              {notificationCount > 0 && (
                <span className="app-header-badge">{notificationCount}</span>
              )}
            </button>

            <button className="app-header-icon-btn" aria-label="Settings">
              <Settings size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
