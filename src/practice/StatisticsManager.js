import practiceStorage from './PracticeStorage.js';
import SolveTimer from './SolveTimer.js';

/**
 * StatisticsManager — reads from PracticeStorage and formats display strings.
 */
class StatisticsManager {
  /**
   * Format milliseconds to display string.
   * @param {number|null} ms
   * @returns {string}
   */
  static formatTime(ms) {
    if (ms === null || ms === undefined) return '--';
    return SolveTimer.format(ms);
  }

  /** @returns {string} */
  static getBestTimeDisplay() {
    const { bestTime } = practiceStorage.getStats();
    return this.formatTime(bestTime);
  }

  /** @returns {string} */
  static getAo5Display() {
    const { ao5 } = practiceStorage.getStats();
    return this.formatTime(ao5);
  }

  /** @returns {string} */
  static getAo12Display() {
    const { ao12 } = practiceStorage.getStats();
    return this.formatTime(ao12);
  }

  /** @returns {number} */
  static getTotalSolves() {
    return practiceStorage.getStats().totalSolves ?? 0;
  }
}

export default StatisticsManager;
