import stateManager from '../core/StateManager.js';

class ThemeManager {
  constructor() {
    this.themeToggleBtn = null;
  }

  /**
   * Initialize theme at startup (checks stored settings)
   */
  init() {
    const currentTheme = stateManager.getSetting('theme');
    this._applyTheme(currentTheme);
  }

  /**
   * Binds theme toggling events to the DOM toggle button.
   */
  bindToggle(buttonElement) {
    this.themeToggleBtn = buttonElement;
    if (!this.themeToggleBtn) return;

    // Synchronize icon with current theme
    this._updateIcon(stateManager.getSetting('theme'));

    this.themeToggleBtn.addEventListener('click', () => {
      const currentTheme = stateManager.getSetting('theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      stateManager.updateSetting('theme', newTheme);
      this._applyTheme(newTheme);
      this._updateIcon(newTheme);
    });
  }

  /**
   * Helper to set class on the body element.
   * @private
   */
  _applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  /**
   * Helper to swap icons inside the button.
   * @private
   */
  _updateIcon(theme) {
    if (!this.themeToggleBtn) return;
    const icon = this.themeToggleBtn.querySelector('i');
    if (!icon) return;

    if (theme === 'light') {
      icon.className = 'bx bx-moon';
      this.themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      icon.className = 'bx bx-sun';
      this.themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
    }
  }
}

const themeManager = new ThemeManager();
export default themeManager;
