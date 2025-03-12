/**
 * Inventory Add Page JavaScript
 * Comprehensive functionality for adding new products
 */

document.addEventListener('DOMContentLoaded', function() {
    // Advanced Notification System
    const NotificationSystem = {
        container: null,
        
        init: function() {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
                max-width: 300px;
                width: 100%;
            `;
            document.body.appendChild(this.container);
        },

        show: function(message, type = 'info', options = {}) {
            // Default options
            const defaultOptions = {
                duration: 3000,
                closeable: true,
                progressBar: true
            };
            const config = { ...defaultOptions, ...options };

            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                background-color: ${
                    type === 'success' ? '#28a745' : 
                    type === 'error' ? '#dc3545' : 
                    type === 'warning' ? '#ffc107' : '#17a2b8'
                };
                color: white;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease-in-out;
            `;

            // Notification content
            notification.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${message}</span>
                    ${config.closeable ? '<button style="background:none; border:none; color:white; font-size:20px; cursor:pointer;">&times;</button>' : ''}
                </div>
                ${config.progressBar ? '<div class="progress-bar" style="position:absolute; bottom:0; left:0; height:4px; background:rgba(255,255,255,0.5); width:100%;"></div>' : ''}
            `;

            // Append to container
            this.container.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Progress bar animation
            if (config.progressBar) {
                const progressBar = notification.querySelector('.progress-bar');
                progressBar.animate([
                    { width: '100%' },
                    { width: '0%' }
                ], {
                    duration: config.duration,
                    fill: 'forwards'
                });
            }

            // Close button functionality
            if (config.closeable) {
                const closeBtn = notification.querySelector('button');
                closeBtn.addEventListener('click', () => this.remove(notification));
            }

            // Auto-remove
            const removeTimeout = setTimeout(() => {
                this.remove(notification);
            }, config.duration);

            // Pause on hover
            notification.addEventListener('mouseenter', () => {
                clearTimeout(removeTimeout);
            });

            notification.addEventListener('mouseleave', () => {
                removeTimeout = setTimeout(() => {
                    this.remove(notification);
                }, config.duration);
            });

            return notification;
        },

        remove: function(notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                this.container.removeChild(notification);
            }, 300);
        },

        // Predefined notification methods
        success: function(message, options = {}) {
            return this.show(message, 'success', options);
        },

        error: function(message, options = {}) {
            return this.show(message, 'error', options);
        },

        warning: function(message, options = {}) {
            return this.show(message, 'warning', options);
        },

        info: function(message, options = {}) {
            return this.show(message, 'info', options);
        }
    };

    // Enhanced Form Validation
    const FormValidator = {
        rules: {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            category: {
                required: true
            },
            sku: {
                required: true,
                pattern: /^PRD-\d{5}-\d{3}$/
            },
            cost_price: {
                required: true,
                min: 0,
                max: 1000000
            },
            price: {
                required: true,
                min: 0,
                max: 1000000
            },
            stock_quantity: {
                required: true,
                min: 0,
                max: 100000
            }
        },

        validateField: function(field, value) {
            const rule = this.rules[field.name];
            if (!rule) return true;

            if (rule.required && (!value || value.trim() === '')) {
                this.markInvalid(field, 'This field is required');
                return false;
            }

            if (rule.minLength && value.length < rule.minLength) {
                this.markInvalid(field, `Minimum length is ${rule.minLength} characters`);
                return false;
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                this.markInvalid(field, `Maximum length is ${rule.maxLength} characters`);
                return false;
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                this.markInvalid(field, 'Invalid format');
                return false;
            }

            if (rule.min !== undefined && parseFloat(value) < rule.min) {
                this.markInvalid(field, `Minimum value is ${rule.min}`);
                return false;
            }

            if (rule.max !== undefined && parseFloat(value) > rule.max) {
                this.markInvalid(field, `Maximum value is ${rule.max}`);
                return false;
            }

            this.markValid(field);
            return true;
        },

        markInvalid: function(field, message) {
            field.classList.add('is-invalid');
            // Create or update error message
            let errorEl = field.nextElementSibling;
            if (!errorEl || !errorEl.classList.contains('invalid-feedback')) {
                errorEl = document.createElement('div');
                errorEl.classList.add('invalid-feedback');
                field.parentNode.insertBefore(errorEl, field.nextSibling);
            }
            errorEl.textContent = message;
        },

        markValid: function(field) {
            field.classList.remove('is-invalid');
            const errorEl = field.nextElementSibling;
            if (errorEl && errorEl.classList.contains('invalid-feedback')) {
                errorEl.textContent = '';
            }
        },

        validateProductForm: function(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                const isFieldValid = this.validateField(field, field.value);
                if (!isFieldValid) {
                    isValid = false;
                }
            });

            // Additional complex validations
            const costPrice = parseFloat(document.getElementById('cost_price').value);
            const sellingPrice = parseFloat(document.getElementById('price').value);

            if (sellingPrice <= costPrice) {
                NotificationSystem.show('Selling price must be greater than cost price', 'error');
                const priceField = document.getElementById('price');
                this.markInvalid(priceField, 'Price must be higher than cost price');
                isValid = false;
            }

            return isValid;
        }
    };

    // SKU Generation
    const SkuGenerator = {
        generate: function() {
            const timestamp = Date.now().toString().slice(-5);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const sku = `PRD-${timestamp}-${random}`;
            document.getElementById('sku').value = sku;
            NotificationSystem.show('SKU generated successfully', 'success');
            return sku;
        }
    };

    // Barcode Generation
    const BarcodeGenerator = {
        generate: function() {
            let barcode = '2';
            for (let i = 0; i < 11; i++) {
                barcode += Math.floor(Math.random() * 10);
            }
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            barcode += checkDigit;

            const barcodeInput = document.getElementById('barcode');
            const barcodeTypeSelect = document.getElementById('barcode_type');
            
            barcodeInput.value = barcode;
            this.updatePreview(barcode, barcodeTypeSelect.value);
            
            NotificationSystem.show('Barcode generated successfully', 'success');
            return barcode;
        },

        updatePreview: function(barcodeValue, barcodeType) {
            const barcodePreview = document.getElementById('barcodePreview');
            const previewContainer = barcodePreview.querySelector('.preview-container');
            
            if (!barcodeValue) {
                previewContainer.innerHTML = '<i class="fas fa-barcode fa-3x text-secondary"></i>';
                return;
    }

    try {
                previewContainer.innerHTML = '<svg id="barcode"></svg>';
                
                JsBarcode("#barcode", barcodeValue, {
                    format: barcodeType,
                    width: 2,
                    height: 100,
                    displayValue: true,
                    fontSize: 20,
                    margin: 10
                });
            } catch (error) {
                console.error('Barcode generation error:', error);
                previewContainer.innerHTML = '<p class="error-message">Invalid barcode format</p>';
                NotificationSystem.show('Error generating barcode', 'error');
            }
        }
    };

    // Profit Margin Calculator
    const ProfitCalculator = {
        calculate: function() {
            const costPriceInput = document.getElementById('cost_price');
            const sellingPriceInput = document.getElementById('price');
            const profitMarginInput = document.getElementById('profit_margin');

            const costPrice = parseFloat(costPriceInput.value) || 0;
            const sellingPrice = parseFloat(sellingPriceInput.value) || 0;

            if (costPrice > 0 && sellingPrice > 0) {
                const profitMargin = ((sellingPrice - costPrice) / costPrice) * 100;
                profitMarginInput.value = profitMargin.toFixed(2);
            } else {
                profitMarginInput.value = '';
            }
        }
    };

    // Image Upload Handler
    const ImageUploader = {
        init: function() {
        Dropzone.autoDiscover = false;
        const dropzone = new Dropzone("#productImageDropzone", {
            url: "/api/inventory/upload_image",
            acceptedFiles: "image/*",
            maxFilesize: 2,
            addRemoveLinks: true,
            clickable: true,
            dictDefaultMessage: "",
            init: function() {
                this.on("success", function(file, response) {
                    document.getElementById('image').value = response.image_path;
                        NotificationSystem.show('Image uploaded successfully', 'success');
                });
                this.on("error", function(file, errorMessage) {
                        NotificationSystem.show(errorMessage, 'error');
                });
                this.on("removedfile", function(file) {
                    document.getElementById('image').value = '';
                        NotificationSystem.show('Image removed', 'info');
                });
                this.on("addedfile", function(file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.createElement('img');
                        preview.src = e.target.result;
                        preview.style.maxWidth = '100%';
                        preview.style.maxHeight = '200px';
                        preview.style.objectFit = 'contain';
                        
                        const previewContainer = document.getElementById('imagePreview');
                        if (previewContainer) {
                            previewContainer.innerHTML = '';
                            previewContainer.appendChild(preview);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
        }
    };

    // Product Form Submission
    const ProductFormHandler = {
        init: function() {
            const productForm = document.getElementById('productForm');
            if (!productForm) return;

            productForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                // Disable submit button to prevent multiple submissions
                const submitButton = this.querySelector('button[type="submit"]');
                const originalButtonContent = submitButton.innerHTML;
                
                try {
                    // Comprehensive validation
                    if (!FormValidator.validateProductForm(productForm)) {
                        throw new Error('Please correct the form errors');
                    }

                    // Disable button and show loading state
                    submitButton.disabled = true;
                    submitButton.innerHTML = `
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Saving...
                    `;

                    // Prepare form data
                    const formData = new FormData(productForm);
                    
                    // Ensure is_active is correctly set
                    const isActiveCheckbox = document.getElementById('is_active');
                    formData.set('is_active', isActiveCheckbox.checked ? 'y' : 'n');

                    // Network request with advanced error handling
                    const response = await fetch('/api/inventory/add', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'  // CSRF protection
                        }
                    });

                    // Parse response
                    const data = await response.json();

                    // Check response status
                    if (!response.ok) {
                        throw new Error(data.message || 'Network response was not ok');
                    }

                    // Successful submission
                    if (data.success) {
                        NotificationSystem.success('Product added successfully', {
                            duration: 2000,
                            onClose: () => {
                                window.location.href = '/inventory';
                            }
                        });
                    } else {
                        throw new Error(data.message || 'Unknown error occurred');
                    }

                } catch (error) {
                    // Detailed error handling
                    console.error('Product submission error:', error);
                    
                    // Different notification types based on error
                    if (error.message.includes('validation')) {
                        NotificationSystem.warning(error.message, { duration: 4000 });
                    } else {
                        NotificationSystem.error(`Submission failed: ${error.message}`, { 
                            duration: 4000,
                            progressBar: true 
                        });
                    }
                } finally {
                    // Always restore button state
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonContent;
                    }
                }
            });
        }
    };

    // Event Bindings
    function bindEvents() {
        // SKU Generation
        const generateSkuBtn = document.getElementById('generateSku');
        if (generateSkuBtn) {
            generateSkuBtn.addEventListener('click', () => {
                const sku = SkuGenerator.generate();
                document.getElementById('sku').value = sku;
            });
        }

        // Barcode Generation
        const generateBarcodeBtn = document.getElementById('generate-barcode');
        if (generateBarcodeBtn) {
            generateBarcodeBtn.addEventListener('click', () => {
                const barcode = BarcodeGenerator.generate();
                document.getElementById('barcode').value = barcode;
            });
        }

        // Barcode Type Change
        const barcodeTypeSelect = document.getElementById('barcode_type');
        if (barcodeTypeSelect) {
            barcodeTypeSelect.addEventListener('change', function() {
                const barcodeInput = document.getElementById('barcode');
                BarcodeGenerator.updatePreview(barcodeInput.value, this.value);
            });
        }

        // Profit Margin Calculation
        const costPriceInput = document.getElementById('cost_price');
        const sellingPriceInput = document.getElementById('price');
        if (costPriceInput && sellingPriceInput) {
            costPriceInput.addEventListener('input', ProfitCalculator.calculate);
            sellingPriceInput.addEventListener('input', ProfitCalculator.calculate);
        }

        // Status Switch
        const statusSwitch = document.getElementById('is_active');
        const statusLabel = document.getElementById('statusLabel');
        if (statusSwitch && statusLabel) {
            statusLabel.textContent = statusSwitch.checked ? 'Active' : 'Inactive';
            statusSwitch.addEventListener('change', function() {
                statusLabel.textContent = this.checked ? 'Active' : 'Inactive';
            });
        }
    }

    // Dependency Checker
    const DependencyManager = {
        requiredDependencies: [
            { name: 'Dropzone', check: () => typeof Dropzone !== 'undefined' },
            { name: 'JsBarcode', check: () => typeof JsBarcode !== 'undefined' }
        ],

        checkDependencies: function() {
            const missingDependencies = this.requiredDependencies.filter(dep => !dep.check());
            
            if (missingDependencies.length > 0) {
                const missingNames = missingDependencies.map(dep => dep.name).join(', ');
                NotificationSystem.error(`Missing dependencies: ${missingNames}. Some features may not work.`, {
                    duration: 5000
                });
                return false;
            }
            return true;
        }
    };

    // Error Tracking
    const ErrorTracker = {
        logError: function(context, error) {
            console.error(`[${context}] Error:`, error);
            
            // Optional: Send error to server-side logging
            fetch('/api/log-client-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context: context,
                    error: error.toString(),
                    timestamp: new Date().toISOString()
                })
            }).catch(console.error);
        }
    };

    // Robust Initialization
    function initializeInventoryAddPage() {
        try {
            // Check dependencies first
            if (!DependencyManager.checkDependencies()) {
                throw new Error('Dependency check failed');
            }

            // Initialize core systems
            NotificationSystem.init();

            // Initialize modules
            ImageUploader.init();
            ProductFormHandler.init();
            bindEvents();

            // Auto-generate initial values
            SkuGenerator.generate();
            BarcodeGenerator.generate();

            NotificationSystem.info('Inventory Add Page Initialized Successfully');
        } catch (error) {
            ErrorTracker.logError('Page Initialization', error);
            NotificationSystem.error('Failed to initialize page. Please refresh or contact support.', {
                duration: 5000
            });
        }
    }

    // Wait for DOM and run initialization
    document.addEventListener('DOMContentLoaded', function() {
        // Fallback for older browsers
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeInventoryAddPage);
            } else {
            initializeInventoryAddPage();
        }
    });

    // Image Upload Preview
    const productImageInput = document.getElementById('productImage');
    productImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.createElement('img');
                preview.src = e.target.result;
                preview.style.maxWidth = '100%';
                preview.style.maxHeight = '200px';
                preview.style.objectFit = 'contain';
                const previewContainer = document.getElementById('imagePreview');
                previewContainer.innerHTML = '';
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    });
}); 