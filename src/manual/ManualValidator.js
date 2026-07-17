/**
 * Validates a ManualNetState object and returns structured error information.
 */
class ManualValidator {
  /**
   * Validates the provided ManualNetState.
   * @param {ManualNetState} netState
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(netState) {
    const errors = [];

    // Rule 1: No unpainted stickers
    const unpainted = netState.getUnpaintedCount();
    if (unpainted > 0) {
      errors.push(`${unpainted} sticker${unpainted > 1 ? 's are' : ' is'} still unpainted.`);
    }

    // Rule 2: Each color must appear exactly 9 times
    const counts = netState.getColorCounts();
    const colorNames = {
      W: 'White', Y: 'Yellow', R: 'Red', O: 'Orange', B: 'Blue', G: 'Green'
    };
    for (const [code, count] of Object.entries(counts)) {
      if (count !== 9) {
        errors.push(`${colorNames[code]}: ${count} sticker${count !== 1 ? 's' : ''} (expected exactly 9).`);
      }
    }

    // Rule 3: All 6 center stickers must be different colors
    const centers = ['U', 'D', 'F', 'B', 'L', 'R'].map(f => netState.getSticker(f, 4));
    const uniqueCenters = new Set(centers);
    if (uniqueCenters.size < 6) {
      errors.push('Two or more faces share the same center color. Each face must have a unique center.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ManualValidator;
