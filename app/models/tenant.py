from datetime import datetime
from app.extensions import db

class Tenant(db.Model):
    """Tenant model for multi-tenant support"""
    
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subdomain = db.Column(db.String(50), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True)
    subscription_plan = db.Column(db.String(20), default='starter')  # starter, pro, enterprise
    subscription_status = db.Column(db.String(20), default='active')  # active, trial, expired
    subscription_end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', back_populates='tenant', cascade='all, delete-orphan')
    products = db.relationship('Product', back_populates='tenant', cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', back_populates='tenant', cascade='all, delete-orphan')
    suppliers = db.relationship('Supplier', back_populates='tenant', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert tenant to dictionary for API responses"""
        return {
            'id': self.id,
            'name': self.name,
            'subdomain': self.subdomain,
            'is_active': self.is_active,
            'subscription_plan': self.subscription_plan,
            'subscription_status': self.subscription_status,
            'subscription_end_date': self.subscription_end_date.isoformat() if self.subscription_end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Tenant {self.name}>' 