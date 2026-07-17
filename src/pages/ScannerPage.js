import CameraManager from '../scanner/CameraManager.js';
import FrameProcessor from '../scanner/FrameProcessor.js';
import GridSampler from '../scanner/GridSampler.js';
import ColorClassifier from '../scanner/ColorClassifier.js';
import ScanSession from '../scanner/ScanSession.js';
import storageManager from '../storage/StorageManager.js';
import router from '../core/Router.js';
import { SCAN_ORDER } from '../utils/constants.js';

// Color hex lookup for preview rendering
const COLOR_HEX_MAP = {
  W: '#ffffff', Y: '#ffcc00', R: '#ff3b30',
  O: '#ff9500', B: '#007aff', G: '#34c759'
};
const COLOR_LABEL = {
  W: 'White', Y: 'Yellow', R: 'Red', O: 'Orange', B: 'Blue', G: 'Green'
};
const FACE_LABEL = { F: 'FRONT', R: 'RIGHT', B: 'BACK', L: 'LEFT', U: 'UP', D: 'DOWN' };
const FACE_COLOR_HINT = { F: 'Green center', R: 'Red center', B: 'Blue center', L: 'Orange center', U: 'White center', D: 'Yellow center' };

class ScannerPage {
  constructor() {
    this.name = 'ScannerPage';

    // Scanner modules
    this.cameraManager   = new CameraManager();
    this.frameProcessor  = null;
    this.gridSampler     = null;
    this.scanSession     = new ScanSession();

    // Off-DOM canvas for pixel sampling
    this.offscreenCanvas = null;

    // State machine
    // States: IDLE | REQUESTING | LIVE | CAPTURED | COMPLETE | ERROR | UNSUPPORTED
    this.state = 'IDLE';

    // Current captured face data
    this.capturedColors  = null;  // string[] of 9 color codes
    this.correctionIndex = null;  // sticker index currently being corrected

    // Bound handler for cleanup
    this._boundResize = () => this._syncOverlay();
  }

