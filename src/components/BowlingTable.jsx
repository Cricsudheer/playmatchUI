import { TableWrapper } from './TableWrapper';
import { Bar } from './Bar';
import { classNames } from '../utils/classNameUtils';
import { formatDecimal } from '../utils/formatUtils';
import { BOWLING_SORT_OPTIONS } from '../constants/config';

/**
 * BowlingTable Component
 * Displays bowling statistics with sorting options
 */
export function BowlingTable({ bowlingPlayers, bowlSortBy, setBowlSortBy }) {
  const sorted = bowlingPlayers.slice().sort((a, b) => {
    if (bowlSortBy === BOWLING_SORT_OPTIONS.WICKETS_PER_INN) {
      return (
        (b.bowlingWktsPerInn || 0) -
        (a.bowlingWktsPerInn || 0)
      );
    }
    if (bowlSortBy === BOWLING_SORT_OPTIONS.ECONOMY) {
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
            bowlSortBy === BOWLING_SORT_OPTIONS.WICKETS && 'active'
          )}
          onClick={() => setBowlSortBy(BOWLING_SORT_OPTIONS.WICKETS)}
        >
          Sort: Wickets
        </button>
        <button
          className={classNames(
            'small-button',
            bowlSortBy === BOWLING_SORT_OPTIONS.WICKETS_PER_INN && 'active'
          )}
          onClick={() => setBowlSortBy(BOWLING_SORT_OPTIONS.WICKETS_PER_INN)}
        >
          Sort: Wkts/Inn
        </button>
        <button
          className={classNames(
            'small-button',
            bowlSortBy === BOWLING_SORT_OPTIONS.ECONOMY && 'active'
          )}
          onClick={() => setBowlSortBy(BOWLING_SORT_OPTIONS.ECONOMY)}
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
              const wktsPerInn = formatDecimal(p.bowlingWktsPerInn);
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
                  <td>{formatDecimal(bowl.economyRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
    </>
  );
}
