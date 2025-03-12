from datetime import datetime
from app.extensions import db

class Supplier(db.Model):
    """Supplier model for supplier management"""
    
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_person = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    country = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    website = db.Column(db.String(255))
    notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = db.relationship('Tenant', back_populates='suppliers')
    products = db.relationship('Product', back_populates='supplier')
    orders = db.relationship('SupplierOrder', back_populates='supplier', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert supplier to dictionary for API responses"""
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'website': self.website,
            'notes': self.notes,
            'is_active': self.is_active,
            'tenant_id': self.tenant_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Supplier {self.name}>'


class SupplierOrder(db.Model):
    """Supplier order model for tracking orders from suppliers"""
    
    __tablename__ = 'supplier_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    expected_delivery_date = db.Column(db.DateTime)
    actual_delivery_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='pending')  # pending, shipped, delivered, cancelled
    total_amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, partial, paid
    notes = db.Column(db.Text)
    is_synced = db.Column(db.Boolean, default=True)
    sync_id = db.Column(db.String(50))  # For offline sync identification
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    supplier = db.relationship('Supplier', back_populates='orders')
    tenant = db.relationship('Tenant')
    items = db.relationship('SupplierOrderItem', back_populates='order', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert supplier order to dictionary for API responses"""
        return {
            'id': self.id,
            'order_number': self.order_number,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'is_synced': self.is_synced,
            'sync_id': self.sync_id,
            'tenant_id': self.tenant_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items]
        }
    
    def __repr__(self):
        return f'<SupplierOrder {self.order_number}>'


class SupplierOrderItem(db.Model):
    """Supplier order item model for tracking items in supplier orders"""
    
    __tablename__ = 'supplier_order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('supplier_orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('SupplierOrder', back_populates='items')
    product = db.relationship('Product')
    
    def to_dict(self):
        """Convert supplier order item to dictionary for API responses"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<SupplierOrderItem {self.id}>' 