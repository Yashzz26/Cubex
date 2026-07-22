import CubeController from '../cube/CubeController.js';
import solutionManager from '../solver/SolutionManager.js';
import CubeStateConverter from '../solver/CubeStateConverter.js';
import CubeState from '../cube/CubeState.js';
import MoveTranslator from '../solver/MoveTranslator.js';
import { getInverseMove } from '../utils/math.js';
import ManualNetState from '../manual/ManualNetState.js';
import storageManager from '../storage/StorageManager.js';

class SolverPage {
  constructor() {
    this.name = 'SolverPage';
    this.cubeController = null;
    
    // Playback state variables
    this.solution = null;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.eduMode = true;
  }

  render() {
    return `
      <div class="solver-workspace animate-fade-in">
        <!-- Sidebar controls (Left Pane) -->
        <aside class="solver-sidebar card" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          <div>
            <h2 class="section-title">Visual Solver</h2>
            <p class="text-sm text-secondary">Interact with the playback engine below.</p>
          </div>
          
          <!-- Scramble test utility for Phase 6 manual verification -->
          <div class="test-utilities" style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
            <p class="text-xs font-bold text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Debug Scrambler</p>
            <button id="test-scramble-btn" class="btn btn-secondary" style="width: 100%; justify-content: center;">
              <i class="bx bx-shuffle"></i> Apply Test Scramble ("R U R' U'")
            </button>
          </div>

          <div class="solver-status" style="padding: var(--spacing-md); background: rgba(0,0,0,0.2); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Cube Status</p>
            <p id="cube-status-text" class="font-semibold" style="margin-top: var(--spacing-xs); display: flex; align-items: center; gap: var(--spacing-xs);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--success); display: inline-block;"></span>
              Solved
            </p>
          </div>

          <!-- Move Highlight List -->
          <div class="move-list-section" style="display: flex; flex-direction: column; gap: var(--spacing-xs); flex: 1; min-height: 120px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-sm font-semibold">Move Sequence</span>
              <span id="move-count-indicator" class="text-xs text-muted">0 Moves</span>
            </div>
            
            <div id="move-sequence-container" style="background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--spacing-md); display: flex; gap: var(--spacing-sm); flex-wrap: wrap; align-content: flex-start; overflow-y: auto; height: 120px; font-family: monospace; font-size: 1.1rem;">
              <span class="text-muted text-sm" style="font-family: var(--font-sans);">Apply a scramble to generate solution...</span>
            </div>
          </div>

          <!-- Playback instructions panel -->
          <div id="instruction-panel" class="instruction-panel" style="padding: var(--spacing-md); background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: none;">
            <p class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px;">Instruction</p>
            <p id="instruction-text" class="text-sm font-medium">Ready to play...</p>
          </div>

          <!-- Playback controls -->
          <div class="solution-playback" style="margin-top: auto; display: flex; flex-direction: column; gap: var(--spacing-md); border-top: 1px solid var(--border-color); padding-top: var(--spacing-lg);">
            
            <!-- Speed & Edu Toggles -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-sm);">
              <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                <label for="speed-select" class="text-xs text-secondary font-medium">Speed:</label>
                <select id="speed-select" style="background: var(--surface-color); border: 1px solid var(--border-color); font-size: 0.8rem; padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text-primary);">
                  <option value="0.5">0.5x</option>
                  <option value="1.0" selected>1.0x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>

              <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                <input type="checkbox" id="edu-toggle" checked style="cursor: pointer;">
                <label for="edu-toggle" class="text-xs text-secondary font-medium" style="cursor: pointer; user-select: none;">Educational text</label>
              </div>
            </div>

            <!-- Main Control Buttons -->
            <div class="playback-controls" style="display: flex; justify-content: center; gap: var(--spacing-md);">
              <button id="restart-btn" class="btn-icon" title="Reset to Start" disabled><i class="bx bx-reset"></i></button>
              <button id="prev-btn" class="btn-icon" title="Step Back" disabled><i class="bx bx-chevron-left"></i></button>
              <button id="play-pause-btn" class="btn-icon" style="background-color: var(--primary-cta); color: white; border: none;" title="Play" disabled><i class="bx bx-play"></i></button>
              <button id="next-btn" class="btn-icon" title="Step Forward" disabled><i class="bx bx-chevron-right"></i></button>
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

    // Bind DOM controls
    this.scrambleBtn = document.getElementById('test-scramble-btn');
    this.playPauseBtn = document.getElementById('play-pause-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.speedSelect = document.getElementById('speed-select');
    this.eduToggle = document.getElementById('edu-toggle');

    // Event Bindings
    if (this.scrambleBtn) {
      this.scrambleBtn.addEventListener('click', () => this._applyTestScramble());
    }

    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this._togglePlayPause());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this._stepBackward());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this._stepForward());
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this._restart());
    }

    if (this.speedSelect) {
      this.speedSelect.addEventListener('change', (e) => {
        const speed = parseFloat(e.target.value);
        this.speed = speed;
        if (this.cubeController) {
          this.cubeController.setSpeed(speed);
        }
      });
    }

    if (this.eduToggle) {
      this.eduToggle.addEventListener('change', (e) => {
        this.eduMode = e.target.checked;
        this._updateUI();
      });
    }

    console.log('SolverPage mounted');

    // Check if ManualPage handed off a pending cube state to solve
    this._checkPendingState();
  }

  /**
   * If ManualPage saved a pending state to localStorage, load and solve it.
   * @private
   */
  async _checkPendingState() {
    const pending = storageManager.getItem('pending_state');
    if (pending) {
      storageManager.removeItem('pending_state');
      try {
        const netState = new ManualNetState();
        netState.fromJSON(pending);
        const cubeState = netState.toCubeState();
        const faceletStr = CubeStateConverter.toFaceletString(cubeState);
        if (this.cubeController) this.cubeController.loadKociembaState(faceletStr);
        const sol = await solutionManager.generateSolution(cubeState);
        this._loadSolution(sol);
      } catch (err) {
        console.error('Failed to load pending manual state into solver:', err);
      }
    }

    // Check for a solution replayed from History page
    const replay = storageManager.getItem('replay_solution');
    if (replay) {
      storageManager.removeItem('replay_solution');
      try {
        // Load the initial visual state from saved face colors
        if (this.cubeController && replay.initialState) {
          const tempState = new CubeState(replay.initialState);
          const faceletStr = CubeStateConverter.toFaceletString(tempState);
          this.cubeController.loadKociembaState(faceletStr);
        }
        // Load solution directly (already solved, no re-solving needed)
        this._loadSolution(replay);
      } catch (err) {
        console.error('Failed to replay solution from history:', err);
      }
    }
  }

  /**
   * Scrambles the cube with a test move and triggers solution generation.
   * @private
   */
  async _applyTestScramble() {
    if (this.cubeController.isBusy()) return;

    this._pause();
    this.solution = null;
    this.currentIndex = 0;
    this._updateUI();

    const scramble = "R U R' U'";
    console.log(`Applying test scramble: "${scramble}"`);

    // Disable scramble button during animation and computation
    if (this.scrambleBtn) this.scrambleBtn.disabled = true;

    // Apply scramble moves to logical cube state first
    this.cubeController.cubeState.applyMoves(scramble);
    const scrambledState = this.cubeController.cubeState.clone();

    // Hook queue completion so solution calculation runs AFTER 3D animation finishes smoothly
    this.cubeController.animationQueue.onQueueComplete = async () => {
      // Restore default sync hook
      this.cubeController.animationQueue.onQueueComplete = () => {
        this.cubeController.syncVisuals();
      };

      try {
        const statusText = document.getElementById('cube-status-text');
        if (statusText) {
          statusText.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--warning); display: inline-block;"></span> Calculating Solution...';
        }

        const sol = await solutionManager.generateSolution(scrambledState);
        this._loadSolution(sol);
      } catch (err) {
        console.error('Failed to generate solution:', err);
      } finally {
        if (this.scrambleBtn) this.scrambleBtn.disabled = false;
      }
    };

    // Trigger 3D animation
    this.cubeController.animationQueue.add(scramble);
  }

  /**
   * Load generated solution object into the playback player.
   * @private
   */
  _loadSolution(sol) {
    this.solution = sol;
    this.currentIndex = 0;
    this.isPlaying = false;
    
    // Enable playback UI buttons
    this.playPauseBtn.disabled = false;
    this.prevBtn.disabled = false;
    this.nextBtn.disabled = false;
    this.restartBtn.disabled = false;

    // Render move spans in list
    const moveSeqContainer = document.getElementById('move-sequence-container');
    const moveCountIndicator = document.getElementById('move-count-indicator');
    
    if (moveSeqContainer && moveCountIndicator) {
      moveCountIndicator.textContent = `${sol.moveCount} Moves`;
      moveSeqContainer.innerHTML = sol.moves
        .map((m, idx) => `<span class="move-token" id="move-token-${idx}" style="padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); transition: all var(--transition-fast);">${m}</span>`)
        .join('');
    }

    this._updateUI();
  }

  /**
   * Toggle between playing auto-slides and pausing.
   * @private
   */
  _togglePlayPause() {
    if (this.isPlaying) {
      this._pause();
    } else {
      this._play();
    }
  }

  _play() {
    if (!this.solution || this.currentIndex >= this.solution.moves.length) return;
    this.isPlaying = true;
    this._updateUI();
    this._playNext();
  }

  _pause() {
    this.isPlaying = false;
    this._updateUI();
  }

  /**
   * Drives the one-by-one auto-rotation loop.
   * @private
   */
  _playNext() {
    if (!this.isPlaying || !this.solution || this.currentIndex >= this.solution.moves.length) {
      if (this.currentIndex >= this.solution.moves.length) {
        this.isPlaying = false;
        this._updateUI();
      }
      return;
    }

    if (this.cubeController.isBusy()) return;

    const nextMove = this.solution.moves[this.currentIndex];

    // Set callback to proceed index on completion
    this.cubeController.animationQueue.onQueueComplete = () => {
      // Hard-sync materials
      this.cubeController.syncVisuals();
      
      this.currentIndex++;
      this._updateUI();
      
      // Call recursively
      this._playNext();
    };

    // Execute single move turn
    this.cubeController.applyMoves(nextMove);
  }

  /**
   * Step forward a single move.
   * @private
   */
  _stepForward() {
    if (!this.solution || this.currentIndex >= this.solution.moves.length || this.cubeController.isBusy()) return;
    this._pause();

    const move = this.solution.moves[this.currentIndex];

    this.cubeController.animationQueue.onQueueComplete = () => {
      this.cubeController.syncVisuals();
      this.currentIndex++;
      this._updateUI();
    };

    this.cubeController.applyMoves(move);
  }

  /**
   * Step backward a single move using inverse notation.
   * @private
   */
  _stepBackward() {
    if (!this.solution || this.currentIndex <= 0 || this.cubeController.isBusy()) return;
    this._pause();

    // Decrement index first to target the move we are reverting
    this.currentIndex--;
    const move = this.solution.moves[this.currentIndex];
    const inverse = getInverseMove(move);

    this.cubeController.animationQueue.onQueueComplete = () => {
      this.cubeController.syncVisuals();
      this._updateUI();
    };

    // Apply inverse move visually and logically
    this.cubeController.applyMoves(inverse);
  }

  /**
   * Reset player to initial scrambled position.
   * @private
   */
  _restart() {
    if (!this.solution || this.cubeController.isBusy()) return;
    this._pause();

    this.currentIndex = 0;

    // Load initial scrambled state
    const initialCube = new CubeState(this.solution.initialState);
    const faceletStr = CubeStateConverter.toFaceletString(initialCube);
    this.cubeController.loadKociembaState(faceletStr);

    this._updateUI();
  }

  /**
   * Synchronize DOM display elements with active state parameters.
   * @private
   */
  _updateUI() {
    // 1. Play/Pause Button Icon Toggle
    if (this.playPauseBtn) {
      this.playPauseBtn.innerHTML = this.isPlaying ? '<i class="bx bx-pause"></i>' : '<i class="bx bx-play"></i>';
    }

    // 2. Status Color and Text
    const statusText = document.getElementById('cube-status-text');
    if (statusText) {
      if (this.solution) {
        const isSolved = this.currentIndex === this.solution.moves.length;
        statusText.innerHTML = isSolved
          ? '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--success); display: inline-block;"></span> Solved'
          : '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--warning); display: inline-block;"></span> Playback Active';
      } else {
        statusText.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--success); display: inline-block;"></span> Solved';
      }
    }

    // 3. Highlight current move token
    if (this.solution) {
      this.solution.moves.forEach((_, idx) => {
        const token = document.getElementById(`move-token-${idx}`);
        if (token) {
          if (idx === this.currentIndex) {
            token.style.color = 'var(--text-primary)';
            token.style.fontWeight = 'bold';
            token.style.backgroundColor = 'var(--primary-cta)';
            token.style.color = '#ffffff';
          } else if (idx < this.currentIndex) {
            token.style.color = 'var(--text-muted)';
            token.style.fontWeight = 'normal';
            token.style.backgroundColor = 'transparent';
            token.style.textDecoration = 'line-through';
          } else {
            token.style.color = 'var(--text-secondary)';
            token.style.fontWeight = 'normal';
            token.style.backgroundColor = 'transparent';
            token.style.textDecoration = 'none';
          }
        }
      });
    }

    // 4. Instructions panel rendering
    const instructionPanel = document.getElementById('instruction-panel');
    const instructionText = document.getElementById('instruction-text');
    
    if (instructionPanel && instructionText) {
      if (this.solution && this.eduMode) {
        instructionPanel.style.display = 'block';
        if (this.currentIndex < this.solution.moves.length) {
          const move = this.solution.moves[this.currentIndex];
          instructionText.innerHTML = `
            <span style="font-weight: 700; color: var(--primary-cta);">${move}</span>: 
            ${MoveTranslator.translate(move)}
            <p class="text-xs text-muted" style="margin-top: 4px;">Move ${this.currentIndex + 1} of ${this.solution.moveCount}</p>
          `;
        } else {
          instructionText.innerHTML = `<span style="color: var(--success); font-weight: 700;"><i class="bx bx-check-circle"></i> Cube Solved!</span>`;
        }
      } else {
        instructionPanel.style.display = 'none';
      }
    }

    // 5. Button bounds controls
    if (this.solution) {
      this.prevBtn.disabled = this.currentIndex === 0;
      this.nextBtn.disabled = this.currentIndex === this.solution.moves.length;
      this.playPauseBtn.disabled = this.currentIndex === this.solution.moves.length;
    }
  }

  destroy() {
    if (this.cubeController) {
      this.cubeController.dispose();
      this.cubeController = null;
      console.log('SolverPage resources cleaned up');
    }
  }
}

export default SolverPage;
