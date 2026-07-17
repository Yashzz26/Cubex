import { rgbToHsl } from '../utils/colors.js';

/**
 * HSL reference ranges for Rubik's Cube color classification.
 * Format: { code, hMin, hMax, sMin, lMin, lMax }
 * H in degrees (0-360), S and L in percent (0-100).
 */
const HSL_REFERENCES = [
  // White: very low saturation, high lightness
  { code: 'W', hMin: 0,   hMax: 360, sMax: 25,  lMin: 70, lMax: 100 },
  // Yellow: yellow hue, high sat, mid lightness
  { code: 'Y', hMin: 40,  hMax: 70,  sMin: 50,  lMin: 40, lMax: 80  },
  // Orange: orange hue
  { code: 'O', hMin: 15,  hMax: 40,  sMin: 55,  lMin: 30, lMax: 70  },
  // Red: wraps around 360 — checked separately
  { code: 'R', hMin: 345, hMax: 360, sMin: 55,  lMin: 20, lMax: 65  },
  { code: 'R', hMin: 0,   hMax: 15,  sMin: 55,  lMin: 20, lMax: 65  },
  // Blue
  { code: 'B', hMin: 190, hMax: 255, sMin: 35,  lMin: 20, lMax: 72  },
  // Green
  { code: 'G', hMin: 85,  hMax: 175, sMin: 28,  lMin: 20, lMax: 62  },
];

// Nearest-hue fallback centroids (degrees)
const HUE_CENTROIDS = [
  { code: 'W', h: 0   },  // irrelevant; handled by lightness first
  { code: 'Y', h: 55  },
  { code: 'O', h: 27  },
  { code: 'R', h: 0   },
  { code: 'B', h: 220 },
  { code: 'G', h: 130 },
];

class ColorClassifier {
  /**
   * Classify a single RGB pixel into a Rubik's Cube color code.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string} Color code: W, Y, R, O, B, or G
   */
  static classify(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);

    // Check white first (low saturation overrides hue matching)
    if (s <= 25 && l >= 70) return 'W';

    // Check all HSL reference ranges
    for (const ref of HSL_REFERENCES) {
      const hOk = ref.hMin <= h && h <= ref.hMax;
      const sOk = ref.sMin !== undefined ? s >= ref.sMin : true;
      const sMaxOk = ref.sMax !== undefined ? s <= ref.sMax : true;
      const lOk = l >= ref.lMin && l <= ref.lMax;
      if (hOk && sOk && sMaxOk && lOk) return ref.code;
    }

    // Fallback: nearest hue centroid
    let best = 'G';
    let bestDist = Infinity;
    for (const centroid of HUE_CENTROIDS) {
      // Hue is circular; compute shortest angular distance
      let dist = Math.abs(h - centroid.h);
      if (dist > 180) dist = 360 - dist;
      if (dist < bestDist) { bestDist = dist; best = centroid.code; }
    }
    return best;
  }

  /**
   * Classify an array of 9 RGB objects into color codes.
   * @param {{ r: number, g: number, b: number }[]} rgbArray
   * @returns {string[]} Array of 9 color codes
   */
  static classifyFace(rgbArray) {
    return rgbArray.map(({ r, g, b }) => this.classify(r, g, b));
  }
}

export default ColorClassifier;
