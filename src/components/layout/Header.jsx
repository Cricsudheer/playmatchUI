import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { TeamSelector } from './TeamSelector';
import { usePendingRequestsCount } from '../../hooks/useJoinRequests';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get pending requests count for captains (requests waiting for their approval)
  const { data: pendingCount = 0 } = usePendingRequestsCount();

  // Don't show team selector on profile page
  const isProfilePage = location.pathname === '/app/profile';

  const handleNotificationsClick = () => {
    // Navigate to teams page with requests tab active
    navigate('/app/teams?tab=captain-requests');
  };

  return (
    <header className="app-header">
      <div className="app-header-container">
        <div className="app-header-content">
          {/* Left side - Team Selector or App Name */}
          <div className="app-header-left">
            {!isProfilePage ? (
              <div className="app-header-context">
                <TeamSelector />
              </div>
            ) : (
              <div className="app-header-title-wrapper">
                <h1 className="app-header-title">GameTeam</h1>
              </div>
            )}
          </div>

          {/* Right side - Icons */}
          <div className="app-header-right">
            <button 
              className="app-header-icon-btn" 
              aria-label="Notifications"
              onClick={handleNotificationsClick}
            >
              <Bell size={20} strokeWidth={2} />
              {pendingCount > 0 && (
                <span className="app-header-badge">{pendingCount > 9 ? '9+' : pendingCount}</span>
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
