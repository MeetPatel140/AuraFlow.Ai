from flask import Blueprint, jsonify

supplier_bp = Blueprint('supplier', __name__, url_prefix='/supplier')

@supplier_bp.route('/', methods=['GET'])
def get_suppliers():
    """Get suppliers data"""
    return jsonify({
        'message': 'Supplier API endpoint - Coming soon'
    }) 