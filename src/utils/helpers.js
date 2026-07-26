/**
 * General helper utilities
 */

/**
 * Creates a unique ID with custom prefix.
 */
export const generateId = (prefix = 'id') => {
  // BUG G: Replaced deprecated .substr(2, 9) with .slice(2, 11) — equivalent behavior
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Returns a promise resolving after designated milliseconds.
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format timestamp into local visual format.
 */
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
