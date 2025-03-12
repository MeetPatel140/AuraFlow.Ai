from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

subscription_bp = Blueprint('subscription', __name__, url_prefix='/subscription')

@subscription_bp.route('/', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get subscription data"""
    return jsonify({
        'message': 'Subscription API endpoint - Coming soon'
    }) 