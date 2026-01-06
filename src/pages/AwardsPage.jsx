import { useState } from 'react';
import { AwardCard } from '../components/AwardCard';
import { AWARDS_DATA, AWARD_FILTERS } from '../constants/config';
import { classifyAward } from '../utils/awardUtils';

/**
 * Awards Page Component
 * Displays all awards with filtering capabilities
 */
export function AwardsPage() {
  const [highlightFilter, setHighlightFilter] = useState(AWARD_FILTERS.ALL);

  const filteredAwards =
    highlightFilter === AWARD_FILTERS.ALL
      ? AWARDS_DATA
      : AWARDS_DATA.filter((award) => classifyAward(award) === highlightFilter);

  return (
    <div className="page">
      <header>
        <div className="header-row">
          <div className="title-block">
            <h1>
              SIGMA Cricket – Season Awards
              <span className="badge">2024–25 Squad</span>
            </h1>
            <p className="subtitle">
              Non-stat awards that capture impact, temperament and stories beyond just averages.
              Curated from internal SIGMA performance data.
            </p>
          </div>
          <div className="meta-row">
            <div className="meta-pill">
              <span className="dot"></span>
              <div>
                <div className="pill-label">Mode</div>
                <div className="pill-value">Awards Night View</div>
              </div>
            </div>
            <div className="meta-pill">
              <div>
                <div className="pill-label">Total Awards</div>
                <div className="pill-value">{filteredAwards.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-row">
          <div className="filters-left">
            <span className="pill-small">SIGMA Internal Awards • Captains Insight Tool</span>
          </div>
          <div className="filters-right">
            <select
              value={highlightFilter}
              onChange={(e) => setHighlightFilter(e.target.value)}
            >
              <option value={AWARD_FILTERS.ALL}>View: All awards</option>
              <option value={AWARD_FILTERS.BATTING}>Highlight: Batting heavy</option>
              <option value={AWARD_FILTERS.BOWLING}>Highlight: Bowling heavy</option>
              <option value={AWARD_FILTERS.ALLROUNDER}>Highlight: All-round profiles</option>
            </select>
          </div>
        </div>
      </header>

      <main>
        <section className="awards-grid">
          {filteredAwards.map((award, idx) => (
            <AwardCard key={idx} award={award} />
          ))}
        </section>
      </main>

      <footer className="page-footer">
        <span>
          Designed as part of the SIGMA dashboard – use alongside stats view for selection calls.
        </span>
        <span>Tip: Screenshot individual cards for Instagram stories or team announcements.</span>
      </footer>
    </div>
  );
}
