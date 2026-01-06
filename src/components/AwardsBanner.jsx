/**
 * Awards Banner Component
 * Displays promotional banner linking to awards page
 */
export function AwardsBanner({ onNavigateToAwards }) {
  return (
    <div className="awards-banner">
      <div className="banner-content">
        <div className="banner-left">
          <div className="banner-icon">🏆</div>
          <div className="banner-text">
            <div className="banner-title">SIGMA Awards 2025</div>
            <div className="banner-subtitle">Nominees announced! Recognize squad brilliance beyond stats.</div>
          </div>
        </div>
        <button className="banner-button" onClick={onNavigateToAwards}>
          View Awards →
        </button>
      </div>
    </div>
  );
}
