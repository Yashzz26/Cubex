import ScrambleGenerator from '../practice/ScrambleGenerator.js';
import SolveTimer from '../practice/SolveTimer.js';
import InspectionTimer from '../practice/InspectionTimer.js';
import practiceStorage from '../practice/PracticeStorage.js';
import StatisticsManager from '../practice/StatisticsManager.js';
import CubeController from '../cube/CubeController.js';

// States: IDLE | INSPECTION | SOLVING | STOPPED
const STATES = { IDLE: 'IDLE', INSPECTION: 'INSPECTION', SOLVING: 'SOLVING', STOPPED: 'STOPPED' };

class PracticePage {
  constructor() {
    this.name = 'PracticePage';

    // Practice modules
    this.scrambleGen    = ScrambleGenerator;
    this.solveTimer     = new SolveTimer();
    this.inspectionTimer = new InspectionTimer(15);
    this.cubeController = null;

    // Page state
    this.state          = STATES.IDLE;
    this.currentScramble = '';
    this.lastSolveMs    = 0;

    // Bound event handlers (for cleanup)
    this._onKeyDown = (e) => this._handleKey(e);
  }

  render() {
    return `
      <div class="practice-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="text-align: center;">
          <h2 class="section-title">Cube Practice Mode</h2>
          <p class="section-subtitle">Scramble, inspect, and time your solves. Track your improvement.</p>
        </div>

        <!-- Scramble Card -->
        <div class="card" style="text-align: center; display: flex; flex-direction: column; gap: var(--spacing-sm); align-items: center;">
          <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Active Scramble</p>
          <div id="scramble-display" class="scramble-notation font-semibold"
               style="font-size: 1.15rem; font-family: monospace; letter-spacing: 0.04em; padding: var(--spacing-sm) var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); border: 1px solid var(--border-color); max-width: 100%; word-break: break-all; min-height: 2.5rem; display: flex; align-items: center; justify-content: center;">
            Generating...
          </div>
          <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-xs); flex-wrap: wrap; justify-content: center;">
            <button id="new-scramble-btn" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
              <i class="bx bx-refresh"></i> New Scramble
            </button>
            <button id="animate-scramble-btn" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
              <i class="bx bx-play"></i> Animate Scramble
            </button>
          </div>
        </div>

        <!-- Main Grid: Timer + Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); align-items: start;">

          <!-- Timer Section -->
          <div class="card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; text-align: center; gap: var(--spacing-md);">
            <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Timer</p>

            <!-- Big timer display -->
            <div id="timer-display" class="timer-digits" style="font-size: clamp(3rem, 10vw, 5rem); font-family: monospace; font-weight: 500; line-height: 1; transition: color 0.3s ease;">
              00.00
            </div>

            <!-- Status label -->
            <p id="timer-status-label" class="text-sm text-muted" style="min-height: 1.4em; transition: color 0.25s ease;">
              Press <kbd style="background: var(--surface-hover); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.75rem;">SPACE</kbd> or tap to start inspection
            </p>

            <!-- Action button -->
            <button id="timer-action-btn" class="btn btn-primary btn-lg" style="padding: 0.75rem 2.5rem; min-width: 180px;">
              <i class="bx bx-time-five"></i> Start Inspection
            </button>

            <!-- Escape hint -->
            <p class="text-xs text-muted" id="escape-hint" style="display: none;">
              Press <kbd style="background: var(--surface-hover); padding: 1px 5px; border-radius: 3px; border: 1px solid var(--border-color); font-size: 0.7rem;">ESC</kbd> to reset
            </p>
          </div>

          <!-- Stats + Recent Solves -->
          <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <h3 style="font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: var(--spacing-xs);">
              <i class="bx bx-bar-chart-alt-2" style="color: var(--primary-cta);"></i> Statistics
            </h3>

            <!-- Stat grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm); text-align: center;">
              <div class="stat-card" style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Best Time</p>
                <p id="stat-best" class="font-bold" style="font-size: 1.3rem; margin-top: 4px; font-family: monospace;">--</p>
              </div>
              <div class="stat-card" style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Total Solves</p>
                <p id="stat-solves" class="font-bold" style="font-size: 1.3rem; margin-top: 4px; font-family: monospace;">0</p>
              </div>
              <div class="stat-card" style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Ao5</p>
                <p id="stat-ao5" class="font-bold" style="font-size: 1.3rem; margin-top: 4px; font-family: monospace;">--</p>
              </div>
              <div class="stat-card" style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Ao12</p>
                <p id="stat-ao12" class="font-bold" style="font-size: 1.3rem; margin-top: 4px; font-family: monospace;">--</p>
              </div>
            </div>

            <!-- Recent Solves -->
            <div style="margin-top: var(--spacing-xs);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                <p class="text-xs font-semibold text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Recent Solves</p>
                <button id="clear-history-btn" class="btn btn-ghost" style="font-size: 0.7rem; padding: 2px 8px; opacity: 0.6;">
                  <i class="bx bx-trash"></i> Clear
                </button>
              </div>
              <div id="recent-solves-list" style="display: flex; flex-direction: column; gap: 3px; max-height: 220px; overflow-y: auto;">
                <!-- populated by JS -->
              </div>
            </div>
          </div>
        </div>

        <!-- 3D Cube for scramble animation -->
        <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
          <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; text-align: center;">Scramble Preview</p>
          <div id="practice-cube-canvas" style="width: 100%; height: 320px; border-radius: var(--radius-md); overflow: hidden; background: rgba(0,0,0,0.15);"></div>
        </div>
      </div>
    `;
  }

