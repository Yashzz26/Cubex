import solveHistory from '../storage/SolveHistory.js';
import SolveTimer from '../practice/SolveTimer.js';
import storageManager from '../storage/StorageManager.js';
import router from '../core/Router.js';

// Color hex map for mini cube face preview
const COLOR_HEX = {
  W: '#ffffff', Y: '#ffcc00', R: '#ff3b30',
  O: '#ff9500', B: '#007aff', G: '#34c759'
};

class HistoryPage {
  constructor() {
    this.name = 'HistoryPage';
    this.selectedId = null;
  }

  render() {
    return `
      <div class="history-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto; width: 100%;">
        
        <!-- Header -->
        <div style="text-align: center;">
          <h2 class="section-title">Solve History</h2>
          <p class="section-subtitle">Browse your past solves. Click any entry to replay it in the solver.</p>
        </div>

        <!-- Summary stats bar -->
        <div id="history-stats-bar" class="card" style="display: flex; gap: var(--spacing-lg); justify-content: center; flex-wrap: wrap; padding: var(--spacing-md) var(--spacing-xl); text-align: center;">
          <div>
            <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Total Solves</p>
            <p id="hs-total" class="font-bold" style="font-size: 1.5rem; font-family: monospace; margin-top: 2px;">0</p>
          </div>
          <div style="width: 1px; background: var(--border-color);"></div>
          <div>
            <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Fewest Moves</p>
            <p id="hs-best" class="font-bold" style="font-size: 1.5rem; font-family: monospace; margin-top: 2px;">--</p>
          </div>
          <div style="width: 1px; background: var(--border-color);"></div>
          <div>
            <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Avg Moves</p>
            <p id="hs-avg" class="font-bold" style="font-size: 1.5rem; font-family: monospace; margin-top: 2px;">--</p>
          </div>
          <div style="width: 1px; background: var(--border-color);"></div>
          <div>
            <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Most Recent</p>
            <p id="hs-recent" class="font-bold text-sm" style="font-family: monospace; margin-top: 2px; font-size: 0.85rem;">--</p>
          </div>
        </div>

        <!-- Main content: list + detail panel -->
        <div style="display: grid; grid-template-columns: 1fr 380px; gap: var(--spacing-lg); align-items: start;">

          <!-- Solve List -->
          <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 1rem; font-weight: 700;">Past Solves</h3>
              <button id="clear-all-btn" class="btn btn-ghost" style="font-size: 0.75rem; padding: 3px 10px; opacity: 0.6;">
                <i class="bx bx-trash"></i> Clear All
              </button>
            </div>
            <div id="history-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 600px; overflow-y: auto;">
              <!-- populated by JS -->
            </div>
          </div>

          <!-- Detail / Preview Panel -->
          <div id="detail-panel" class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md); position: sticky; top: var(--spacing-lg);">
            <!-- Default: nothing selected -->
            <div id="detail-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; color: var(--text-muted); gap: var(--spacing-sm);">
              <i class="bx bx-search-alt-2" style="font-size: 2.5rem; opacity: 0.4;"></i>
              <p class="text-sm">Select a solve to preview details and replay it.</p>
            </div>

            <!-- Solve detail (hidden until selected) -->
            <div id="detail-content" style="display: none; flex-direction: column; gap: var(--spacing-md);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Selected Solve</p>
                  <p id="detail-date" class="text-sm font-semibold">--</p>
                </div>
                <button id="delete-solve-btn" class="btn btn-ghost" style="font-size: 0.7rem; padding: 2px 8px; color: var(--danger); opacity: 0.7;">
                  <i class="bx bx-trash"></i>
                </button>
              </div>

              <!-- Stats row -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-sm); text-align: center;">
                <div style="background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); padding: var(--spacing-sm);">
                  <p class="text-xs text-muted">Moves</p>
                  <p id="detail-moves" class="font-bold" style="font-size: 1.2rem; font-family: monospace; margin-top: 2px;">--</p>
                </div>
                <div style="background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); padding: var(--spacing-sm);">
                  <p class="text-xs text-muted">Est. Time</p>
                  <p id="detail-time" class="font-bold" style="font-size: 1.2rem; font-family: monospace; margin-top: 2px;">--</p>
                </div>
                <div style="background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); padding: var(--spacing-sm);">
                  <p class="text-xs text-muted">Rank</p>
                  <p id="detail-rank" class="font-bold" style="font-size: 1.2rem; font-family: monospace; margin-top: 2px;">--</p>
                </div>
              </div>

              <!-- Mini cube face preview -->
              <div>
                <p class="text-xs text-muted font-semibold" style="text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--spacing-sm);">Initial Cube State</p>
                <div id="mini-cube-net" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                  <!-- populated per selection -->
                </div>
              </div>

              <!-- Solution notation -->
              <div>
                <p class="text-xs text-muted font-semibold" style="text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--spacing-xs);">Solution Notation</p>
                <div id="detail-notation" style="font-family: monospace; font-size: 0.82rem; line-height: 1.7; background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); padding: var(--spacing-sm); word-break: break-all; border: 1px solid var(--border-color); max-height: 100px; overflow-y: auto;">
                  --
                </div>
              </div>

              <!-- Replay button -->
              <button id="replay-btn" class="btn btn-primary" style="width: 100%; justify-content: center;">
                <i class="bx bx-play-circle"></i> Replay in Solver
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  mount() {
    this._renderStats();
    this._renderList();

    document.getElementById('clear-all-btn')?.addEventListener('click',    () => this._clearAll());
    document.getElementById('delete-solve-btn')?.addEventListener('click', () => this._deleteCurrent());
    document.getElementById('replay-btn')?.addEventListener('click',       () => this._replayCurrent());

    console.log('HistoryPage mounted');
  }

  // ─── Render Helpers ───────────────────────────────────────────────────────────

  _renderStats() {
    const solves = solveHistory.getRecent();
    const total  = solves.length;

    const totalEl  = document.getElementById('hs-total');
    const bestEl   = document.getElementById('hs-best');
    const avgEl    = document.getElementById('hs-avg');
    const recentEl = document.getElementById('hs-recent');

    if (totalEl)  totalEl.textContent  = total;

    if (total > 0) {
      const counts = solves.map(s => s.moveCount);
      const best   = Math.min(...counts);
      const avg    = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
      const recent = new Date(solves[0].createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (bestEl)   bestEl.textContent   = best;
      if (avgEl)    avgEl.textContent    = avg;
      if (recentEl) recentEl.textContent = recent;
    } else {
      if (bestEl)   bestEl.textContent   = '--';
      if (avgEl)    avgEl.textContent    = '--';
      if (recentEl) recentEl.textContent = '--';
    }
  }

  _renderList() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const solves = solveHistory.getRecent();
    const allCounts = solves.map(s => s.moveCount);
    const best = allCounts.length ? Math.min(...allCounts) : null;

    if (!solves.length) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-xl) 0; text-align: center; color: var(--text-muted);">
          <i class="bx bx-history" style="font-size: 2.5rem; opacity: 0.4;"></i>
          <p class="text-sm">No solves yet. Generate one from the <a href="#/solver" style="color: var(--primary-cta);">Solver</a> or <a href="#/manual" style="color: var(--primary-cta);">Manual Input</a>.</p>
        </div>`;
      return;
    }

