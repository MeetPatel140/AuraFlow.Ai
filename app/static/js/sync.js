/**
 * AuraFlow.Ai - Sync Module (DISABLED)
 * This module has been disabled to prevent redirect loops.
 */

// Create empty sync manager to prevent errors
class SyncManager {
  constructor() {
    console.log('Sync functionality has been disabled');
  }
  
  // Stub methods to prevent errors
  init() {}
  startPeriodicSync() {}
  stopPeriodicSync() {}
  sync() { return Promise.resolve({ success: true }); }
  getSyncStatus() { return Promise.resolve({ online: true, lastSync: null, pendingChanges: 0 }); }
}

// Initialize sync manager on DOM load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Sync functionality has been disabled to prevent redirect loops');
  window.syncManager = new SyncManager();
}); 