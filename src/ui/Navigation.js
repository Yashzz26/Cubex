import themeManager from './ThemeManager.js';

class Navigation {
  constructor() {
    this.hamburgerBtn = null;
    this.drawerCloseBtn = null;
    this.drawerOverlay = null;
    this.navDrawer = null;
  }

  /**
   * Bind event listeners for the responsive drawer.
   */
  init() {
    this.hamburgerBtn = document.getElementById('hamburger-btn');
    this.drawerCloseBtn = document.getElementById('drawer-close');
    this.drawerOverlay = document.getElementById('drawer-overlay');
    this.navDrawer = document.getElementById('nav-drawer');

    // Bind drawer toggles
    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', () => this.openDrawer());
    }

    if (this.drawerCloseBtn) {
      this.drawerCloseBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (this.drawerOverlay) {
      this.drawerOverlay.addEventListener('click', () => this.closeDrawer());
    }

    // Auto-close drawer on link navigation
    const drawerLinks = document.querySelectorAll('.drawer-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => this.closeDrawer());
    });

    // Bind theme button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeManager.bindToggle(themeBtn);
    }
  }

  /**
   * Open the drawer menu.
   */
  openDrawer() {
    if (this.navDrawer && this.drawerOverlay) {
      this.navDrawer.classList.add('active');
      this.drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
    }
  }

  /**
   * Close the drawer menu.
   */
  closeDrawer() {
    if (this.navDrawer && this.drawerOverlay) {
      this.navDrawer.classList.remove('active');
      this.drawerOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore scroll
    }
  }
}

const navigation = new Navigation();
export default navigation;
