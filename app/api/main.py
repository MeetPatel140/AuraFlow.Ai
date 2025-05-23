from flask import Blueprint, render_template, redirect, url_for, send_from_directory, request, session, flash
from flask_login import login_required, current_user, logout_user
import os
from app.forms.inventory import InventoryAddForm

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Redirect to the login page if not authenticated, otherwise to dashboard"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('main.login'))

@main_bp.route('/login')
def login():
    """Serve the login page"""
    # If already logged in, redirect to dashboard
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    # Clear session to ensure a fresh login
    session.clear()
    return render_template('auth.html')

@main_bp.route('/register')
def register():
    """Serve the register page"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('auth.html')

@main_bp.route('/forgot-password')
def forgot_password():
    """Serve the forgot password page"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('auth.html')

@main_bp.route('/logout')
def logout():
    """Log out the user and redirect to login page"""
    # Clear session data
    session.clear()
    
    # Logout the user if authenticated
    if current_user.is_authenticated:
        logout_user()
    
    # Redirect to login page
    return redirect(url_for('main.login'))

@main_bp.route('/offline')
def offline():
    """Serve the offline page"""
    return render_template('offline.html')

@main_bp.route('/test')
def test():
    """Test page"""
    return render_template('test.html')

@main_bp.route('/test2')
def test2():
    """Test page 2"""
    return render_template('test2.html')

@main_bp.route('/test3')
def test3():
    """Test page 3"""
    return render_template('test3.html')

@main_bp.route('/test-modal')
def test_modal():
    """Serve the test modal page"""
    return render_template('test_modal.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """Serve the dashboard page"""
    # Make sure we have user context
    if not current_user.is_authenticated:
        return redirect(url_for('main.login'))
        
    # Render the dashboard template with user data
    return render_template('dashboard.html', user=current_user)

@main_bp.route('/pos')
@login_required
def pos():
    """Serve the POS page"""
    return render_template('pos.html')

@main_bp.route('/inventory')
@login_required
def inventory():
    """Serve the inventory management page"""
    return render_template('inventory.html')

@main_bp.route('/inventory/add', methods=['GET'])
@login_required
def inventory_add():
    """Serve the add/edit product page"""
    form = InventoryAddForm()
    
    # Get product ID from query parameters for edit mode
    product_id = request.args.get('id')
    product = None
    
    if product_id:
        # Edit mode - fetch product data
        from app.models.product import Product
        product = Product.query.filter_by(id=product_id, tenant_id=current_user.tenant_id).first()
        if not product:
            flash('Product not found', 'error')
            return redirect(url_for('main.inventory'))
    
    # Get categories for the select field
    categories = [
        ("electronics", "Electronics"),
        ("clothing", "Clothing & Apparel"),
        ("food", "Food & Beverages"),
        ("home", "Home & Kitchen"),
        ("beauty", "Beauty & Personal Care"),
        ("sports", "Sports & Outdoors"),
        ("books", "Books & Stationery"),
        ("toys", "Toys & Games")
    ]
    form.category.choices = categories
    
    # Set barcode type choices
    barcode_types = [
        ('EAN-13', 'EAN-13'),
        ('UPC-A', 'UPC-A'),
        ('CODE128', 'CODE128'),
        ('CODE39', 'CODE39')
    ]
    form.barcode_type.choices = barcode_types
    
    # Set default values for new products
    if not product:
        form.tax_rate.data = 18
        form.discount.data = 0
        form.low_stock_threshold.data = 10
        form.is_active.data = True
    else:
        # Populate form with existing product data
        form.name.data = product.name
        form.sku.data = product.sku
        form.barcode.data = product.barcode
        form.barcode_type.data = product.barcode_type
        form.category.data = product.category
        form.price.data = product.price
        form.cost_price.data = product.cost_price
        form.mrp.data = product.mrp
        form.tax_rate.data = product.tax_rate
        form.discount.data = product.discount
        form.quantity.data = product.stock_quantity
        form.low_stock_threshold.data = product.min_stock_level
        form.is_active.data = product.is_active
        form.notes.data = product.notes
        form.description.data = product.description
        form.brand.data = product.brand
        form.weight.data = product.weight
        form.length.data = product.length
        form.width.data = product.width
        form.height.data = product.height
    
    return render_template('inventory_add.html', form=form, product=product)

@main_bp.route('/inventory/categories')
@login_required
def inventory_categories():
    """Serve the inventory categories page"""
    return render_template('inventory_categories.html')

@main_bp.route('/inventory/stock')
@login_required
def inventory_stock():
    """Serve the inventory stock control page"""
    return render_template('inventory_stock.html')

@main_bp.route('/orders')
@login_required
def orders():
    """Serve the orders page"""
    return render_template('orders.html')

@main_bp.route('/customers')
@login_required
def customers():
    """Serve the customers page"""
    return render_template('customers.html')

@main_bp.route('/suppliers')
@login_required
def suppliers():
    """Serve the suppliers management page"""
    return render_template('suppliers.html')

@main_bp.route('/suppliers/add')
@login_required
def suppliers_add():
    """Serve the add supplier page"""
    return render_template('suppliers.html', mode='add')

@main_bp.route('/suppliers/orders')
@login_required
def suppliers_orders():
    """Serve the purchase orders page"""
    return render_template('suppliers_orders.html')

@main_bp.route('/reports')
@login_required
def reports():
    """Serve the reports page"""
    return render_template('reports.html')

@main_bp.route('/settings')
@login_required
def settings():
    """Serve the settings page"""
    return render_template('settings.html')

@main_bp.route('/profile')
@login_required
def profile():
    """Serve the profile page"""
    return render_template('profile.html')

@main_bp.route('/ai-agent')
@login_required
def ai_agent():
    return render_template('ai_agent.html')

@main_bp.route('/manifest.json')
def manifest():
    """Serve the manifest.json file"""
    return send_from_directory('static', 'manifest.json')

@main_bp.route('/static/<path:path>')
def static_files(path):
    """Serve static files"""
    return send_from_directory('static', path)