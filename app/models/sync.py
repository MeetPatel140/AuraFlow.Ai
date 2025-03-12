from datetime import datetime
from app.extensions import db

class SyncLog(db.Model):
    """Sync log model for tracking offline data synchronization"""
    
    __tablename__ = 'sync_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    sync_id = db.Column(db.String(50), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=False)  # transaction, product, supplier, etc.
    entity_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(20), nullable=False)  # create, update, delete
    status = db.Column(db.String(20), default='pending')  # pending, success, conflict, error
    conflict_details = db.Column(db.Text)
    error_message = db.Column(db.Text)
    local_timestamp = db.Column(db.DateTime, nullable=False)
    server_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    tenant = db.relationship('Tenant')
    user = db.relationship('User')
    
    def to_dict(self):
        """Convert sync log to dictionary for API responses"""
        return {
            'id': self.id,
            'sync_id': self.sync_id,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'action': self.action,
            'status': self.status,
            'conflict_details': self.conflict_details,
            'error_message': self.error_message,
            'local_timestamp': self.local_timestamp.isoformat() if self.local_timestamp else None,
            'server_timestamp': self.server_timestamp.isoformat() if self.server_timestamp else None,
            'tenant_id': self.tenant_id,
            'user_id': self.user_id
        }
    
    def __repr__(self):
        return f'<SyncLog {self.id}>'


class SyncQueue(db.Model):
    """Sync queue model for tracking pending sync operations"""
    
    __tablename__ = 'sync_queue'
    
    id = db.Column(db.Integer, primary_key=True)
    sync_id = db.Column(db.String(50), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(20), nullable=False)
    data = db.Column(db.Text, nullable=False)  # JSON data of the entity
    priority = db.Column(db.Integer, default=0)
    attempts = db.Column(db.Integer, default=0)
    last_attempt = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    tenant = db.relationship('Tenant')
    user = db.relationship('User')
    
    def to_dict(self):
        """Convert sync queue to dictionary for API responses"""
        return {
            'id': self.id,
            'sync_id': self.sync_id,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'action': self.action,
            'data': self.data,
            'priority': self.priority,
            'attempts': self.attempts,
            'last_attempt': self.last_attempt.isoformat() if self.last_attempt else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tenant_id': self.tenant_id,
            'user_id': self.user_id
        }
    
    def __repr__(self):
        return f'<SyncQueue {self.id}>' 