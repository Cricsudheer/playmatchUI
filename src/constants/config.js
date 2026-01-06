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

/**
 * Awards Data
 */
export const AWARDS_DATA = [
  {
    title: 'Emerging Player of the Year',
    description:
      'Awarded to a player who has shown strong development, confidence and rising influence across matches — signaling a bright future ahead.',
    nominees: [
      { name: 'Vicky', runs: 110, innings: 6, average: 18.0 },
      { name: 'Avinash', runs: 129, innings: 6, average: 25.0 },
      { name: 'Rahat', wickets: 12, innings: 6, economy: 5.81 },
    ],
  },
  {
    title: 'Breakthrough Machines',
    description:
      'Recognizes bowlers who consistently provide crucial breakthroughs, breaking partnerships and shifting momentum back to the team.',
    nominees: [
      { name: 'Braj', wickets: 37, innings: 20, economy: 6.33 },
      { name: 'Sudheer', wickets: 45, innings: 28, economy: 6.07 },
      { name: 'ROHIT', wickets: 15, innings: 13, economy: 5.91 },
    ],
  },
  {
    title: 'Death Overs Doctor',
    description:
      'Awarded to the bowler who performs with control, discipline and composure in the final overs, minimizing damage under intense pressure.',
    nominees: [
      { name: 'ROHIT', wickets: 15, economy: 5.91 },
      { name: 'Rahat', wickets: 12, economy: 5.81 },
      { name: 'Kapil Raghuwanshi', wickets: 18, economy: 5.93 },
    ],
  },
  {
    title: 'Impact All-Rounder',
    description:
      'Recognizes a player who adds value in multiple departments, contributing significantly with both bat and ball.',
    nominees: [
      { name: 'Sumit', runs: 244, wickets: 17, innings_batting: 16, innings_bowling: 17 },
      { name: 'ANSHUL', runs: 118, wickets: 12, innings_batting: 8, innings_bowling: 10 },
      { name: 'Braj', runs: 102, wickets: 37, innings_batting: 12, innings_bowling: 20 },
    ],
  },
  {
    title: 'Mr. Reliability',
    description:
      'Awarded to the player who provides stability and consistency, repeatedly delivering dependable performances for the team.',
    nominees: [
      { name: 'Rana', runs: 270, innings: 7, average: 45.0 },
      { name: 'Pavan', runs: 422, innings: 12, average: 35.0 },
      { name: 'Sujith Shetty', runs: 498, innings: 18, average: 31.0 },
    ],
  },
  {
    title: 'Unsung Hero',
    description:
      'Recognizes the player who may not always receive spotlight but continually contributes selflessly for the team\'s success.',
    nominees: [
      { name: 'Ayush', runs: 205, innings: 20 },
      { name: 'Paras Jain', runs: 326, innings: 16 },
      { name: 'Kapil Raghuwanshi', wickets: 18, economy: 5.93 },
    ],
  },
];

/**
 * Award Filter Categories
 */
export const AWARD_FILTERS = {
  ALL: 'all',
  BATTING: 'batting',
  BOWLING: 'bowling',
  ALLROUNDER: 'allrounder',
};
