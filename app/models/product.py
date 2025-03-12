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
    barcode_type = db.Column(db.String(20), default='EAN-13')
    price = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float)
    mrp = db.Column(db.Float)
    tax_rate = db.Column(db.Float, default=18.0)
    discount = db.Column(db.Float, default=0.0)
    stock_quantity = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=5)
    category = db.Column(db.String(50))
    brand = db.Column(db.String(50))
    weight = db.Column(db.Float)
    length = db.Column(db.Float)
    width = db.Column(db.Float)
    height = db.Column(db.Float)
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
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'sku': self.sku,
            'barcode': self.barcode,
            'barcode_type': self.barcode_type,
            'price': self.price,
            'cost_price': self.cost_price,
            'mrp': self.mrp,
            'tax_rate': self.tax_rate,
            'discount': self.discount,
            'stock_quantity': self.stock_quantity,
            'min_stock_level': self.min_stock_level,
            'category': self.category,
            'brand': self.brand,
            'weight': self.weight,
            'length': self.length, 
            'width': self.width,
            'height': self.height,
            'notes': self.notes,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'tenant_id': self.tenant_id,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Product {self.name}>' 