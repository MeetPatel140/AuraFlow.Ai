from datetime import datetime
from app.extensions import db

class Product(db.Model):
    """Product model for inventory management"""
    
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    sku = db.Column(db.String(50), nullable=False)
    barcode = db.Column(db.String(50), index=True)
    barcode_type = db.Column(db.String(20), default='CODE128')
    price = db.Column(db.Float, default=0.0)
    cost_price = db.Column(db.Float, default=0.0)
    mrp = db.Column(db.Float, default=0.0)
    selling_price = db.Column(db.Float, default=0.0)
    tax_rate = db.Column(db.Float, default=18.0)
    discount = db.Column(db.Float, default=0.0)
    stock_quantity = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=5)
    reorder_point = db.Column(db.Integer, default=5)
    category = db.Column(db.String(50))
    category_id = db.Column(db.Integer)
    brand = db.Column(db.String(50))
    weight = db.Column(db.Float, default=0.0)
    length = db.Column(db.Float, default=0.0)
    width = db.Column(db.Float, default=0.0)
    height = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    expiry_date = db.Column(db.DateTime)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = db.relationship('Tenant', back_populates='products')
    transaction_items = db.relationship('TransactionItem', back_populates='product')
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    supplier = db.relationship('Supplier', back_populates='products')
    
    def to_dict(self):
        """Convert product to dictionary for API responses"""
        try:
            return {
                'id': self.id,
                'name': self.name,
                'description': self.description or '',
                'sku': self.sku,
                'barcode': self.barcode,
                'barcode_type': self.barcode_type or 'CODE128',
                'price': float(self.price) if self.price else 0.0,
                'cost_price': float(self.cost_price) if self.cost_price else 0.0,
                'mrp': float(self.mrp) if self.mrp else 0.0,
                'selling_price': float(self.selling_price) if self.selling_price else 0.0,
                'stock': self.stock_quantity,
                'stock_quantity': self.stock_quantity,
                'min_stock_level': self.min_stock_level,
                'category': self.category,
                'category_id': self.category_id,  # Fixed from self.category
                'brand': self.brand or '',
                'weight': float(self.weight) if self.weight else 0.0,
                'length': float(self.length) if self.length else 0.0,
                'width': float(self.width) if self.width else 0.0,
                'height': float(self.height) if self.height else 0.0,
                'notes': self.notes or '',
                'image_url': self.image_url or '',
                'is_active': self.is_active,
                'tenant_id': self.tenant_id,
                'supplier_id': self.supplier_id,
                'supplier_name': self.supplier.name if self.supplier else '',
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            # Fallback to minimal product info if there are missing columns
            return {
                'id': self.id,
                'name': self.name,
                'sku': self.sku if hasattr(self, 'sku') else f'SKU-{self.id}',
                'price': float(self.price) if hasattr(self, 'price') and self.price else 0.0,
                'stock_quantity': self.stock_quantity if hasattr(self, 'stock_quantity') else 0,
                'category': self.category if hasattr(self, 'category') else 'Uncategorized',
                'image_url': self.image_url if hasattr(self, 'image_url') else None
            }
    
    def __repr__(self):
        return f'<Product {self.name}>' 