  mount() {
    // Generate initial scramble
    this._newScramble();

    // Mount 3D cube for scramble preview
    const canvasContainer = document.getElementById('practice-cube-canvas');
    if (canvasContainer) {
      try {
        this.cubeController = new CubeController(canvasContainer, { autoRotate: true, autoRotateSpeed: 0.004 });
      } catch (e) {
        console.warn('Practice cube init failed:', e);
        this.cubeController = null;
      }
    }

    // Populate stats from storage
    this._updateStats();
    this._renderRecentSolves();

    // Bind buttons
    document.getElementById('new-scramble-btn')?.addEventListener('click',      () => this._newScramble());
    document.getElementById('animate-scramble-btn')?.addEventListener('click',  () => this._animateScramble());
    document.getElementById('timer-action-btn')?.addEventListener('click',      () => this._advanceState());
    document.getElementById('clear-history-btn')?.addEventListener('click',     () => this._clearHistory());

    // Spacebar / Escape control
    window.addEventListener('keydown', this._onKeyDown);

    // Configure timer callbacks
    this.solveTimer.onTick(({ minutes, seconds, centiseconds }) => {
      const ss = String(seconds).padStart(2, '0');
      const cs = String(centiseconds).padStart(2, '0');
      const display = minutes > 0 ? `${minutes}:${ss}.${cs}` : `${ss}.${cs}`;
      const el = document.getElementById('timer-display');
      if (el) el.textContent = display;
    });

    console.log('PracticePage mounted');
  }

  // ─── State Machine ──────────────────────────────────────────────────────────

  _advanceState() {
    switch (this.state) {
      case STATES.IDLE:        this._startInspection(); break;
      case STATES.INSPECTION:  this._startSolve();      break;
      case STATES.SOLVING:     this._stopSolve();       break;
      case STATES.STOPPED:     this._resetToIdle();     break;
    }
  }

