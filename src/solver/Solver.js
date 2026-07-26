import Cube from 'cubejs';

class Solver {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Asynchronously initialize Kociemba search tables in the background.
   * Generation of search tables can take 1-2 seconds.
   */
  async init() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (!this.isInitialized) {
            console.log('Initializing Kociemba solver search tables...');
            Cube.initSolver();
            this.isInitialized = true;
            console.log('Kociemba search tables generated.');
          }
        } catch (error) {
          console.error('Failed to initialize Kociemba solver:', error);
        }
        resolve();
      }, 50);
    });

    return this.initPromise;
  }

  /**
   * Solves a 54-character Kociemba state string.
   * @param {string} faceletString - 54 character string (U, R, F, D, L, B).
   * @returns {string} Space-separated moves sequence solution.
   */
  solve(faceletString) {
    if (!this.isInitialized) {
      console.warn('Solver search tables not pre-initialized. Synchronously initializing Kociemba tables...');
      try {
        Cube.initSolver();
        this.isInitialized = true;
      } catch (err) {
        console.error('Sync solver initialization failed:', err);
        throw new Error('Solver not initialized');
      }
    }

    try {
      // Load cube state from facelet string representation
      const cube = Cube.fromString(faceletString);
      
      // If cube is already solved, return empty solution string
      if (cube.isSolved()) {
        return '';
      }

      // Solve and retrieve standard moves notation string
      const solution = cube.solve();
      return solution;
    } catch (error) {
      console.error('Kociemba solver failed for facelet string:', faceletString, error);
      throw new Error(`Solver error: ${error.message}`);
    }
  }
}

const solver = new Solver();
export default solver;
