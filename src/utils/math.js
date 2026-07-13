/**
 * Math utilities for rotation snapping and matrix calculations.
 */

/**
 * Snap angle to nearest 90 degree step.
 * @param {number} angle - Angle in radians.
 * @returns {number} Snapped angle in radians.
 */
export const snapTo90 = (angle) => {
  const halfPi = Math.PI / 2;
  return Math.round(angle / halfPi) * halfPi;
};

/**
 * Normalize an angle to be within [-PI, PI].
 */
export const normalizeAngle = (angle) => {
  while (angle <= -Math.PI) angle += Math.PI * 2;
  while (angle > Math.PI) angle -= Math.PI * 2;
  return angle;
};

/**
 * Calculates the inverse of a standard Singmaster move notation.
 * @param {string} move - Move token (e.g. "R", "U'", "F2").
 * @returns {string} The inverse move token.
 */
export const getInverseMove = (move) => {
  if (!move) return '';
  const face = move[0];
  const modifier = move.slice(1);

  if (modifier === "'") {
    return face;
  } else if (modifier === '2') {
    return move; // 180 degrees inverse is itself
  } else {
    return `${face}'`;
  }
};
