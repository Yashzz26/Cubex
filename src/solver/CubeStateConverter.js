class CubeStateConverter {
  /**
   * Converts a color-based CubeState into a facelet-symbol Kociemba 54-char string.
   * @param {CubeState} cubeState - Logical CubeState object.
   * @returns {string} Facelet string (composed of U, R, F, D, L, B).
   */
  static toFaceletString(cubeState) {
    const faces = cubeState.faces;
    
    // Find the center color code (index 4) of each face.
    // In Rubik's cube geometry, the centers are fixed and determine the face's name.
    const centerColorToFace = {
      [faces.U[4]]: 'U',
      [faces.R[4]]: 'R',
      [faces.F[4]]: 'F',
      [faces.D[4]]: 'D',
      [faces.L[4]]: 'L',
      [faces.B[4]]: 'B'
    };

    // Safety verification: Ensure center colors map uniquely to 6 faces.
    const uniqueCentersCount = Object.keys(centerColorToFace).length;
    if (uniqueCentersCount !== 6) {
      console.warn(`Warning: Cube center colors are not unique! Found only ${uniqueCentersCount} unique centers.`);
    }

    // Kociemba notation expects faces ordered as: U, R, F, D, L, B
    const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
    
    let faceletStr = '';
    for (const face of faceOrder) {
      const stickers = faces[face];
      for (const colorCode of stickers) {
        const faceSymbol = centerColorToFace[colorCode];
        if (!faceSymbol) {
          // If color is unrecognized, fallback to the current face name as a safe default
          faceletStr += face;
        } else {
          faceletStr += faceSymbol;
        }
      }
    }

    return faceletStr;
  }
}

export default CubeStateConverter;
