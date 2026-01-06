/**
 * Format decimal values to fixed decimal places
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted value or dash if null
 */
export function formatDecimal(value, decimals = 2) {
  return value !== null && value !== undefined ? value.toFixed(decimals) : '–';
}

/**
 * Format percentage values
 * @param {number} value - Value to format
 * @param {number} total - Total to calculate percentage from
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(value, total) {
  if (!value || !total) return '0.0';
  return ((value / total) * 100).toFixed(1);
}
