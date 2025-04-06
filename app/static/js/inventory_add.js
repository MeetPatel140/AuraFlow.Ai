/**
 * Inventory Add Page JavaScript
 * Handles product creation, image upload, barcode generation, and form validation
 */

console.log('Loading inventory_add.js - New SKU Generation Implementation');

console.log('Using SKU generator from external script - should be loaded before inventory_add.js');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventory Add page loaded - DOM Content Loaded Event');
    
    // Register FilePond plugins
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginFileValidateType,
        FilePondPluginImageValidateSize
    );
    
    // Get the file input element
    const fileInput = document.getElementById('product-image');
    
    if (fileInput) {
        console.log('Found file input, initializing FilePond');
        
        // Create FilePond instance
        const pond = FilePond.create(fileInput, {
            allowMultiple: false,
            acceptedFileTypes: ['image/*'],
            imagePreviewHeight: 200,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 800,
            imageResizeTargetHeight: 800,
            stylePanelAspectRatio: 1,
            styleLoadIndicatorPosition: 'center bottom',
            styleProgressIndicatorPosition: 'right bottom',
            styleButtonRemoveItemPosition: 'left bottom',
            styleButtonProcessItemPosition: 'right bottom',
            instantUpload: false,
            allowImagePreview: true,
            imagePreviewMinHeight: 200,
            imagePreviewMaxHeight: 400,
            server: {
                process: '/api/inventory/upload-image',
                revert: '/api/inventory/delete-image',
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                onload: (response) => {
                    try {
                        const parsedResponse = JSON.parse(response);
                        if (parsedResponse.error) {
                            throw new Error(parsedResponse.error);
                        }
                        return response;
                    } catch (error) {
                        throw new Error('Failed to process server response');
                    }
                },
                onerror: (response) => {
                    try {
                        const parsedResponse = JSON.parse(response);
                        return parsedResponse.error || 'Upload failed';
                    } catch (error) {
                        return 'Upload failed';
                    }
                }
            },
            labelIdle: '<span class="filepond--label-action">Upload Product Image</span><br>Drag & Drop or Browse',
            onaddfile: (error, file) => {
                if (error) {
                    console.error('Error adding file:', error);
                    showNotification('Error uploading image: ' + (error.message || 'Unknown error'), 'error');
                    return;
                }
                console.log('File added successfully:', file.filename);
                showNotification('Image selected: ' + file.filename, 'success');
            },
            onpreparefile: (file) => {
                console.log('File preview ready:', file.filename);
            },
            onerror: (error, file, status) => {
                console.error('FilePond error:', error, status);
                const errorMessage = error?.body?.error || error?.message || 'Unknown error';
                showNotification('Error: ' + errorMessage, 'error');
            }
        });
        
        window.productImagePond = pond;
        console.log('FilePond initialized successfully');
    }
    
    // Function to check if we should auto-generate SKU
    function checkAutoGenerateSKU() {
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        const skuInput = document.getElementById('product-sku');
        
        // Only proceed if both fields have values and SKU is empty
        if (categorySelect && categorySelect.value && 
            productNameInput && productNameInput.value.trim() && 
            skuInput && skuInput.value.trim() === '') {
            
            console.log('Auto-generating SKU');
            // Call generateSKU with silent=true to avoid alerts
            window.generateSKU(true);
        }
    }
    
    // Set up auto-generation when product name or category changes
    const categorySelect = document.getElementById('product-category');
    const productNameInput = document.getElementById('product-name');
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            console.log('Category changed, checking if we should auto-generate SKU');
            checkAutoGenerateSKU();
        });
    }
    
    if (productNameInput) {
        // Use both input and change events to catch all changes
        let typingTimer;
        productNameInput.addEventListener('input', function() {
            // Use a small delay to ensure the value is fully entered
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function() {
                console.log('Product name changed, checking if we should auto-generate SKU');
                checkAutoGenerateSKU();
            }, 500); // 500ms delay to avoid generating on every keystroke
        });
        
        productNameInput.addEventListener('change', function() {
            console.log('Product name change event, checking if we should auto-generate SKU');
            checkAutoGenerateSKU();
        });
        
        // Also check on blur (when field loses focus)
        productNameInput.addEventListener('blur', function() {
            console.log('Product name blur event, checking if we should auto-generate SKU');
            checkAutoGenerateSKU();
        });
    }
    
    // Directly attach the SKU generation function to the button
    const generateSkuButton = document.getElementById('generate-sku');
    if (generateSkuButton) {
        console.log('Found Generate SKU button, attaching direct onclick handler');
        generateSkuButton.onclick = function(e) {
            e.preventDefault();
            window.generateSKU();
            return false;
        };
    } else {
        console.error('Generate SKU button not found in DOM');
    }
    
    // Initialize UI components
    initializeSKUGenerator();
    
    // Test SKU generation directly (for debugging)
    window.testSKUGeneration = function() {
        console.log('Testing SKU generation directly');
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        const skuInput = document.getElementById('product-sku');
        
        // Set test values if empty
        if (!categorySelect.value) {
            categorySelect.value = 'electronics';
            console.log('Set test category: electronics');
        }
        
        if (!productNameInput.value) {
            productNameInput.value = 'Test Product';
            console.log('Set test product name: Test Product');
        }
        
        // Find and click the generate button
        const generateButton = document.getElementById('generate-sku');
        if (generateButton) {
            console.log('Clicking generate button');
            generateButton.click();
        } else {
            console.error('Generate button not found');
            
            // Try direct generation
            if (categorySelect && productNameInput && skuInput) {
                const sku = generateUniqueSKU(categorySelect.value, productNameInput.value);
                console.log('Generated SKU directly:', sku);
                skuInput.value = sku;
            }
        }
    };
    
    // Auto-test after 2 seconds (uncomment for testing)
    /*
    setTimeout(() => {
        console.log('Auto-testing SKU generation');
        window.testSKUGeneration();
    }, 2000);
    */
    
    // SVG fallback for product box icon
    const productBoxSvg = `
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="16" width="48" height="40" rx="2" stroke="#a0aec0" stroke-width="2"/>
            <path d="M8 24H56" stroke="#a0aec0" stroke-width="2"/>
            <path d="M32 24V56" stroke="#a0aec0" stroke-width="2" stroke-dasharray="4 4"/>
            <path d="M24 8L40 8" stroke="#a0aec0" stroke-width="2"/>
            <path d="M24 8L24 16" stroke="#a0aec0" stroke-width="2"/>
            <path d="M40 8L40 16" stroke="#a0aec0" stroke-width="2"/>
        </svg>
    `;

    // Insert SVG fallback
    const svgFallbackContainer = document.querySelector('.svg-fallback');
    if (svgFallbackContainer) {
        svgFallbackContainer.innerHTML = productBoxSvg;
    }

    // Check if Font Awesome icon loaded properly
    const faIcon = document.querySelector('.box-icon i');
    if (faIcon) {
        // If the icon width is very small, it likely didn't load properly
        setTimeout(() => {
            const iconWidth = faIcon.getBoundingClientRect().width;
            if (iconWidth < 10) {
                faIcon.style.display = 'none';
                const svgFallback = document.querySelector('.svg-fallback');
                if (svgFallback) {
                    svgFallback.style.display = 'block';
                }
            }
        }, 500);
    }

    // Notification System
    function showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Create icon based on notification type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        container.appendChild(notification);
        
        // Add visible class after a small delay to trigger animation
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Set up close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.remove('visible');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300); // Match the CSS transition duration
        });
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode === container) {
                    notification.classList.remove('visible');
                    setTimeout(() => {
                        if (notification.parentNode === container) {
                            container.removeChild(notification);
                        }
                    }, 300);
                }
            }, duration);
        }
        
        return notification;
    }

    // Function to generate a unique SKU
    function generateUniqueSKU(categoryValue, productName) {
        // Generate SKU: Category prefix (2 chars) + Random number (4 digits) + First 2 chars of product name + Timestamp suffix
        const categoryPrefix = (categoryValue || 'XX').substring(0, 2).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const productPrefix = (productName || 'XX').substring(0, 2).toUpperCase();
        const timestamp = Date.now().toString().substring(9, 13); // Last 4 digits of timestamp for uniqueness
        
        return `${categoryPrefix}${randomNum}${productPrefix}${timestamp}`;
    }

    // Function to initialize the SKU generator
    function initializeSKUGenerator() {
        console.log('Initializing SKU generator');
        
        // Direct function to generate SKU
        function generateSKU(silent = false) {
            console.log('Generate SKU function called, silent:', silent);
            
            const categorySelect = document.getElementById('product-category');
            const productName = document.getElementById('product-name').value.trim();
            const skuInput = document.getElementById('product-sku');
            
            console.log('Category:', categorySelect ? categorySelect.value : 'not found');
            console.log('Product name:', productName);
            console.log('SKU input element:', skuInput ? 'found' : 'not found');
            
            if (!categorySelect || !categorySelect.value) {
                if (!silent) {
                    showNotification('Please select a category first', 'warning');
                    if (categorySelect) categorySelect.focus();
                }
                return;
            }
            
            if (!productName) {
                if (!silent) {
                    // Removing this notification to prevent duplicate alerts
                    // showNotification('Please enter a product name first', 'warning');
                    document.getElementById('product-name').focus();
                }
                return;
            }

            if (!skuInput) {
                console.error('SKU input element not found');
                if (!silent) {
                    showNotification('Error: Could not find SKU input field', 'error');
                }
                return;
            }
            
            // If SKU field already has a value and this is an auto-generation, don't overwrite it
            if (silent && skuInput.value.trim() !== '') {
                console.log('SKU field already has a value, not overwriting during auto-generation');
                return;
            }
            
            // Generate a unique SKU
            const sku = generateUniqueSKU(categorySelect.value, productName);
            console.log('Generated SKU:', sku);
            
            // Add a visual indicator that the SKU was generated
            skuInput.value = sku;
            skuInput.style.backgroundColor = '#f0fff4'; // Light green background
            skuInput.style.borderColor = '#68d391'; // Green border
            
            // Reset the styling after a short delay
            setTimeout(() => {
                skuInput.style.backgroundColor = '';
                skuInput.style.borderColor = '';
            }, 1500);
            
            // Trigger a change event on the SKU input to ensure any listeners are notified
            const changeEvent = new Event('change', { bubbles: true });
            skuInput.dispatchEvent(changeEvent);
            
            if (!silent) {
                showNotification('SKU generated successfully', 'success');
            } else {
                // For silent mode, show a less intrusive notification
                showNotification('SKU generated automatically', 'info', 3000);
            }
        }
        
        // Function to check if we should auto-generate SKU
        function checkAutoGenerateSKU() {
            const categorySelect = document.getElementById('product-category');
            const productNameInput = document.getElementById('product-name');
            const skuInput = document.getElementById('product-sku');
            
            // Only proceed if both fields have values and SKU is empty
            if (categorySelect && categorySelect.value && 
                productNameInput && productNameInput.value.trim() && 
                skuInput && skuInput.value.trim() === '') {
                
                console.log('Auto-generating SKU in initializeSKUGenerator');
                // Call generateSKU with silent=true to avoid alerts
                generateSKU(true);
            }
        }
        
        // Find the generate SKU button
        const generateSkuButton = document.getElementById('generate-sku');
        
        if (!generateSkuButton) {
            console.error('Generate SKU button not found');
            return;
        }
        
        console.log('SKU generator button found, attaching event listener');
        
        // Remove any existing event listeners (just in case)
        const newButton = generateSkuButton.cloneNode(true);
        generateSkuButton.parentNode.replaceChild(newButton, generateSkuButton);
        
        // Add the event listener to the new button
        newButton.addEventListener('click', function(event) {
            console.log('Generate SKU button clicked');
            event.preventDefault();
            generateSKU(false);
        });
        
        // Make sure the button is visible and properly styled
        newButton.style.display = 'flex';
        
        // Add a visual indicator when hovering over the button
        newButton.title = 'Click to generate a unique SKU';
        
        // Set up auto-generation when product name or category changes
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                console.log('Category changed in initializeSKUGenerator');
                checkAutoGenerateSKU();
            });
        }
        
        if (productNameInput) {
            // Use both input and change events to catch all changes
            let typingTimer;
            productNameInput.addEventListener('input', function() {
                // Use a small delay to ensure the value is fully entered
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function() {
                    console.log('Product name changed in initializeSKUGenerator');
                    checkAutoGenerateSKU();
                }, 500); // 500ms delay to avoid generating on every keystroke
            });
            
            productNameInput.addEventListener('change', function() {
                console.log('Product name change event in initializeSKUGenerator');
                checkAutoGenerateSKU();
            });
            
            // Also check on blur (when field loses focus)
            productNameInput.addEventListener('blur', function() {
                console.log('Product name blur event in initializeSKUGenerator');
                checkAutoGenerateSKU();
            });
        }
    }

    // Barcode Generation
    document.getElementById('generate-barcode').addEventListener('click', function() {
        generateBarcode(false);
    });

    // Function to generate barcode
    function generateBarcode(silent = false) {
        console.log('Generating barcode, silent mode:', silent);
        
        // Get required elements
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        const barcodeInput = document.getElementById('product-barcode');
        
        // Log the current values
        console.log('Category:', categorySelect ? categorySelect.value : 'not found');
        console.log('Product name:', productNameInput ? productNameInput.value : 'not found');
        
        // Validate inputs
        if (!categorySelect || !categorySelect.value) {
            if (!silent) {
                showNotification('Please select a category first', 'warning');
                if (categorySelect) categorySelect.focus();
            }
            return false;
        }
        
        if (!productNameInput || !productNameInput.value.trim()) {
            // Silently return without showing notification - other validation will handle this
            if (productNameInput && !silent) productNameInput.focus();
            return false;
        }
        
        // If barcode already has a value and this is auto-generation, don't overwrite it
        if (silent && barcodeInput && barcodeInput.value.trim() !== '') {
            console.log('Barcode field already has a value, not overwriting during auto-generation');
            return false;
        }
        
        // Generate barcode with format: "BAR-<First2CharactersOfProductName><First2CharactersOfCategory><4DigitsOfCurrentUniqueTimestamp>"
        const productPrefix = productNameInput.value.trim().substring(0, 2).toUpperCase();
        const categoryPrefix = getCategoryShortCode(categorySelect.value);
        const timestamp = new Date().getTime().toString().slice(-4);
        
        const barcode = `BAR-${productPrefix}${categoryPrefix}${timestamp}`;
        console.log('Generated barcode:', barcode);
        
        // Set the barcode value
        barcodeInput.value = barcode;
        
        // Update the barcode preview
        updateBarcodePreview();
        
        // Add visual feedback
        barcodeInput.style.backgroundColor = '#f0fff4';
        barcodeInput.style.borderColor = '#68d391';
        
        // Reset the styling after a delay
        setTimeout(() => {
            barcodeInput.style.backgroundColor = '';
            barcodeInput.style.borderColor = '';
        }, 1500);
        
        // Show notification based on mode - keep only this notification
        if (!silent) {
            showNotification('Barcode generated successfully: ' + barcode, 'success');
        }
        
        return true;
    }
    
    // Helper function to get category short code (same as in sku-generator.js)
    function getCategoryShortCode(categoryValue) {
        // Try to extract category name from various formats
        let categoryName = categoryValue;
        
        // If the value is a select option text
        const categorySelect = document.getElementById('product-category');
        if (categorySelect) {
            const selectedOption = categorySelect.options[categorySelect.selectedIndex];
            if (selectedOption) {
                categoryName = selectedOption.text || categoryName;
            }
        }
        
        // If the category is a number (ID), try to get the text
        if (!isNaN(categoryValue) && categorySelect) {
            // Look for the option with this value
            const options = categorySelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value == categoryValue) {
                    categoryName = options[i].text;
                    break;
                }
            }
        }
        
        // Extract first 2 characters of category name
        return categoryName.substring(0, 2).toUpperCase();
    }
    
    // Function to check if we should auto-generate barcode
    function checkAutoGenerateBarcode() {
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        const barcodeInput = document.getElementById('product-barcode');
        
        console.log('Checking auto-generate barcode conditions...');
        console.log('Category value:', categorySelect ? categorySelect.value : 'not found');
        console.log('Product name value:', productNameInput ? productNameInput.value : 'not found');
        console.log('Barcode value:', barcodeInput ? barcodeInput.value : 'not found');
        
        // Only proceed if both fields have values and barcode is empty
        if (categorySelect && categorySelect.value && 
            productNameInput && productNameInput.value.trim() && 
            barcodeInput && barcodeInput.value.trim() === '') {
            
            console.log('Auto-generating barcode - conditions met');
            // Call generateBarcode with silent=true to avoid alerts
            generateBarcode(true);
        }
    }

    // Update barcode preview when barcode value or type changes
    document.getElementById('product-barcode').addEventListener('input', updateBarcodePreview);
    document.getElementById('barcode-type').addEventListener('change', function() {
        updateBarcodePreview();
        // Also check if we should regenerate the barcode when type changes
        checkAutoGenerateBarcode();
    });

    // Set up auto-generation when product name or category changes
    const productNameInputForBarcode = document.getElementById('product-name');
    const categorySelectForBarcode = document.getElementById('product-category');
    
    if (productNameInputForBarcode) {
        // Use both input and change events to catch all changes
        let barcodeTypingTimer;
        productNameInputForBarcode.addEventListener('input', function() {
            // Use a small delay to ensure the value is fully entered
            clearTimeout(barcodeTypingTimer);
            barcodeTypingTimer = setTimeout(function() {
                console.log('Product name changed, checking if we should auto-generate barcode');
                checkAutoGenerateBarcode();
            }, 500); // 500ms delay to avoid generating on every keystroke
        });
        
        productNameInputForBarcode.addEventListener('change', function() {
            console.log('Product name change event, checking if we should auto-generate barcode');
            checkAutoGenerateBarcode();
        });
        
        // Also check on blur (when field loses focus)
        productNameInputForBarcode.addEventListener('blur', function() {
            console.log('Product name blur event, checking if we should auto-generate barcode');
            checkAutoGenerateBarcode();
        });
    }
    
    // Add event listeners for category select (for barcode)
    if (categorySelectForBarcode) {
        categorySelectForBarcode.addEventListener('change', function() {
            console.log('Category changed, checking if we should auto-generate barcode');
            checkAutoGenerateBarcode();
        });
    }
    
    // Check immediately if we already have values that would trigger barcode generation
    setTimeout(checkAutoGenerateBarcode, 200);
    
    // Set up a periodic check for the first few seconds
    let barcodeCheckCount = 0;
    const maxBarcodeChecks = 5;
    const barcodeCheckInterval = setInterval(function() {
        barcodeCheckCount++;
        console.log(`Periodic check for barcode generation (${barcodeCheckCount}/${maxBarcodeChecks})`);
        checkAutoGenerateBarcode();
        
        if (barcodeCheckCount >= maxBarcodeChecks) {
            clearInterval(barcodeCheckInterval);
        }
    }, 1000);

    function updateBarcodePreview() {
        const barcodeValue = document.getElementById('product-barcode').value.trim();
        const barcodeType = document.getElementById('barcode-type').value;
        const previewContainer = document.getElementById('barcode-preview');
        
        // Clear previous barcode
        previewContainer.innerHTML = '';
        
        if (!barcodeValue) {
            return;
        }
        
        // Create SVG element for the barcode
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        previewContainer.appendChild(svgElement);
        
        try {
            JsBarcode(svgElement, barcodeValue, {
                format: barcodeType,
                lineColor: '#000',
                width: 2,
                height: 50,
                displayValue: true,
                fontSize: 14,
                margin: 10
            });
        } catch (error) {
            previewContainer.innerHTML = `<div class="barcode-error">Invalid barcode: ${error.message}</div>`;
        }
    }

    // Calculate profit margin when prices change
    function updateProfitMargin() {
        console.log('Updating profit margin');
        
        const costPriceInput = document.getElementById('product-cost-price');
        const mrpInput = document.getElementById('product-mrp');
        const sellingPriceInput = document.getElementById('product-selling-price');
        const profitDisplay = document.getElementById('profit-margin-display');
        
        if (!costPriceInput || !sellingPriceInput || !profitDisplay) {
            console.error('Required elements for profit margin calculation not found:', {
                costPrice: !!costPriceInput,
                sellingPrice: !!sellingPriceInput,
                profitDisplay: !!profitDisplay
            });
            return;
        }
        
        const profitAmount = profitDisplay.querySelector('.profit-amount');
        const profitPercentage = profitDisplay.querySelector('.profit-percentage');
        
        if (!profitAmount || !profitPercentage) {
            console.error('Profit display elements not found');
            return;
        }
        
        const costPrice = parseFloat(costPriceInput.value) || 0;
        const mrp = parseFloat(mrpInput?.value) || 0;
        const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
        
        console.log('Price values:', { costPrice, mrp, sellingPrice });
        
        if (costPrice > 0 && sellingPrice > 0) {
            const profit = sellingPrice - costPrice;
            const percentage = (profit / costPrice) * 100;
            
            console.log('Calculated profit:', { profit, percentage });
            
            profitAmount.textContent = `₹${profit.toFixed(2)}`;
            profitPercentage.textContent = `(${percentage.toFixed(1)}%)`;
            
            // Change color based on profit margin
            if (profit < 0) {
                profitDisplay.className = 'profit-margin-display negative';
            } else if (percentage < 15) {
                profitDisplay.className = 'profit-margin-display low';
            } else if (percentage < 30) {
                profitDisplay.className = 'profit-margin-display medium';
            } else {
                profitDisplay.className = 'profit-margin-display high';
            }
        } else {
            profitAmount.textContent = '₹0.00';
            profitPercentage.textContent = '(0%)';
            profitDisplay.className = 'profit-margin-display';
        }
    }
    
    // Initialize price input elements
    const costPriceInput = document.getElementById('product-cost-price');
    const mrpInput = document.getElementById('product-mrp');
    const sellingPriceInput = document.getElementById('product-selling-price');
    
    if (costPriceInput && mrpInput && sellingPriceInput) {
        // Add input event listeners for price fields
        const priceInputs = [costPriceInput, mrpInput, sellingPriceInput];
        const events = ['input', 'change', 'blur', 'keyup'];
        
        priceInputs.forEach(input => {
            events.forEach(eventType => {
                input.addEventListener(eventType, () => {
                    console.log(`${input.id} changed:`, input.value);
                    updateProfitMargin();
                });
            });
        });
        
        // MRP validation
        mrpInput.addEventListener('change', function() {
            const mrp = parseFloat(this.value) || 0;
            const costPrice = parseFloat(costPriceInput.value) || 0;
            const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
            const mrpError = document.getElementById('mrp-error');
            
            if (mrpError) {
                if (mrp < costPrice) {
                    mrpError.textContent = 'MRP cannot be less than Cost Price';
                    this.value = costPrice;
                } else {
                    mrpError.textContent = '';
                }
            }
            
            if (sellingPrice > mrp) {
                sellingPriceInput.value = mrp;
                const sellingPriceError = document.getElementById('selling-price-error');
                if (sellingPriceError) {
                    sellingPriceError.textContent = 'Selling Price cannot exceed MRP';
                }
                updateProfitMargin();
            }
        });
        
        sellingPriceInput.addEventListener('change', function() {
            const mrp = parseFloat(mrpInput.value) || 0;
            const sellingPrice = parseFloat(this.value) || 0;
            const sellingPriceError = document.getElementById('selling-price-error');
            
            if (mrp > 0 && sellingPrice > mrp) {
                if (sellingPriceError) {
                    sellingPriceError.textContent = 'Selling Price cannot exceed MRP';
                }
                this.value = mrp;
                updateProfitMargin();
            } else if (sellingPriceError) {
                sellingPriceError.textContent = '';
            }
        });
        
        // Initial calculation
        updateProfitMargin();
    } else {
        console.error('One or more price input elements not found');
    }

    // Toggle status switch
    const statusSwitch = document.getElementById('product-status');
    const statusLabel = document.getElementById('status-label');
    
    if (statusSwitch && statusLabel) {
        statusSwitch.addEventListener('change', function() {
            statusLabel.textContent = this.checked ? 'Active' : 'Inactive';
        });
    }

    // Cancel button
    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
                window.location.href = '/inventory';
            }
        });
    }

    // Form submission handling
    const productForm = document.getElementById('product-form');
    const addProductForm = document.getElementById('add-product-form');
    const formToUse = productForm || addProductForm;
    
    if (formToUse) {
        console.log('Found product form:', formToUse.id);
        formToUse.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            try {
                // Show loading state
                const submitBtn = document.querySelector('button[type="submit"]');
                if (!submitBtn) {
                    console.error('Submit button not found');
                    showNotification('Error: Could not find submit button', 'error');
                    return;
                }
                
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Saving...';
                submitBtn.disabled = true;
        
        // Create FormData object
                const formData = new FormData(this);
                
                // Log form data for debugging
                console.log('Form data entries:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
                }
                
                // Add the image file if selected via Dropzone
                const dropzone = window.productImageDropzone;
                if (dropzone && dropzone.files.length > 0) {
                    console.log('Found Dropzone files:', dropzone.files.length);
                    const file = dropzone.files[0];
                    if (file) {
                        console.log('Adding image file to form data:', file.name);
                        formData.append('image', file);
                    }
                } else {
                    console.log('No Dropzone files found');
                    
                    // Check if there's a file in the regular input as fallback
                    const imageInput = document.getElementById('product-image');
                    if (imageInput && imageInput.files && imageInput.files.length > 0) {
                        console.log('Found file in regular input:', imageInput.files[0].name);
                        formData.append('image', imageInput.files[0]);
                    }
                }

                // Send POST request
                console.log('Sending POST request to /api/inventory/add');
                const response = await fetch('/api/inventory/add', {
            method: 'POST',
            body: formData
                });

                console.log('Response status:', response.status);
                const data = await response.json();

                if (response.ok) {
                    // Show success notification
                    console.log('Product added successfully:', data);
            showNotification('Product added successfully!', 'success');
            
                    // Reset form
                    this.reset();
                    
                    // Reset FilePond
                    if (dropzone) {
                        dropzone.removeFiles();
                    }
                    
                    // Redirect to inventory page after 2 seconds
            setTimeout(() => {
                window.location.href = '/inventory';
                    }, 2000);
                } else {
                    // Show error notification
                    console.error('API error:', data.error || 'Unknown error');
                    showNotification(data.error || 'Failed to add product', 'error');
                }
            } catch (error) {
                console.error('Error during form submission:', error);
                showNotification('An error occurred while saving the product', 'error');
            } finally {
            // Reset button state
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    } else {
        console.error('Product form not found with ID "product-form" or "add-product-form"');
    }
});