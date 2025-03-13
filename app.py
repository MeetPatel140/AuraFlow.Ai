import os

# Apply SQLAlchemy patch for Python 3.13 compatibility
try:
    import sqlalchemy_patch
except ImportError:
    print("SQLAlchemy patch not found, continuing without it")

from flask import Flask, render_template, send_from_directory, send_file, request
from app.config.config import config_by_name
from app.extensions import db, migrate, login_manager, jwt, cors, cache, mail, celery_app
from app.api import register_blueprints
from app.utils.cache_utils import versioned_url_for
from app.utils.cache_middleware import CacheMiddleware
from werkzeug.serving import WSGIRequestHandler

# Hide server version information
WSGIRequestHandler.server_version = "Server"
WSGIRequestHandler.sys_version = ""

def create_app(config_name='development'):
    """Create and configure the Flask application"""
    app = Flask(__name__, 
                static_folder='app/static',
                template_folder='app/templates')
    
    # Load configuration based on environment
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize optional extensions if available
    if jwt:
        jwt.init_app(app)
    
    if cors:
        cors.init_app(app)
    
    if login_manager:
        login_manager.init_app(app)
    
    if migrate:
        try:
            migrate.init_app(app, db)
        except Exception as e:
            print(f"Warning: Could not initialize Flask-Migrate: {e}")
    
    if cache:
        try:
            cache.init_app(app)
        except Exception as e:
            print(f"Warning: Could not initialize Flask-Cache: {e}")
    
    if mail:
        try:
            mail.init_app(app)
        except Exception as e:
            print(f"Warning: Could not initialize Flask-Mail: {e}")
    
    # Configure Celery
    if celery_app:
        try:
            celery_app.conf.update(app.config)
        except Exception as e:
            print(f"Warning: Could not configure Celery: {e}")
    
    # Register API blueprints
    register_blueprints(app)
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Override url_for to use versioned URLs for cache busting
    app.jinja_env.globals['url_for'] = versioned_url_for
    
    # Initialize cache middleware
    CacheMiddleware(app)
    
    # Add routes for serving static files and PWA assets
    @app.route('/manifest.json')
    def manifest():
        """Serve the PWA manifest file"""
        return send_file('app/static/manifest.json', mimetype='application/json')
    
    @app.route('/service-worker.js')
    def service_worker():
        """Serve the service worker for offline functionality"""
        return send_file('app/static/service-worker.js', mimetype='application/javascript')
    
    @app.route('/static/<path:path>')
    def static_files(path):
        """Serve static files"""
        # Ignore version parameter if present
        if '?' in path:
            path = path.split('?')[0]
        
        return send_from_directory('app/static', path)
    
    # Create database tables if they don't exist (in development)
    if app.config['ENV'] == 'development':
        with app.app_context():
            db.create_all()
            print("Database tables created successfully!")
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True) 