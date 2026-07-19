import solver from './Solver.js';
import CubeStateConverter from './CubeStateConverter.js';
import MoveParser from './MoveParser.js';
import { generateId } from '../utils/helpers.js';
import solveHistory from '../storage/SolveHistory.js';

class SolutionManager {
  /**
   * Generates a solution object for a given logical CubeState.
   * @param {CubeState} cubeState - The current logical state.
   * @returns {Promise<Object>} Solution object.
   */
  async generateSolution(cubeState) {
    try {
      // 1. Convert color state to facelet-symbol string (U, R, F, D, L, B)
      const faceletString = CubeStateConverter.toFaceletString(cubeState);
      
      // 2. Generate solution using the wrap solver
      const notation = solver.solve(faceletString);
      
      // 3. Parse move tokens into an array
      const moves = MoveParser.parse(notation);
      
      // 4. Calculate estimated duration (~0.35s per single turn)
      const estimatedDuration = Number((moves.length * 0.35).toFixed(1));

      const solution = {
        id: generateId('solve'),
        createdAt: new Date().toISOString(),
        initialState: cubeState.clone().faces,
        notation,
        moves,
        moveCount: moves.length,
        estimatedDuration
      };

      // Persist to history
      solveHistory.add(solution);

      return solution;
    } catch (error) {
      console.error('Failed to generate solution:', error);
      throw error;
    }
  }
}

const solutionManager = new SolutionManager();
export default solutionManager;
