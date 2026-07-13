/**
 * Simple EventBus implementation for publish-subscribe event communication.
 * Enables decoupled components to communicate without direct dependencies.
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Register a listener callback for an event.
   * @param {string} event - The name of the event.
   * @param {Function} callback - The callback function to execute.
   * @returns {Function} A deregister function for convenience.
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return an off() reference for easy cleanup
    return () => this.off(event, callback);
  }

  /**
   * Remove a listener callback from an event.
   * @param {string} event - The name of the event.
   * @param {Function} callback - The callback function to remove.
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit/Publish an event with payload.
   * @param {string} event - The name of the event.
   * @param {*} data - The payload to pass to listener callbacks.
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for event "${event}":`, err);
      }
    });
  }
}

const eventBus = new EventBus();
export default eventBus;
