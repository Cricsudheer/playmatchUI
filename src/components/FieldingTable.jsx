import { TableWrapper } from './TableWrapper';
import { Bar } from './Bar';
import { formatDecimal } from '../utils/formatUtils';

/**
 * FieldingTable Component
 * Displays fielding and dismissal statistics
 */
export function FieldingTable({ fieldingPlayers }) {
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
            const rate = formatDecimal(p.dismissPerInn);
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
