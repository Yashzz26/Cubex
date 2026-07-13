class AnimationQueue {
  /**
   * Manages move scheduling and execution.
   * @param {RotationEngine} rotationEngine - The active rotation engine instance.
   */
  constructor(rotationEngine) {
    this.rotationEngine = rotationEngine;
    this.queue = [];
    this.isPaused = false;
    this.speedMultiplier = 1.0;

    // Event/callback hooks
    this.onMoveStart = null;
    this.onMoveComplete = null;
    this.onQueueComplete = null;
  }

  /**
   * Set execution playback speed.
   * @param {number} speed - The speed factor (e.g. 1.0, 2.0, 0.5)
   */
  setSpeed(speed) {
    this.speedMultiplier = Math.max(0.1, Math.min(speed, 5));
  }

  /**
   * Append a single or array of moves to the queue.
   * @param {string|string[]} moves - Move notation or array of notations.
   */
  add(moves) {
    if (Array.isArray(moves)) {
      this.queue.push(...moves);
    } else if (typeof moves === 'string' && moves.trim()) {
      this.queue.push(moves);
    }

    this.process();
  }

  /**
   * Execute the next move in the queue if idle and not paused.
   */
  process() {
    if (this.rotationEngine.isAnimating || this.queue.length === 0 || this.isPaused) {
      // Check if queue completed while animating was running
      if (this.queue.length === 0 && !this.rotationEngine.isAnimating) {
        this._triggerQueueComplete();
      }
      return;
    }

    const currentMove = this.queue.shift();

    // Trigger start event hook
    if (this.onMoveStart) {
      this.onMoveStart(currentMove);
    }

    // Execute layer rotation
    this.rotationEngine.rotateLayer(
      currentMove,
      () => {
        // Trigger completion event hook
        if (this.onMoveComplete) {
          this.onMoveComplete(currentMove);
        }

        // Recursively trigger next move
        this.process();
      },
      this.speedMultiplier
    );
  }

  /**
   * Pause queue playback.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume queue playback.
   */
  resume() {
    this.isPaused = false;
    this.process();
  }

  /**
   * Clear all pending moves and reset status.
   */
  clear() {
    this.queue = [];
    this.isPaused = false;
  }

  /**
   * Helper to trigger queue completion callbacks.
   * @private
   */
  _triggerQueueComplete() {
    if (this.onQueueComplete) {
      this.onQueueComplete();
    }
  }

  /**
   * Check if animations are currently running.
   */
  isBusy() {
    return this.rotationEngine.isAnimating || this.queue.length > 0;
  }
}

export default AnimationQueue;
