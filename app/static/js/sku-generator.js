/**
 * SKU Generator
 * Standalone script for generating unique SKUs
 */

console.log('Loading standalone SKU generator script');

// Define the SKU generation function in the global scope
window.generateSKU = function(silent = false) {
    console.log('Standalone SKU generation function called');
    
    // Get the required elements
    const categorySelect = document.getElementById('product-category');
    const productNameInput = document.getElementById('product-name');
    const skuInput = document.getElementById('product-sku');
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
        if (!silent) {
            // Removing this notification to avoid duplicates
            // showNotification('Please enter a product name first', 'warning');
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
    
    // If SKU field already has a value, don't overwrite it unless forced
    if (skuInput.value.trim() !== '' && silent) {
        console.log('SKU field already has a value, not overwriting');
        return true;
    }
    
    // Generate a unique SKU in the format: "SKU-[First2LettersOfProductName][First2LettersOfCategoryName][4DigitTimestamp]"
    const productPrefix = productNameInput.value.trim().substring(0, 2).toUpperCase();
    const categoryPrefix = getCategoryShortCode(categorySelect.value);
    const timestamp = new Date().getTime().toString().slice(-4);
    
    const sku = `SKU-${productPrefix}${categoryPrefix}${timestamp}`;
    console.log('Generated SKU:', sku);
    
    // Set the SKU value
    skuInput.value = sku;
    
    // Also set the same value to barcode input
    if (barcodeInput) {
        console.log('Found barcode input field, setting value:', sku);
        barcodeInput.value = sku;
        
        // Add visual feedback for barcode input
        barcodeInput.style.backgroundColor = '#f0fff4';
        barcodeInput.style.borderColor = '#68d391';
        
        // Reset barcode styling after a delay
        setTimeout(() => {
            barcodeInput.style.backgroundColor = '';
            barcodeInput.style.borderColor = '';
        }, 1500);
    } else {
        console.warn('Barcode input field not found');
    }
    
    // Add visual feedback
    skuInput.style.backgroundColor = '#f0fff4';
    skuInput.style.borderColor = '#68d391';
    
    // Reset the styling after a delay
    setTimeout(() => {
        skuInput.style.backgroundColor = '';
        skuInput.style.borderColor = '';
    }, 1500);
    
    // Show success message only if not silent
    if (!silent) {
        if (typeof showNotification === 'function') {
            showNotification('SKU generated successfully: ' + sku, 'success');
        } else {
            alert('SKU generated successfully: ' + sku);
        }
    }
    
    return true;
};

// Helper function to get category short code
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

// Function to check if we should auto-generate SKU
function checkAutoGenerateSKU() {
    const categorySelect = document.getElementById('product-category');
    const productNameInput = document.getElementById('product-name');
    const skuInput = document.getElementById('product-sku');
    
    console.log('Checking auto-generate conditions...');
    console.log('Category value:', categorySelect ? categorySelect.value : 'not found');
    console.log('Product name value:', productNameInput ? productNameInput.value : 'not found');
    console.log('SKU value:', skuInput ? skuInput.value : 'not found');
    
    // Only proceed if both fields have values and SKU is empty
    if (categorySelect && categorySelect.value && 
        productNameInput && productNameInput.value.trim() && 
        skuInput && skuInput.value.trim() === '') {
        
        console.log('Auto-generating SKU - conditions met');
        // Call generateSKU with silent=true to avoid alerts
        window.generateSKU(true);
    }
}

// Immediately set up event listeners when the script loads
(function() {
    console.log('Setting up immediate event listeners for SKU generation');
    
    // Function to set up the event listeners
    function setupEventListeners() {
        const categorySelect = document.getElementById('product-category');
        const productNameInput = document.getElementById('product-name');
        
        if (categorySelect && productNameInput) {
            console.log('Found form elements, attaching event listeners');
            
            // For category select
            categorySelect.addEventListener('change', function() {
                console.log('Category changed (immediate listener)');
                setTimeout(checkAutoGenerateSKU, 50);
            });
            
            // For product name input - multiple events to ensure we catch all changes
            productNameInput.addEventListener('input', function() {
                console.log('Product name input event (immediate listener)');
                setTimeout(checkAutoGenerateSKU, 50);
            });
            
            productNameInput.addEventListener('change', function() {
                console.log('Product name change event (immediate listener)');
                setTimeout(checkAutoGenerateSKU, 50);
            });
            
            productNameInput.addEventListener('blur', function() {
                console.log('Product name blur event (immediate listener)');
                setTimeout(checkAutoGenerateSKU, 50);
            });
            
            productNameInput.addEventListener('keyup', function() {
                console.log('Product name keyup event (immediate listener)');
                setTimeout(checkAutoGenerateSKU, 50);
            });
            
            // Check if we already have values that would trigger SKU generation
            setTimeout(checkAutoGenerateSKU, 100);
            
            return true;
        }
        
        return false;
    }
    
    // Try to set up event listeners immediately
    if (!setupEventListeners()) {
        // If elements aren't available yet, try again when DOM is loaded
        console.log('Elements not found, will try again when DOM is loaded');
        
        // Set up a polling mechanism to check for the elements
        let attempts = 0;
        const maxAttempts = 5; // Reduced from 20 to 5
        const pollInterval = 300; // Increased from 100ms to 300ms
        
        const pollForElements = setInterval(function() {
            attempts++;
            console.log(`Polling for elements (attempt ${attempts}/${maxAttempts})`);
            
            if (setupEventListeners()) {
                console.log('Successfully set up event listeners on poll');
                clearInterval(pollForElements);
            } else if (attempts >= maxAttempts) {
                console.error('Failed to find elements after maximum attempts');
                clearInterval(pollForElements);
            }
        }, pollInterval);
    }
})();

// Also attach the function to the button when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in standalone SKU generator script');
    
    // Get the generate SKU button
    const generateSkuButton = document.getElementById('generate-sku');
    
    if (generateSkuButton) {
        console.log('Found Generate SKU button in standalone script');
        
        // Attach the click event handler
        generateSkuButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.generateSKU();
            return false;
        });
        
        console.log('Successfully attached event handlers to Generate SKU button');
    } else {
        console.error('Generate SKU button not found in DOM');
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
        productNameInput.addEventListener('input', function() {
            // Use a small delay to ensure the value is fully entered
            clearTimeout(productNameInput.autoGenerateTimer);
            productNameInput.autoGenerateTimer = setTimeout(function() {
                console.log('Product name changed, checking if we should auto-generate SKU');
                checkAutoGenerateSKU();
            }, 100); // Reduced delay to 100ms for faster response
        });
        
        productNameInput.addEventListener('blur', function() {
            console.log('Product name blur event, checking if we should auto-generate SKU');
            checkAutoGenerateSKU();
        });
    }
    
    // Check immediately if we already have values that would trigger SKU generation
    setTimeout(checkAutoGenerateSKU, 100);
    
    // Set up a periodic check for the first few seconds
    let checkCount = 0;
    const maxChecks = 5;
    const checkInterval = setInterval(function() {
        checkCount++;
        console.log(`Periodic check for SKU generation (${checkCount}/${maxChecks})`);
        checkAutoGenerateSKU();
        
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
        }
    }, 300);
}); 