/**
 * CameraManager — wraps MediaDevices.getUserMedia for camera stream lifecycle.
 */
class CameraManager {
  constructor() {
    this.stream = null;
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
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<void>}
   */
  async start(videoElement) {
    if (!this.isSupported()) {
      throw new Error('Camera API is not supported in this browser.');
    }

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 640 },
        height: { ideal: 640 }
      }
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = this.stream;

    // Wait for the video to be ready to play
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
  }

  /**
   * Stop all camera tracks and release the stream.
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default CameraManager;
