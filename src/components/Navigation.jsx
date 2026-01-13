/**
 * Main navigation bar component
 * Provides persistent navigation between Dashboard and Awards pages
 * Displays user info and logout button when authenticated
 */
export default function Navigation({ currentPage, onNavigateDashboard, onNavigateAwards, onNavigateProfile, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <h1>GameTeam</h1>
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
        </ul>

        {/* User Info and Logout */}
        {user && (
          <div className="nav-user">
            <span className="nav-user-name">{user.name}</span>
            <button className="nav-profile-button" onClick={onNavigateProfile}>
              Profile
            </button>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
