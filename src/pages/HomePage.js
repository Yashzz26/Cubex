import CubeController from '../cube/CubeController.js';

class HomePage {
  constructor() {
    this.name = 'HomePage';
    this.cubeController = null;
  }

  render() {
    return `
      <div class="home-hero animate-slide-up" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex: 1; padding: var(--spacing-xxl) 0;">
        <h1 class="hero-title">Solve the cube.<br>See every move.</h1>
        <p class="hero-subtitle">
          Cubix is a modern 3×3 Rubik's Cube assistant. Scan your cube with your camera, recreate it manually, watch the solution step-by-step in 3D, and practice your solving speed.
        </p>
        
        <div class="hero-actions" style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center; margin-bottom: var(--spacing-xxl);">
          <a href="#/solver" class="btn btn-primary">
            <i class="bx bx-play-circle"></i> Solve a Cube
          </a>
          <a href="#/practice" class="btn btn-secondary">
            <i class="bx bx-timer"></i> Practice Mode
          </a>
        </div>

        <!-- 3D Cube Canvas Container -->
        <div id="home-cube-showcase" style="width: 100%; max-width: 450px; height: 350px; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; position: relative; box-shadow: var(--shadow-md); overflow: hidden;">
          <!-- Three.js Canvas will mount here -->
        </div>
      </div>
    `;
  }

  mount() {
    const container = document.getElementById('home-cube-showcase');
    if (container) {
      // Clear mount target text if any
      container.innerHTML = '';
      
      this.cubeController = new CubeController(container, {
        autoRotate: true,
        autoRotateSpeed: 0.003,
        enableZoom: false,
        enablePan: false,
        cameraPos: [3.8, 3.8, 5.2]
      });
    }
    console.log('HomePage mounted with 3D showcase');
  }

  destroy() {
    if (this.cubeController) {
      this.cubeController.dispose();
      this.cubeController = null;
      console.log('HomePage 3D showcase cleaned up');
    }
  }
}

export default HomePage;
