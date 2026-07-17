import { DEFAULT_SOLVED_STATE, FACES, COLORS } from '../utils/constants.js';
import CubeState from '../cube/CubeState.js';

/**
 * Owns the 54-sticker logical state for the Manual Net Editor.
 * Each face holds an array of 9 color codes (W, Y, R, O, B, G) or null (unpainted).
 * Center sticker (index 4) is always fixed and cannot be overwritten.
 */
class ManualNetState {
  constructor() {
    this._centerColors = {
      U: 'W',
      D: 'Y',
      F: 'G',
      B: 'B',
      L: 'O',
      R: 'R'
    };
    this.reset();
  }

  /**
   * Restore all stickers to the default solved configuration.
   */
  reset() {
    this.faces = {
      U: [...DEFAULT_SOLVED_STATE.U],
      D: [...DEFAULT_SOLVED_STATE.D],
      F: [...DEFAULT_SOLVED_STATE.F],
      B: [...DEFAULT_SOLVED_STATE.B],
      L: [...DEFAULT_SOLVED_STATE.L],
      R: [...DEFAULT_SOLVED_STATE.R]
    };
  }

  /**
   * Clear all non-center stickers to null (unpainted).
   * Center stickers remain fixed.
   */
  clear() {
    for (const face of Object.keys(this.faces)) {
      this.faces[face] = this.faces[face].map((_, idx) =>
        idx === 4 ? this._centerColors[face] : null
      );
    }
  }

  /**
   * Set a single sticker's color. Center (index 4) is protected.
   * @param {string} face - Face code (U, D, L, R, F, B)
   * @param {number} index - Sticker index 0-8
   * @param {string} colorCode - Color code (W, Y, R, O, B, G)
   */
  setSticker(face, index, colorCode) {
    if (index === 4) return; // Center is locked
    if (!this.faces[face]) return;
    if (index < 0 || index > 8) return;
    this.faces[face][index] = colorCode;
  }

  /**
   * Get the color code at a specific position.
   * @param {string} face
   * @param {number} index
   * @returns {string|null}
   */
  getSticker(face, index) {
    return this.faces[face]?.[index] ?? null;
  }

  /**
   * Get a count of how many stickers of each color are currently painted.
   * @returns {Object} Map of color code to count, e.g. { W: 9, Y: 9, ... }
   */
  getColorCounts() {
    const counts = { W: 0, Y: 0, R: 0, O: 0, B: 0, G: 0 };
    for (const face of Object.values(this.faces)) {
      for (const code of face) {
        if (code && counts[code] !== undefined) {
          counts[code]++;
        }
      }
    }
    return counts;
  }

  /**
   * Count how many stickers are still unpainted (null).
   * @returns {number}
   */
  getUnpaintedCount() {
    let count = 0;
    for (const face of Object.values(this.faces)) {
      for (const code of face) {
        if (code === null) count++;
      }
    }
    return count;
  }

  /**
   * Returns true if all 54 stickers are painted and each color appears exactly 9 times.
   * @returns {boolean}
   */
  isValid() {
    if (this.getUnpaintedCount() > 0) return false;
    const counts = this.getColorCounts();
    return Object.values(counts).every(c => c === 9);
  }

  /**
   * Convert the ManualNetState into a CubeState instance for solving.
   * @returns {CubeState}
   */
  toCubeState() {
    return new CubeState(this.faces);
  }

  /**
   * Serialize state to a plain JSON-compatible object.
   * @returns {Object}
   */
  toJSON() {
    return {
      faces: {
        U: [...this.faces.U],
        D: [...this.faces.D],
        F: [...this.faces.F],
        B: [...this.faces.B],
        L: [...this.faces.L],
        R: [...this.faces.R]
      }
    };
  }

  /**
   * Restore state from a plain JSON object (e.g. from localStorage).
   * @param {Object} json
   */
  fromJSON(json) {
    if (!json || !json.faces) return;
    for (const face of ['U', 'D', 'F', 'B', 'L', 'R']) {
      if (Array.isArray(json.faces[face]) && json.faces[face].length === 9) {
        this.faces[face] = [...json.faces[face]];
        // Always enforce center color integrity
        this.faces[face][4] = this._centerColors[face];
      }
    }
  }
}

export default ManualNetState;
