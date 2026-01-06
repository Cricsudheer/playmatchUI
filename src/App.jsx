import React, { useEffect, useMemo, useState } from 'react';

const API_URL = "https://playmatch-preprod.onrender.com/sigma/api/players/all/stats";

function enrichPlayers(players) {
  return players.map((p) => {
    const bat = p.battingStats;
    const bowl = p.bowlingStats;
    const dis = p.dismissalStats;

    const battingRunsPerInn =
      bat && bat.innings > 0 ? bat.runsScored / bat.innings : null;
    const bowlingWktsPerInn =
      bowl && bowl.innings > 0 ? bowl.wicketsTaken / bowl.innings : null;
    const dismissPerInn =
      dis && dis.innings > 0 ? dis.dismissals / dis.innings : null;

    let role = 'Fielder';
    if (bat && bowl) role = 'All-rounder';
    else if (bowl) role = 'Bowler';
    else if (bat) {
      if (dis && (dismissPerInn ?? 0) > 0.5) role = 'WK-Batsman';
      else role = 'Batsman';
    } else if (dis) role = 'Fielder';

    return {
      ...p,
      role,
      battingRunsPerInn,
      bowlingWktsPerInn,
      dismissPerInn,
    };
  });
}

function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [batSortBy, setBatSortBy] = useState('runs');
  const [batMinInns, setBatMinInns] = useState(0);
  const [bowlSortBy, setBowlSortBy] = useState('wkts');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log("Fetching data...");
        
        if (!res.ok) throw new Error('Failed with status ' + res.status);
        const data = await res.json();
        setPlayers(enrichPlayers(data));
      } catch (e) {
        console.error(e);
        setError('Could not load stats from backend. Check API / CORS.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const {
    battingPlayers,
    bowlingPlayers,
    fieldingPlayers,
    totalRuns,
    totalWickets,
    topRunScorer,
    topAvgBatter,
    topWicketTaker,
    bestEconomy,
    topKeeper,
  } = useMemo(() => {
    const battingPlayers = players.filter((p) => p.battingStats);
    const bowlingPlayers = players.filter((p) => p.bowlingStats);
    const fieldingPlayers = players.filter((p) => p.dismissalStats);

    const totalRuns = battingPlayers.reduce(
      (sum, p) => sum + p.battingStats.runsScored,
      0
    );
    const totalWickets = bowlingPlayers.reduce(
      (sum, p) => sum + p.bowlingStats.wicketsTaken,
      0
    );

    const topRunScorer =
      battingPlayers
        .slice()
        .sort((a, b) => b.battingStats.runsScored - a.battingStats.runsScored)[0] ||
      null;

    const topAvgBatter =
      battingPlayers
        .filter((p) => p.battingStats.innings >= 7)
        .slice()
        .sort(
          (a, b) => b.battingStats.averageScore - a.battingStats.averageScore
        )[0] || null;

    const topWicketTaker =
      bowlingPlayers
        .slice()
        .sort(
          (a, b) => b.bowlingStats.wicketsTaken - a.bowlingStats.wicketsTaken
        )[0] || null;

    const bestEconomy =
      bowlingPlayers
        .slice()
        .sort(
          (a, b) => a.bowlingStats.economyRate - b.bowlingStats.economyRate
        )[0] || null;

    const topKeeper =
      fieldingPlayers
        .slice()
        .sort(
          (a, b) => b.dismissalStats.dismissals - a.dismissalStats.dismissals
        )[0] || null;

    return {
      battingPlayers,
      bowlingPlayers,
      fieldingPlayers,
      totalRuns,
      totalWickets,
      topRunScorer,
      topAvgBatter,
      topWicketTaker,
      bestEconomy,
      topKeeper,
    };
  }, [players]);

  function renderOverviewTable() {
    const maxRuns = battingPlayers.reduce(
      (m, p) => Math.max(m, p.battingStats.runsScored),
      0
    );
    const maxWkts = bowlingPlayers.reduce(
      (m, p) => Math.max(m, p.bowlingStats.wicketsTaken),
      0
    );
    const maxDismiss = fieldingPlayers.reduce(
      (m, p) => Math.max(m, p.dismissalStats.dismissals),
      0
    );

    const weights = { runs: 0.4, wkts: 0.4, dismiss: 0.2 };

    const sorted = players.slice().sort((a, b) => {
      const aImpact =
        (a.battingStats
          ? (a.battingStats.runsScored / (maxRuns || 1)) * weights.runs
          : 0) +
        (a.bowlingStats
          ? (a.bowlingStats.wicketsTaken / (maxWkts || 1)) * weights.wkts
          : 0) +
        (a.dismissalStats
          ? (a.dismissalStats.dismissals / (maxDismiss || 1)) * weights.dismiss
          : 0);
      const bImpact =
        (b.battingStats
          ? (b.battingStats.runsScored / (maxRuns || 1)) * weights.runs
          : 0) +
        (b.bowlingStats
          ? (b.bowlingStats.wicketsTaken / (maxWkts || 1)) * weights.wkts
          : 0) +
        (b.dismissalStats
          ? (b.dismissalStats.dismissals / (maxDismiss || 1)) * weights.dismiss
          : 0);
      return bImpact - aImpact;
    });

    return (
      <TableWrapper>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Bat Inn</th>
              <th>Runs</th>
              <th>Avg</th>
              <th>Runs/Inn</th>
              <th>Bowl Inn</th>
              <th>Wkts</th>
              <th>Eco</th>
              <th>Dismiss</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.playerId}>
                <td>
                  <div className="player-cell">
                    <div className="player-name">{p.playerName}</div>
                    <div className="player-meta">
                      {p.role === 'WK-Batsman' ? 'WK' : p.role}
                    </div>
                  </div>
                </td>
                <td className="muted">
                  {p.battingStats ? p.battingStats.innings : '–'}
                </td>
                <td>{p.battingStats ? p.battingStats.runsScored : '–'}</td>
                <td className="muted">
                  {p.battingStats
                    ? p.battingStats.averageScore.toFixed(2)
                    : '–'}
                </td>
                <td className="muted">
                  {p.battingRunsPerInn
                    ? p.battingRunsPerInn.toFixed(1)
                    : '–'}
                </td>
                <td className="muted">
                  {p.bowlingStats ? p.bowlingStats.innings : '–'}
                </td>
                <td>{p.bowlingStats ? p.bowlingStats.wicketsTaken : '–'}</td>
                <td className="muted">
                  {p.bowlingStats
                    ? p.bowlingStats.economyRate.toFixed(2)
                    : '–'}
                </td>
                <td className="muted">
                  {p.dismissalStats ? p.dismissalStats.dismissals : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    );
  }

  function renderBattingTable() {
    const filtered = battingPlayers.filter(
      (p) => p.battingStats.innings >= batMinInns
    );

    const sorted = filtered.slice().sort((a, b) => {
      if (batSortBy === 'avg') {
        return b.battingStats.averageScore - a.battingStats.averageScore;
      }
      return b.battingStats.runsScored - a.battingStats.runsScored;
    });

    const maxRuns = sorted.reduce(
      (m, p) => Math.max(m, p.battingStats.runsScored),
      0
    );

    return (
      <>
        <div className="panel-controls">
          <select
            value={batMinInns}
            onChange={(e) => setBatMinInns(Number(e.target.value))}
          >
            <option value={0}>Min inns: All</option>
            <option value={5}>Min inns: 5</option>
            <option value={8}>Min inns: 8</option>
            <option value={10}>Min inns: 10</option>
          </select>
          <button
            className={classNames(
              'small-button',
              batSortBy === 'runs' && 'active'
            )}
            onClick={() => setBatSortBy('runs')}
          >
            Sort: Runs
          </button>
          <button
            className={classNames(
              'small-button',
              batSortBy === 'avg' && 'active'
            )}
            onClick={() => setBatSortBy('avg')}
          >
            Sort: Avg
          </button>
        </div>
        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Runs</th>
                <th>Avg</th>
                <th>Runs/Inn</th>
                <th>Dismissals</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const bat = p.battingStats;
                const pct = maxRuns ? bat.runsScored / maxRuns : 0;
                const batRate = p.battingRunsPerInn
                  ? p.battingRunsPerInn.toFixed(1)
                  : '–';
                return (
                  <tr key={p.playerId}>
                    <td>
                      <div className="player-cell">
                        <div className="player-name">{p.playerName}</div>
                        <div className="player-meta">
                          {bat.innings} inns • {p.role}
                        </div>
                      </div>
                    </td>
                    <td>
                      {bat.runsScored}
                      <Bar pct={pct} />
                    </td>
                    <td>{bat.averageScore.toFixed(2)}</td>
                    <td className="muted">{batRate}</td>
                    <td className="muted">
                      {p.dismissalStats
                        ? p.dismissalStats.dismissals
                        : '–'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>
      </>
    );
  }

  function renderBowlingTable() {
    const filtered = bowlingPlayers.slice();

    const sorted = filtered.sort((a, b) => {
      if (bowlSortBy === 'wktsPerInn') {
        return (
          (b.bowlingWktsPerInn || 0) -
          (a.bowlingWktsPerInn || 0)
        );
      }
      if (bowlSortBy === 'eco') {
        return (
          a.bowlingStats.economyRate -
          b.bowlingStats.economyRate
        );
      }
      return (
        b.bowlingStats.wicketsTaken -
        a.bowlingStats.wicketsTaken
      );
    });

    const maxWkts = sorted.reduce(
      (m, p) => Math.max(m, p.bowlingStats.wicketsTaken),
      0
    );

    return (
      <>
        <div className="panel-controls">
          <button
            className={classNames(
              'small-button',
              bowlSortBy === 'wkts' && 'active'
            )}
            onClick={() => setBowlSortBy('wkts')}
          >
            Sort: Wickets
          </button>
          <button
            className={classNames(
              'small-button',
              bowlSortBy === 'wktsPerInn' && 'active'
            )}
            onClick={() => setBowlSortBy('wktsPerInn')}
          >
            Sort: Wkts/Inn
          </button>
          <button
            className={classNames(
              'small-button',
              bowlSortBy === 'eco' && 'active'
            )}
            onClick={() => setBowlSortBy('eco')}
          >
            Sort: Econ
          </button>
        </div>
        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th>Bowler</th>
                <th>Wickets</th>
                <th>Wkts/Inn</th>
                <th>Economy</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const bowl = p.bowlingStats;
                const pct = maxWkts ? bowl.wicketsTaken / maxWkts : 0;
                const wktsPerInn = p.bowlingWktsPerInn
                  ? p.bowlingWktsPerInn.toFixed(2)
                  : '–';
                return (
                  <tr key={p.playerId}>
                    <td>
                      <div className="player-cell">
                        <div className="player-name">{p.playerName}</div>
                        <div className="player-meta">
                          {bowl.innings} bowling inns
                        </div>
                      </div>
                    </td>
                    <td>
                      {bowl.wicketsTaken}
                      <Bar pct={pct} />
                    </td>
                    <td>{wktsPerInn}</td>
                    <td>{bowl.economyRate.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>
      </>
    );
  }

  function renderFieldingTable() {
    const sorted = fieldingPlayers
      .slice()
      .sort(
        (a, b) =>
          b.dismissalStats.dismissals -
          a.dismissalStats.dismissals
      );
    const maxDismiss = sorted.reduce(
      (m, p) => Math.max(m, p.dismissalStats.dismissals),
      0
    );

    return (
      <TableWrapper>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Dismissals</th>
              <th>Dismissals/Inn</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const d = p.dismissalStats;
              const pct = maxDismiss ? d.dismissals / maxDismiss : 0;
              const rate = p.dismissPerInn
                ? p.dismissPerInn.toFixed(2)
                : '–';
              return (
                <tr key={p.playerId}>
                  <td>
                    <div className="player-cell">
                      <div className="player-name">{p.playerName}</div>
                      <div className="player-meta">
                        {d.innings} fielding inns
                      </div>
                    </div>
                  </td>
                  <td>
                    {d.dismissals}
                    <Bar pct={pct} />
                  </td>
                  <td>{rate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
    );
  }

  function renderInsights() {
    const items = [];

    if (topRunScorer) {
      const p = topRunScorer;
      const pct = totalRuns
        ? ((p.battingStats.runsScored / totalRuns) * 100).toFixed(1)
        : '0.0';
      items.push({
        icon: '🏏',
        title: `${p.playerName} is your run-bank`,
        body: `${p.playerName} has ${p.battingStats.runsScored} of ${totalRuns} team runs (${pct}%). Treat him as a top-order anchor in big games.`,
        chips: [
          `Avg ${p.battingStats.averageScore.toFixed(2)}`,
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
        body: `${p.playerName} tops wickets (${p.bowlingStats.wicketsTaken}) and also keeps economy at ${p.bowlingStats.economyRate.toFixed(
          2
        )} rpo. Build bowling plans around him.`,
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
            `Eco ${p.bowlingStats.economyRate.toFixed(2)}`,
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
          body: `${p.playerName} has the best economy at ${p.bowlingStats.economyRate.toFixed(
            2
          )} rpo. Use him to choke runs when game drifts.`,
          chips: ['Middle-overs control'],
        });
      }
    }

    if (topKeeper) {
      const p = topKeeper;
      const rate = p.dismissPerInn
        ? p.dismissPerInn.toFixed(2)
        : '-';
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

  const squadSize = players.length;

  return (
    <div className="page">
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

      <div className="main-layout">
        <div>
          <div className="highlights-row">
            {topRunScorer && (
              <HighlightCard
                title="Top Run Scorer"
                pill="Batting"
                player={topRunScorer.playerName}
                primaryValue={
                  topRunScorer.battingStats.runsScored
                }
                primaryLabel="RUNS"
                subText={`Avg ${topRunScorer.battingStats.averageScore} in ${topRunScorer.battingStats.innings} inns`}
                chip={
                  totalRuns
                    ? `${(
                        (topRunScorer.battingStats.runsScored /
                          totalRuns) *
                        100
                      ).toFixed(1)}% of team runs`
                    : ''
                }
              />
            )}
            {topWicketTaker && (
              <HighlightCard
                title="Top Wicket Taker"
                pill="Bowling"
                player={topWicketTaker.playerName}
                primaryValue={
                  topWicketTaker.bowlingStats.wicketsTaken
                }
                primaryLabel="WICKETS"
                subText={`Eco ${topWicketTaker.bowlingStats.economyRate} in ${topWicketTaker.bowlingStats.innings} inns`}
                chip={
                  totalWickets
                    ? `${(
                        (topWicketTaker.bowlingStats.wicketsTaken /
                          totalWickets) *
                        100
                      ).toFixed(1)}% of team wickets`
                    : ''
                }
              />
            )}
            {topKeeper && (
              <HighlightCard
                title="Most Dismissals"
                pill="Fielding"
                player={topKeeper.playerName}
                primaryValue={
                  topKeeper.dismissalStats.dismissals
                }
                primaryLabel="DISMISSALS"
                subText={`${topKeeper.dismissalStats.dismissals} in ${topKeeper.dismissalStats.innings} inns (${
                  topKeeper.dismissPerInn
                    ? topKeeper.dismissPerInn.toFixed(2)
                    : '-'
                }/inn)`}
                chip="Primary WK / gun fielder"
              />
            )}
          </div>

          <div className="tabs">
            <button
              className={classNames(
                'tab-button',
                activeTab === 'overview' && 'active'
              )}
              onClick={() => setActiveTab('overview')}
            >
              Overview
              <span className="count">
                {players.length}
              </span>
            </button>
            <button
              className={classNames(
                'tab-button',
                activeTab === 'batting' && 'active'
              )}
              onClick={() => setActiveTab('batting')}
            >
              Batting
              <span className="count">
                {battingPlayers.length}
              </span>
            </button>
            <button
              className={classNames(
                'tab-button',
                activeTab === 'bowling' && 'active'
              )}
              onClick={() => setActiveTab('bowling')}
            >
              Bowling
              <span className="count">
                {bowlingPlayers.length}
              </span>
            </button>
            <button
              className={classNames(
                'tab-button',
                activeTab === 'fielding' && 'active'
              )}
              onClick={() => setActiveTab('fielding')}
            >
              Fielding
              <span className="count">
                {fieldingPlayers.length}
              </span>
            </button>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  {activeTab === 'overview' &&
                    'Team Overview'}
                  {activeTab === 'batting' &&
                    'Batting – Core Contributors'}
                  {activeTab === 'bowling' &&
                    'Bowling – Strike Unit'}
                  {activeTab === 'fielding' &&
                    'Fielding & Dismissals'}
                </div>
                <div className="panel-subtitle">
                  {activeTab === 'overview' &&
                    'Combined snapshot of batting, bowling & fielding.'}
                  {activeTab === 'batting' &&
                    'Use min innings & sorting to focus on batters that actually face balls.'}
                  {activeTab === 'bowling' &&
                    'Use wickets / wkts per inn / economy to pick your attack.'}
                  {activeTab === 'fielding' &&
                    'Who is converting half-chances into wickets in the field.'}
                </div>
              </div>
            </div>

            {loading && (
              <div className="table-wrapper">
                <div className="loading-overlay">
                  Loading stats from backend…
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="table-wrapper">
                <div className="loading-overlay">
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {activeTab === 'overview' &&
                  renderOverviewTable()}
                {activeTab === 'batting' &&
                  renderBattingTable()}
                {activeTab === 'bowling' &&
                  renderBowlingTable()}
                {activeTab === 'fielding' &&
                  renderFieldingTable()}
              </>
            )}
          </div>
        </div>

        {renderInsights()}
      </div>
    </div>
  );
}

function TableWrapper({ children }) {
  return <div className="table-wrapper">{children}</div>;
}

function Bar({ pct }) {
  return (
    <div className="bar-bg">
      <div
        className="bar-fill visible"
        style={{ transform: `scaleX(${pct || 0})` }}
      />
    </div>
  );
}

function HighlightCard({
  title,
  pill,
  player,
  primaryValue,
  primaryLabel,
  subText,
  chip,
}) {
  return (
    <div className="card-highlight">
      <div className="card-highlight-header">
        <div className="card-highlight-title">
          {title}
        </div>
        <div className="pill-small">{pill}</div>
      </div>
      <div className="card-highlight-main">
        <div className="card-highlight-name">
          {player}
        </div>
        <div className="card-highlight-stat">
          <div className="card-highlight-stat-value">
            {primaryValue}
          </div>
          <div className="card-highlight-stat-label">
            {primaryLabel}
          </div>
        </div>
      </div>
      <div className="card-highlight-footer">
        <span>{subText}</span>
        {chip && (
          <span className="chip chip-accent">
            {chip}
          </span>
        )}
      </div>
    </div>
  );
}
