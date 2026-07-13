const VALID_MOVE_REGEX = /^[UDLRFB][2']?$/;

class MoveParser {
  /**
   * Parses a space-separated algorithm move string into an array of clean move tokens.
   * @param {string} moveStr - The algorithm string (e.g. "R U R' U' F2").
   * @returns {string[]} An array of valid move tokens.
   */
  static parse(moveStr) {
    if (!moveStr || typeof moveStr !== 'string') return [];
    
    return moveStr
      .trim()
      .split(/\s+/)
      .filter(token => this.isValidMove(token));
  }

  /**
   * Verifies if a token represents standard Rubik's cube notation.
   * @param {string} token - The notation token.
   * @returns {boolean}
   */
  static isValidMove(token) {
    return VALID_MOVE_REGEX.test(token);
  }
}

export default MoveParser;
