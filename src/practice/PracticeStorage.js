import storageManager from '../storage/StorageManager.js';
import { generateId } from '../utils/helpers.js';

const STORAGE_KEY = 'practice';

/**
 * PracticeStorage — manages practice solve history and computed stats in localStorage.
 */
class PracticeStorage {
  /**
   * Load current data from storage.
   * @returns {{ solves: Array, stats: Object }}
   * @private
   */
  _load() {
    return storageManager.getItem(STORAGE_KEY, { solves: [], stats: {} });
  }

  /**
   * Save data back to storage.
   * @private
   */
  _save(data) {
    storageManager.setItem(STORAGE_KEY, data);
  }

  /**
   * Add a new solve entry and recompute stats.
   * @param {{ time: number, scramble: string }} solve - time in milliseconds
   */
  addSolve({ time, scramble }) {
    const data = this._load();
    const entry = {
      id: generateId('solve'),
      timestamp: Date.now(),
      time,
      scramble,
      dnf: false
    };
    data.solves.push(entry);
    data.stats = this._computeStats(data.solves);
    this._save(data);
    return entry;
  }

  /**
   * Get computed stats object.
   * @returns {{ bestTime: number|null, totalSolves: number, ao5: number|null, ao12: number|null }}
   */
  getStats() {
    return this._load().stats;
  }

  /**
   * Get the n most recent solves, newest first.
   * @param {number} n
   * @returns {Array}
   */
  getRecentSolves(n = 10) {
    const { solves } = this._load();
    return [...solves].reverse().slice(0, n);
  }

  /**
   * Get all solves.
   * @returns {Array}
   */
  getAllSolves() {
    return this._load().solves;
  }

  /**
   * Clear all practice data.
   */
  clearAll() {
    storageManager.removeItem(STORAGE_KEY);
  }

  /**
   * Compute stats from the full solve array.
   * @private
   */
  _computeStats(solves) {
    if (!solves.length) return { bestTime: null, totalSolves: 0, ao5: null, ao12: null };

    const times = solves.map(s => s.time);
    const bestTime = Math.min(...times);
    const totalSolves = solves.length;

    const ao5  = this._averageOf(times, 5);
    const ao12 = this._averageOf(times, 12);

    return { bestTime, totalSolves, ao5, ao12 };
  }

  /**
   * Compute average of last N solves (trimming best + worst for N >= 5).
   * @private
   */
  _averageOf(times, n) {
    if (times.length < n) return null;
    const last = times.slice(-n);
    if (n >= 5) {
      const sorted = [...last].sort((a, b) => a - b);
      // Trim best and worst
      const trimmed = sorted.slice(1, -1);
      return trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
    }
    return last.reduce((s, t) => s + t, 0) / last.length;
  }
}

const practiceStorage = new PracticeStorage();
export default practiceStorage;
