const CACHE_NAME = 'auraflow-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/static/css/normalize.css',
    '/static/css/styles.css',
    '/static/css/bootstrap-fixes.css',
    '/static/css/dashboard.css',
    '/static/css/inventory.css',
    '/static/css/inventory_add.css',
    '/static/css/pos.css',
    '/static/css/particles.css',
    '/static/vendor/css/bootstrap.min.css',
    '/static/vendor/css/materialdesignicons.min.css',
    '/static/vendor/css/all.min.css',
    '/static/vendor/css/chart.min.css',
    '/static/vendor/js/bootstrap.bundle.min.js',
    '/static/vendor/js/chart.min.js',
    '/static/vendor/js/jsbarcode.all.min.js',
    '/static/vendor/js/filepond.min.js',
    '/static/vendor/js/filepond-plugin-file-encode.min.js',
    '/static/vendor/js/filepond-plugin-file-validate-type.min.js',
    '/static/vendor/js/filepond-plugin-image-exif-orientation.min.js',
    '/static/vendor/js/filepond-plugin-image-preview.min.js',
    '/static/vendor/js/filepond-plugin-image-edit.min.js',
    '/static/vendor/js/filepond-plugin-image-transform.min.js',
    '/static/vendor/js/filepond-plugin-file-poster.min.js',
    '/static/js/app.js',
    '/static/js/auth.js',
    '/static/js/notification.js',
    '/static/js/notifications-handler.js',
    '/static/js/inventory.js',
    '/static/js/inventory_add.js',
    '/static/js/pos.js',
    '/static/images/favicon.png',
    '/static/images/icons/icon-192x192.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response before using it
                    const responseToCache = response.clone();
                    
                    // Cache the successful API response
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                })
                .catch(() => {
                    // If network request fails, try to get from cache
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cached response, return a default offline response
                            return new Response(JSON.stringify({
                                error: 'You are offline',
                                offline: true
                            }), {
                                headers: { 'Content-Type': 'application/json' }
                            });
                        });
                })
        );
        return;
    }

    // Handle static assets and other requests
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                // If network request fails, try to get from cache
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If the request is for a page, return the offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                        // For other resources, return a simple error response
                        return new Response('Offline - Resource not available');
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Get all pending requests from IndexedDB and try to send them
            syncPendingRequests()
        );
    }
});

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/static/images/icons/icon-192x192.png',
        badge: '/static/images/icons/icon-192x192.png'
    };

    event.waitUntil(
        self.registration.showNotification('AuraFlow', options)
    );
}); 