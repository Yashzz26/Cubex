import storageManager from '../storage/StorageManager.js';

const STORAGE_KEY  = 'solve_history';
const MAX_ENTRIES  = 50; // keep last 50 solves

/**
 * SolveHistory — persists every generated solution to localStorage.
 * Each entry is the full solution object from SolutionManager.generateSolution().
 */
class SolveHistory {
  /**
   * Load raw history array from storage.
   * @returns {Array}
   * @private
   */
  _load() {
    return storageManager.getItem(STORAGE_KEY, []);
  }

  /**
   * Save history array to storage.
   * @private
   */
  _save(entries) {
    storageManager.setItem(STORAGE_KEY, entries);
  }

  /**
   * Persist a solution entry.
   * @param {Object} solution - Solution object from SolutionManager
   */
  add(solution) {
    const entries = this._load();
    // Add newest first
    entries.unshift({
      id:               solution.id,
      createdAt:        solution.createdAt,
      notation:         solution.notation,
      moves:            solution.moves,
      moveCount:        solution.moveCount,
      estimatedDuration: solution.estimatedDuration,
      initialState:     solution.initialState   // the 6-face color arrays
    });
    // Trim to max
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    this._save(entries);
  }

  /**
   * Get the n most recent solves (default all up to MAX_ENTRIES).
   * @param {number} n
   * @returns {Array}
   */
  getRecent(n = MAX_ENTRIES) {
    return this._load().slice(0, n);
  }

  /**
   * Get a single solve by its id.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return this._load().find(e => e.id === id) ?? null;
  }

  /**
   * Remove one solve by id.
   * @param {string} id
   */
  remove(id) {
    const entries = this._load().filter(e => e.id !== id);
    this._save(entries);
  }

  /**
   * Clear all history.
   */
  clearAll() {
    storageManager.removeItem(STORAGE_KEY);
  }

  /**
   * Total number of recorded solves.
   * @returns {number}
   */
  count() {
    return this._load().length;
  }
}

const solveHistory = new SolveHistory();
export default solveHistory;
