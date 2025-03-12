from flask import Blueprint, jsonify

pos_bp = Blueprint('pos', __name__, url_prefix='/pos')

@pos_bp.route('/', methods=['GET'])
def get_pos_data():
    """Get POS data"""
    return jsonify({
        'message': 'POS API endpoint - Coming soon'
    }) 