// AuraFlow.Ai Service Worker - Disabled

// This service worker has been disabled to ensure the app is fully online-only
// It only serves to unregister itself and not intercept any network requests

self.addEventListener('install', event => {
  console.log('Service worker installed - but disabled');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activated - but disabled');
  
  // Unregister this service worker
  self.registration.unregister()
      .then(() => {
      console.log('Service worker unregistered itself');
    })
    .catch(error => {
      console.error('Error unregistering service worker:', error);
    });
    
  // Claim clients to ensure this executes right away
  event.waitUntil(self.clients.claim());
});

// No fetch handler - let all network requests go directly to the network 