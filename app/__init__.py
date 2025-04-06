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
from flask_cors import CORS
from sqlalchemy import event
from sqlalchemy.engine import Engine
from app.extensions import db, migrate, login_manager, cors, cache, mail, celery_app, jwt
from app.config import config_dict
from app.utils.error_handlers import register_error_handlers
from app.api import register_blueprints

def create_app(config_mode='development'):
    app = Flask(__name__)
    
    # Load the configuration
    config = config_dict[config_mode]
    app.config.from_object(config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register versioned_url_for for templates
    from app.utils.versioned_urls import versioned_url_for
    app.jinja_env.globals['versioned_url_for'] = versioned_url_for
    
    # Configure SQLAlchemy
    with app.app_context():
        # Enable better connection handling
        db.engine.pool_pre_ping = True
        
        # SQLite specific configuration
        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
    
    # Register blueprints
    from app.api import register_blueprints
    register_blueprints(app)
    
    return app
