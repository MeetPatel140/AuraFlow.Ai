"""
Cache Middleware for Flask
Provides comprehensive cache control functionality
"""

class CacheMiddleware:
    """
    Middleware to add cache control headers to responses
    """
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """
        Initialize the middleware with a Flask app
        """
        app.after_request(self.add_cache_headers)
        app.after_request(self.add_security_headers)
    
    def add_cache_headers(self, response):
        """
        Add appropriate cache control headers based on content type
        """
        # Skip if headers are already set
        if 'Cache-Control' in response.headers:
            return response
        
        # Remove deprecated headers if they exist
        if 'Pragma' in response.headers:
            del response.headers['Pragma']
        if 'Expires' in response.headers:
            del response.headers['Expires']
        
        # Set different cache policies based on content type and path
        if response.mimetype == 'text/html':
            # Don't cache HTML - always fetch fresh content
            response.headers['Cache-Control'] = 'no-cache'
        
        elif response.mimetype in ['application/json', 'application/xml']:
            # API responses - short cache time
            response.headers['Cache-Control'] = 'private, max-age=0'
        
        elif response.mimetype.startswith(('image/', 'font/', 'application/font')):
            # Cache images and fonts for 1 week (604800 seconds)
            response.headers['Cache-Control'] = 'public, max-age=604800, immutable'
        
        elif response.mimetype in ['text/css', 'application/javascript']:
            # Force revalidation of CSS and JS files
            response.headers['Cache-Control'] = 'no-cache, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            response.headers['Cache-Control'] = 'public, max-age=86400'
        
        elif response.mimetype == 'application/manifest+json':
            # PWA manifest - cache for 1 day but allow revalidation
            response.headers['Cache-Control'] = 'public, max-age=86400'
        
        elif response.mimetype == 'application/serviceworker':
            # Service worker - short cache time to ensure updates
            response.headers['Cache-Control'] = 'no-cache'
        
        else:
            # Default cache policy for other resources
            response.headers['Cache-Control'] = 'public, max-age=3600'
        
        return response
    
    def add_security_headers(self, response):
        """
        Add security headers to responses
        """
        # Remove X-Frame-Options if it exists (replaced by CSP)
        if 'X-Frame-Options' in response.headers:
            del response.headers['X-Frame-Options']
        
        # Only add CSP header to HTML responses, not to static resources
        if response.mimetype == 'text/html':
            # Add Content Security Policy header
            response.headers['Content-Security-Policy'] = "frame-ancestors 'self'"
            
            # Add other security headers
            response.headers['X-Content-Type-Options'] = 'nosniff'
        
        return response