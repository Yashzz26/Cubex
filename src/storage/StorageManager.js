/**
 * Centralized manager for localStorage operations.
 * Isolates direct localStorage calls and handles exceptions gracefully.
 */
class StorageManager {
  constructor() {
    this.prefix = 'cubix.';
  }

  /**
   * Helper to construct prefixed key names.
   * @private
   */
  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Retrieve a parsed JSON item from local storage.
   * @param {string} key - The configuration key (without prefix).
   * @param {*} defaultValue - The default fallback if item is missing or corrupted.
   * @returns {*} The parsed item or default value.
   */
  getItem(key, defaultValue = null) {
    const fullKey = this._getKey(key);
    try {
      const item = localStorage.getItem(fullKey);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading key "${fullKey}" from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Write an object/value to local storage.
   * @param {string} key - The configuration key.
   * @param {*} value - The value to store (will be stringified).
   * @returns {boolean} True if successful.
   */
  setItem(key, value) {
    const fullKey = this._getKey(key);
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing key "${fullKey}" to localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove an item from local storage.
   * @param {string} key - The configuration key.
   */
  removeItem(key) {
    const fullKey = this._getKey(key);
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error removing key "${fullKey}" from localStorage:`, error);
    }
  }

  /**
   * Clear all Cubix-related items from local storage.
   */
  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (error) {
      console.error('Error clearing Cubix localStorage entries:', error);
    }
  }
}

const storageManager = new StorageManager();
export default storageManager;
