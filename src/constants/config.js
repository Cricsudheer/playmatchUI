/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://playmatch-preprod.onrender.com',
  ENDPOINTS: {
    STATS: '/sigma/api/players/all/stats',
  },
};

/**
 * Tab Configuration
 */
export const TABS = {
  OVERVIEW: 'overview',
  BATTING: 'batting',
  BOWLING: 'bowling',
  FIELDING: 'fielding',
};

/**
 * Sort Options
 */
export const BATTING_SORT_OPTIONS = {
  RUNS: 'runs',
  AVG: 'avg',
};

export const BOWLING_SORT_OPTIONS = {
  WICKETS: 'wkts',
  WICKETS_PER_INN: 'wktsPerInn',
  ECONOMY: 'eco',
};

/**
 * Min Innings Filter Options
 */
export const MIN_INNINGS_OPTIONS = [
  { value: 0, label: 'Min inns: All' },
  { value: 5, label: 'Min inns: 5' },
  { value: 8, label: 'Min inns: 8' },
  { value: 10, label: 'Min inns: 10' },
];

/**
 * Role Names
 */
export const ROLES = {
  ALL_ROUNDER: 'All-rounder',
  BOWLER: 'Bowler',
  BATSMAN: 'Batsman',
  WK_BATSMAN: 'WK-Batsman',
  FIELDER: 'Fielder',
};

/**
 * Impact Scoring Weights for Overview
 */
export const IMPACT_WEIGHTS = {
  RUNS: 0.4,
  WICKETS: 0.4,
  DISMISSALS: 0.2,
};

/**
 * Minimum Innings for Top Batters
 */
export const MIN_INNINGS_FOR_AVG = 7;

/**
 * Dismissal Rate Threshold for WK-Batsman Classification
 */
export const DISMISS_RATE_WK_THRESHOLD = 0.5;
