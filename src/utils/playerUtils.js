/**
 * Enrich player data with calculated fields
 * @param {Array} players - Array of player objects from API
 * @returns {Array} - Enriched player data with role, runs per inning, etc
 */
export function enrichPlayers(players) {
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
