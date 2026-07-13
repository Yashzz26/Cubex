import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class CubeScene {
  /**
   * Initializes the Three.js WebGL workspace.
   * @param {HTMLElement} container - DOM element to mount the canvas.
   * @param {Object} options - Custom scene configurations.
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoRotate: false,
      enableZoom: true,
      enablePan: false,
      cameraPos: [4, 4, 6],
      ...options
    };

    this.width = this.container.clientWidth || 400;
    this.height = this.container.clientHeight || 400;

    // 1. Create Scene
    this.scene = new THREE.Scene();
    
    // Support transparent or tailored background based on active theme
    const isLightTheme = document.body.classList.contains('light-theme');
    this.scene.background = null; // Transparent so it blends with CSS container background

    // 2. Set up Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(...this.options.cameraPos);

    // 3. Set up Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 4. Set up Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = this.options.enableZoom;
    this.controls.enablePan = this.options.enablePan;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 12;

    // 5. Configure Lighting
    this._setupLights();

    // 6. Bind Event Listeners
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);

    this.animationFrameId = null;
    this.onUpdateCallbacks = [];

    // 7. Start Render Loop
    this.animate();
  }

  /**
   * Set up a multi-light rig to showcase glossy plastic textures.
   * @private
   */
  _setupLights() {
    // Soft Ambient Light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Directional Key Light (Top-Right-Front)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.keyLight.position.set(5, 8, 5);
    this.scene.add(this.keyLight);

    // Directional Fill Light (Bottom-Left-Back)
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.fillLight.position.set(-5, -3, -5);
    this.scene.add(this.fillLight);
  }

  /**
   * Register a callback to execute on each frame update.
   */
  registerUpdate(callback) {
    if (typeof callback === 'function') {
      this.onUpdateCallbacks.push(callback);
    }
  }

  /**
   * Main rendering loop.
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Update orbit controls
    this.controls.update();

    // Run custom update callbacks
    this.onUpdateCallbacks.forEach(callback => callback());

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Resize camera aspect and WebGL canvas dimensions.
   */
  onResize() {
    if (!this.container || !this.renderer) return;
    
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  }

  /**
   * Clean up all objects, events, and WebGL contexts.
   */
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.resizeHandler);

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }

    this.onUpdateCallbacks = [];
  }
}

export default CubeScene;
