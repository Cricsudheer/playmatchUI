import { formatPercentage, formatDecimal } from '../utils/formatUtils';

/**
 * InsightsPanel Component
 * Displays auto-derived insights and key player stats
 */
export function InsightsPanel({
  players,
  topRunScorer,
  topWicketTaker,
  bestEconomy,
  topKeeper,
  totalRuns,
  totalWickets,
}) {
  const items = [];

  if (topRunScorer) {
    const p = topRunScorer;
    const pct = formatPercentage(p.battingStats.runsScored, totalRuns);
    items.push({
      icon: '🏏',
      title: `${p.playerName} is your run-bank`,
      body: `${p.playerName} has ${p.battingStats.runsScored} of ${totalRuns} team runs (${pct}%). Treat him as a top-order anchor in big games.`,
      chips: [
        `Avg ${formatDecimal(p.battingStats.averageScore)}`,
        `${p.battingStats.innings} innings`,
      ],
    });
  }

  if (
    topWicketTaker &&
    bestEconomy &&
    topWicketTaker.playerId === bestEconomy.playerId
  ) {
    const p = topWicketTaker;
    items.push({
      icon: '🎯',
      title: `${p.playerName} is the strike spearhead`,
      body: `${p.playerName} tops wickets (${p.bowlingStats.wicketsTaken}) and also keeps economy at ${formatDecimal(p.bowlingStats.economyRate)} rpo. Build bowling plans around him.`,
      chips: ['Death + powerplay overs'],
    });
  } else {
    if (topWicketTaker) {
      const p = topWicketTaker;
      items.push({
        icon: '🎯',
        title: `${p.playerName} – wicket machine`,
        body: `${p.playerName} leads with ${p.bowlingStats.wicketsTaken} wickets in ${p.bowlingStats.innings} innings.`,
        chips: [
          `Eco ${formatDecimal(p.bowlingStats.economyRate)}`,
        ],
      });
    }
    if (
      bestEconomy &&
      (!topWicketTaker ||
        bestEconomy.playerId !== topWicketTaker.playerId)
    ) {
      const p = bestEconomy;
      items.push({
        icon: '💰',
        title: `${p.playerName} controls the run-rate`,
        body: `${p.playerName} has the best economy at ${formatDecimal(p.bowlingStats.economyRate)} rpo. Use him to choke runs when game drifts.`,
        chips: ['Middle-overs control'],
      });
    }
  }

  if (topKeeper) {
    const p = topKeeper;
    const rate = formatDecimal(p.dismissPerInn);
    items.push({
      icon: '🧤',
      title: `${p.playerName} is your primary keeper`,
      body: `${p.playerName} has ${p.dismissalStats.dismissals} dismissals in ${p.dismissalStats.innings} innings (${rate}/inn).`,
      chips: ['Pick in spin-heavy games'],
    });
  }

  const allRounders = players.filter(
    (p) => p.role === 'All-rounder'
  );
  if (allRounders.length) {
    items.push({
      icon: '⚖️',
      title: 'All-round balance',
      body: `All-round options (${allRounders
        .map((p) => p.playerName)
        .join(
          ', '
        )}) give you flexibility in team combination.`,
      chips: [`${allRounders.length} all-round options`],
    });
  }

  return (
    <aside className="insights-panel">
      <div className="insights-header">
        <div className="insights-title">Key Insights</div>
        <div className="tag">Auto-derived</div>
      </div>
      <ul className="insight-list">
        {items.map((it, idx) => (
          <li className="insight-item" key={idx}>
            <div className="insight-bullet">{it.icon}</div>
            <div className="insight-main">
              <div className="insight-label">{it.title}</div>
              <div className="insight-meta">{it.body}</div>
              {it.chips?.length ? (
                <div className="insight-chip-row">
                  {it.chips.map((c) => (
                    <span
                      key={c}
                      className="mini-chip accent"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="insight-item">
            <div className="insight-main">
              <div className="insight-meta">
                Not enough data yet to generate insights.
              </div>
            </div>
          </li>
        )}
      </ul>
      <div className="footer-note">
        <span>Updated from backend stats API.</span>
        <span>Use this for XI planning & match-ups.</span>
      </div>
    </aside>
  );
}
