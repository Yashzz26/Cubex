class HomePage {
  constructor() {
    this.name = 'HomePage';
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

        <!-- 3D Cube Canvas Container Placeholder -->
        <div class="cube-showcase-container" style="width: 100%; max-width: 450px; height: 350px; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; position: relative; box-shadow: var(--shadow-md);">
          <div style="text-align: center; color: var(--text-secondary);">
            <div style="font-size: 3.5rem; margin-bottom: var(--spacing-sm); color: var(--primary-cta); opacity: 0.85;">
              <i class="bx bxs-cube-alt animate-pulse-subtle" style="animation: pulse-subtle 2s infinite ease-in-out;"></i>
            </div>
            <p class="font-medium">3D Cube Engine Preview</p>
            <p class="text-sm text-muted" style="margin-top: var(--spacing-xs);">Three.js canvas will load here in Phase 2</p>
          </div>
        </div>
      </div>
    `;
  }

  mount() {
    // Phase 1: Verify lifecycle mount
    console.log('HomePage mounted successfully');
  }

  destroy() {
    console.log('HomePage unmounted');
  }
}

export default HomePage;
