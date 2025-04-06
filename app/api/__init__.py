from flask import Blueprint

# Import blueprints
from app.api.auth import auth_bp
from app.api.pos import pos_bp
from app.api.inventory import inventory_bp
from app.api.supplier import supplier_bp
from app.api.dashboard import dashboard_bp
from app.api.user import user_bp
from app.api.subscription import subscription_bp
from app.api.sync import sync_bp
from app.api.categories import categories_bp

def register_blueprints(app):
    """Register all API blueprints with the Flask application"""
    
    # Create main API blueprint
    api_bp = Blueprint('api', __name__, url_prefix='/api')
    
    # Register feature blueprints with the API blueprint
    api_bp.register_blueprint(auth_bp)
    api_bp.register_blueprint(pos_bp)
    # Register inventory blueprint directly with the API blueprint
    api_bp.register_blueprint(inventory_bp)
    api_bp.register_blueprint(supplier_bp)
    api_bp.register_blueprint(dashboard_bp)
    api_bp.register_blueprint(user_bp)
    api_bp.register_blueprint(subscription_bp)
    api_bp.register_blueprint(sync_bp)
    api_bp.register_blueprint(categories_bp)
    
    # Register the main API blueprint with the app
    app.register_blueprint(api_bp)
    
    # Register the main routes blueprint (for frontend serving)
    from app.api.main import main_bp
    app.register_blueprint(main_bp) 