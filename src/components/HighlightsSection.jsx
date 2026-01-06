import { HighlightCard } from './HighlightCard';
import { formatPercentage, formatDecimal } from '../utils/formatUtils';

/**
 * HighlightsSection Component
 * Displays top players in key categories
 */
export function HighlightsSection({
  topRunScorer,
  topWicketTaker,
  topKeeper,
  totalRuns,
  totalWickets,
}) {
  return (
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
          subText={`Avg ${formatDecimal(topRunScorer.battingStats.averageScore)} in ${topRunScorer.battingStats.innings} inns`}
          chip={
            totalRuns
              ? `${formatPercentage(topRunScorer.battingStats.runsScored, totalRuns)}% of team runs`
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
          subText={`Eco ${formatDecimal(topWicketTaker.bowlingStats.economyRate)} in ${topWicketTaker.bowlingStats.innings} inns`}
          chip={
            totalWickets
              ? `${formatPercentage(topWicketTaker.bowlingStats.wicketsTaken, totalWickets)}% of team wickets`
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
            formatDecimal(topKeeper.dismissPerInn)
          }/inn)`}
          chip="Primary WK / gun fielder"
        />
      )}
    </div>
  );
}
