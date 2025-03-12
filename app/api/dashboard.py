from flask import Blueprint, jsonify

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data"""
    return jsonify({
        'message': 'Dashboard API endpoint - Coming soon'
    }) 