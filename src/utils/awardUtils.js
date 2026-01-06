/**
 * Classify an award into a category
 * @param {Object} award - Award object with title
 * @returns {string} - Category: 'batting', 'bowling', 'allrounder', or 'all'
 */
export function classifyAward(award) {
  const title = award.title.toLowerCase();
  if (title.includes('all-round')) return 'allrounder';
  if (title.includes('breakthrough') || title.includes('death') || title.includes('bowler'))
    return 'bowling';
  if (title.includes('reliability') || title.includes('emerging')) return 'batting';
  return 'all';
}

/**
 * Get primary tag for an award based on category
 * @param {Object} award - Award object
 * @returns {string} - Tag text
 */
export function buildPrimaryTag(award) {
  const category = classifyAward(award);
  if (category === 'batting') return 'Batting-leaning';
  if (category === 'bowling') return 'Bowling-leaning';
  if (category === 'allrounder') return 'All-round value';
  return 'Team culture';
}

/**
 * Get chips to display for an award
 * @param {Object} award - Award object
 * @returns {Array} - Array of chip strings
 */
export function buildAwardChips(award) {
  const chips = [];
  const category = classifyAward(award);
  if (category === 'batting') chips.push('Top-order mindset');
  if (category === 'bowling') chips.push('Phase control');
  if (category === 'allrounder') chips.push('Balance in XI');
  chips.push(`Nominees: ${award.nominees.length}`);
  return chips;
}

/**
 * Get rank emoji and label for nominee position
 * @param {number} position - Nominee position (0-indexed)
 * @returns {Object} - { emoji, label }
 */
export function getNomineeRank(position) {
  const ranks = [
    { emoji: '🏆', label: 'Front-runner' },
    { emoji: '⭐', label: 'Strong contender' },
    { emoji: '🎯', label: 'Shortlist' },
  ];
  return ranks[position] || ranks[2];
}
