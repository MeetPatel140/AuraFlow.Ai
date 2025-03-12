from datetime import datetime
from app.extensions import db

class Transaction(db.Model):
    """Transaction model for POS system"""
    
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(100))
    customer_email = db.Column(db.String(120))
    customer_phone = db.Column(db.String(20))
    total_amount = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, default=0)
    tax_amount = db.Column(db.Float, default=0)
    payment_method = db.Column(db.String(20), nullable=False)  # cash, card, mobile
    payment_status = db.Column(db.String(20), default='completed')  # completed, pending, failed
    notes = db.Column(db.Text)
    is_synced = db.Column(db.Boolean, default=True)
    sync_id = db.Column(db.String(50))  # For offline sync identification
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = db.relationship('Tenant', back_populates='transactions')
    user = db.relationship('User')
    items = db.relationship('TransactionItem', back_populates='transaction', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert transaction to dictionary for API responses"""
        return {
            'id': self.id,
            'transaction_number': self.transaction_number,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'total_amount': self.total_amount,
            'discount_amount': self.discount_amount,
            'tax_amount': self.tax_amount,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'is_synced': self.is_synced,
            'sync_id': self.sync_id,
            'tenant_id': self.tenant_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items]
        }
    
    def __repr__(self):
        return f'<Transaction {self.transaction_number}>'


class TransactionItem(db.Model):
    """Transaction item model for POS system"""
    
    __tablename__ = 'transaction_items'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, default=0)
    total_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transaction = db.relationship('Transaction', back_populates='items')
    product = db.relationship('Product', back_populates='transaction_items')
    
    def to_dict(self):
        """Convert transaction item to dictionary for API responses"""
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'discount_amount': self.discount_amount,
            'total_price': self.total_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<TransactionItem {self.id}>' 