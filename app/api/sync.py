from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime
from app.extensions import db, cache
from app.models.user import User
from app.models.sync import SyncLog, SyncQueue
from app.models.transaction import Transaction, TransactionItem
from app.models.product import Product
from app.models.supplier import Supplier, SupplierOrder, SupplierOrderItem

sync_bp = Blueprint('sync', __name__, url_prefix='/sync')

# Map entity types to their model classes
ENTITY_MODELS = {
    'transaction': Transaction,
    'transaction_item': TransactionItem,
    'product': Product,
    'supplier': Supplier,
    'supplier_order': SupplierOrder,
    'supplier_order_item': SupplierOrderItem
}

@sync_bp.route('/status', methods=['GET'])
@jwt_required()
def sync_status():
    """Get sync status for the current user's tenant"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get pending sync items
    pending_items = SyncQueue.query.filter_by(tenant_id=user.tenant_id).count()
    
    # Get last successful sync
    last_sync = SyncLog.query.filter_by(
        tenant_id=user.tenant_id,
        status='success'
    ).order_by(SyncLog.server_timestamp.desc()).first()
    
    # Get sync conflicts
    conflicts = SyncLog.query.filter_by(
        tenant_id=user.tenant_id,
        status='conflict'
    ).count()
    
    return jsonify({
        'pending_items': pending_items,
        'last_sync': last_sync.server_timestamp.isoformat() if last_sync else None,
        'conflicts': conflicts
    }), 200


@sync_bp.route('/push', methods=['POST'])
@jwt_required()
def push_changes():
    """Push local changes to the server"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data or not isinstance(data, list):
        return jsonify({'error': 'Invalid data format. Expected a list of changes'}), 400
    
    results = []
    
    for item in data:
        # Validate required fields
        required_fields = ['sync_id', 'entity_type', 'entity_id', 'action', 'data', 'timestamp']
        missing_fields = [field for field in required_fields if field not in item]
        
        if missing_fields:
            results.append({
                'sync_id': item.get('sync_id', 'unknown'),
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            })
            continue
        
        # Check if entity type is valid
        if item['entity_type'] not in ENTITY_MODELS:
            results.append({
                'sync_id': item['sync_id'],
                'status': 'error',
                'message': f'Invalid entity type: {item["entity_type"]}'
            })
            continue
        
        try:
            # Parse timestamp
            local_timestamp = datetime.fromisoformat(item['timestamp'])
            
            # Process the change based on action
            if item['action'] == 'create':
                result = _process_create(item, user, local_timestamp)
            elif item['action'] == 'update':
                result = _process_update(item, user, local_timestamp)
            elif item['action'] == 'delete':
                result = _process_delete(item, user, local_timestamp)
            else:
                result = {
                    'sync_id': item['sync_id'],
                    'status': 'error',
                    'message': f'Invalid action: {item["action"]}'
                }
            
            results.append(result)
            
        except Exception as e:
            # Log the error and continue with the next item
            current_app.logger.error(f"Sync error: {str(e)}")
            results.append({
                'sync_id': item['sync_id'],
                'status': 'error',
                'message': str(e)
            })
    
    return jsonify(results), 200


