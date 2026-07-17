import ManualNetState from '../manual/ManualNetState.js';
import ManualValidator from '../manual/ManualValidator.js';
import storageManager from '../storage/StorageManager.js';
import router from '../core/Router.js';
import { FACES, COLOR_HEX } from '../utils/constants.js';

// Color metadata: code → CSS var name, display label, hex
const COLOR_META = [
  { code: 'W', cssVar: '--cube-white',  label: 'White',  face: 'U', hex: COLOR_HEX.white  },
  { code: 'Y', cssVar: '--cube-yellow', label: 'Yellow', face: 'D', hex: COLOR_HEX.yellow },
  { code: 'R', cssVar: '--cube-red',    label: 'Red',    face: 'R', hex: COLOR_HEX.red    },
  { code: 'O', cssVar: '--cube-orange', label: 'Orange', face: 'L', hex: COLOR_HEX.orange },
  { code: 'B', cssVar: '--cube-blue',   label: 'Blue',   face: 'B', hex: COLOR_HEX.blue   },
  { code: 'G', cssVar: '--cube-green',  label: 'Green',  face: 'F', hex: COLOR_HEX.green  }
];

// Face layout for the unfolded net (grid-column, grid-row, face code, default color meta)
const NET_LAYOUT = [
  { face: 'U', col: 2, row: 1, label: 'UP (U)' },
  { face: 'L', col: 1, row: 2, label: 'LEFT (L)' },
  { face: 'F', col: 2, row: 2, label: 'FRONT (F)' },
  { face: 'R', col: 3, row: 2, label: 'RIGHT (R)' },
  { face: 'B', col: 4, row: 2, label: 'BACK (B)' },
  { face: 'D', col: 2, row: 3, label: 'DOWN (D)' }
];

class ManualPage {
  constructor() {
    this.name = 'ManualPage';
    this.netState = new ManualNetState();
    this.selectedColor = 'W';
    this.isPainting = false;
    this._onMouseUp = () => { this.isPainting = false; };
  }

  render() {
    return `
      <div class="manual-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 1100px; margin: 0 auto; width: 100%;">
        
        <div style="text-align: center;">
          <h2 class="section-title">Manual Cube Input</h2>
          <p class="section-subtitle">Select a color from the palette, then click or drag stickers on the net to paint them.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr auto; gap: var(--spacing-xl); align-items: start;">
          
          <!-- Left: Net Editor -->
          <div class="card" style="display: flex; flex-direction: column; align-items: center; padding: var(--spacing-xl); overflow-x: auto; gap: var(--spacing-lg);">
            <div id="cube-net" style="display: grid; grid-template-columns: repeat(4, 110px); grid-template-rows: repeat(3, 110px); gap: var(--spacing-sm);">
              ${NET_LAYOUT.map(({ face, col, row, label }) => `
                <div style="grid-column: ${col}; grid-row: ${row}; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <p class="text-xs font-semibold text-muted" style="margin: 0; text-align: center; letter-spacing: 0.04em;">${label}</p>
                  <div id="face-grid-${face}" class="net-face-grid" data-face="${face}"
                       style="display: grid; grid-template-columns: repeat(3, 32px); grid-template-rows: repeat(3, 32px); gap: 3px; background: rgba(0,0,0,0.2); border: 1.5px solid var(--border-color); padding: 3px; border-radius: var(--radius-sm);">
                    ${this._renderFaceStickers(face)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Controls Sidebar -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 220px; min-width: 200px;">
            
            <!-- Color Palette -->
            <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">Color Palette</h3>
              <div class="color-palette" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-sm);">
                ${COLOR_META.map(({ code, cssVar, label }) => `
                  <button
                    class="palette-color ${code === 'W' ? 'active' : ''}"
                    data-color="${code}"
                    aria-label="Select ${label}"
                    title="${label}"
                    style="background-color: var(${cssVar}); aspect-ratio: 1; border: 2px solid ${code === 'W' ? 'var(--primary-cta)' : 'var(--border-color)'}; border-radius: var(--radius-sm); width: 100%;">
                  </button>
                `).join('')}
              </div>

              <!-- Selected color indicator -->
              <div style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); background: rgba(0,0,0,0.15); border-radius: var(--radius-sm);">
                <div id="selected-color-dot" style="width: 14px; height: 14px; border-radius: 50%; background: var(--cube-white); flex-shrink: 0; border: 1px solid rgba(0,0,0,0.3);"></div>
                <span id="selected-color-label" class="text-sm font-medium">White selected</span>
              </div>
            </div>

