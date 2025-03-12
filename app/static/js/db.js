/**
 * AuraFlow.Ai - IndexedDB Database Manager
 * Handles local database operations for offline functionality
 */

const DB_NAME = 'auraflow_db';
const DB_VERSION = 1;

// Database schema
const STORES = {
  products: { keyPath: 'id', indexes: ['tenant_id', 'barcode', 'category'] },
  transactions: { keyPath: 'id', indexes: ['tenant_id', 'transaction_number', 'created_at'] },
  transaction_items: { keyPath: 'id', indexes: ['transaction_id', 'product_id'] },
  suppliers: { keyPath: 'id', indexes: ['tenant_id', 'name'] },
  supplier_orders: { keyPath: 'id', indexes: ['tenant_id', 'supplier_id', 'order_number'] },
  supplier_order_items: { keyPath: 'id', indexes: ['order_id', 'product_id'] },
  sync_queue: { keyPath: 'id', indexes: ['entity_type', 'entity_id', 'action', 'created_at'] },
  settings: { keyPath: 'key' }
};

// Database instance
let db;

/**
 * Initialize the database
 * @returns {Promise} Promise that resolves when the database is ready
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      console.error('Your browser does not support IndexedDB. Offline functionality will not work.');
      reject(new Error('IndexedDB not supported'));
      return;
    }

    // Open the database
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (called when the database is created or version changes)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores and indexes
      for (const [storeName, storeConfig] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
          
          // Create indexes
          if (storeConfig.indexes) {
            storeConfig.indexes.forEach(indexName => {
              store.createIndex(indexName, indexName, { unique: false });
            });
          }
          
          console.log(`Created object store: ${storeName}`);
        }
      }
    };

    // Handle success
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database initialized successfully');
      resolve(db);
    };

    // Handle error
    request.onerror = (event) => {
      console.error('Database initialization error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get a transaction and object store
 * @param {string} storeName - The name of the object store
 * @param {string} mode - The transaction mode ('readonly' or 'readwrite')
 * @returns {Object} Object containing the transaction and object store
 */
function getStore(storeName, mode = 'readonly') {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  
  return { transaction, store };
}

/**
 * Add or update an item in the specified store
 * @param {string} storeName - The name of the object store
 * @param {Object} item - The item to add or update
 * @returns {Promise} Promise that resolves with the item's key
 */
function saveItem(storeName, item) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore(storeName, 'readwrite');
      
      const request = store.put(item);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        console.log(`Item saved in ${storeName}`);
      };
      
      transaction.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get an item by its key from the specified store
 * @param {string} storeName - The name of the object store
 * @param {*} key - The key of the item to get
 * @returns {Promise} Promise that resolves with the item
 */
function getItem(storeName, key) {
  return new Promise((resolve, reject) => {
    try {
      const { store } = getStore(storeName);
      
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete an item by its key from the specified store
 * @param {string} storeName - The name of the object store
 * @param {*} key - The key of the item to delete
 * @returns {Promise} Promise that resolves when the item is deleted
 */
function deleteItem(storeName, key) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore(storeName, 'readwrite');
      
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        console.log(`Item deleted from ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all items from the specified store
 * @param {string} storeName - The name of the object store
 * @param {string} indexName - Optional index name to use for retrieval
 * @param {*} indexValue - Optional value to match against the index
 * @returns {Promise} Promise that resolves with an array of items
 */
function getAllItems(storeName, indexName = null, indexValue = null) {
  return new Promise((resolve, reject) => {
    try {
      const { store } = getStore(storeName);
      
      let request;
      
      if (indexName && indexValue !== null) {
        const index = store.index(indexName);
        request = index.getAll(indexValue);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clear all data from the specified store
 * @param {string} storeName - The name of the object store
 * @returns {Promise} Promise that resolves when the store is cleared
 */
function clearStore(storeName) {
  return new Promise((resolve, reject) => {
    try {
      const { transaction, store } = getStore(storeName, 'readwrite');
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        console.log(`Store ${storeName} cleared`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add an item to the sync queue
 * @param {string} entityType - The type of entity (product, transaction, etc.)
 * @param {number} entityId - The ID of the entity
 * @param {string} action - The action performed (create, update, delete)
 * @param {Object} data - The entity data
 * @returns {Promise} Promise that resolves with the sync queue item ID
 */
function addToSyncQueue(entityType, entityId, action, data) {
  const syncItem = {
    id: Date.now() + Math.random().toString(36).substr(2, 5), // Generate a unique ID
    sync_id: Date.now() + Math.random().toString(36).substr(2, 9),
    entity_type: entityType,
    entity_id: entityId,
    action: action,
    data: JSON.stringify(data),
    timestamp: new Date().toISOString(),
    attempts: 0,
    created_at: new Date().toISOString()
  };
  
  return saveItem('sync_queue', syncItem);
}

/**
 * Get all pending sync items
 * @returns {Promise} Promise that resolves with an array of sync items
 */
function getPendingSyncItems() {
  return getAllItems('sync_queue');
}

/**
 * Remove a sync item from the queue
 * @param {string} id - The ID of the sync item to remove
 * @returns {Promise} Promise that resolves when the item is removed
 */
function removeSyncItem(id) {
  return deleteItem('sync_queue', id);
}

/**
 * Update a sync item's attempts count
 * @param {string} id - The ID of the sync item
 * @returns {Promise} Promise that resolves when the item is updated
 */
function incrementSyncAttempts(id) {
  return getItem('sync_queue', id)
    .then(item => {
      if (item) {
        item.attempts += 1;
        item.last_attempt = new Date().toISOString();
        return saveItem('sync_queue', item);
      }
      throw new Error('Sync item not found');
    });
}

/**
 * Save a setting value
 * @param {string} key - The setting key
 * @param {*} value - The setting value
 * @returns {Promise} Promise that resolves when the setting is saved
 */
function saveSetting(key, value) {
  return saveItem('settings', { key, value });
}

/**
 * Get a setting value
 * @param {string} key - The setting key
 * @returns {Promise} Promise that resolves with the setting value
 */
function getSetting(key) {
  return getItem('settings', key)
    .then(item => item ? item.value : null);
}

// Initialize the database when the script loads
initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

// Export the database API
window.DB = {
  init: initDatabase,
  save: saveItem,
  get: getItem,
  delete: deleteItem,
  getAll: getAllItems,
  clear: clearStore,
  addToSyncQueue,
  getPendingSyncItems,
  removeSyncItem,
  incrementSyncAttempts,
  saveSetting,
  getSetting
}; 