@sync_bp.route('/pull', methods=['GET'])
@jwt_required()
def pull_changes():
    """Pull server changes to the client"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get the last sync timestamp from the client
    last_sync = request.args.get('last_sync')
    
    if last_sync:
        try:
            last_sync_timestamp = datetime.fromisoformat(last_sync)
        except ValueError:
            return jsonify({'error': 'Invalid timestamp format'}), 400
    else:
        # If no timestamp provided, use a very old date
        last_sync_timestamp = datetime(1970, 1, 1)
    
    # Get changes for each entity type
    changes = []
    
    for entity_type, model in ENTITY_MODELS.items():
        # Get updated records
        updated_records = model.query.filter(
            model.tenant_id == user.tenant_id,
            model.updated_at > last_sync_timestamp
        ).all()
        
        for record in updated_records:
            changes.append({
                'entity_type': entity_type,
                'entity_id': record.id,
                'action': 'update',
                'data': record.to_dict(),
                'timestamp': record.updated_at.isoformat()
            })
    
    # Get deleted records from sync logs
    deleted_logs = SyncLog.query.filter(
        SyncLog.tenant_id == user.tenant_id,
        SyncLog.action == 'delete',
        SyncLog.status == 'success',
        SyncLog.server_timestamp > last_sync_timestamp
    ).all()
    
    for log in deleted_logs:
        changes.append({
            'entity_type': log.entity_type,
            'entity_id': log.entity_id,
            'action': 'delete',
            'data': None,
            'timestamp': log.server_timestamp.isoformat()
        })
    
    # Sort changes by timestamp
    changes.sort(key=lambda x: x['timestamp'])
    
    return jsonify({
        'changes': changes,
        'server_timestamp': datetime.utcnow().isoformat()
    }), 200


@sync_bp.route('/conflicts', methods=['GET'])
@jwt_required()
def get_conflicts():
    """Get sync conflicts for the current user's tenant"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get conflicts
    conflicts = SyncLog.query.filter_by(
        tenant_id=user.tenant_id,
        status='conflict'
    ).order_by(SyncLog.server_timestamp.desc()).all()
    
    return jsonify({
        'conflicts': [conflict.to_dict() for conflict in conflicts]
    }), 200


