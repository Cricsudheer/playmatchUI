import { TableWrapper } from './TableWrapper';
import { Bar } from './Bar';
import { formatDecimal } from '../utils/formatUtils';

/**
 * OverviewTable Component
 * Displays combined view of all player stats with weighted impact scoring
 */
export function OverviewTable({ players, battingPlayers, bowlingPlayers, fieldingPlayers }) {
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
                {formatDecimal(p.battingStats?.averageScore)}
              </td>
              <td className="muted">
                {formatDecimal(p.battingRunsPerInn, 1)}
              </td>
              <td className="muted">
                {p.bowlingStats ? p.bowlingStats.innings : '–'}
              </td>
              <td>{p.bowlingStats ? p.bowlingStats.wicketsTaken : '–'}</td>
              <td className="muted">
                {formatDecimal(p.bowlingStats?.economyRate)}
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
