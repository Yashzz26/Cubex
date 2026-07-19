import { SCAN_ORDER } from '../utils/constants.js';
import storageManager from '../storage/StorageManager.js';

const STORAGE_KEY = 'scan_session';

/**
 * ScanSession — manages per-scan progress, confirmed face data, and localStorage caching.
 */
class ScanSession {
  constructor() {
    this.reset();
  }

  /**
   * Clear all session data and remove the cached key.
   */
  reset() {
    this.faceResults = { U: null, D: null, F: null, B: null, L: null, R: null };
    this.currentFaceIndex = 0;
    storageManager.removeItem(STORAGE_KEY);
  }

  /**
   * Get the face code for the current scan step.
   * @returns {string} e.g. 'F', 'R', 'B', 'L', 'U', 'D'
   */
  getCurrentFace() {
    return SCAN_ORDER[this.currentFaceIndex] ?? null;
  }

  /**
   * Get the face label for the current step.
   * @returns {string}
   */
  getCurrentFaceLabel() {
    const labels = { F: 'FRONT', R: 'RIGHT', B: 'BACK', L: 'LEFT', U: 'UP', D: 'DOWN' };
    return labels[this.getCurrentFace()] ?? '';
  }

  /**
   * Store the 9-element color array for a given face.
   * @param {string} faceCode
   * @param {string[]} colors - Array of 9 color codes
   */
  setFace(faceCode, colors) {
    this.faceResults[faceCode] = [...colors];
    this.save();
  }

  /**
   * Advance to the next face (up to and including the last index+1
   * so isComplete() can evaluate after all faces are confirmed).
   */
  advance() {
    if (this.currentFaceIndex < SCAN_ORDER.length) {
      this.currentFaceIndex++;
      this.save();
    }
  }

  /**
   * Go back to the previous face, clearing its result.
   */
  goBack() {
    if (this.currentFaceIndex > 0) {
      const currentFace = this.getCurrentFace();
      this.faceResults[currentFace] = null;
      this.currentFaceIndex--;
      const prevFace = this.getCurrentFace();
      this.faceResults[prevFace] = null;
      this.save();
    }
  }

  /**
   * Check if all 6 faces have been confirmed.
   * @returns {boolean}
   */
  isComplete() {
    return SCAN_ORDER.every(face => Array.isArray(this.faceResults[face]));
  }

  /**
   * Get current progress as { current: number, total: number }.
   * @returns {{ current: number, total: number }}
   */
  getProgress() {
    return { current: this.currentFaceIndex + 1, total: SCAN_ORDER.length };
  }

  /**
   * Convert completed scan results to ManualNetState-compatible JSON.
   * @returns {Object}
   */
  toManualNetStateJSON() {
    return {
      faces: {
        U: this.faceResults.U ?? Array(9).fill('W'),
        D: this.faceResults.D ?? Array(9).fill('Y'),
        F: this.faceResults.F ?? Array(9).fill('G'),
        B: this.faceResults.B ?? Array(9).fill('B'),
        L: this.faceResults.L ?? Array(9).fill('O'),
        R: this.faceResults.R ?? Array(9).fill('R'),
      }
    };
  }

  /**
   * Save current session state to localStorage.
   */
  save() {
    storageManager.setItem(STORAGE_KEY, {
      faceResults: this.faceResults,
      currentFaceIndex: this.currentFaceIndex
    });
  }

  /**
   * Restore session state from localStorage. Returns true if found.
   * @returns {boolean}
   */
  restore() {
    const saved = storageManager.getItem(STORAGE_KEY);
    if (!saved) return false;
    this.faceResults = { ...saved.faceResults };
    this.currentFaceIndex = saved.currentFaceIndex ?? 0;
    return true;
  }
}

export default ScanSession;
