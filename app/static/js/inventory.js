/**
 * Inventory Management Module
 * Handles product listing, filtering, searching, and CRUD operations
 */

class InventoryManager {
    constructor() {
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.filters = {
            category: 'all',
            stockStatus: 'all',
            search: ''
        };
        
        this.init();
    }
    
    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
    }
    
    async loadProducts() {
        try {
            // Show a loading indicator
            const tbody = document.querySelector('.inventory-table tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="11" class="text-center">
                            <div class="loading-state">
                                <i class="mdi mdi-loading mdi-spin"></i>
                                <p>Loading products...</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            // Make API request with proper error handling
            const response = await fetch('/api/inventory/', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            // Handle 404 case - likely means API isn't ready or database is empty
            if (response.status === 404) {
                // Just show empty state message instead of error
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="11" class="text-center">
                                <div class="empty-state">
                                    <i class="mdi mdi-package-variant"></i>
                                    <p>No products found. Add your first product to get started!</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.products = data.products || [];
            
            // If database is empty, show a friendly message instead of an error
            if (this.products.length === 0) {
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="11" class="text-center">
                                <div class="empty-state">
                                    <i class="mdi mdi-package-variant"></i>
                                    <p>No products found. Add your first product to get started!</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                return;
            }
            
            this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
            
            // Load categories
            await this.loadCategories();
            
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Show a user-friendly error message
            const tbody = document.querySelector('.inventory-table tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="11" class="text-center">
                            <div class="empty-state error">
                                <i class="mdi mdi-alert-circle"></i>
                                <p>Unable to load products: ${error.message}</p>
                                <button class="btn btn-sm btn-primary mt-3" onclick="window.inventoryManager.loadProducts()">
                                    <i class="mdi mdi-refresh"></i> Try Again
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            // Don't show notification for database errors - it's too intrusive
            // Log the error to console instead
            console.log(`Failed to load products: ${error.message}`);
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/inventory/categories', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const data = await response.json();
            const categorySelect = document.getElementById('category-filter');
            if (!categorySelect) return;
            
            // Clear existing options except the first one
            while (categorySelect.children.length > 1) {
                categorySelect.removeChild(categorySelect.lastChild);
            }
            
            // Add new options based on the response format
            if (Array.isArray(data)) {
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } else if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Don't show UI error for categories - just log to console
        }
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.renderProducts();
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.currentPage = 1;
                this.renderProducts();
            });
        }
        
        // Stock status filter
        const stockFilter = document.getElementById('stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.filters.stockStatus = e.target.value;
                this.currentPage = 1;
                this.renderProducts();
            });
        }
        
        // Pagination buttons
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                }
            });
        }
    }
    
    filterProducts() {
        return this.products.filter(product => {
            const searchTerm = this.filters.search.toLowerCase();
            const productName = (product.name || '').toLowerCase();
            const productSku = (product.sku || '').toLowerCase();
            
            const matchesSearch = productName.includes(searchTerm) ||
                                productSku.includes(searchTerm);
            
            const matchesCategory = this.filters.category === 'all' || 
                                  product.category === this.filters.category;
            
            let matchesStock = true;
            const stock = parseInt(product.stock_quantity || product.stock || 0);
            const minStockLevel = parseInt(product.min_stock_level || product.reorder_point || 5);
            
            if (this.filters.stockStatus !== 'all') {
                switch (this.filters.stockStatus) {
                    case 'in-stock':
                        matchesStock = stock > minStockLevel;
                        break;
                    case 'low-stock':
                        matchesStock = stock > 0 && stock <= minStockLevel;
                        break;
                    case 'out-of-stock':
                        matchesStock = stock === 0;
                        break;
                }
            }
            
            return matchesSearch && matchesCategory && matchesStock;
        });
    }
    
    renderProducts() {
        const tbody = document.querySelector('.inventory-table tbody');
        if (!tbody) return;
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Get filtered products
        const filteredProducts = this.filterProducts();
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // If no products found after filtering
        if (paginatedProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center">
                        <div class="empty-state">
                            <i class="mdi mdi-package-variant"></i>
                            <p>No products found matching your filters.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render each product
        paginatedProducts.forEach(product => {
            // Ensure numeric values have defaults and are properly formatted
            const costPrice = parseFloat(product.cost_price || 0);
            const mrp = parseFloat(product.mrp || 0);
            const sellingPrice = parseFloat(product.selling_price || product.price || 0);
            const stockQuantity = parseInt(product.stock_quantity || product.stock || 0);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id || ''}</td>
                <td>
                    <img src="${product.image_url || '/static/images/placeholders/product-placeholder.jpg'}" 
                         alt="${product.name || 'Product Image'}" 
                         class="product-thumbnail">
                </td>
                <td>${product.name || 'Unnamed Product'}</td>
                <td>${product.category || 'Uncategorized'}</td>
                <td>${product.sku || 'N/A'}</td>
                <td>₹${costPrice.toFixed(2)}</td>
                <td>₹${mrp.toFixed(2)}</td>
                <td>₹${sellingPrice.toFixed(2)}</td>
                <td>
                    <span class="stock-badge ${this.getStockStatusClass(product)}">
                        ${stockQuantity}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.is_active ? 'active' : 'inactive'}">
                        ${product.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn btn-icon" onclick="window.location.href='/inventory/add?id=${product.id}'" title="Edit">
                        <i class="mdi mdi-pencil"></i>
                    </button>
                    <button class="btn btn-icon" onclick="window.inventoryManager.deleteProduct(${product.id})" title="Delete">
                        <i class="mdi mdi-delete"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update pagination
        this.updatePagination();
    }
    
    getStockStatusClass(product) {
        const stock = product.stock_quantity || product.stock || 0;
        const minLevel = product.min_stock_level || 5;
        
        if (stock === 0) return 'out-of-stock';
        if (stock <= minLevel) return 'low-stock';
        return 'in-stock';
    }
    
    getStockStatusText(product) {
        const stock = product.stock_quantity || product.stock || 0;
        const minLevel = product.min_stock_level || 5;
        
        if (stock === 0) return 'Out of Stock';
        if (stock <= minLevel) return 'Low Stock';
        return 'In Stock';
    }
    
    updatePagination() {
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');
        const pageInfo = document.querySelector('.pagination-info');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
    }
    
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/inventory/delete/${productId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            // Reload products
            await this.loadProducts();
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Product deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to delete product', 'error');
            }
        }
    }
}

// Initialize the inventory manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
        window.inventoryManager = new InventoryManager();
}); 