class ScannerPage {
  constructor() {
    this.name = 'ScannerPage';
  }

  render() {
    return `
      <div class="scanner-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 800px; margin: 0 auto; width: 100%;">
        <div style="text-align: center;">
          <h2 class="section-title">Camera Cube Scanner</h2>
          <p class="section-subtitle">Follow the instructions to scan each face of your physical cube.</p>
        </div>

        <div class="scanner-content card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 450px; position: relative; overflow: hidden; text-align: center;">
          
          <!-- Guided Camera Stream Container Placeholder -->
          <div class="camera-viewport-placeholder" style="width: 100%; max-width: 380px; aspect-ratio: 1; background: rgba(0,0,0,0.3); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: var(--spacing-lg);">
            
            <!-- 3x3 Calibration Grid Overlay -->
            <div style="position: absolute; width: 80%; height: 80%; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 4px; pointer-events: none; opacity: 0.4;">
              ${Array(9).fill('<div style="border: 1px solid var(--text-primary); border-radius: 4px;"></div>').join('')}
            </div>
            
            <div style="color: var(--text-secondary); text-align: center; padding: var(--spacing-md); z-index: 1;">
              <i class="bx bx-camera" style="font-size: 3rem; color: var(--primary-cta); margin-bottom: var(--spacing-xs);"></i>
              <p class="font-semibold text-sm">Camera Permission Requested</p>
              <p class="text-xs text-muted" style="margin-top: 4px; max-width: 250px;">Click the button below to grant browser access to your camera.</p>
            </div>
          </div>

          <!-- Active Instruction Panel -->
          <div class="scanner-instruction" style="margin-bottom: var(--spacing-lg);">
            <span class="text-xs text-primary font-bold" style="padding: 0.25rem 0.5rem; background: var(--primary-cta-glow); border-radius: var(--radius-sm); text-transform: uppercase;">
              Face 1 of 6
            </span>
            <h3 style="margin-top: var(--spacing-sm); font-size: 1.25rem;">FRONT FACE (GREEN)</h3>
            <p class="text-sm text-secondary" style="max-width: 320px; margin: 4px auto 0;">Align the green center sticker inside the central grid cell.</p>
          </div>

          <!-- Scanner Controls -->
          <div class="scanner-actions" style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
            <button class="btn btn-primary"><i class="bx bx-video"></i> Start Scanner</button>
            <a href="#/manual" class="btn btn-secondary"><i class="bx bx-edit"></i> Switch to Manual Input</a>
          </div>
        </div>
      </div>
    `;
  }

  mount() {
    console.log('ScannerPage mounted');
  }

  destroy() {
    console.log('ScannerPage unmounted');
  }
}

export default ScannerPage;
