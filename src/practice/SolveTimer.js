/**
 * SolveTimer — high-accuracy centisecond solve timer using requestAnimationFrame.
 */
class SolveTimer {
  constructor() {
    this.startTime   = null;
    this.elapsedMs   = 0;
    this.rafId       = null;
    this._tickCb     = null;
  }

  /**
   * Register a callback invoked on every animation frame with current time parts.
   * @param {Function} callback - Called with { minutes, seconds, centiseconds, totalMs }
   */
  onTick(callback) {
    this._tickCb = callback;
  }

  /**
   * Start the timer.
   */
  start() {
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this._loop();
  }

  /**
   * Stop the timer and return elapsed milliseconds.
   * @returns {number}
   */
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.elapsedMs = this.startTime !== null
      ? performance.now() - this.startTime
      : 0;
    this.startTime = null;
    return this.elapsedMs;
  }

  /**
   * Reset without triggering the tick callback.
   */
  reset() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId     = null;
    this.startTime = null;
    this.elapsedMs = 0;
  }

  /**
   * Get current elapsed milliseconds (safe to call any time).
   * @returns {number}
   */
  getElapsedMs() {
    if (this.startTime === null) return this.elapsedMs;
    return performance.now() - this.startTime;
  }

  /**
   * Internal rAF loop.
   * @private
   */
  _loop() {
    this.rafId = requestAnimationFrame(() => {
      const ms = this.getElapsedMs();
      if (this._tickCb) this._tickCb(SolveTimer.decompose(ms));
      if (this.startTime !== null) this._loop();
    });
  }

  /**
   * Decompose milliseconds into display parts.
   * @param {number} ms
   * @returns {{ minutes: number, seconds: number, centiseconds: number, totalMs: number }}
   */
  static decompose(ms) {
    const totalCs  = Math.floor(ms / 10);
    const minutes  = Math.floor(totalCs / 6000);
    const seconds  = Math.floor((totalCs % 6000) / 100);
    const centiseconds = totalCs % 100;
    return { minutes, seconds, centiseconds, totalMs: ms };
  }

  /**
   * Format milliseconds as MM:SS.cs or SS.cs string.
   * @param {number} ms
   * @returns {string}
   */
  static format(ms) {
    const { minutes, seconds, centiseconds } = SolveTimer.decompose(ms);
    const ss = String(seconds).padStart(2, '0');
    const cs = String(centiseconds).padStart(2, '0');
    if (minutes > 0) {
      return `${minutes}:${ss}.${cs}`;
    }
    return `${ss}.${cs}`;
  }
}

export default SolveTimer;