  render() {
    return `
      <div class="scanner-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 780px; margin: 0 auto; width: 100%;">

        <!-- Page Header -->
        <div style="text-align: center;">
          <h2 class="section-title">Camera Cube Scanner</h2>
          <p class="section-subtitle" id="scanner-subtitle">Scan each face of your Rubik's Cube using your camera.</p>
        </div>

        <!-- Progress Bar -->
        <div id="scanner-progress-wrap" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xs);">
            <span id="progress-label" class="text-sm font-semibold text-secondary">Face 1 of 6</span>
            <span id="face-name-label" class="text-xs font-bold" style="padding: 2px 10px; border-radius: 20px; background: var(--primary-cta-glow); color: var(--primary-cta);">FRONT FACE</span>
          </div>
          <div style="height: 5px; background: var(--border-color); border-radius: 10px; overflow: hidden;">
            <div id="progress-fill" style="height: 100%; background: var(--primary-cta); border-radius: 10px; transition: width 0.4s ease; width: 0%;"></div>
          </div>
          <p id="face-hint" class="text-xs text-muted" style="margin-top: 4px;">Align the <strong>Green center</strong> sticker inside the grid center cell.</p>
        </div>

        <!-- Main Card -->
        <div class="card" id="scanner-card" style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-lg); padding: var(--spacing-xl); min-height: 460px; justify-content: center;">

          <!-- IDLE STATE -->
          <div id="state-idle" style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-lg); text-align: center;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--primary-cta-glow); display: flex; align-items: center; justify-content: center;">
              <i class="bx bx-camera" style="font-size: 2.2rem; color: var(--primary-cta);"></i>
            </div>
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 6px;">Ready to Scan</h3>
              <p class="text-sm text-secondary" style="max-width: 320px; margin: 0 auto;">
                Hold each face of your cube steady in front of the camera. You'll scan all 6 faces one by one.
              </p>
            </div>
            <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center;">
              <button id="start-btn" class="btn btn-primary">
                <i class="bx bx-video"></i> Start Scanner
              </button>
              <a href="#/manual" class="btn btn-secondary">
                <i class="bx bx-edit"></i> Manual Input Instead
              </a>
            </div>
          </div>

          <!-- ERROR STATE -->
          <div id="state-error" style="display: none; flex-direction: column; align-items: center; gap: var(--spacing-lg); text-align: center;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(239,68,68,0.12); display: flex; align-items: center; justify-content: center;">
              <i class="bx bx-camera-off" style="font-size: 2.2rem; color: var(--danger);"></i>
            </div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; color: var(--danger);">Camera Unavailable</h3>
              <p id="error-message" class="text-sm text-secondary" style="max-width: 300px; margin: 0 auto;">Camera permission was denied.</p>
            </div>
            <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center;">
              <button id="retry-btn" class="btn btn-secondary"><i class="bx bx-refresh"></i> Try Again</button>
              <a href="#/manual" class="btn btn-primary"><i class="bx bx-edit"></i> Switch to Manual Input</a>
            </div>
          </div>

          <!-- LIVE / CAPTURE STATE — video + overlay + controls -->
          <div id="state-live" style="display: none; flex-direction: column; align-items: center; gap: var(--spacing-md); width: 100%;">
            <!-- Video viewport -->
            <div id="video-container" class="scanner-video-container" style="position: relative; width: 100%; max-width: 380px; aspect-ratio: 1; background: #000; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);">
              <video id="scanner-video" autoplay playsinline muted
                     style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
              <!-- 3×3 scan grid overlay -->
              <div id="scan-grid-overlay" class="scan-grid-overlay"
                   style="position: absolute; top: 12.5%; left: 12.5%; width: 75%; height: 75%; display: grid; grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(3,1fr); gap: 3px; pointer-events: none;">
                ${Array(9).fill(0).map((_, i) => `
                  <div class="scan-cell ${i === 4 ? 'scan-cell-center' : ''}"
                       style="border: ${i === 4 ? '2px solid rgba(255,255,255,0.9)' : '1.5px solid rgba(255,255,255,0.45)'}; border-radius: 4px; background: rgba(255,255,255,0.03);"></div>
                `).join('')}
              </div>
              <!-- Corner markers for visual alignment -->
              <div style="position: absolute; top: 10%; left: 10%; width: 14px; height: 14px; border-top: 3px solid var(--primary-cta); border-left: 3px solid var(--primary-cta); border-radius: 2px;"></div>
              <div style="position: absolute; top: 10%; right: 10%; width: 14px; height: 14px; border-top: 3px solid var(--primary-cta); border-right: 3px solid var(--primary-cta); border-radius: 2px;"></div>
              <div style="position: absolute; bottom: 10%; left: 10%; width: 14px; height: 14px; border-bottom: 3px solid var(--primary-cta); border-left: 3px solid var(--primary-cta); border-radius: 2px;"></div>
              <div style="position: absolute; bottom: 10%; right: 10%; width: 14px; height: 14px; border-bottom: 3px solid var(--primary-cta); border-right: 3px solid var(--primary-cta); border-radius: 2px;"></div>
            </div>

            <!-- Capture controls -->
            <div id="live-controls" style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center;">
              <button id="back-btn" class="btn btn-secondary" style="display: none;">
                <i class="bx bx-chevron-left"></i> Back
              </button>
              <button id="capture-btn" class="btn btn-primary" style="min-width: 160px;">
                <i class="bx bx-camera"></i> Capture Face
              </button>
            </div>
          </div>

          <!-- CAPTURED / CORRECTION STATE — preview grid + correction palette -->
          <div id="state-captured" style="display: none; flex-direction: column; align-items: center; gap: var(--spacing-lg); width: 100%;">
            <div style="text-align: center;">
              <p class="text-sm font-semibold" style="margin-bottom: 4px;">Detected Colors</p>
              <p class="text-xs text-muted">Tap any sticker to correct its color, then confirm.</p>
            </div>

            <!-- 3×3 preview grid -->
            <div id="preview-grid"
                 style="display: grid; grid-template-columns: repeat(3, 68px); grid-template-rows: repeat(3, 68px); gap: 4px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              ${Array(9).fill(0).map((_, i) => `
                <div class="preview-sticker"
                     data-index="${i}"
                     id="preview-sticker-${i}"
                     style="background: #444; border-radius: 8px; cursor: pointer; border: 2px solid rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: rgba(0,0,0,0.5); transition: transform 0.12s ease, box-shadow 0.12s ease;">
                </div>
              `).join('')}
            </div>

            <!-- Correction palette (shown when a sticker is selected) -->
            <div id="correction-palette" style="display: none; flex-direction: column; align-items: center; gap: var(--spacing-sm);">
              <p class="text-xs text-muted font-semibold">Select correct color:</p>
              <div style="display: flex; gap: var(--spacing-sm);">
                ${['W','Y','R','O','B','G'].map(code => `
                  <button class="correction-swatch"
                          data-color="${code}"
                          title="${COLOR_LABEL[code]}"
                          style="width: 38px; height: 38px; border-radius: 50%; background: ${COLOR_HEX_MAP[code]}; border: 3px solid rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.12s ease, box-shadow 0.12s ease;">
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Confirm / Re-scan controls -->
            <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center;">
              <button id="rescan-btn" class="btn btn-secondary">
                <i class="bx bx-refresh"></i> Re-scan
              </button>
              <button id="confirm-btn" class="btn btn-primary" style="min-width: 150px;">
                <i class="bx bx-check"></i> Confirm Face
              </button>
            </div>
          </div>

        </div><!-- end scanner-card -->
      </div>
    `;
  }

  mount() {
    // Check camera support
    if (!this.cameraManager.isSupported()) {
      this._setState('UNSUPPORTED');
      this._showError('Your browser does not support camera access. Please use a modern browser or try Manual Input.');
      return;
    }

    // Restore any in-progress scan session
    const restored = this.scanSession.restore();
    if (restored && this.scanSession.currentFaceIndex > 0) {
      console.log(`Scanner: restored session at face index ${this.scanSession.currentFaceIndex}`);
    }

    // Create offscreen canvas for pixel sampling
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width  = 640;
    this.offscreenCanvas.height = 640;

    // Bind button events
    document.getElementById('start-btn')?.addEventListener('click', () => this._startCamera());
    document.getElementById('retry-btn')?.addEventListener('click', () => this._startCamera());
    document.getElementById('capture-btn')?.addEventListener('click', () => this._captureFrame());
    document.getElementById('back-btn')?.addEventListener('click', () => this._goBack());
    document.getElementById('rescan-btn')?.addEventListener('click', () => this._rescan());
    document.getElementById('confirm-btn')?.addEventListener('click', () => this._confirmFace());

    // Preview sticker click (correction)
    document.querySelectorAll('.preview-sticker').forEach(el => {
      el.addEventListener('click', () => this._selectStickerForCorrection(parseInt(el.dataset.index, 10)));
    });

    // Correction swatch click
    document.querySelectorAll('.correction-swatch').forEach(el => {
      el.addEventListener('click', () => this._applyCorrection(el.dataset.color));
    });

    window.addEventListener('resize', this._boundResize);

    // Auto-start if session was restored mid-scan
    if (restored && this.scanSession.currentFaceIndex > 0) {
      this._startCamera();
    }

    console.log('ScannerPage mounted');
  }

  // ─── State Transitions ────────────────────────────────────────────────────────

  async _startCamera() {
    this._setState('REQUESTING');
    const videoEl = document.getElementById('scanner-video');
    if (!videoEl) return;

    try {
      this.frameProcessor = new FrameProcessor(videoEl, this.offscreenCanvas);
      this.gridSampler    = new GridSampler(this.frameProcessor);
      await this.cameraManager.start(videoEl);
      this._setState('LIVE');
      this._updateProgress();
    } catch (err) {
      console.error('Camera start failed:', err);
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission was denied. Please allow camera access in your browser settings.'
        : `Camera error: ${err.message}`;
      this._showError(msg);
    }
  }

  _captureFrame() {
    if (!this.frameProcessor || !this.gridSampler) return;
    this.frameProcessor.captureFrame();
    const rgbSamples = this.gridSampler.sample();
    this.capturedColors = ColorClassifier.classifyFace(rgbSamples);
    this._setState('CAPTURED');
    this._renderPreviewGrid(this.capturedColors);
  }

  _rescan() {
    this.capturedColors  = null;
    this.correctionIndex = null;
    this._setState('LIVE');
  }

  _confirmFace() {
    const faceCode = this.scanSession.getCurrentFace();
    if (!faceCode || !this.capturedColors) return;

    this.scanSession.setFace(faceCode, this.capturedColors);
    this.scanSession.advance();
    this.capturedColors  = null;
    this.correctionIndex = null;

    if (this.scanSession.isComplete()) {
      this._complete();
    } else {
      this._setState('LIVE');
      this._updateProgress();
    }
  }

  _goBack() {
    this.scanSession.goBack();
    this.capturedColors  = null;
    this.correctionIndex = null;
    this._setState('LIVE');
    this._updateProgress();
  }

  _complete() {
    this.cameraManager.stop();
    const stateJSON = this.scanSession.toManualNetStateJSON();
    storageManager.setItem('pending_state', stateJSON);
    this.scanSession.reset();
    router.navigate('solver');
  }

  _selectStickerForCorrection(index) {
    this.correctionIndex = index;
    // Highlight the selected sticker
    document.querySelectorAll('.preview-sticker').forEach((el, i) => {
      el.style.boxShadow = i === index ? '0 0 0 3px var(--primary-cta)' : 'none';
      el.style.transform = i === index ? 'scale(1.08)' : 'scale(1)';
    });
    // Show correction palette
    const palette = document.getElementById('correction-palette');
    if (palette) palette.style.display = 'flex';
  }

  _applyCorrection(colorCode) {
    if (this.correctionIndex === null || !this.capturedColors) return;
    this.capturedColors[this.correctionIndex] = colorCode;
    // Update the sticker cell
    const el = document.getElementById(`preview-sticker-${this.correctionIndex}`);
    if (el) {
      el.style.backgroundColor = COLOR_HEX_MAP[colorCode];
    }
    // Deselect
    this.correctionIndex = null;
    document.querySelectorAll('.preview-sticker').forEach(s => {
      s.style.boxShadow = 'none';
      s.style.transform = 'scale(1)';
    });
    document.getElementById('correction-palette').style.display = 'none';
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────────

  _setState(newState) {
    this.state = newState;

    // Show/hide sections
    const show = (id, flex = true) => {
      const el = document.getElementById(id);
      if (el) el.style.display = flex ? 'flex' : 'block';
    };
    const hide = (id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    };

    hide('state-idle');
    hide('state-error');
    hide('state-live');
    hide('state-captured');

    const progressWrap = document.getElementById('scanner-progress-wrap');

    switch (newState) {
      case 'IDLE':
        show('state-idle');
        if (progressWrap) progressWrap.style.display = 'none';
        break;
      case 'REQUESTING':
        show('state-idle'); // keep visible briefly
        if (progressWrap) progressWrap.style.display = 'none';
        break;
      case 'LIVE':
        show('state-live');
        if (progressWrap) progressWrap.style.display = 'block';
        // Show back button only after face 1
        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.style.display = this.scanSession.currentFaceIndex > 0 ? 'inline-flex' : 'none';
        break;
      case 'CAPTURED':
        show('state-captured');
        if (progressWrap) progressWrap.style.display = 'block';
        hide('correction-palette');
        break;
      case 'ERROR':
      case 'UNSUPPORTED':
        show('state-error');
        if (progressWrap) progressWrap.style.display = 'none';
        break;
    }
  }

  _showError(message) {
    this._setState('ERROR');
    const msgEl = document.getElementById('error-message');
    if (msgEl) msgEl.textContent = message;
  }

  _updateProgress() {
    const { current, total } = this.scanSession.getProgress();
    const face  = this.scanSession.getCurrentFace();
    const label = FACE_LABEL[face] ?? '';
    const hint  = FACE_COLOR_HINT[face] ?? '';

    const progressLabel = document.getElementById('progress-label');
    const faceNameLabel = document.getElementById('face-name-label');
    const progressFill  = document.getElementById('progress-fill');
    const faceHint      = document.getElementById('face-hint');

    if (progressLabel) progressLabel.textContent = `Face ${current} of ${total}`;
    if (faceNameLabel) faceNameLabel.textContent = `${label} FACE`;
    if (progressFill)  progressFill.style.width  = `${((current - 1) / total) * 100}%`;
    if (faceHint)      faceHint.innerHTML = `Align the <strong>${hint}</strong> sticker inside the center grid cell.`;
  }

  _renderPreviewGrid(colors) {
    colors.forEach((code, i) => {
      const el = document.getElementById(`preview-sticker-${i}`);
      if (!el) return;
      el.style.backgroundColor = COLOR_HEX_MAP[code] ?? '#444';
      el.style.boxShadow = i === 4 ? 'inset 0 0 0 2px rgba(0,0,0,0.4)' : 'none';
    });
  }

  _syncOverlay() {
    // No-op: CSS handles overlay positioning
  }

  destroy() {
    this.cameraManager.stop();
    window.removeEventListener('resize', this._boundResize);
    if (this.offscreenCanvas) {
      this.offscreenCanvas = null;
    }
    console.log('ScannerPage unmounted');
  }
}

export default ScannerPage;
