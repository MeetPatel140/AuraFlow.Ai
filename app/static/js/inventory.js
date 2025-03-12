/**
 * Inventory Management Module
 * Handles product listing, filtering, searching, and CRUD operations
 */

class InventoryManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.filters = {
            category: 'all',
            stockStatus: 'all',
            search: ''
        };
        
        // Initialize the inventory manager
        this.init();
    }
    
    /**
     * Initialize the inventory manager
     */
    async init() {
        console.log('Initializing Inventory Manager...');
        
        // Load categories
        await this.loadCategories();
        
        // Load products
        await this.loadProducts();
        
        // Initialize event listeners
        this.initEventListeners();
        
        console.log('Inventory Manager initialized');
    }
    
    /**
     * Load product categories
     */
    async loadCategories() {
        try {
            // In a real app, this would be an API call
            // For now, we'll use dummy data
            this.categories = [
                { id: 1, name: 'Food' },
                { id: 2, name: 'Beverages' },
                { id: 3, name: 'Electronics' },
                { id: 4, name: 'Clothing' }
            ];
            
            // Populate category filter
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showNotification('Error loading categories', 'error');
        }
    }
    
    /**
     * Populate category filter dropdown
     */
    populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;
        
        // Clear existing options except the first one (All Categories)
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add categories to filter
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name.toLowerCase();
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
    
    /**
     * Load products
     */
    async loadProducts() {
        try {
            // Show loading state
            this.showLoading(true);
            
            // In a real app, this would be an API call
            // For now, we'll use dummy data
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.products = [
                {
                    id: 1,
                    name: 'Product 1',
                    category: 'Food',
                    sku: 'SKU-001',
                    price: 19.99,
                    stock: 25,
                    status: 'in-stock',
                    image: '/static/images/placeholder.png'
                },
                {
                    id: 2,
                    name: 'Product 2',
                    category: 'Beverages',
                    sku: 'SKU-002',
                    price: 9.99,
                    stock: 5,
                    status: 'low-stock',
                    image: '/static/images/placeholder.png'
                },
                {
                    id: 3,
                    name: 'Product 3',
                    category: 'Electronics',
                    sku: 'SKU-003',
                    price: 29.99,
                    stock: 0,
                    status: 'out-of-stock',
                    image: '/static/images/placeholder.png'
                }
            ];
            
            // Calculate total pages
            this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
            
            // Render products
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Error loading products', 'error');
        } finally {
            // Hide loading state
            this.showLoading(false);
        }
    }
    
    /**
     * Render products in the table
     */
    renderProducts() {
        const tableBody = document.querySelector('.inventory-table tbody');
        if (!tableBody) return;
        
        // Clear table body
        tableBody.innerHTML = '';
        
        // Filter products
        const filteredProducts = this.filterProducts();
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Update pagination info
        this.updatePagination(filteredProducts.length);
        
        // Check if there are products to display
        if (paginatedProducts.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="9" class="text-center">No products found</td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Render products
        paginatedProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" class="product-thumbnail"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.sku}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${product.status}">${this.formatStatus(product.status)}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit-product" data-id="${product.id}"><i class="mdi mdi-pencil"></i></button>
                        <button class="icon-btn delete-product" data-id="${product.id}"><i class="mdi mdi-delete"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        this.addActionButtonListeners();
    }
    
    /**
     * Filter products based on current filters
     * @returns {Array} Filtered products
     */
    filterProducts() {
        return this.products.filter(product => {
            // Filter by category
            if (this.filters.category !== 'all' && product.category.toLowerCase() !== this.filters.category) {
                return false;
            }
            
            // Filter by stock status
            if (this.filters.stockStatus !== 'all' && product.status !== this.filters.stockStatus) {
                return false;
            }
            
            // Filter by search term
            if (this.filters.search && !product.name.toLowerCase().includes(this.filters.search.toLowerCase())) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Update pagination controls
     * @param {number} totalItems Total number of items after filtering
     */
    updatePagination(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        
        // Update pagination buttons
        const prevButton = document.querySelector('.pagination-btn:first-child');
        const nextButton = document.querySelector('.pagination-btn:last-child');
        
        if (prevButton) {
            prevButton.disabled = this.currentPage === 1;
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        }
    }
    
    /**
     * Format status for display
     * @param {string} status Product status
     * @returns {string} Formatted status
     */
    formatStatus(status) {
        switch (status) {
            case 'in-stock':
                return 'In Stock';
            case 'low-stock':
                return 'Low Stock';
            case 'out-of-stock':
                return 'Out of Stock';
            default:
                return status;
        }
    }
    
    /**
     * Add event listeners to action buttons
     */
    addActionButtonListeners() {
        // Edit product buttons
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', event => {
                const productId = parseInt(event.currentTarget.dataset.id);
                this.editProduct(productId);
            });
        });
        
        // Delete product buttons
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', event => {
                const productId = parseInt(event.currentTarget.dataset.id);
                this.deleteProduct(productId);
            });
        });
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Add product button
        const addProductBtn = document.getElementById('add-product');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }
        
        // Import products button
        const importProductsBtn = document.getElementById('import-products');
        if (importProductsBtn) {
            importProductsBtn.addEventListener('click', () => this.importProducts());
        }
        
        // Export products button
        const exportProductsBtn = document.getElementById('export-products');
        if (exportProductsBtn) {
            exportProductsBtn.addEventListener('click', () => this.exportProducts());
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', event => {
                this.filters.category = event.target.value;
                this.currentPage = 1;
                this.renderProducts();
            });
        }
        
        // Stock filter
        const stockFilter = document.getElementById('stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', event => {
                this.filters.stockStatus = event.target.value;
                this.currentPage = 1;
                this.renderProducts();
            });
        }
        
        // Search input
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('keyup', event => {
                if (event.key === 'Enter') {
                    this.filters.search = event.target.value.trim();
                    this.currentPage = 1;
                    this.renderProducts();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    this.filters.search = searchInput.value.trim();
                    this.currentPage = 1;
                    this.renderProducts();
                }
            });
        }
        
        // Pagination buttons
        const prevButton = document.querySelector('.pagination-btn:first-child');
        const nextButton = document.querySelector('.pagination-btn:last-child');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                }
            });
        }
    }
    
    /**
     * Show add product modal
     */
    showAddProductModal() {
        // Create modal if it doesn't exist
        if (!document.getElementById('product-modal')) {
            this.createProductModal();
        }
        
        // Clear form
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
            form.dataset.mode = 'add';
        }
        
        // Update modal title
        const modalTitle = document.querySelector('#product-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add Product';
        }
        
        // Show modal
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * Edit product
     * @param {number} productId Product ID
     */
    editProduct(productId) {
        // Find product
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }
        
        // Create modal if it doesn't exist
        if (!document.getElementById('product-modal')) {
            this.createProductModal();
        }
        
        // Fill form with product data
        const form = document.getElementById('product-form');
        if (form) {
            form.dataset.mode = 'edit';
            form.dataset.productId = productId;
            
            // Set form values
            form.elements['product-name'].value = product.name;
            form.elements['product-category'].value = product.category.toLowerCase();
            form.elements['product-sku'].value = product.sku;
            form.elements['product-price'].value = product.price;
            form.elements['product-stock'].value = product.stock;
        }
        
        // Update modal title
        const modalTitle = document.querySelector('#product-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Product';
        }
        
        // Show modal
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * Delete product
     * @param {number} productId Product ID
     */
    deleteProduct(productId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            // In a real app, this would be an API call
            // For now, we'll just remove it from the array
            this.products = this.products.filter(p => p.id !== productId);
            
            // Re-render products
            this.renderProducts();
            
            // Show success notification
            this.showNotification('Product deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error deleting product', 'error');
        }
    }
    
    /**
     * Create product modal
     */
    createProductModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'modal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Product</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="product-form" data-mode="add">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-name">Product Name</label>
                                <input type="text" id="product-name" name="product-name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="product-category">Category</label>
                                <select id="product-category" name="product-category" class="form-control" required>
                                    <option value="">Select Category</option>
                                    ${this.categories.map(category => `
                                        <option value="${category.name.toLowerCase()}">${category.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-sku">SKU</label>
                                <input type="text" id="product-sku" name="product-sku" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="product-price">Price (₹)</label>
                                <input type="number" id="product-price" name="product-price" step="0.01" min="0" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-stock">Stock Quantity</label>
                                <input type="number" id="product-stock" name="product-stock" min="0" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="product-image">Product Image</label>
                                <input type="file" id="product-image" name="product-image" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" name="product-description" class="form-control"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-product">Cancel</button>
                    <button class="btn btn-primary" id="save-product">Save Product</button>
                </div>
            </div>
        `;
        
        // Add modal to the page
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-product');
        const saveBtn = modal.querySelector('#save-product');
        
        // Close modal
        const closeModal = () => {
            modal.classList.remove('active');
        };
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProduct();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    /**
     * Save product
     */
    saveProduct() {
        const form = document.getElementById('product-form');
        if (!form) return;
        
        // Check form validity
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form data
        const formData = {
            name: form.elements['product-name'].value,
            category: form.elements['product-category'].value,
            sku: form.elements['product-sku'].value,
            price: parseFloat(form.elements['product-price'].value),
            stock: parseInt(form.elements['product-stock'].value),
            description: form.elements['product-description'].value
        };
        
        try {
            // Determine if adding or editing
            const mode = form.dataset.mode;
            
            if (mode === 'add') {
                // Add new product
                const newProduct = {
                    id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
                    ...formData,
                    status: formData.stock > 10 ? 'in-stock' : formData.stock > 0 ? 'low-stock' : 'out-of-stock',
                    image: '/static/images/placeholder.png'
                };
                
                this.products.push(newProduct);
                this.showNotification('Product added successfully', 'success');
            } else if (mode === 'edit') {
                // Edit existing product
                const productId = parseInt(form.dataset.productId);
                const productIndex = this.products.findIndex(p => p.id === productId);
                
                if (productIndex !== -1) {
                    // Update product
                    this.products[productIndex] = {
                        ...this.products[productIndex],
                        ...formData,
                        status: formData.stock > 10 ? 'in-stock' : formData.stock > 0 ? 'low-stock' : 'out-of-stock'
                    };
                    
                    this.showNotification('Product updated successfully', 'success');
                }
            }
            
            // Close modal
            const modal = document.getElementById('product-modal');
            if (modal) {
                modal.classList.remove('active');
            }
            
            // Re-render products
            this.renderProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error saving product', 'error');
        }
    }
    
    /**
     * Import products
     */
    importProducts() {
        // In a real app, this would open a file picker and process the file
        this.showNotification('Import functionality would be implemented here', 'info');
    }
    
    /**
     * Export products
     */
    exportProducts() {
        // In a real app, this would generate a CSV/Excel file and download it
        this.showNotification('Export functionality would be implemented here', 'info');
    }
    
    /**
     * Show loading state
     * @param {boolean} show Whether to show or hide loading state
     */
    showLoading(show) {
        const tableContainer = document.querySelector('.inventory-table-container');
        if (!tableContainer) return;
        
        // Remove existing loading overlay
        const existingOverlay = tableContainer.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (show) {
            // Create loading overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            
            // Add loading overlay to table container
            tableContainer.style.position = 'relative';
            tableContainer.appendChild(loadingOverlay);
        }
    }
    
    /**
     * Show notification
     * @param {string} message Notification message
     * @param {string} type Notification type (success, error, warning, info)
     */
    showNotification(message, type) {
        // Use the global notification system
        if (window.Notifications) {
            window.Notifications.show(message, type);
        } else if (window.Notification && typeof window.Notification.show === 'function') {
            window.Notification.show(message, type);
        } else {
            // Fallback to console log
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize Inventory Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the inventory page
    if (document.querySelector('.inventory-page')) {
        window.inventoryManager = new InventoryManager();
    }
}); 