    container.innerHTML = solves.map((solve, idx) => {
      const isBest   = solve.moveCount === best;
      const date     = new Date(solve.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const notation = solve.moves.slice(0, 6).join(' ') + (solve.moves.length > 6 ? ' …' : '');
      const isSelected = solve.id === this.selectedId;

      return `
        <div class="history-row ${isBest ? 'history-best' : ''} ${isSelected ? 'history-selected' : ''}"
             data-id="${solve.id}"
             style="
               display: flex; justify-content: space-between; align-items: center;
               padding: var(--spacing-sm) var(--spacing-md);
               border-radius: var(--radius-sm);
               cursor: pointer;
               border: 1px solid ${isSelected ? 'var(--primary-cta)' : isBest ? 'rgba(255,204,0,0.25)' : 'transparent'};
               background: ${isSelected ? 'rgba(0,122,255,0.08)' : isBest ? 'rgba(255,204,0,0.05)' : 'rgba(0,0,0,0.1)'};
               transition: background 0.12s ease, border-color 0.12s ease;">
          <div style="display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0;">
            ${isBest
              ? '<i class="bx bx-trophy" style="color: #ffcc00; font-size: 1rem; flex-shrink: 0;"></i>'
              : `<span class="text-xs text-muted" style="min-width: 20px; text-align: right;">#${idx + 1}</span>`}
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="font-bold font-mono" style="color: ${isBest ? '#ffcc00' : 'var(--text-primary)'}; font-size: 1rem;">${solve.moveCount}</span>
                <span class="text-xs text-muted">moves</span>
                <span class="text-xs" style="padding: 1px 6px; border-radius: 10px; background: rgba(0,122,255,0.1); color: var(--primary-cta);">${solve.estimatedDuration}s</span>
              </div>
              <p class="text-xs text-muted" style="font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; margin-top: 2px;">${notation}</p>
            </div>
          </div>
          <span class="text-xs text-muted" style="white-space: nowrap; flex-shrink: 0; margin-left: 8px;">${date}</span>
        </div>`;
    }).join('');

    // Bind row clicks
    container.querySelectorAll('.history-row').forEach(row => {
      row.addEventListener('click', () => this._selectSolve(row.dataset.id));
    });
  }

  _selectSolve(id) {
    this.selectedId = id;
    const solve = solveHistory.getById(id);
    if (!solve) return;

    // Update selected highlight in list
    document.querySelectorAll('.history-row').forEach(row => {
      const sel = row.dataset.id === id;
      row.style.border      = sel ? '1px solid var(--primary-cta)' : (row.classList.contains('history-best') ? '1px solid rgba(255,204,0,0.25)' : '1px solid transparent');
      row.style.background  = sel ? 'rgba(0,122,255,0.08)' : (row.classList.contains('history-best') ? 'rgba(255,204,0,0.05)' : 'rgba(0,0,0,0.1)');
    });

    // Show detail panel
    document.getElementById('detail-empty').style.display   = 'none';
    document.getElementById('detail-content').style.display = 'flex';

    // Populate fields
    const date = new Date(solve.createdAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById('detail-date').textContent     = date;
    document.getElementById('detail-moves').textContent    = solve.moveCount;
    document.getElementById('detail-time').textContent     = `${solve.estimatedDuration}s`;
    document.getElementById('detail-notation').textContent = solve.notation || '--';

    // Rank
    const allSolves = solveHistory.getRecent();
    const rank = allSolves.findIndex(s => s.id === id) + 1;
    document.getElementById('detail-rank').textContent = `#${rank}`;

    // Mini cube net
    this._renderMiniNet(solve.initialState);
  }

  _renderMiniNet(faces) {
    const container = document.getElementById('mini-cube-net');
    if (!container || !faces) return;

    // Net layout: U row 1, L/F/R/B row 2, D row 3
    // Render as small face thumbnails
    const NET_ORDER = [
      { face: 'U', label: 'U' },
      { face: 'L', label: 'L' },
      { face: 'F', label: 'F' },
      { face: 'R', label: 'R' },
      { face: 'B', label: 'B' },
      { face: 'D', label: 'D' },
    ];

    container.innerHTML = NET_ORDER.map(({ face, label }) => {
      const stickers = faces[face] ?? Array(9).fill('W');
      const grid = stickers.map(code =>
        `<div style="background: ${COLOR_HEX[code] ?? '#444'}; border-radius: 2px;"></div>`
      ).join('');
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <p style="font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${label}</p>
          <div style="display: grid; grid-template-columns: repeat(3, 14px); grid-template-rows: repeat(3, 14px); gap: 1.5px; background: rgba(0,0,0,0.3); padding: 2px; border-radius: 3px;">${grid}</div>
        </div>`;
    }).join('');
  }

  _deleteCurrent() {
    if (!this.selectedId) return;
    if (!confirm('Remove this solve from history?')) return;
    solveHistory.remove(this.selectedId);
    this.selectedId = null;
    // Hide detail
    document.getElementById('detail-empty').style.display   = 'flex';
    document.getElementById('detail-content').style.display = 'none';
    this._renderStats();
    this._renderList();
  }

  _clearAll() {
    if (!confirm('Clear all solve history? This cannot be undone.')) return;
    solveHistory.clearAll();
    this.selectedId = null;
    document.getElementById('detail-empty').style.display   = 'flex';
    document.getElementById('detail-content').style.display = 'none';
    this._renderStats();
    this._renderList();
  }

  _replayCurrent() {
    const solve = solveHistory.getById(this.selectedId);
    if (!solve) return;
    // Store as pending state so SolverPage can load it
    storageManager.setItem('replay_solution', {
      notation:     solve.notation,
      moves:        solve.moves,
      moveCount:    solve.moveCount,
      estimatedDuration: solve.estimatedDuration,
      initialState: solve.initialState
    });
    router.navigate('solver');
  }

  destroy() {
    console.log('HistoryPage unmounted');
  }
}

export default HistoryPage;
