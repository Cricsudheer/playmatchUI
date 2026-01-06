/**
 * Header Component
 * Displays page title and meta information
 */
export function Header({ squadSize, totalRuns, totalWickets }) {
  return (
    <header>
      <div className="header-row">
        <div className="title-block">
          <h1>
            SIGMA Cricket – Team Dashboard
            <span className="badge">Season Insights</span>
          </h1>
          <p className="subtitle">
            Core squad performance across batting, bowling & fielding. Designed
            for captains making selection calls.
          </p>
        </div>
        <div className="meta-row">
          <div className="meta-pill">
            <span className="dot" />
            <div>
              <div className="pill-label">Squad Size</div>
              <div className="pill-value">
                {squadSize || '–'} players
              </div>
            </div>
          </div>
          <div className="meta-pill">
            <div>
              <div className="pill-label">Total Runs</div>
              <div className="pill-value">
                {totalRuns || '–'}
              </div>
            </div>
          </div>
          <div className="meta-pill">
            <div>
              <div className="pill-label">Total Wickets</div>
              <div className="pill-value">
                {totalWickets || '–'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
