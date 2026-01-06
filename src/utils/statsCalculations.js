import { IMPACT_WEIGHTS, MIN_INNINGS_FOR_AVG } from '../constants/config';

/**
 * Calculate statistics from player data
 * @param {Array} players - Array of enriched player objects
 * @returns {Object} - Calculated statistics
 */
export function calculateStats(players) {
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

  const topRunScorer = battingPlayers
    .slice()
    .sort((a, b) => b.battingStats.runsScored - a.battingStats.runsScored)[0] ||
    null;

  const topAvgBatter = battingPlayers
    .filter((p) => p.battingStats.innings >= MIN_INNINGS_FOR_AVG)
    .slice()
    .sort(
      (a, b) => b.battingStats.averageScore - a.battingStats.averageScore
    )[0] || null;

  const topWicketTaker = bowlingPlayers
    .slice()
    .sort(
      (a, b) => b.bowlingStats.wicketsTaken - a.bowlingStats.wicketsTaken
    )[0] || null;

  const bestEconomy = bowlingPlayers
    .slice()
    .sort(
      (a, b) => a.bowlingStats.economyRate - b.bowlingStats.economyRate
    )[0] || null;

  const topKeeper = fieldingPlayers
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
}

/**
 * Calculate player impact score for overview ranking
 * @param {Object} player - Player object with stats
 * @param {number} maxRuns - Maximum runs in dataset
 * @param {number} maxWkts - Maximum wickets in dataset
 * @param {number} maxDismiss - Maximum dismissals in dataset
 * @returns {number} - Impact score
 */
export function calculatePlayerImpact(player, maxRuns, maxWkts, maxDismiss) {
  return (
    (player.battingStats
      ? (player.battingStats.runsScored / (maxRuns || 1)) * IMPACT_WEIGHTS.RUNS
      : 0) +
    (player.bowlingStats
      ? (player.bowlingStats.wicketsTaken / (maxWkts || 1)) * IMPACT_WEIGHTS.WICKETS
      : 0) +
    (player.dismissalStats
      ? (player.dismissalStats.dismissals / (maxDismiss || 1)) * IMPACT_WEIGHTS.DISMISSALS
      : 0)
  );
}
