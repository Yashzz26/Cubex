import stateManager from './StateManager.js';

class Router {
  constructor() {
    this.routes = {};
    this.container = null;
    this.currentPage = null;
    
    // Bind event handler
    window.addEventListener('hashchange', () => this._handleRoute());
  }

  /**
   * Register a route mapping.
   * @param {string} path - Hash route (e.g., '', 'solver', 'scanner')
   * @param {Function} PageClass - Constructor function for Page component
   */
  register(path, PageClass) {
    this.routes[path] = PageClass;
  }

  /**
   * Initialize router and bind to main mounting container.
   * @param {HTMLElement} container - Element to render pages into
   */
  init(container) {
    this.container = container;
    this._handleRoute();
  }

  /**
   * Route handler executed on hash change.
   * @private
   */
  _handleRoute() {
    if (!this.container) return;

    // Get current hash, remove leading '#' and slashes
    let hash = window.location.hash.slice(1) || '/';
    
    // Normalize hash (remove trailing slash if any, e.g. '#/solver/' -> 'solver')
    if (hash.startsWith('/')) hash = hash.slice(1);
    if (hash.endsWith('/')) hash = hash.slice(0, -1);
    
    const route = hash || 'home';

    // Find registered page class
    const PageClass = this.routes[route] || this.routes['home'];

    // Clean up previous page if applicable
    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }

    this.container.innerHTML = ''; // Clear container

    // Instantiate and render the new page
    this.currentPage = new PageClass();
    
    if (typeof this.currentPage.render === 'function') {
      const pageElement = this.currentPage.render();
      if (pageElement instanceof HTMLElement) {
        this.container.appendChild(pageElement);
      } else if (typeof pageElement === 'string') {
        this.container.innerHTML = pageElement;
      }
    }

    // Call mount hook if defined
    if (typeof this.currentPage.mount === 'function') {
      this.currentPage.mount();
    }

    // Update global state manager
    stateManager.setActivePage(route);

    // Update navigation active states
    this._updateActiveLinks(route);
  }

  /**
   * Helper to set `.active` class on elements linking to the current page.
   * @private
   */
  _updateActiveLinks(route) {
    document.querySelectorAll('[data-route]').forEach(link => {
      const targetRoute = link.getAttribute('data-route');
      if (targetRoute === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Programmatically navigate to a route.
   * @param {string} route - The route target (e.g. 'solver')
   */
  navigate(route) {
    window.location.hash = `#/${route === 'home' ? '' : route}`;
  }
}

const router = new Router();
export default router;
