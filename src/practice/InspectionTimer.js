/**
 * InspectionTimer — countdown timer for WCA-style pre-solve inspection.
 * Default: 15 seconds.
 */
class InspectionTimer {
  /**
   * @param {number} durationSeconds - Total inspection duration (default 15)
   */
  constructor(durationSeconds = 15) {
    this.duration    = durationSeconds;
    this.remaining   = durationSeconds;
    this.intervalId  = null;
    this._onTick     = null;
    this._onExpire   = null;
  }

  /**
   * Start the inspection countdown.
   * @param {Function} onTick    - Called every 100ms with remaining seconds (number).
   * @param {Function} onExpire  - Called when countdown reaches 0.
   */
  start(onTick, onExpire) {
    this._onTick   = onTick;
    this._onExpire = onExpire;
    this.remaining = this.duration;

    this.intervalId = setInterval(() => {
      this.remaining = Math.max(0, this.remaining - 0.1);
      if (this._onTick) this._onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        if (this._onExpire) this._onExpire();
      }
    }, 100);
  }

  /**
   * Stop the countdown and return remaining seconds.
   * @returns {number}
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return this.remaining;
  }

  /**
   * Reset remaining time to the full duration.
   */
  reset() {
    this.stop();
    this.remaining = this.duration;
  }
}

export default InspectionTimer;
