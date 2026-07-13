class MoveTranslator {
  /**
   * Translates a standard Singmaster notation move into a user-friendly instruction.
   * @param {string} move - Move token (e.g. "R", "U'", "F2").
   * @returns {string} Human-readable instruction.
   */
  static translate(move) {
    if (!move || move.length === 0) return '';
    
    const face = move[0];
    const modifier = move.slice(1);

    const facesMap = {
      U: 'top (Up)',
      D: 'bottom (Down)',
      L: 'left (Left)',
      R: 'right (Right)',
      F: 'front (Front)',
      B: 'back (Back)'
    };

    const faceName = facesMap[face];
    if (!faceName) return move;

    let direction = 'clockwise';
    if (modifier.includes("'")) {
      direction = 'counterclockwise';
    } else if (modifier.includes('2')) {
      direction = '180 degrees';
    }

    return `Rotate the ${faceName} face ${direction}`;
  }
}

export default MoveTranslator;
