import { FACES } from '../utils/constants.js';

class ManualPage {
  constructor() {
    this.name = 'ManualPage';
  }

  render() {
    return `
      <div class="manual-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="text-align: center;">
          <h2 class="section-title">Manual Cube Input</h2>
          <p class="section-subtitle">Click colors on the palette and paint them onto the 2D cube net below.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: var(--spacing-lg); align-items: start;" class="grid-2">
          
          <!-- Left Column: Net Editor -->
          <div class="card" style="display: flex; flex-direction: column; align-items: center; padding: var(--spacing-xl); overflow-x: auto;">
            <!-- Unfolded Net Container -->
            <div class="cube-net-layout" style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, 1fr); gap: var(--spacing-md); width: max-content;">
              
              <!-- Row 1: UP (Column index 1, 0-indexed) -->
              <div style="grid-column: 2; grid-row: 1;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">UP (U)</p>
                ${this._generateFaceGrid(FACES.UP, 'white')}
              </div>

              <!-- Row 2: LEFT, FRONT, RIGHT, BACK -->
              <div style="grid-column: 1; grid-row: 2;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">LEFT (L)</p>
                ${this._generateFaceGrid(FACES.LEFT, 'orange')}
              </div>
              
              <div style="grid-column: 2; grid-row: 2;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">FRONT (F)</p>
                ${this._generateFaceGrid(FACES.FRONT, 'green')}
              </div>

              <div style="grid-column: 3; grid-row: 2;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">RIGHT (R)</p>
                ${this._generateFaceGrid(FACES.RIGHT, 'red')}
              </div>

              <div style="grid-column: 4; grid-row: 2;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">BACK (B)</p>
                ${this._generateFaceGrid(FACES.BACK, 'blue')}
              </div>

              <!-- Row 3: DOWN (Column index 1, 0-indexed) -->
              <div style="grid-column: 2; grid-row: 3;" class="net-face-wrapper">
                <p class="text-xs font-semibold text-center text-muted" style="margin-bottom: 4px;">DOWN (D)</p>
                ${this._generateFaceGrid(FACES.DOWN, 'yellow')}
              </div>

            </div>
          </div>

          <!-- Right Column: Color Palette & Actions -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            
            <!-- Palette Selection Card -->
            <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
              <h3 style="font-size: 1.1rem; font-weight: 700;">Color Palette</h3>
              
              <div class="color-palette" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--spacing-xs);">
                <button class="palette-color active" style="background-color: var(--cube-white); aspect-ratio: 1; border: 2px solid var(--primary-cta); border-radius: var(--radius-sm);" aria-label="Select White"></button>
                <button class="palette-color" style="background-color: var(--cube-yellow); aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" aria-label="Select Yellow"></button>
                <button class="palette-color" style="background-color: var(--cube-red); aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" aria-label="Select Red"></button>
                <button class="palette-color" style="background-color: var(--cube-orange); aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" aria-label="Select Orange"></button>
                <button class="palette-color" style="background-color: var(--cube-blue); aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" aria-label="Select Blue"></button>
                <button class="palette-color" style="background-color: var(--cube-green); aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" aria-label="Select Green"></button>
              </div>

              <!-- Color Statistics Counts -->
              <div class="color-statistics" style="margin-top: var(--spacing-sm); display: flex; flex-direction: column; gap: var(--spacing-xs);">
                <p class="text-xs font-semibold text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Sticker Distribution</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>White (U)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>Yellow (D)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>Red (R)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>Orange (L)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>Blue (B)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span>Green (F)</span>
                  <span class="font-semibold">9 / 9</span>
                </div>
              </div>
            </div>

            <!-- Workspace Actions Card -->
            <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
              <h3 style="font-size: 1.1rem; font-weight: 700;">Actions</h3>
              <button class="btn btn-secondary" style="width: 100%;"><i class="bx bx-check-double"></i> Load Solved Preset</button>
              <button class="btn btn-secondary" style="width: 100%;"><i class="bx bx-trash"></i> Clear Cube Net</button>
              <button class="btn btn-primary" style="width: 100%; margin-top: var(--spacing-sm);" disabled>
                <i class="bx bx-bolt-circle"></i> Solve Cube
              </button>
            </div>
            
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generates a 3x3 grid representation for a single Rubik's cube face net.
   * @private
   */
  _generateFaceGrid(faceCode, defaultColorName) {
    const defaultColorVar = `var(--cube-${defaultColorName})`;
    
    // Generate 9 stickers
    let gridHTML = `<div class="net-face-grid" style="display: grid; grid-template-columns: repeat(3, 30px); grid-template-rows: repeat(3, 30px); gap: 2px; border: 1.5px solid var(--border-color); padding: 2px; border-radius: var(--radius-sm); background-color: var(--bg-color);">`;
    
    for (let i = 0; i < 9; i++) {
      const isCenter = i === 4;
      const borderStyle = isCenter ? '2px solid rgba(0,0,0,0.4)' : '1px solid var(--cube-sticker-border)';
      const pointerEvents = isCenter ? 'none' : 'auto';
      const cursor = isCenter ? 'not-allowed' : 'pointer';
      
      gridHTML += `
        <div class="net-sticker" 
             data-face="${faceCode}" 
             data-index="${i}" 
             style="background-color: ${defaultColorVar}; border: ${borderStyle}; border-radius: 4px; pointer-events: ${pointerEvents}; cursor: ${cursor}; position: relative;">
             ${isCenter ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.35);"></div>` : ''}
        </div>
      `;
    }
    
    gridHTML += `</div>`;
    return gridHTML;
  }

  mount() {
    console.log('ManualPage mounted');
  }

  destroy() {
    console.log('ManualPage unmounted');
  }
}

export default ManualPage;
