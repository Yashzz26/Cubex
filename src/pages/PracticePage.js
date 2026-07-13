class PracticePage {
  constructor() {
    this.name = 'PracticePage';
  }

  render() {
    return `
      <div class="practice-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="text-align: center;">
          <h2 class="section-title">Cube Practice Mode</h2>
          <p class="section-subtitle">Scramble your cube, inspection, and track your speed metrics.</p>
        </div>

        <!-- Scramble Card -->
        <div class="card" style="text-align: center; display: flex; flex-direction: column; gap: var(--spacing-sm); align-items: center;">
          <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Active Scramble</p>
          <div class="scramble-notation font-semibold" style="font-size: 1.25rem; font-family: monospace; letter-spacing: 0.02em; padding: var(--spacing-sm) var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-sm); border: 1px solid var(--border-color); max-width: 100%; word-break: break-all;">
            R U2 F' L D2 B R2 U' F2 D L' F2 R2 D2 R B' D B'
          </div>
          <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-xs);">
            <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="bx bx-refresh"></i> New Scramble</button>
            <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="bx bx-play"></i> Animate Scramble</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: var(--spacing-lg); align-items: start;" class="grid-2">
          <!-- Timer Display Section -->
          <div class="card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; text-align: center;">
            <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: var(--spacing-sm);">Timer</p>
            
            <div class="timer-digits" style="font-size: clamp(3rem, 10vw, 5rem); font-family: monospace; font-weight: 500; margin-bottom: var(--spacing-md); color: var(--text-primary);">
              00:00.00
            </div>
            
            <p class="text-xs text-secondary" style="margin-bottom: var(--spacing-lg);">Press <span style="background: var(--surface-hover); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">SPACEBAR</span> or tap below to start inspection / timer.</p>
            
            <button class="btn btn-primary btn-lg" style="padding: 0.75rem 2rem;"><i class="bx bx-play"></i> Start Inspection</button>
          </div>

          <!-- Practice Statistics Section -->
          <div class="card" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <h3 style="font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: var(--spacing-xs);">
              <i class="bx bx-bar-chart-alt-2" style="color: var(--primary-cta);"></i> Statistics
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-sm); text-align: center;">
              <div style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Best Time</p>
                <p class="font-bold" style="font-size: 1.25rem; margin-top: 4px;">--</p>
              </div>
              <div style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Average</p>
                <p class="font-bold" style="font-size: 1.25rem; margin-top: 4px;">--</p>
              </div>
              <div style="padding: var(--spacing-md); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <p class="text-xs text-muted">Solves</p>
                <p class="font-bold" style="font-size: 1.25rem; margin-top: 4px;">0</p>
              </div>
            </div>

            <!-- Recent Solves Log -->
            <div style="margin-top: var(--spacing-sm);">
              <p class="text-xs font-semibold text-muted" style="text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--spacing-sm);">Recent Practice Times</p>
              <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); text-align: center; color: var(--text-muted); padding: var(--spacing-lg) 0; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                <i class="bx bx-time" style="font-size: 1.5rem; opacity: 0.5;"></i>
                <p class="text-xs">No recent solves recorded.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  mount() {
    console.log('PracticePage mounted');
  }

  destroy() {
    console.log('PracticePage unmounted');
  }
}

export default PracticePage;
