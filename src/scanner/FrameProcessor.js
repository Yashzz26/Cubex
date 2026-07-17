/**
 * FrameProcessor — draws video frames to a canvas and exposes pixel sampling.
 */
class FrameProcessor {
  /**
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLCanvasElement} canvasElement
   */
  constructor(videoElement, canvasElement) {
    this.video  = videoElement;
    this.canvas = canvasElement;
    this.ctx    = canvasElement.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Draw the current video frame onto the canvas.
   */
  captureFrame() {
    const { video, canvas, ctx } = this;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 640;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  /**
   * Sample a square cluster of pixels around (cx, cy) and return averaged RGB.
   * @param {number} cx - Center X in canvas pixels
   * @param {number} cy - Center Y in canvas pixels
   * @param {number} radius - Half-size of the sampling square (default 8)
   * @returns {{ r: number, g: number, b: number }}
   */
  getPixelAt(cx, cy, radius = 8) {
    const x0 = Math.max(0, Math.round(cx - radius));
    const y0 = Math.max(0, Math.round(cy - radius));
    const w  = Math.min(radius * 2, this.canvas.width  - x0);
    const h  = Math.min(radius * 2, this.canvas.height - y0);

    if (w <= 0 || h <= 0) return { r: 128, g: 128, b: 128 };

    const data = this.ctx.getImageData(x0, y0, w, h).data;
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      // Skip near-black (under-exposed) and near-white (over-exposed)
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luma < 20 || luma > 235) continue;
      r += data[i]; g += data[i + 1]; b += data[i + 2];
      count++;
    }

    if (count === 0) return { r: 128, g: 128, b: 128 };
    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count)
    };
  }
}

export default FrameProcessor;
