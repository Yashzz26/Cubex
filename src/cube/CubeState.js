import { DEFAULT_SOLVED_STATE } from '../utils/constants.js';

class CubeState {
  /**
   * Initializes the logical state of the Rubik's Cube.
   * @param {Object} [initialState] - Pre-configured face state to load.
   */
  constructor(initialState = null) {
    this.faces = initialState ? this._cloneState(initialState) : this._cloneState(DEFAULT_SOLVED_STATE);
  }

  /**
   * Apply a single move (e.g. "R", "U'", "F2") to the logical state.
   * @param {string} move - Single move notation.
   */
  applyMove(move) {
    if (!move || move.length === 0) return;
    
    const base = move[0];
    const modifier = move.slice(1);
    
    let turns = 1;
    if (modifier.includes("'")) {
      turns = 3; // 3 clockwise turns is equivalent to 1 counter-clockwise turn
    } else if (modifier.includes('2')) {
      turns = 2;
    }

    for (let i = 0; i < turns; i++) {
      this._executeClockwiseMove(base);
    }
  }

  /**
   * Apply a sequence of space-separated moves (e.g. "R U R' U'").
   * @param {string|string[]} moveInput - Space-separated moves or array of moves.
   */
  applyMoves(moveInput) {
    let moves = [];
    if (Array.isArray(moveInput)) {
      moves = moveInput;
    } else if (typeof moveInput === 'string') {
      moves = moveInput.trim().split(/\s+/).filter(m => m.length > 0);
    }

    moves.forEach(m => this.applyMove(m));
  }

  /**
   * Serializes the current facelet colors into a 54-character Kociemba solver string.
   * Format: U1-U9 + R1-R9 + F1-F9 + D1-D9 + L1-L9 + B1-B9
   * @returns {string} The 54-character string.
   */
  serialize() {
    const order = ['U', 'R', 'F', 'D', 'L', 'B'];
    return order.map(face => this.faces[face].join('')).join('');
  }

  /**
   * Restores the facelet colors from a 54-character Kociemba solver string.
   * @param {string} str - 54-character string.
   */
  deserialize(str) {
    if (!str || str.length !== 54) {
      console.error(`Invalid Kociemba serialization string length (${str ? str.length : 0})`);
      return;
    }

    this.faces.U = str.slice(0, 9).split('');
    this.faces.R = str.slice(9, 18).split('');
    this.faces.F = str.slice(18, 27).split('');
    this.faces.D = str.slice(27, 36).split('');
    this.faces.L = str.slice(36, 45).split('');
    this.faces.B = str.slice(45, 54).split('');
  }

