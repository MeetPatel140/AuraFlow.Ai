from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

from app.extensions import db
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.tenant import Tenant
from app.models.category import Category

# Change the URL prefix to /api/inventory
inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

@inventory_bp.route('/', methods=['GET'])
@login_required
def get_inventory():
    """Fetch inventory data for the current user's tenant"""
    try:
        # Use a more direct approach with raw SQL to avoid SQLAlchemy ORM issues with missing columns
        from sqlalchemy import text
        
        # Execute a raw SQL query to get only the basic columns we know exist
        sql = text("""
            SELECT id, name, sku, price, cost_price, stock_quantity, category, 
                   image_url, is_active, tenant_id, supplier_id, created_at, updated_at
            FROM products
            WHERE tenant_id = :tenant_id
        """)
        
        result = db.session.execute(sql, {"tenant_id": current_user.tenant_id})
        
        # Convert result to list of dictionaries
        products = []
        for row in result:
            product = {
                'id': row.id,
                'name': row.name,
                'sku': row.sku,
                'price': float(row.price) if row.price else 0,
                'selling_price': float(row.price) if row.price else 0,
                'cost_price': float(row.cost_price) if row.cost_price else 0,
                'stock': row.stock_quantity,
                'stock_quantity': row.stock_quantity,
                'category': row.category,
                'category_id': row.category,  # For backward compatibility
                'image_url': row.image_url,
                'is_active': row.is_active,
                'created_at': row.created_at.isoformat() if row.created_at else '',
                'updated_at': row.updated_at.isoformat() if row.updated_at else ''
            }
            products.append(product)
        
        # Check if products were found
        if not products:
            # Return an empty list instead of 404 to make frontend handling easier
            return jsonify({"products": [], "message": "No products found"}), 200
        
        return jsonify({"products": products, "success": True})
        
    except Exception as e:
        current_app.logger.error(f"Error fetching inventory: {str(e)}")
        return jsonify({
            "message": "Failed to fetch inventory data",
            "error": str(e),
            "success": False
        }), 500

@inventory_bp.route('/add', methods=['POST'])
@login_required
def add_product():
    """Add a new product to inventory"""
    try:
        # Get basic information
        name = request.form.get('name')
        sku = request.form.get('sku')
        barcode = request.form.get('barcode')
        barcode_type = request.form.get('barcode_type', 'CODE128')
        description = request.form.get('description', '')
        category = request.form.get('category')
        brand = request.form.get('brand', '')
        
        # Price information
        selling_price = float(request.form.get('price', 0))
        cost_price = float(request.form.get('cost_price', 0))
        mrp = float(request.form.get('mrp', 0))
        tax_rate = float(request.form.get('tax_rate', 18))
        discount = float(request.form.get('discount', 0))
        
        # Stock information
        stock_quantity = int(request.form.get('quantity', 0))
        low_stock_threshold = int(request.form.get('low_stock_threshold', 10))
        
        # Additional information
        weight = float(request.form.get('weight', 0)) if request.form.get('weight') else 0
        length = float(request.form.get('length', 0)) if request.form.get('length') else 0
        width = float(request.form.get('width', 0)) if request.form.get('width') else 0
        height = float(request.form.get('height', 0)) if request.form.get('height') else 0
        is_active = request.form.get('is_active') == 'y'
        notes = request.form.get('notes', '')
        
        # Handle image upload
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                
                # Save to upload folder
                upload_folder = os.path.join(current_app.root_path, 'static/uploads/products')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Store relative URL
                image_url = f"/static/uploads/products/{unique_filename}"
        
        # Create new product
        new_product = Product(
            name=name,
            description=description,
            sku=sku,
            barcode=barcode,
            barcode_type=barcode_type,
            price=selling_price,
            cost_price=cost_price,
            mrp=mrp,
            tax_rate=tax_rate,
            discount=discount,
            stock_quantity=stock_quantity,
            min_stock_level=low_stock_threshold,
            category=category,
            brand=brand,
            weight=weight,
            length=length,
            width=width,
            height=height,
            notes=notes,
            image_url=image_url,
            is_active=is_active,
            tenant_id=current_user.tenant_id
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product added successfully',
            'product': new_product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding product: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error adding product: {str(e)}"
        }), 500

