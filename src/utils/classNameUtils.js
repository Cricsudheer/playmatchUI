/**
 * Utility function to conditionally join classNames together
 * @param {...any} xs - Class names to conditionally join
 * @returns {string} - Space-separated class names
 */
export function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}
