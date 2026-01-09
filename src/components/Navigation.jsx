import { useState } from 'react';
import { logout } from '../services/authService';

/**
 * Main navigation bar component
 * Provides persistent navigation between Dashboard and Awards pages
 */
export default function Navigation({
  currentPage,
  onNavigateDashboard,
  onNavigateAwards,
  user,
  onLoginClick,
  onLogout,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <h1>PlayMatch</h1>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li>
            <button
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={onNavigateDashboard}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'awards' ? 'active' : ''}`}
              onClick={onNavigateAwards}
            >
              <span className="trophy-icon">🏆</span> Awards 2025
            </button>
          </li>

          {/* Auth Section */}
          {user ? (
            <li className="navbar-auth-user">
              <div className="user-dropdown">
                <button
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showUserMenu && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">{user.email}</div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </li>
          ) : (
            <li>
              <button className="nav-link login-btn" onClick={onLoginClick}>
                🔐 Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
