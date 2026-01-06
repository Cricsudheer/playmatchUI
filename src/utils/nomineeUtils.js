/**
 * Build stat pills HTML for a nominee
 * @param {Object} nominee - Nominee with various stats
 * @returns {Array} - Array of stat objects with label and value
 */
export function buildStatPills(nominee) {
  const pills = [];

  if (nominee.runs != null) {
    pills.push({ label: 'runs', value: nominee.runs });
  }
  if (nominee.average != null) {
    pills.push({ label: 'avg', value: nominee.average.toFixed(2) });
  }
  if (nominee.innings != null) {
    pills.push({ label: 'inns', value: nominee.innings });
  }
  if (nominee.wickets != null) {
    pills.push({ label: 'wkts', value: nominee.wickets });
  }
  if (nominee.economy != null) {
    pills.push({ label: 'eco', value: nominee.economy.toFixed(2) });
  }
  if (nominee.innings_batting != null) {
    pills.push({ label: 'bat_inns', value: nominee.innings_batting });
  }
  if (nominee.innings_bowling != null) {
    pills.push({ label: 'bowl_inns', value: nominee.innings_bowling });
  }

  return pills;
}

/**
 * Format stat label for display
 * @param {string} label - Stat label
 * @returns {string} - Formatted label
 */
export function formatStatLabel(label) {
  const labels = {
    runs: 'runs',
    avg: 'Avg',
    inns: 'inns',
    wkts: 'wkts',
    eco: 'Eco',
    bat_inns: 'Bat inns',
    bowl_inns: 'Bowl inns',
  };
  return labels[label] || label;
}