@sync_bp.route('/resolve-conflict/<int:conflict_id>', methods=['POST'])
@jwt_required()
def resolve_conflict(conflict_id):
    """Resolve a sync conflict"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get the conflict
    conflict = SyncLog.query.filter_by(
        id=conflict_id,
        tenant_id=user.tenant_id,
        status='conflict'
    ).first()
    
    if not conflict:
        return jsonify({'error': 'Conflict not found'}), 404
    
    data = request.get_json()
    
    if not data or 'resolution' not in data:
        return jsonify({'error': 'Resolution is required'}), 400
    
    resolution = data['resolution']
    
    if resolution not in ['client', 'server', 'manual']:
        return jsonify({'error': 'Invalid resolution. Must be client, server, or manual'}), 400
    
    try:
        if resolution == 'client':
            # Apply client changes
            if conflict.action == 'create' or conflict.action == 'update':
                entity_data = json.loads(data.get('entity_data', '{}'))
                _apply_entity_data(conflict.entity_type, conflict.entity_id, entity_data, user)
            elif conflict.action == 'delete':
                _delete_entity(conflict.entity_type, conflict.entity_id, user)
        
        elif resolution == 'manual':
            # Apply manual changes
            if 'entity_data' not in data:
                return jsonify({'error': 'Entity data is required for manual resolution'}), 400
            
            entity_data = json.loads(data['entity_data'])
            _apply_entity_data(conflict.entity_type, conflict.entity_id, entity_data, user)
        
        # Mark conflict as resolved
        conflict.status = 'resolved'
        db.session.commit()
        
        return jsonify({'message': 'Conflict resolved successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Helper functions for sync operations

def _process_create(item, user, local_timestamp):
    """Process a create action"""
    entity_type = item['entity_type']
    entity_data = json.loads(item['data'])
    
    # Check if entity already exists
    model = ENTITY_MODELS[entity_type]
    existing = model.query.filter_by(id=item['entity_id']).first()
    
    if existing:
        # Entity already exists, log conflict
        return _log_conflict(item, user, local_timestamp, 'Entity already exists')
    
    try:
        # Create new entity
        entity = model()
        
        # Set tenant ID
        entity.tenant_id = user.tenant_id
        
        # Set attributes from data
        for key, value in entity_data.items():
            if hasattr(entity, key) and key not in ['id', 'tenant_id', 'created_at', 'updated_at']:
                setattr(entity, key, value)
        
        # Set ID to match client
        entity.id = item['entity_id']
        
        db.session.add(entity)
        db.session.flush()
        
        # Log successful sync
        _log_sync(item, user, local_timestamp, 'success')
        
        db.session.commit()
        
        return {
            'sync_id': item['sync_id'],
            'status': 'success',
            'entity_id': entity.id
        }
    
    except Exception as e:
        db.session.rollback()
        return _log_conflict(item, user, local_timestamp, str(e))


def _process_update(item, user, local_timestamp):
    """Process an update action"""
    entity_type = item['entity_type']
    entity_id = item['entity_id']
    entity_data = json.loads(item['data'])
    
    # Get the entity
    model = ENTITY_MODELS[entity_type]
    entity = model.query.filter_by(id=entity_id, tenant_id=user.tenant_id).first()
    
    if not entity:
        # Entity doesn't exist, log conflict
        return _log_conflict(item, user, local_timestamp, 'Entity not found')
    
    # Check for conflicts (server version is newer)
    if entity.updated_at > local_timestamp:
        return _log_conflict(item, user, local_timestamp, 'Server version is newer')
    
    try:
        # Update entity attributes
        for key, value in entity_data.items():
            if hasattr(entity, key) and key not in ['id', 'tenant_id', 'created_at', 'updated_at']:
                setattr(entity, key, value)
        
        # Log successful sync
        _log_sync(item, user, local_timestamp, 'success')
        
        db.session.commit()
        
        return {
            'sync_id': item['sync_id'],
            'status': 'success',
            'entity_id': entity.id
        }
    
    except Exception as e:
        db.session.rollback()
        return _log_conflict(item, user, local_timestamp, str(e))


def _process_delete(item, user, local_timestamp):
    """Process a delete action"""
    entity_type = item['entity_type']
    entity_id = item['entity_id']
    
    # Get the entity
    model = ENTITY_MODELS[entity_type]
    entity = model.query.filter_by(id=entity_id, tenant_id=user.tenant_id).first()
    
    if not entity:
        # Entity doesn't exist, might have been deleted already
        _log_sync(item, user, local_timestamp, 'success', 'Entity already deleted')
        return {
            'sync_id': item['sync_id'],
            'status': 'success',
            'message': 'Entity already deleted'
        }
    
    # Check for conflicts (server version is newer)
    if entity.updated_at > local_timestamp:
        return _log_conflict(item, user, local_timestamp, 'Server version is newer')
    
    try:
        # Delete the entity
        db.session.delete(entity)
        
        # Log successful sync
        _log_sync(item, user, local_timestamp, 'success')
        
        db.session.commit()
        
        return {
            'sync_id': item['sync_id'],
            'status': 'success',
            'entity_id': entity_id
        }
    
    except Exception as e:
        db.session.rollback()
        return _log_conflict(item, user, local_timestamp, str(e))


def _log_sync(item, user, local_timestamp, status, message=None):
    """Log a sync operation"""
    sync_log = SyncLog(
        sync_id=item['sync_id'],
        entity_type=item['entity_type'],
        entity_id=item['entity_id'],
        action=item['action'],
        status=status,
        error_message=message,
        local_timestamp=local_timestamp,
        tenant_id=user.tenant_id,
        user_id=user.id
    )
    db.session.add(sync_log)
    return sync_log


def _log_conflict(item, user, local_timestamp, reason):
    """Log a sync conflict"""
    sync_log = _log_sync(item, user, local_timestamp, 'conflict', reason)
    db.session.commit()
    
    return {
        'sync_id': item['sync_id'],
        'status': 'conflict',
        'message': reason,
        'conflict_id': sync_log.id
    }


def _apply_entity_data(entity_type, entity_id, entity_data, user):
    """Apply entity data to an entity"""
    model = ENTITY_MODELS[entity_type]
    entity = model.query.filter_by(id=entity_id, tenant_id=user.tenant_id).first()
    
    if not entity and entity_data:
        # Create new entity
        entity = model()
        entity.id = entity_id
        entity.tenant_id = user.tenant_id
        db.session.add(entity)
    
    if entity and entity_data:
        # Update entity attributes
        for key, value in entity_data.items():
            if hasattr(entity, key) and key not in ['id', 'tenant_id', 'created_at', 'updated_at']:
                setattr(entity, key, value)
    
    db.session.commit()


def _delete_entity(entity_type, entity_id, user):
    """Delete an entity"""
    model = ENTITY_MODELS[entity_type]
    entity = model.query.filter_by(id=entity_id, tenant_id=user.tenant_id).first()
    
    if entity:
        db.session.delete(entity)
        db.session.commit() 