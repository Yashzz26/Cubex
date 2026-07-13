import CubeScene from './CubeScene.js';
import CubeModel from './CubeModel.js';

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

    // 4. Bind update hooks
    if (this.options.autoRotate) {
      this.cubeScene.registerUpdate(() => this._handleAutoRotation());
    }
  }

  /**
   * Slowly rotate the entire Rubik's cube on update.
   * @private
   */
  _handleAutoRotation() {
    if (!this.cubeModel) return;
    const group = this.cubeModel.getGroup();
    group.rotation.y += this.options.autoRotateSpeed;
    group.rotation.x += this.options.autoRotateSpeed * 0.4;
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
    this.cubeModel = null;
  }
}

export default CubeController;
