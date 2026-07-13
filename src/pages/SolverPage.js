import CubeController from '../cube/CubeController.js';

class SolverPage {
  constructor() {
    this.name = 'SolverPage';
    this.cubeController = null;
  }

  render() {
    return `
      <div class="solver-workspace animate-fade-in">
        <!-- Sidebar controls (Left Pane) -->
        <aside class="solver-sidebar card" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          <div>
            <h2 class="section-title">Workspace</h2>
            <p class="text-sm text-secondary">Verify cube state and play solution.</p>
          </div>
          
          <div class="solver-status" style="padding: var(--spacing-md); background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Cube Status</p>
            <p class="font-semibold" style="margin-top: var(--spacing-xs); display: flex; align-items: center; gap: var(--spacing-xs);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--warning); display: inline-block;"></span>
              Unsolved / Not Configured
            </p>
          </div>

          <div class="solve-actions-wrapper" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
            <p class="text-xs font-semibold text-secondary">Input Cube Configuration</p>
            <div style="display: flex; gap: var(--spacing-sm);">
              <a href="#/scanner" class="btn btn-secondary" style="flex: 1; padding: 0.5rem 1rem; font-size: 0.875rem;">
                <i class="bx bx-camera"></i> Scan Camera
              </a>
              <a href="#/manual" class="btn btn-secondary" style="flex: 1; padding: 0.5rem 1rem; font-size: 0.875rem;">
                <i class="bx bx-edit"></i> Manual Input
              </a>
            </div>
          </div>

          <!-- Solution control skeletons -->
          <div class="solution-playback" style="margin-top: auto; display: flex; flex-direction: column; gap: var(--spacing-md); border-top: 1px solid var(--border-color); padding-top: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-sm font-semibold">Solution Move List</span>
              <span class="text-xs text-muted">0 Moves</span>
            </div>
            
            <div class="move-highlight-container" style="background: rgba(0,0,0,0.1); border-radius: var(--radius-md); padding: var(--spacing-md); text-align: center; color: var(--text-muted);">
              No solution loaded
            </div>

            <div class="playback-controls" style="display: flex; justify-content: center; gap: var(--spacing-md);">
              <button class="btn-icon" disabled><i class="bx bx-skip-previous"></i></button>
              <button class="btn-icon" disabled><i class="bx bx-play"></i></button>
              <button class="btn-icon" disabled><i class="bx bx-skip-next"></i></button>
              <button class="btn-icon" disabled><i class="bx bx-reset"></i></button>
            </div>
          </div>
        </aside>

        <!-- 3D Cube rendering container (Right Pane) -->
        <main id="solver-cube-canvas" class="solver-cube-area" style="min-height: 400px; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-lg); position: relative; overflow: hidden; box-shadow: var(--shadow-md);">
          <!-- Three.js Canvas will mount here -->
        </main>
      </div>
    `;
  }

  mount() {
    const container = document.getElementById('solver-cube-canvas');
    if (container) {
      container.innerHTML = '';
      
      this.cubeController = new CubeController(container, {
        autoRotate: false,
        enableZoom: true,
        enablePan: false,
        cameraPos: [4.2, 4.2, 6.2]
      });
    }
    console.log('SolverPage mounted with 3D scene');
  }

  destroy() {
    if (this.cubeController) {
      this.cubeController.dispose();
      this.cubeController = null;
      console.log('SolverPage 3D scene cleaned up');
    }
  }
}

export default SolverPage;
