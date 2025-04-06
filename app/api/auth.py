from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from app.extensions import db
from app.models.user import User
from app.models.tenant import Tenant
from werkzeug.security import generate_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and tenant"""
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['email', 'username', 'password', 'tenant_name', 'subdomain']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Check if subdomain already exists
    if Tenant.query.filter_by(subdomain=data['subdomain']).first():
        return jsonify({'error': 'Subdomain already taken'}), 400
    
    # Create new tenant
    tenant = Tenant(
        name=data['tenant_name'],
        subdomain=data['subdomain'],
        is_active=True,
        subscription_plan='starter',
        subscription_status='trial'
    )
    db.session.add(tenant)
    db.session.flush()  # Flush to get tenant ID
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        is_active=True,
        is_admin=True,  # First user is admin
        tenant_id=tenant.id
    )
    db.session.add(user)
    
    try:
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict(),
            'tenant': tenant.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login a user"""
    # Handle GET request - show login page
    if request.method == 'GET':
        next_page = request.args.get('next')
        if not current_user.is_authenticated:
            return jsonify({'redirect': '/login', 'next': next_page}), 200
        return jsonify({'redirect': next_page if next_page else '/dashboard'}), 200

    # Handle POST request
    data = request.get_json()
    
    # Check if required fields are present
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check if user is active
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403
    
    # Check if tenant is active
    tenant = Tenant.query.get(user.tenant_id)
    if not tenant or not tenant.is_active:
        return jsonify({'error': 'Tenant account is inactive'}), 403
    
    # Update last login time
    user.last_login_at = datetime.utcnow()
    db.session.commit()
    
    # Login user (for session-based auth)
    login_user(user)
    
    # Create tokens (for token-based auth)
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Get the next page from the request
    next_page = request.args.get('next')
    
    response_data = {
        'message': 'Login successful',
        'user': user.to_dict(),
        'tenant': tenant.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'redirect': next_page if next_page else '/dashboard'
    }
    
    return jsonify(response_data), 200


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout a user"""
    try:
        # Clear the current login session
        logout_user()
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
    except Exception as e:
        # Log the error
        current_app.logger.error(f"Logout error: {str(e)}")
        
        # Return error response
        return jsonify({
            'success': False,
            'message': 'Failed to logout'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user information"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    tenant = Tenant.query.get(user.tenant_id)
    
    return jsonify({
        'user': user.to_dict(),
        'tenant': tenant.to_dict() if tenant else None
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Check if required fields are present
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    # Check if current password is correct
    if not user.verify_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    user.password = data['new_password']
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': getattr(current_user, 'first_name', ''),
                'last_name': getattr(current_user, 'last_name', '')
            }
        }), 200
    else:
        return jsonify({
            'authenticated': False
        }), 200