  _startInspection() {
    this.state = STATES.INSPECTION;
    this.inspectionTimer.reset();
    this._setTimerColor('inspection');
    this._setStatus('Inspection: 15s', 'var(--warning)');
    this._setActionBtn('bx-play', 'Start Timer');
    this._showEscapeHint(true);

    this.inspectionTimer.start(
      (remaining) => {
        const secs = Math.ceil(remaining);
        this._setStatus(`Inspection: ${secs}s`, secs <= 3 ? 'var(--danger)' : 'var(--warning)');
        const el = document.getElementById('timer-display');
        if (el) {
          el.textContent = String(secs).padStart(2, '0') + '.00';
          el.className   = `timer-digits inspection ${secs <= 3 ? 'urgent' : ''}`;
        }
      },
      () => {
        // Inspection expired — auto-start solve
        this._startSolve();
      }
    );
  }

  _startSolve() {
    this.inspectionTimer.stop();
    this.state = STATES.SOLVING;
    this._setTimerColor('solving');
    this._setStatus('Solving...', 'var(--success)');
    this._setActionBtn('bx-stop', 'Stop Timer');
    // Reset display before starting
    const el = document.getElementById('timer-display');
    if (el) { el.textContent = '00.00'; el.className = 'timer-digits solving'; }
    this.solveTimer.start();
  }

  _stopSolve() {
    const ms = this.solveTimer.stop();
    this.lastSolveMs = ms;
    this.state = STATES.STOPPED;

    const timeStr = SolveTimer.format(ms);
    const el = document.getElementById('timer-display');
    if (el) { el.textContent = timeStr; el.className = 'timer-digits stopped'; }
    this._setTimerColor('stopped');
    this._setStatus(`Solved! ${timeStr}`, 'var(--success)');
    this._setActionBtn('bx-refresh', 'New Scramble');

    // Save solve
    practiceStorage.addSolve({ time: ms, scramble: this.currentScramble });
    this._updateStats();
    this._renderRecentSolves();
  }

