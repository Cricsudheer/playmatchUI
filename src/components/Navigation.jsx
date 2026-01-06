/**
 * Main navigation bar component
 * Provides persistent navigation between Dashboard and Awards pages
 */
export default function Navigation({ currentPage, onNavigateDashboard, onNavigateAwards }) {
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
        </ul>
      </div>
    </nav>
  );
}
