import eventBus from './EventBus.js';
import storageManager from '../storage/StorageManager.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  animationSpeed: 1,
  educationalMode: true,
  rotationIndicators: true,
  solutionView: 'sequence'
};

class StateManager {
  constructor() {
    this.state = {
      activePage: 'home',
      settings: storageManager.getItem('settings', { ...DEFAULT_SETTINGS }),
      manualDraft: storageManager.getItem('manualDraft', null),
      scanSession: storageManager.getItem('scanSession', null)
    };
  }

  // Active Page Methods
  getActivePage() {
    return this.state.activePage;
  }

  setActivePage(pageId) {
    if (this.state.activePage === pageId) return;
    const oldPage = this.state.activePage;
    this.state.activePage = pageId;
    eventBus.emit('pageChanged', { activePage: pageId, oldPage });
  }

  // Settings Methods
  getSettings() {
    return this.state.settings;
  }

  getSetting(key) {
    return this.state.settings[key];
  }

  updateSetting(key, value) {
    if (this.state.settings[key] === value) return;
    this.state.settings[key] = value;
    storageManager.setItem('settings', this.state.settings);
    eventBus.emit('settingChanged', { key, value, settings: this.state.settings });
    
    if (key === 'theme') {
      eventBus.emit('themeChanged', value);
    }
  }

  // Manual Draft Methods
  getManualDraft() {
    return this.state.manualDraft;
  }

  saveManualDraft(faces) {
    const draft = {
      updatedAt: Date.now(),
      faces
    };
    this.state.manualDraft = draft;
    storageManager.setItem('manualDraft', draft);
    eventBus.emit('draftChanged', draft);
  }

  clearManualDraft() {
    this.state.manualDraft = null;
    storageManager.removeItem('manualDraft');
    eventBus.emit('draftCleared');
  }

  // Scan Session Methods
  getScanSession() {
    return this.state.scanSession;
  }

  saveScanSession(session) {
    this.state.scanSession = session;
    storageManager.setItem('scanSession', session);
    eventBus.emit('scanSessionChanged', session);
  }

  clearScanSession() {
    this.state.scanSession = null;
    storageManager.removeItem('scanSession');
    eventBus.emit('scanSessionCleared');
  }
}

const stateManager = new StateManager();
export default stateManager;
