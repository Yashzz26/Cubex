import CubeScene from './CubeScene.js';
import CubeModel from './CubeModel.js';
import RotationEngine from './RotationEngine.js';
import AnimationQueue from './AnimationQueue.js';

class CubeController {
  /**
   * Orchestrates the 3D scene and Rubik's cube model interaction.
   * @param {HTMLElement} container - Target DOM container to mount the canvas.
   * @param {Object} options - Configurations for scene and behavior.
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoRotate: false,
      autoRotateSpeed: 0.005,
      ...options
    };

    // 1. Initialize Scene
    this.cubeScene = new CubeScene(this.container, this.options);

    // 2. Initialize Cube Model
    this.cubeModel = new CubeModel();

    // 3. Add model to scene
    this.cubeScene.scene.add(this.cubeModel.getGroup());

    // 4. Initialize Rotation and Animation Queue
    this.rotationEngine = new RotationEngine(this.cubeModel, this.cubeScene);
    this.animationQueue = new AnimationQueue(this.rotationEngine);

    // 5. Bind update hooks for auto-rotation
    if (this.options.autoRotate) {
      this.cubeScene.registerUpdate(() => this._handleAutoRotation());
    }

    // Expose controller globally in dev mode for testing
    if (import.meta.env.DEV) {
      window.cubeController = this;
    }
  }

  /**
   * Slowly rotate the entire Rubik's cube on update.
   * @private
   */
  _handleAutoRotation() {
    if (!this.cubeModel || this.rotationEngine.isAnimating) return;
    const group = this.cubeModel.getGroup();
    group.rotation.y += this.options.autoRotateSpeed;
    group.rotation.x += this.options.autoRotateSpeed * 0.4;
  }

  /**
   * Apply a sequence of moves (e.g. "R U R' U'").
   * @param {string|string[]} moveInput - Space-separated move notation or an array of moves.
   */
  applyMoves(moveInput) {
    let moves = [];
    if (Array.isArray(moveInput)) {
      moves = moveInput;
    } else if (typeof moveInput === 'string') {
      // Split by whitespace and filter out empty elements
      moves = moveInput.trim().split(/\s+/).filter(m => m.length > 0);
    }
    
    this.animationQueue.add(moves);
  }

  /**
   * Set the playback animation speed.
   * @param {number} speed - The multiplier (1.0 default)
   */
  setSpeed(speed) {
    this.animationQueue.setSpeed(speed);
  }

  /**
   * Check if any move animations are actively running.
   * @returns {boolean}
   */
  isBusy() {
    return this.animationQueue.isBusy();
  }

  /**
   * Pause move execution.
   */
  pause() {
    this.animationQueue.pause();
  }

  /**
   * Resume move execution.
   */
  resume() {
    this.animationQueue.resume();
  }

  /**
   * Clear all pending animations in the queue.
   */
  clearQueue() {
    this.animationQueue.clear();
  }

  /**
   * Trigger canvas resizing.
   */
  resize() {
    if (this.cubeScene) {
      this.cubeScene.onResize();
    }
  }

  /**
   * Tear down all resources cleanly.
   */
  dispose() {
    if (this.cubeScene) {
      this.cubeScene.dispose();
      this.cubeScene = null;
    }
    if (this.animationQueue) {
      this.animationQueue.clear();
      this.animationQueue = null;
    }
    this.rotationEngine = null;
    this.cubeModel = null;

    if (window.cubeController === this) {
      delete window.cubeController;
    }
  }
}

export default CubeController;