@inventory_bp.route('/delete/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    """Delete a product from inventory"""
    try:
        product = Product.query.filter_by(id=product_id, tenant_id=current_user.tenant_id).first()
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f"Error deleting product: {str(e)}"
        }), 500

@inventory_bp.route('/update/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    """Update a product in inventory"""
    try:
        product = Product.query.filter_by(id=product_id, tenant_id=current_user.tenant_id).first()
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        # Update product fields
        if 'name' in request.form:
            product.name = request.form.get('name')
        
        if 'description' in request.form:
            product.description = request.form.get('description')
        
        if 'sku' in request.form:
            product.sku = request.form.get('sku')
        
        if 'barcode' in request.form:
            product.barcode = request.form.get('barcode')
        
        if 'selling_price' in request.form:
            product.price = float(request.form.get('selling_price'))
        
        if 'cost_price' in request.form:
            product.cost_price = float(request.form.get('cost_price'))
        
        if 'stock_quantity' in request.form:
            product.stock_quantity = int(request.form.get('stock_quantity'))
        
        if 'low_stock_threshold' in request.form:
            product.min_stock_level = int(request.form.get('low_stock_threshold'))
        
        if 'category_id' in request.form:
            product.category = request.form.get('category_id')
        
        if 'supplier_id' in request.form:
            product.supplier_id = request.form.get('supplier_id')
        
        if 'status' in request.form:
            product.is_active = True if request.form.get('status') == 'active' else False
        
        # Handle image upload
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                
                # Save to upload folder
                upload_folder = os.path.join(current_app.root_path, 'static/uploads/products')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Store relative URL
                product.image_url = f"/static/uploads/products/{unique_filename}"
        
        product.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'product': product.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f"Error updating product: {str(e)}"
        }), 500

# API endpoints for categories and suppliers
@inventory_bp.route('/categories', methods=['GET'])
@login_required
def get_categories():
    """Get all product categories"""
    try:
        # Try to fetch categories from the database
        categories = Category.query.filter_by(tenant_id=current_user.tenant_id).all()
        
        if categories:
            return jsonify([{
                "id": category.id,
                "name": category.name
            } for category in categories])
        
        # If no categories found, return default categories
        default_categories = [
        {"id": "electronics", "name": "Electronics"},
        {"id": "clothing", "name": "Clothing & Apparel"},
        {"id": "food", "name": "Food & Beverages"},
        {"id": "home", "name": "Home & Kitchen"},
        {"id": "beauty", "name": "Beauty & Personal Care"},
        {"id": "sports", "name": "Sports & Outdoors"},
        {"id": "books", "name": "Books & Stationery"},
        {"id": "toys", "name": "Toys & Games"}
    ]
    
        return jsonify(default_categories)
    except Exception as e:
        current_app.logger.error(f"Error fetching categories: {str(e)}")
        # Fallback to default categories
        default_categories = [
            {"id": "electronics", "name": "Electronics"},
            {"id": "clothing", "name": "Clothing & Apparel"},
            {"id": "food", "name": "Food & Beverages"},
            {"id": "home", "name": "Home & Kitchen"},
            {"id": "beauty", "name": "Beauty & Personal Care"},
            {"id": "sports", "name": "Sports & Outdoors"},
            {"id": "books", "name": "Books & Stationery"},
            {"id": "toys", "name": "Toys & Games"}
        ]
        
        return jsonify(default_categories)

@inventory_bp.route('/suppliers', methods=['GET'])
@login_required
def get_suppliers():
    """Get all suppliers"""
    suppliers = Supplier.query.filter_by(tenant_id=current_user.tenant_id).all()
    
    # If no suppliers found, return sample data
    if not suppliers:
        suppliers_data = [
            {"id": "1", "name": "ABC Suppliers"},
            {"id": "2", "name": "XYZ Distributors"},
            {"id": "3", "name": "Global Traders"}
        ]
    else:
        suppliers_data = [
            {"id": supplier.id, "name": supplier.name}
            for supplier in suppliers
        ]
    
    return jsonify(suppliers_data)

@inventory_bp.route('/<int:product_id>', methods=['GET'])
@login_required
def get_product(product_id):
    """Get a single product's details"""
    try:
        product = Product.query.filter_by(id=product_id, tenant_id=current_user.tenant_id).first()
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        return jsonify({
            'success': True,
            'product': product.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching product: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error fetching product: {str(e)}"
        }), 500