/**
 * AuraFlow.Ai - API Client
 * Handles communication with the backend API
 */

// API base URL
const API_BASE_URL = '/api';

// Default request headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * API client for making requests to the backend
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.isRefreshing = false;
    this.refreshQueue = [];
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      this.dispatchEvent('online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.dispatchEvent('offline');
    });
    
    // Custom event handling
    this.eventListeners = {
      'online': [],
      'offline': [],
      'tokenRefreshed': [],
      'unauthorized': [],
      'syncComplete': []
    };
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }
  
  /**
   * Dispatch an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * Set the authentication tokens
   * @param {string} token - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }
  
  /**
   * Clear the authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }
  
  /**
   * Get request headers with authentication
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = { ...DEFAULT_HEADERS };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const headers = options.headers || this.getHeaders();
    const body = options.body ? JSON.stringify(options.body) : undefined;
    
    // Check if we're online
    if (!this.isOnline) {
      // If this is a GET request, try to get from cache
      if (method === 'GET') {
        try {
          const cachedData = await this.getCachedData(endpoint);
          if (cachedData) {
            return cachedData;
          }
        } catch (error) {
          console.warn('Failed to get cached data:', error);
        }
      } else {
        // For non-GET requests, add to offline queue
        return this.addToOfflineQueue(endpoint, options);
      }
      
      throw new Error('You are offline');
    }
    
    try {
      const response = await fetch(url, { method, headers, body });
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401 && this.refreshToken && !options.isRefreshRequest) {
        try {
          await this.refreshAccessToken();
          // Retry the request with the new token
          return this.request(endpoint, options);
        } catch (refreshError) {
          // If refresh fails, clear tokens and dispatch unauthorized event
          this.clearTokens();
          this.dispatchEvent('unauthorized');
          throw refreshError;
        }
      }
      
      // Parse response
      const data = await response.json();
      
      // Handle error responses
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      // Cache GET responses
      if (method === 'GET') {
        this.cacheData(endpoint, data);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * Refresh the access token
   * @returns {Promise} Promise that resolves when the token is refreshed
   */
  async refreshAccessToken() {
    // If already refreshing, wait for it to complete
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }
    
    this.isRefreshing = true;
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('auth_token', this.token);
      
      // Resolve all queued promises
      this.refreshQueue.forEach(({ resolve }) => resolve());
      this.refreshQueue = [];
      
      // Dispatch token refreshed event
      this.dispatchEvent('tokenRefreshed', this.token);
      
      return this.token;
    } catch (error) {
      // Reject all queued promises
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }
  
  /**
   * Cache API response data
   * @param {string} endpoint - API endpoint
   * @param {*} data - Response data
   */
  cacheData(endpoint, data) {
    try {
      const cacheKey = `api_cache_${endpoint}`;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  
  /**
   * Get cached API response data
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Promise that resolves with the cached data
   */
  async getCachedData(endpoint) {
    const cacheKey = `api_cache_${endpoint}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) {
      return null;
    }
    
    try {
      const { data, timestamp } = JSON.parse(cachedItem);
      const age = Date.now() - timestamp;
      
      // Cache expiration (1 hour)
      if (age > 3600000) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to parse cached data:', error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }
  
  /**
   * Add a request to the offline queue
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with a placeholder response
   */
  async addToOfflineQueue(endpoint, options) {
    const { method, body } = options;
    
    // Extract entity type and ID from the endpoint
    const parts = endpoint.split('/').filter(Boolean);
    const entityType = parts[0];
    const entityId = parts.length > 1 ? parseInt(parts[1], 10) : null;
    
    if (!entityType) {
      throw new Error('Invalid endpoint for offline queue');
    }
    
    let action;
    switch (method) {
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      default:
        throw new Error(`Unsupported method for offline queue: ${method}`);
    }
    
    // Add to IndexedDB sync queue
    await window.DB.addToSyncQueue(entityType, entityId || Date.now(), action, body || {});
    
    // Return a placeholder response
    return {
      success: true,
      offline: true,
      message: 'Request added to offline queue'
    };
  }
  
  /**
   * Process the offline queue when back online
   */
  async processOfflineQueue() {
    if (!this.isOnline) {
      return;
    }
    
    try {
      const syncItems = await window.DB.getPendingSyncItems();
      
      if (syncItems.length === 0) {
        return;
      }
      
      console.log(`Processing ${syncItems.length} offline items`);
      
      // Send sync items to the server
      const response = await this.request('/sync/push', {
        method: 'POST',
        body: syncItems.map(item => ({
          sync_id: item.sync_id,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          action: item.action,
          data: item.data,
          timestamp: item.timestamp
        }))
      });
      
      // Process results
      for (const result of response) {
        const syncItem = syncItems.find(item => item.sync_id === result.sync_id);
        
        if (!syncItem) {
          continue;
        }
        
        if (result.status === 'success') {
          // Remove successful items from the queue
          await window.DB.removeSyncItem(syncItem.id);
        } else if (result.status === 'error') {
          // Increment attempt count for failed items
          await window.DB.incrementSyncAttempts(syncItem.id);
        }
      }
      
      // Dispatch sync complete event
      this.dispatchEvent('syncComplete', response);
      
      return response;
    } catch (error) {
      console.error('Failed to process offline queue:', error);
      throw error;
    }
  }
  
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }
  
  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export the API client
window.API = new ApiClient(); 