/**
 * Inventory Add Page JavaScript
 * Handles product creation, image upload, barcode generation, and form validation
 */

console.log('Loading inventory_add.js - New SKU Generation Implementation');

// Direct SKU generation function - globally accessible
window.generateSKU = function(silent = false) {
    console.log('Direct SKU generation function called');
    
    // Get the required elements
    const categorySelect = document.getElementById('product-category');
    const productNameInput = document.getElementById('product-name');
    const skuInput = document.getElementById('product-sku');
    
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
        if (!silent) {
            showNotification('Please enter a product name first', 'warning');
            if (productNameInput) productNameInput.focus();
        }
        return false;
    }
    
    if (!skuInput) {
        console.error('SKU input field not found');
        if (!silent) {
            showNotification('Error: Could not find SKU input field', 'error');
        }
        return false;
    }
    
    // If SKU field already has a value and this is an auto-generation, don't overwrite it
    if (silent && skuInput.value.trim() !== '') {
        console.log('SKU field already has a value, not overwriting during auto-generation');
        return true;
    }
    
    // Generate a unique SKU
    const categoryPrefix = categorySelect.value.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const productPrefix = productNameInput.value.trim().substring(0, 2).toUpperCase();
    const timestamp = new Date().getTime().toString().slice(-4);
    
    const sku = `${categoryPrefix}${randomNum}${productPrefix}${timestamp}`;
    console.log('Generated SKU:', sku);
    
    // Set the SKU value
    skuInput.value = sku;
    
    // Add visual feedback
    skuInput.style.backgroundColor = '#f0fff4';
    skuInput.style.borderColor = '#68d391';
    
    // Reset the styling after a delay
    setTimeout(() => {
        skuInput.style.backgroundColor = '';
        skuInput.style.borderColor = '';
    }, 1500);
    
    // Show success message using notification system
    if (!silent) {
        showNotification('SKU generated successfully', 'success');
    }
    
    return true;
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventory Add page loaded - DOM Content Loaded Event');
    
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

    console.log('Registering FilePond plugins');
    // Initialize FilePond
    FilePond.registerPlugin(
        FilePondPluginFileEncode,
        FilePondPluginFileValidateType,
        FilePondPluginImageExifOrientation,
        FilePondPluginImagePreview,
        FilePondPluginImageEdit,
        FilePondPluginImageTransform,
        FilePondPluginFilePoster
    );

    console.log('Creating FilePond instance');
    // Initialize FilePond
    const pond = FilePond.create(document.getElementById('product-image'), {
        allowMultiple: false,
        acceptedFileTypes: ['image/*'],
        storeAsFile: true,
        credits: false,
        instantUpload: false,
        allowImagePreview: true,
        imagePreviewHeight: 300,
        imagePreviewMinHeight: 300,
        imageCropAspectRatio: '1:1',
        imageResizeTargetWidth: 300,
        imageResizeTargetHeight: 300,
        stylePanelLayout: 'compact',
        styleLoadIndicatorPosition: 'center bottom',
        styleButtonRemoveItemPosition: 'top right',
        styleButtonProcessItemPosition: 'top right',
        styleButtonEditItemPosition: 'top right',
        labelIdle: 'Drag & drop your image or <span class="filepond--label-action">Browse</span>',
        allowBrowse: true,
        allowImageTransform: true,
        allowImageEdit: true,
        imageEditIconEdit: '<i class="fas fa-pencil-alt"></i>',
        imageTransformOutputQuality: 90,
        imageTransformOutputMimeType: 'image/jpeg',
        imagePreviewMarkupShow: true,
        imagePreviewMaxFileSize: 50000000,
        // File poster plugin options
        filePosterMaxHeight: 300,
        beforeAddFile: (file) => {
            console.log('beforeAddFile called', file);
            // Hide the placeholder immediately when a file is about to be added
            const placeholder = document.getElementById('product-image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            return true;
        },
        onaddfile: (error, file) => {
            console.log('onaddfile called', error, file);
            if (error) {
                showNotification('Error uploading image: ' + error.message, 'error');
                // Show the placeholder again if there was an error
                const placeholder = document.getElementById('product-image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'flex';
                }
                return;
            }
            // Hide the placeholder when an image is added
            const placeholder = document.getElementById('product-image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            console.log('File added:', file);
            
            // Force refresh of the preview
            setTimeout(() => {
                const previewContainer = document.querySelector('.filepond--image-preview');
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                    setTimeout(() => {
                        previewContainer.style.display = 'block';
                        
                        // Add edit button if it doesn't exist
                        if (!document.querySelector('.filepond--action-edit-item')) {
                            const removeButton = document.querySelector('.filepond--action-remove-item');
                            if (removeButton) {
                                const editButton = document.createElement('button');
                                editButton.className = 'filepond--action-edit-item filepond--action-button';
                                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                                editButton.title = 'Edit Image';
                                editButton.addEventListener('click', () => {
                                    // Simple edit functionality - just re-trigger file selection
                                    document.getElementById('direct-file-input').click();
                                });
                                removeButton.parentNode.insertBefore(editButton, removeButton);
                            }
                        }
                        
                        // Show notification
                        showNotification('Image preview ready', 'success');
                    }, 10);
                }
            }, 100);
        },
        onremovefile: () => {
            console.log('onremovefile called');
            // Show the placeholder when the image is removed
            const placeholder = document.getElementById('product-image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
            showNotification('Image removed', 'info');
        },
        oninit: () => {
            console.log('FilePond initialized');
            
            // Add a test image for development purposes
            // Uncommented for testing
            setTimeout(() => {
                // Create a dummy file object
                const dummyFile = {
                    name: 'test-image.jpg',
                    size: 1024,
                    type: 'image/jpeg'
                };
                
                // Create a new file input element
                const input = document.createElement('input');
                input.type = 'file';
                
                // Create a new File object
                const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
                
                // Add the file to FilePond
                pond.addFile(file);
                
                // Hide the placeholder
                const placeholder = document.getElementById('product-image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Add edit and delete buttons manually after a delay
                setTimeout(() => {
                    const itemContainer = document.querySelector('.filepond--item');
                    if (itemContainer && !document.querySelector('.filepond--action-edit-item')) {
                        // Create edit button
                        const editButton = document.createElement('button');
                        editButton.className = 'filepond--action-edit-item filepond--action-button';
                        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                        editButton.title = 'Edit Image';
                        editButton.addEventListener('click', () => {
                            document.getElementById('direct-file-input').click();
                        });
                        
                        // Create remove button if it doesn't exist
                        let removeButton = document.querySelector('.filepond--action-remove-item');
                        if (!removeButton) {
                            removeButton = document.createElement('button');
                            removeButton.className = 'filepond--action-remove-item filepond--action-button';
                            removeButton.innerHTML = '<i class="fas fa-times"></i>';
                            removeButton.title = 'Remove Image';
                            removeButton.addEventListener('click', () => {
                                pond.removeFile();
                            });
                            itemContainer.appendChild(removeButton);
                        }
                        
                        // Add edit button before remove button
                        itemContainer.insertBefore(editButton, removeButton);
                    }
                }, 500);
            }, 1000);
        }
    });

    // Make the placeholder clickable to trigger file input
    const placeholder = document.getElementById('product-image-placeholder');
    const directFileInput = document.getElementById('direct-file-input');
    
    if (placeholder) {
        placeholder.addEventListener('click', () => {
            directFileInput.click();
        });
    }
    
    // Handle the direct file input
    if (directFileInput) {
        console.log('Setting up direct file input handler');
        directFileInput.addEventListener('change', (event) => {
            console.log('Direct file input changed', event.target.files);
            if (event.target.files && event.target.files.length > 0) {
                // Hide the placeholder immediately
                const placeholder = document.getElementById('product-image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Check if we're editing an existing image
                const isEditing = document.querySelector('.filepond--action-edit-item') !== null;
                
                // If editing, remove the current file first
                if (isEditing && pond.getFile()) {
                    pond.removeFile();
                }
                
                // Add the file to FilePond
                console.log('Adding file to FilePond from direct input');
                pond.addFile(event.target.files[0]);
                
                // Force refresh of the preview after a short delay
                setTimeout(() => {
                    const previewContainer = document.querySelector('.filepond--image-preview');
                    if (previewContainer) {
                        previewContainer.style.display = 'none';
                        setTimeout(() => {
                            previewContainer.style.display = 'block';
                            
                            // Add edit button if it doesn't exist
                            if (!document.querySelector('.filepond--action-edit-item')) {
                                const removeButton = document.querySelector('.filepond--action-remove-item');
                                if (removeButton) {
                                    const editButton = document.createElement('button');
                                    editButton.className = 'filepond--action-edit-item filepond--action-button';
                                    editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                                    editButton.title = 'Edit Image';
                                    editButton.addEventListener('click', () => {
                                        // Simple edit functionality - just re-trigger file selection
                                        document.getElementById('direct-file-input').click();
                                    });
                                    removeButton.parentNode.insertBefore(editButton, removeButton);
                                }
                            }
                        }, 10);
                    }
                }, 300);
                
                // Show a notification
                showNotification(isEditing ? 'Image updated successfully' : 'Image uploaded successfully', 'success');
            }
        });
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
                    showNotification('Please enter a product name first', 'warning');
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
        const barcodeType = document.getElementById('barcode-type').value;
        const barcodeInput = document.getElementById('product-barcode');
        
        // If barcode already has a value and this is auto-generation, don't overwrite it
        if (silent && barcodeInput && barcodeInput.value.trim() !== '') {
            console.log('Barcode field already has a value, not overwriting during auto-generation');
            return;
        }
        
        let barcodeValue = '';
        
        // Generate barcode based on type
        switch(barcodeType) {
            case 'EAN13':
                // Generate 12 digits (13th is check digit, added by JsBarcode)
                barcodeValue = Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
                break;
            case 'CODE128':
                // Generate alphanumeric code
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                barcodeValue = Array.from({length: 10}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                break;
            case 'UPC':
                // Generate 11 digits (12th is check digit, added by JsBarcode)
                barcodeValue = Array.from({length: 11}, () => Math.floor(Math.random() * 10)).join('');
                break;
        }
        
        barcodeInput.value = barcodeValue;
        updateBarcodePreview();
        
        // Add visual feedback
        barcodeInput.style.backgroundColor = '#f0fff4';
        barcodeInput.style.borderColor = '#68d391';
        
        // Reset the styling after a delay
        setTimeout(() => {
            barcodeInput.style.backgroundColor = '';
            barcodeInput.style.borderColor = '';
        }, 1500);
        
        if (!silent) {
            showNotification('Barcode generated successfully', 'success');
        } else {
            showNotification('Barcode generated automatically', 'info', 3000);
        }
    }
    
    // Function to check if we should auto-generate barcode
    function checkAutoGenerateBarcode() {
        const productNameInputForBarcode = document.getElementById('product-name');
        const barcodeInput = document.getElementById('product-barcode');
        
        console.log('Checking auto-generate barcode conditions...');
        console.log('Product name value:', productNameInputForBarcode ? productNameInputForBarcode.value : 'not found');
        console.log('Barcode value:', barcodeInput ? barcodeInput.value : 'not found');
        
        // Only proceed if product name has a value and barcode is empty
        if (productNameInputForBarcode && productNameInputForBarcode.value.trim() && 
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

    // Set up auto-generation when product name changes
    const productNameInputForBarcode = document.getElementById('product-name');
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
    
    statusSwitch.addEventListener('change', function() {
        statusLabel.textContent = this.checked ? 'Active' : 'Inactive';
    });

    // Cancel button
    document.getElementById('cancel-button').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            window.location.href = '/inventory';
        }
    });

    // Form validation and submission
    const form = document.getElementById('add-product-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    function validateForm() {
        let isValid = true;
        
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Validate required fields
        const requiredFields = [
            { id: 'product-name', error: 'name-error', message: 'Product name is required' },
            { id: 'product-category', error: 'category-error', message: 'Category is required' },
            { id: 'product-sku', error: 'sku-error', message: 'SKU is required' },
            { id: 'product-cost-price', error: 'cost-price-error', message: 'Cost price is required' },
            { id: 'product-selling-price', error: 'selling-price-error', message: 'Selling price is required' },
            { id: 'product-stock', error: 'stock-error', message: 'Stock quantity is required' }
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                document.getElementById(field.error).textContent = field.message;
                isValid = false;
                
                // Add error class to input
                input.classList.add('error');
                
                // Remove error class when input changes
                input.addEventListener('input', function() {
                    this.classList.remove('error');
                    document.getElementById(field.error).textContent = '';
                }, { once: true });
            }
        });
        
        // Validate prices
        const costPrice = parseFloat(costPriceInput.value) || 0;
        const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
        
        if (costPrice <= 0 && costPriceInput.value.trim()) {
            document.getElementById('cost-price-error').textContent = 'Cost price must be greater than zero';
            costPriceInput.classList.add('error');
            isValid = false;
        }
        
        if (sellingPrice <= 0 && sellingPriceInput.value.trim()) {
            document.getElementById('selling-price-error').textContent = 'Selling price must be greater than zero';
            sellingPriceInput.classList.add('error');
            isValid = false;
        }
        
        if (sellingPrice < costPrice && sellingPrice > 0 && costPrice > 0) {
            document.getElementById('selling-price-error').textContent = 'Selling price should be greater than cost price';
            sellingPriceInput.classList.add('error');
            isValid = false;
        }
        
        return isValid;
    }
    
    function submitForm() {
        // Show loading state
        const submitButton = document.getElementById('submit-button');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        // Create FormData object
        const formData = new FormData(form);
        
        // Add status value
        formData.append('status', document.getElementById('product-status').checked ? 1 : 0);
        
        // Add image if available
        if (pond.getFile()) {
            formData.append('image', pond.getFile().file);
        }
        
        // Send form data to server
        fetch('/api/inventory/add', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Product added successfully!', 'success');
            
            // Redirect to inventory page after a short delay
            setTimeout(() => {
                window.location.href = '/inventory';
            }, 1500);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding product: ' + error.message, 'error');
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    }
}); 