            <!-- Color Count Statistics -->
            <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">Sticker Counts</h3>
              <p class="text-xs text-muted" style="margin: 0;">Each color must appear exactly <strong>9</strong> times.</p>
              <div id="color-stats" style="display: flex; flex-direction: column; gap: 2px; margin-top: var(--spacing-xs);">
                ${COLOR_META.map(({ code, label, hex }) => `
                  <div class="color-count-row valid" id="count-row-${code}">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <span class="count-dot" style="background: ${hex};"></span>
                      <span>${label}</span>
                    </span>
                    <span class="count-val" id="count-val-${code}">9</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Actions -->
            <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">Actions</h3>
              <button id="preset-btn" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                <i class="bx bx-check-double"></i> Load Solved
              </button>
              <button id="clear-btn" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                <i class="bx bx-eraser"></i> Clear Net
              </button>
              <button id="solve-btn" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-xs);" disabled>
                <i class="bx bx-bolt-circle"></i> Solve Cube
              </button>
              <div id="validation-errors" style="display: none;"></div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the 9 sticker cells for a given face from current netState.
   * @private
   */
  _renderFaceStickers(face) {
    let html = '';
    for (let i = 0; i < 9; i++) {
      const isCenter = i === 4;
      const colorCode = this.netState.getSticker(face, i);
      const bgStyle = this._colorToCss(colorCode);
      const isUnpainted = colorCode === null;

      html += `
        <div class="net-sticker ${isUnpainted ? 'unpainted' : ''} ${isCenter ? 'center-sticker' : ''}"
             data-face="${face}"
             data-index="${i}"
             style="
               background-color: ${bgStyle};
               border-radius: 5px;
               border: ${isCenter ? '2px solid rgba(0,0,0,0.45)' : '1px solid rgba(0,0,0,0.18)'};
               cursor: ${isCenter ? 'not-allowed' : 'crosshair'};
               pointer-events: ${isCenter ? 'none' : 'auto'};
               position: relative;
               transition: transform 0.1s ease, box-shadow 0.1s ease;
             ">
          ${isCenter ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:rgba(0,0,0,0.3);"></div>' : ''}
        </div>`;
    }
    return html;
  }

  /**
   * Convert a color code to an inline CSS background-color value.
   * @private
   */
  _colorToCss(code) {
    const map = {
      W: '#ffffff', Y: '#ffcc00', R: '#ff3b30',
      O: '#ff9500', B: '#007aff', G: '#34c759'
    };
    return map[code] || '#1e2340';
  }

  mount() {
    // Restore auto-saved draft if present
    const draft = storageManager.getItem('draft_manual_state');
    if (draft) {
      this.netState.fromJSON(draft);
    }

    // Re-paint all sticker DOM elements to match current state
    this._repaintAllStickers();
    this._updateUI();

    // Bind palette clicks
    document.querySelectorAll('.palette-color').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedColor = btn.dataset.color;
        this._updatePaletteUI();
      });
    });

    // Bind sticker paint interactions (click + drag)
    document.querySelectorAll('.net-sticker').forEach(sticker => {
      sticker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.isPainting = true;
        this._paintSticker(sticker);
      });
      sticker.addEventListener('mouseover', () => {
        if (this.isPainting) this._paintSticker(sticker);
      });
      // Touch support
      sticker.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.isPainting = true;
        this._paintSticker(sticker);
      }, { passive: false });
    });

    // Stop painting on mouse/touch release anywhere
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('touchend', this._onMouseUp);

    // Action buttons
    document.getElementById('preset-btn')?.addEventListener('click', () => this._loadSolvedPreset());
    document.getElementById('clear-btn')?.addEventListener('click',  () => this._clearNet());
    document.getElementById('solve-btn')?.addEventListener('click',  () => this._solveCube());

    console.log('ManualPage mounted');
  }

  /**
   * Paint a sticker element with the currently selected color.
   * @private
   */
  _paintSticker(el) {
    const face  = el.dataset.face;
    const index = parseInt(el.dataset.index, 10);
    if (index === 4) return; // center lock

    this.netState.setSticker(face, index, this.selectedColor);
    el.style.backgroundColor = this._colorToCss(this.selectedColor);
    el.classList.remove('unpainted');

    // Auto-save draft
    storageManager.setItem('draft_manual_state', this.netState.toJSON());

    this._updateUI();
  }

  /**
   * Re-paint every sticker from the current netState (used after reset / clear / draft restore).
   * @private
   */
  _repaintAllStickers() {
    document.querySelectorAll('.net-sticker').forEach(el => {
      const face  = el.dataset.face;
      const index = parseInt(el.dataset.index, 10);
      const code  = this.netState.getSticker(face, index);
      el.style.backgroundColor = this._colorToCss(code);
      if (code === null) {
        el.classList.add('unpainted');
      } else {
        el.classList.remove('unpainted');
      }
    });
  }

  /**
   * Update palette active state and selected-color indicator.
   * @private
   */
  _updatePaletteUI() {
    const meta = COLOR_META.find(m => m.code === this.selectedColor);
    document.querySelectorAll('.palette-color').forEach(btn => {
      const isActive = btn.dataset.color === this.selectedColor;
      btn.classList.toggle('active', isActive);
      btn.style.borderColor = isActive ? 'var(--primary-cta)' : 'var(--border-color)';
    });
    const dot   = document.getElementById('selected-color-dot');
    const label = document.getElementById('selected-color-label');
    if (dot && meta)   dot.style.background   = `var(${meta.cssVar})`;
    if (label && meta) label.textContent = `${meta.label} selected`;
  }

  /**
   * Synchronize all dynamic UI elements with current state.
   * @private
   */
  _updateUI() {
    const counts = this.netState.getColorCounts();
    const unpainted = this.netState.getUnpaintedCount();
    let allValid = true;

    COLOR_META.forEach(({ code }) => {
      const count = counts[code] ?? 0;
      const row   = document.getElementById(`count-row-${code}`);
      const val   = document.getElementById(`count-val-${code}`);
      const ok    = count === 9;
      if (!ok) allValid = false;
      if (row) { row.classList.toggle('valid', ok); row.classList.toggle('invalid', !ok); }
      if (val) val.textContent = String(count);
    });

    // Enable Solve button only when fully valid
    const solveBtn = document.getElementById('solve-btn');
    if (solveBtn) solveBtn.disabled = !allValid || unpainted > 0;

    // Clear any previous errors when state is now valid
    if (allValid && unpainted === 0) {
      this._clearErrors();
    }
  }

  /**
   * Load the default solved configuration into the net.
   * @private
   */
  _loadSolvedPreset() {
    this.netState.reset();
    storageManager.removeItem('draft_manual_state');
    this._repaintAllStickers();
    this._updateUI();
    this._clearErrors();
  }

  /**
   * Clear all non-center stickers (set to unpainted).
   * @private
   */
  _clearNet() {
    this.netState.clear();
    storageManager.removeItem('draft_manual_state');
    this._repaintAllStickers();
    this._updateUI();
    this._clearErrors();
  }

  /**
   * Final validation then hand off to solver page.
   * @private
   */
  _solveCube() {
    const result = ManualValidator.validate(this.netState);
    if (!result.valid) {
      this._showErrors(result.errors);
      return;
    }
    this._clearErrors();
    // Save state and navigate to solver
    storageManager.setItem('pending_state', this.netState.toJSON());
    storageManager.removeItem('draft_manual_state');
    router.navigate('solver');
  }

  /**
   * Show a list of validation errors below the Solve button.
   * @private
   */
  _showErrors(errors) {
    const container = document.getElementById('validation-errors');
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = `<div class="validation-error-list">${errors.map(e => `<p>${e}</p>`).join('')}</div>`;
  }

  _clearErrors() {
    const container = document.getElementById('validation-errors');
    if (container) { container.style.display = 'none'; container.innerHTML = ''; }
  }

  destroy() {
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('touchend', this._onMouseUp);
    console.log('ManualPage unmounted');
  }
}

export default ManualPage;
