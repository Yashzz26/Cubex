/**
 * GridSampler — divides the canvas into a 3×3 grid and samples center RGB per cell.
 */
class GridSampler {
  /**
   * @param {FrameProcessor} frameProcessor
   */
  constructor(frameProcessor) {
    this.frameProcessor = frameProcessor;
  }

  /**
   * Sample the 9 grid cells from the current canvas frame.
   * Uses 75% of the canvas as the active scan region (centered).
   * @returns {{ r: number, g: number, b: number }[]} Array of 9 sampled RGB values
   */
  sample() {
    const canvas = this.frameProcessor.canvas;
    const cw = canvas.width;
    const ch = canvas.height;

    // Active scan region: centered 75% of canvas dimensions
    const margin = 0.125; // 12.5% margin on each side → 75% active
    const regionX = cw * margin;
    const regionY = ch * margin;
    const regionW = cw * 0.75;
    const regionH = ch * 0.75;

    const cellW = regionW / 3;
    const cellH = regionH / 3;

    const results = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = regionX + (col + 0.5) * cellW;
        const cy = regionY + (row + 0.5) * cellH;
        results.push(this.frameProcessor.getPixelAt(cx, cy, 10));
      }
    }

    return results; // 9 { r, g, b } objects, row-major order (top-left to bottom-right)
  }
}

export default GridSampler;