  /**
   * Checks if the Rubik's Cube is in a fully solved state.
   * @returns {boolean} True if all faces are solved.
   */
  isSolved() {
    for (const face in this.faces) {
      const stickers = this.faces[face];
      const primaryColor = stickers[0];
      if (stickers.some(s => s !== primaryColor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clones this CubeState instance.
   * @returns {CubeState} A new cloned CubeState instance.
   */
  clone() {
    return new CubeState(this.faces);
  }

  /**
   * Helper to perform deep clone on the state object.
   * @private
   */
  _cloneState(state) {
    return {
      U: [...state.U],
      D: [...state.D],
      L: [...state.L],
      R: [...state.R],
      F: [...state.F],
      B: [...state.B]
    };
  }

  /**
   * Execute 1 clockwise rotation on a face and its adjacent layer edges.
   * @private
   */
  _executeClockwiseMove(face) {
    // 1. Rotate the face itself clockwise
    const f = this.faces[face];
    const prev = [...f];
    f[0] = prev[6]; f[1] = prev[3]; f[2] = prev[0];
    f[3] = prev[7]; f[4] = prev[4]; f[5] = prev[1];
    f[6] = prev[8]; f[7] = prev[5]; f[8] = prev[2];

    // 2. Shift adjacent facelet rows
    switch (face) {
      case 'U': {
        const temp = [this.faces.L[0], this.faces.L[1], this.faces.L[2]];
        this.faces.L[0] = this.faces.F[0]; this.faces.L[1] = this.faces.F[1]; this.faces.L[2] = this.faces.F[2];
        this.faces.F[0] = this.faces.R[0]; this.faces.F[1] = this.faces.R[1]; this.faces.F[2] = this.faces.R[2];
        this.faces.R[0] = this.faces.B[0]; this.faces.R[1] = this.faces.B[1]; this.faces.R[2] = this.faces.B[2];
        this.faces.B[0] = temp[0]; this.faces.B[1] = temp[1]; this.faces.B[2] = temp[2];
        break;
      }
      case 'D': {
        const temp = [this.faces.R[6], this.faces.R[7], this.faces.R[8]];
        this.faces.R[6] = this.faces.F[6]; this.faces.R[7] = this.faces.F[7]; this.faces.R[8] = this.faces.F[8];
        this.faces.F[6] = this.faces.L[6]; this.faces.F[7] = this.faces.L[7]; this.faces.F[8] = this.faces.L[8];
        this.faces.L[6] = this.faces.B[6]; this.faces.L[7] = this.faces.B[7]; this.faces.L[8] = this.faces.B[8];
        this.faces.B[6] = temp[0]; this.faces.B[7] = temp[1]; this.faces.B[8] = temp[2];
        break;
      }
      case 'F': {
        const temp = [this.faces.U[6], this.faces.U[7], this.faces.U[8]];
        this.faces.U[6] = this.faces.L[8];
        this.faces.U[7] = this.faces.L[5];
        this.faces.U[8] = this.faces.L[2];
        
        this.faces.L[6] = this.faces.D[0];
        this.faces.L[3] = this.faces.D[1];
        this.faces.L[0] = this.faces.D[2];
        
        this.faces.D[2] = this.faces.R[0];
        this.faces.D[1] = this.faces.R[3];
        this.faces.D[0] = this.faces.R[6];
        
        this.faces.R[0] = temp[0];
        this.faces.R[3] = temp[1];
        this.faces.R[6] = temp[2];
        break;
      }
      case 'B': {
        const temp = [this.faces.U[0], this.faces.U[1], this.faces.U[2]];
        this.faces.U[0] = this.faces.R[2];
        this.faces.U[1] = this.faces.R[5];
        this.faces.U[2] = this.faces.R[8];
        
        this.faces.R[2] = this.faces.D[8];
        this.faces.R[5] = this.faces.D[7];
        this.faces.R[8] = this.faces.D[6];
        
        this.faces.D[6] = this.faces.L[0];
        this.faces.D[7] = this.faces.L[3];
        this.faces.D[8] = this.faces.L[6];
        
        this.faces.L[0] = temp[2];
        this.faces.L[3] = temp[1];
        this.faces.L[6] = temp[0];
        break;
      }
      case 'L': {
        const temp = [this.faces.U[0], this.faces.U[3], this.faces.U[6]];
        this.faces.U[0] = this.faces.B[8];
        this.faces.U[3] = this.faces.B[5];
        this.faces.U[6] = this.faces.B[2];
        
        this.faces.B[8] = this.faces.D[0];
        this.faces.B[5] = this.faces.D[3];
        this.faces.B[2] = this.faces.D[6];
        
        this.faces.D[0] = this.faces.F[0];
        this.faces.D[3] = this.faces.F[3];
        this.faces.D[6] = this.faces.F[6];
        
        this.faces.F[0] = temp[0];
        this.faces.F[3] = temp[1];
        this.faces.F[6] = temp[2];
        break;
      }
      case 'R': {
        const temp = [this.faces.U[2], this.faces.U[5], this.faces.U[8]];
        this.faces.U[2] = this.faces.F[2];
        this.faces.U[5] = this.faces.F[5];
        this.faces.U[8] = this.faces.F[8];
        
        this.faces.F[2] = this.faces.D[2];
        this.faces.F[5] = this.faces.D[5];
        this.faces.F[8] = this.faces.D[8];
        
        this.faces.D[2] = this.faces.B[6];
        this.faces.D[5] = this.faces.B[3];
        this.faces.D[8] = this.faces.B[0];
        
        this.faces.B[0] = temp[2];
        this.faces.B[3] = temp[1];
        this.faces.B[6] = temp[0];
        break;
      }
    }
  }
}

export default CubeState;
