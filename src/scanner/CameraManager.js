/**
 * CameraManager — wraps MediaDevices.getUserMedia for camera stream lifecycle.
 */
class CameraManager {
  constructor() {
    this.stream   = null;
    this._starting = false; // Guard against concurrent start() calls
  }

  /**
   * Check if the browser supports camera access.
   * @returns {boolean}
   */
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Request camera access and bind the stream to a video element.
   *
   * Robustness improvements (BUG E):
   *  - Rejects immediately if getUserMedia not supported.
   *  - Guards against concurrent/repeated start() calls.
   *  - Wraps video.play() to handle NotAllowedError and similar rejections.
   *  - An 8-second timeout on loadedmetadata prevents permanent hangs on
   *    Android Chrome with unusual camera constraints.
   *  - Cleans up timeout and onloadedmetadata handler after success/failure.
   *  - stop() can be called safely while start() is pending.
   *
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<void>}
   */
  async start(videoElement) {
    if (!this.isSupported()) {
      throw new Error('Camera API is not supported in this browser.');
    }

    // Prevent concurrent start() invocations
    if (this._starting) {
      throw new Error('Camera start already in progress.');
    }
    this._starting = true;

    // Stop any previously active stream before acquiring a new one
    this.stop();

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 640 },
        height: { ideal: 640 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      this._starting = false;
      // Provide specific messages for the most common failures
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was denied. Please allow camera access and try again.');
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No camera found on this device.');
      }
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Camera is already in use by another application.');
      }
      throw err;
    }

    // Bail out cleanly if stop() was called while getUserMedia was pending
    if (!this.stream) {
      this._starting = false;
      throw new Error('Camera was stopped before it could start.');
    }

    videoElement.srcObject = this.stream;

    // Wait for the video to be ready — with an 8-second timeout.
    // On some Android browsers loadedmetadata never fires for certain camera
    // constraints, leaving the promise pending forever without this guard.
    await new Promise((resolve, reject) => {
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        videoElement.onloadedmetadata = null;
        reject(new Error('Camera timed out waiting for video metadata (8s). Try a different camera or reload.'));
      }, 8000);

      videoElement.onloadedmetadata = async () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        videoElement.onloadedmetadata = null;

        try {
          await videoElement.play();
          resolve();
        } catch (playErr) {
          // play() can reject with NotAllowedError on some browsers in the background
          reject(new Error(`Video playback was blocked: ${playErr.message}`));
        }
      };
    }).catch(err => {
      // On any failure, stop and release the stream before re-throwing
      this.stop();
      this._starting = false;
      throw err;
    });

    this._starting = false;
  }

  /**
   * Stop all camera tracks and release the stream.
   * Safe to call at any time, including during a pending start().
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default CameraManager;
