/**
 * Dashboard Loader Script
 * Ensures Chart.js is properly loaded with fallback mechanism
 */

(function() {
    // Primary CDN for Chart.js
    const cdnSources = [
        {
            js: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js",
            css: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.css",
            integrity: {
                js: "sha512-QSkVNOCYLtj73J4hbmVoOV6KVZuMluZlioC+trLpewV8qMjsWqlIQvkn1KGX2StWvPMdWGBqim1xlC8krl1EKQ==",
                css: "sha512-vK5r+cnXJNbQUm+MQc1HzzLmT4/iGY0QD1qJkMBuHlAfqiR3G7T5/unlKN5tJYGJJenAI9J8oZwWpo1J7hKx+Q=="
            }
        },
        {
            js: "https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js",
            css: "https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.css"
        }
    ];

    // Local fallback paths
    const localFallback = {
        js: "/static/js/chart.min.js",
        css: "/static/css/chart.min.css"
    };

    // Function to load a script with fallback
    function loadScript(src, integrity = null, callback = null) {
        const script = document.createElement('script');
        script.src = src;
        if (integrity) {
            script.integrity = integrity;
            script.crossOrigin = "anonymous";
        }
        
        script.onload = function() {
            console.log(`Successfully loaded script: ${src}`);
            if (callback) callback(true);
        };
        
        script.onerror = function() {
            console.warn(`Failed to load script: ${src}`);
            if (callback) callback(false);
        };
        
        document.head.appendChild(script);
        return script;
    }

    // Function to load a stylesheet with fallback
    function loadStylesheet(href, integrity = null, callback = null) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        if (integrity) {
            link.integrity = integrity;
            link.crossOrigin = "anonymous";
        }
        
        link.onload = function() {
            console.log(`Successfully loaded stylesheet: ${href}`);
            if (callback) callback(true);
        };
        
        link.onerror = function() {
            console.warn(`Failed to load stylesheet: ${href}`);
            if (callback) callback(false);
        };
        
        document.head.appendChild(link);
        return link;
    }

    // Function to check if Chart.js is loaded
    function isChartJsLoaded() {
        return typeof Chart !== 'undefined';
    }

    // Function to attempt loading Chart.js from multiple sources
    function loadChartJs(callback) {
        // Already loaded?
        if (isChartJsLoaded()) {
            console.log('Chart.js already loaded');
            if (callback) callback(true);
            return;
        }

        // Try loading from CDN sources
        let currentSourceIndex = 0;
        
        function tryNextSource() {
            if (currentSourceIndex >= cdnSources.length) {
                // All CDN sources failed, try local fallback
                console.warn('All CDN sources failed, trying local fallback');
                loadStylesheet(localFallback.css);
                loadScript(localFallback.js, null, function(success) {
                    if (success && isChartJsLoaded()) {
                        console.log('Chart.js loaded from local fallback');
                        if (callback) callback(true);
                    } else {
                        console.error('All attempts to load Chart.js failed');
                        if (callback) callback(false);
                    }
                });
                return;
            }
            
            const source = cdnSources[currentSourceIndex];
            
            // Load CSS first
            loadStylesheet(source.css, source.integrity?.css);
            
            // Then load JS
            loadScript(source.js, source.integrity?.js, function(success) {
                if (success && isChartJsLoaded()) {
                    console.log(`Chart.js loaded from source ${currentSourceIndex + 1}`);
                    if (callback) callback(true);
                } else {
                    currentSourceIndex++;
                    tryNextSource();
                }
            });
        }
        
        // Start the loading process
        tryNextSource();
    }

    // Initialize Chart.js loading
    document.addEventListener('DOMContentLoaded', function() {
        loadChartJs(function(success) {
            if (success) {
                // Dispatch a custom event that other scripts can listen for
                const event = new CustomEvent('chartjs-loaded');
                document.dispatchEvent(event);
            } else {
                // Dispatch failure event
                const event = new CustomEvent('chartjs-failed');
                document.dispatchEvent(event);
                
                // Show error notification
                if (window.Notifications) {
                    window.Notifications.show('Dashboard visualization library failed to load. Please refresh the page.', 'error');
                } else if (window.Notification && typeof window.Notification.show === 'function') {
                    window.Notification.show('Dashboard visualization library failed to load. Please refresh the page.', 'error');
                }
            }
        });
    });

    // Expose the loader to the global scope
    window.ChartJsLoader = {
        load: loadChartJs,
        isLoaded: isChartJsLoaded
    };
})(); 