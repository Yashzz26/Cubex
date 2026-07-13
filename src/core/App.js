import router from './Router.js';
import themeManager from '../ui/ThemeManager.js';
import navigation from '../ui/Navigation.js';

// Page Imports
import HomePage from '../pages/HomePage.js';
import SolverPage from '../pages/SolverPage.js';
import ScannerPage from '../pages/ScannerPage.js';
import ManualPage from '../pages/ManualPage.js';
import PracticePage from '../pages/PracticePage.js';
import HistoryPage from '../pages/HistoryPage.js';
import AboutPage from '../pages/AboutPage.js';

class App {
  constructor() {
    this.shellRendered = false;
  }

  /**
   * Initialize theme and build application shell.
   */
  init() {
    // 1. Initialize Theme (applies body classes before rendering shell to avoid flashes)
    themeManager.init();

    // 2. Render App Shell Layout
    this._renderShell();

    // 3. Register Routes
    router.register('home', HomePage);
    router.register('solver', SolverPage);
    router.register('scanner', ScannerPage);
    router.register('manual', ManualPage);
    router.register('practice', PracticePage);
    router.register('history', HistoryPage);
    router.register('about', AboutPage);

    // 4. Initialize Router
    const container = document.getElementById('main-page-container');
    router.init(container);

    // 5. Initialize Navigation Events (drawer, hamburger, click links)
    navigation.init();
  }

  /**
   * Generates the semantic HTML structure of the persistent App Shell.
   * @private
   */
  _renderShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('App mount element #app not found in document!');
      return;
    }

    appContainer.innerHTML = `
      <!-- App Header -->
      <header class="app-header">
        <a href="#/" class="logo-container">
          <div class="logo-icon">
            <i class="bx bxs-cube-alt"></i>
          </div>
          <span>Cubix</span>
        </a>
        
        <!-- Desktop Nav -->
        <nav class="nav-links">
          <a href="#/" class="nav-link" data-route="home">Home</a>
          <a href="#/solver" class="nav-link" data-route="solver">Solver</a>
          <a href="#/scanner" class="nav-link" data-route="scanner">Scanner</a>
          <a href="#/manual" class="nav-link" data-route="manual">Manual Input</a>
          <a href="#/practice" class="nav-link" data-route="practice">Practice</a>
          <a href="#/history" class="nav-link" data-route="history">History</a>
          <a href="#/about" class="nav-link" data-route="about">About</a>
        </nav>
        
        <div class="header-actions">
          <button id="theme-toggle" class="theme-toggle-btn btn-icon" aria-label="Toggle dark/light theme">
            <i class="bx bx-sun"></i>
          </button>
          <button id="hamburger-btn" class="hamburger-menu-btn btn-icon" aria-label="Open menu">
            <i class="bx bx-menu"></i>
          </button>
        </div>
      </header>

      <!-- Navigation Drawer (Mobile) -->
      <div id="drawer-overlay" class="drawer-overlay"></div>
      <aside id="nav-drawer" class="nav-drawer">
        <div class="drawer-header">
          <div class="logo-container">
            <div class="logo-icon">
              <i class="bx bxs-cube-alt"></i>
            </div>
            <span>Cubix</span>
          </div>
          <button id="drawer-close" class="btn-icon" aria-label="Close menu">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <nav class="drawer-links">
          <a href="#/" class="drawer-link" data-route="home">Home</a>
          <a href="#/solver" class="drawer-link" data-route="solver">Solver</a>
          <a href="#/scanner" class="drawer-link" data-route="scanner">Scanner</a>
          <a href="#/manual" class="drawer-link" data-route="manual">Manual Input</a>
          <a href="#/practice" class="drawer-link" data-route="practice">Practice</a>
          <a href="#/history" class="drawer-link" data-route="history">History</a>
          <a href="#/about" class="drawer-link" data-route="about">About</a>
        </nav>
      </aside>

      <!-- Dynamic Page Container -->
      <main id="main-content" class="main-content">
        <div id="main-page-container" class="page-container"></div>
      </main>

      <!-- App Footer -->
      <footer class="app-footer">
        <p>&copy; ${new Date().getFullYear()} Cubix. Built with Three.js & cubejs. All rights reserved.</p>
      </footer>
    `;

    this.shellRendered = true;
  }
}

const app = new App();
export default app;
