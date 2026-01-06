import { TableWrapper } from './TableWrapper';
import { Bar } from './Bar';
import { classNames } from '../utils/classNameUtils';
import { formatDecimal } from '../utils/formatUtils';
import { MIN_INNINGS_OPTIONS, BATTING_SORT_OPTIONS } from '../constants/config';

/**
 * BattingTable Component
 * Displays batting statistics with filtering and sorting options
 */
export function BattingTable({ battingPlayers, batSortBy, setBatSortBy, batMinInns, setBatMinInns }) {
  const filtered = battingPlayers.filter(
    (p) => p.battingStats.innings >= batMinInns
  );

  const sorted = filtered.slice().sort((a, b) => {
    if (batSortBy === BATTING_SORT_OPTIONS.AVG) {
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
          {MIN_INNINGS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          className={classNames(
            'small-button',
            batSortBy === BATTING_SORT_OPTIONS.RUNS && 'active'
          )}
          onClick={() => setBatSortBy(BATTING_SORT_OPTIONS.RUNS)}
        >
          Sort: Runs
        </button>
        <button
          className={classNames(
            'small-button',
            batSortBy === BATTING_SORT_OPTIONS.AVG && 'active'
          )}
          onClick={() => setBatSortBy(BATTING_SORT_OPTIONS.AVG)}
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
              const batRate = formatDecimal(p.battingRunsPerInn, 1);
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
                  <td>{formatDecimal(bat.averageScore)}</td>
                  <td className="muted">{batRate}</td>
                  <td className="muted">
                    {p.dismissalStats ? p.dismissalStats.dismissals : '–'}
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