  _resetToIdle() {
    this.solveTimer.reset();
    this.inspectionTimer.reset();
    this.state = STATES.IDLE;
    const el = document.getElementById('timer-display');
    if (el) { el.textContent = '00.00'; el.className = 'timer-digits'; }
    this._setTimerColor('');
    this._setStatus('Press SPACE or tap to start inspection', '');
    this._setActionBtn('bx-time-five', 'Start Inspection');
    this._showEscapeHint(false);
    this._newScramble();
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  _newScramble() {
    // Reset timer to IDLE if not already
    if (this.state !== STATES.IDLE) {
      this.solveTimer.reset();
      this.inspectionTimer.reset();
      this.state = STATES.IDLE;
      const el = document.getElementById('timer-display');
      if (el) { el.textContent = '00.00'; el.className = 'timer-digits'; }
      this._setTimerColor('');
      this._setStatus('Press SPACE or tap to start inspection', '');
      this._setActionBtn('bx-time-five', 'Start Inspection');
      this._showEscapeHint(false);
    }
    this.currentScramble = this.scrambleGen.generate(20);
    const el = document.getElementById('scramble-display');
    if (el) el.textContent = this.currentScramble;
  }

  _animateScramble() {
    if (!this.cubeController) return;
    if (this.cubeController.isBusy()) return;
    // Clear any pending, apply the full scramble as a move sequence
    this.cubeController.clearQueue();
    this.cubeController.applyMoves(this.currentScramble);
  }

  _clearHistory() {
    if (!confirm('Clear all practice history and statistics?')) return;
    practiceStorage.clearAll();
    this._updateStats();
    this._renderRecentSolves();
  }

  // ─── UI Helpers ─────────────────────────────────────────────────────────────

  _updateStats() {
    const best   = document.getElementById('stat-best');
    const solves = document.getElementById('stat-solves');
    const ao5    = document.getElementById('stat-ao5');
    const ao12   = document.getElementById('stat-ao12');

    if (best)   best.textContent   = StatisticsManager.getBestTimeDisplay();
    if (solves) solves.textContent = StatisticsManager.getTotalSolves();
    if (ao5)    ao5.textContent    = StatisticsManager.getAo5Display();
    if (ao12)   ao12.textContent   = StatisticsManager.getAo12Display();
  }

  _renderRecentSolves() {
    const container = document.getElementById('recent-solves-list');
    if (!container) return;

    const recent = practiceStorage.getRecentSolves(15);
    const stats  = practiceStorage.getStats();

    if (!recent.length) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs); text-align: center; color: var(--text-muted); padding: var(--spacing-lg) 0; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          <i class="bx bx-time" style="font-size: 1.5rem; opacity: 0.5;"></i>
          <p class="text-xs">No solves recorded yet.</p>
        </div>`;
      return;
    }

    container.innerHTML = recent.map((solve, idx) => {
      const timeStr  = SolveTimer.format(solve.time);
      const isBest   = solve.time === stats.bestTime;
      const date     = new Date(solve.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const scrambleSnippet = solve.scramble.split(' ').slice(0, 5).join(' ') + '…';
      return `
        <div class="recent-solve-row ${isBest ? 'best' : ''}" style="
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px var(--spacing-sm); border-radius: var(--radius-sm);
          background: ${isBest ? 'rgba(255,204,0,0.08)' : 'rgba(0,0,0,0.1)'};
          border: 1px solid ${isBest ? 'rgba(255,204,0,0.25)' : 'transparent'};
          font-size: 0.82rem;">
          <span style="display: flex; align-items: center; gap: 6px;">
            ${isBest ? '<i class="bx bx-trophy" style="color: #ffcc00; font-size: 0.9rem;"></i>' : `<span style="color: var(--text-muted); font-size: 0.7rem;">${idx + 1}</span>`}
            <span class="font-bold font-mono" style="color: ${isBest ? '#ffcc00' : 'var(--text-primary)'};">${timeStr}</span>
          </span>
          <span class="text-xs text-muted" style="font-family: monospace; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${solve.scramble}">${scrambleSnippet}</span>
          <span class="text-xs text-muted">${date}</span>
        </div>`;
    }).join('');
  }

  _setTimerColor(mode) {
    const el = document.getElementById('timer-display');
    if (!el) return;
    el.classList.remove('inspection', 'urgent', 'solving', 'stopped');
    if (mode) el.classList.add(mode);
  }

  _setStatus(text, color = '') {
    const el = document.getElementById('timer-status-label');
    if (!el) return;
    if (text.includes('SPACE')) {
      el.innerHTML = `Press <kbd style="background: var(--surface-hover); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.75rem;">SPACE</kbd> or tap to start inspection`;
    } else {
      el.textContent = text;
    }
    el.style.color = color || 'var(--text-muted)';
  }

  _setActionBtn(icon, label) {
    const btn = document.getElementById('timer-action-btn');
    if (btn) btn.innerHTML = `<i class="bx ${icon}"></i> ${label}`;
  }

  _showEscapeHint(show) {
    const el = document.getElementById('escape-hint');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  // ─── Keyboard ───────────────────────────────────────────────────────────────

  _handleKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      this._advanceState();
    } else if (e.code === 'Escape') {
      e.preventDefault();
      this.solveTimer.reset();
      this.inspectionTimer.reset();
      this.state = STATES.IDLE;
      const el = document.getElementById('timer-display');
      if (el) { el.textContent = '00.00'; el.className = 'timer-digits'; }
      this._setTimerColor('');
      this._setStatus('Press SPACE or tap to start inspection', '');
      this._setActionBtn('bx-time-five', 'Start Inspection');
      this._showEscapeHint(false);
    }
  }

  destroy() {
    this.solveTimer.reset();
    this.inspectionTimer.reset();
    if (this.cubeController) {
      this.cubeController.dispose();
      this.cubeController = null;
    }
    window.removeEventListener('keydown', this._onKeyDown);
    console.log('PracticePage unmounted');
  }
}

export default PracticePage;
