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
