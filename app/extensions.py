from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate

# Initialize SQLAlchemy
db = SQLAlchemy()

# Initialize other extensions with try/except to handle missing dependencies
try:
    migrate = Migrate()
except ImportError:
    migrate = None

try:
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        return User.query.get(int(user_id))
except ImportError:
    login_manager = None

try:
    from flask_jwt_extended import JWTManager
    jwt = JWTManager()
except ImportError:
    jwt = None

try:
    from flask_cors import CORS
    cors = CORS()
except ImportError:
    cors = None

try:
    from flask_caching import Cache
    cache = Cache()
except ImportError:
    cache = None

try:
    from flask_mail import Mail
    mail = Mail()
except ImportError:
    mail = None

try:
    from celery import Celery
    celery_app = Celery()
except ImportError:
    celery_app = None 