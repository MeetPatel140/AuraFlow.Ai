# This file intentionally left empty to avoid circular imports.
# Models are imported in the application factory function.

from app.extensions import db

# Import models to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.tenant import Tenant
from app.models.product import Product
from app.models.transaction import Transaction, TransactionItem
from app.models.supplier import Supplier, SupplierOrder, SupplierOrderItem
from app.models.sync import SyncLog, SyncQueue
from app.models.subscription import Subscription, Invoice
from app.models.category import Category

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

# Initialize extensions
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.api import register_blueprints
    register_blueprints(app)
    
    return app
