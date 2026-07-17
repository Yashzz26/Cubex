/**
 * ScrambleGenerator — generates WCA-style random scrambles.
 * Rules:
 * - No consecutive move on the same face.
 * - No 3 consecutive moves in the same axis group (U/D, L/R, F/B).
 */

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const MODIFIERS = ['', "'", '2'];
const AXIS_GROUPS = { U: 'UD', D: 'UD', L: 'LR', R: 'LR', F: 'FB', B: 'FB' };

class ScrambleGenerator {
  /**
   * Return which axis group a face belongs to.
   * @param {string} face
   * @returns {string}
   */
  static getAxisGroup(face) {
    return AXIS_GROUPS[face] ?? '';
  }

  /**
   * Generate a random scramble string.
   * @param {number} length - Number of moves (default 20)
   * @returns {string} e.g. "R U2 F' L D2 B R2 U' F2 D"
   */
  static generate(length = 20) {
    const moves = [];
    let prevFace = null;
    let prevAxisGroup = null;
    let prevPrevAxisGroup = null;

    while (moves.length < length) {
      // Pick a random face
      const face = FACES[Math.floor(Math.random() * FACES.length)];
      const axisGroup = this.getAxisGroup(face);

      // Reject if same face as previous
      if (face === prevFace) continue;

      // Reject if same axis group as both previous two (prevents U D U-style redundancies)
      if (axisGroup === prevAxisGroup && axisGroup === prevPrevAxisGroup) continue;

      const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
      moves.push(`${face}${modifier}`);

      prevPrevAxisGroup = prevAxisGroup;
      prevAxisGroup = axisGroup;
      prevFace = face;
    }

    return moves.join(' ');
  }

  /**
   * Parse a scramble string into an array of individual move tokens.
   * @param {string} scramble
   * @returns {string[]}
   */
  static parse(scramble) {
    return scramble.trim().split(/\s+/).filter(Boolean);
  }
}

export default ScrambleGenerator;
