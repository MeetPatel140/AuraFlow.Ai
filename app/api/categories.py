from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from slugify import slugify

from app.extensions import db
from app.models.category import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all categories for the current tenant"""
    try:
        # Return all categories for now without tenant filtering
        categories = Category.query.all()
        
        return jsonify([category.to_dict() for category in categories])
    except Exception as e:
        current_app.logger.error(f"Error fetching categories: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error fetching categories'
        }), 500

@categories_bp.route('/categories', methods=['POST'])
@login_required
def add_category():
    """Add a new category"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Category name is required'
            }), 400
        
        # Generate slug from name
        slug = slugify(data['name'])
        
        # Check if slug already exists for this tenant
        existing_category = Category.query.filter_by(
            tenant_id=current_user.tenant_id,
            slug=slug
        ).first()
        
        if existing_category:
            return jsonify({
                'success': False,
                'message': 'A category with this name already exists'
            }), 400
        
        # Create new category
        new_category = Category(
            name=data['name'],
            description=data.get('description'),
            slug=slug,
            icon=data.get('icon'),
            parent_id=data.get('parent_id'),
            is_active=data.get('is_active', True),
            tenant_id=current_user.tenant_id
        )
        
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category added successfully',
            'category': new_category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding category: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error adding category: {str(e)}"
        }), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
@login_required
def update_category(category_id):
    """Update an existing category"""
    try:
        category = Category.query.filter_by(
            id=category_id,
            tenant_id=current_user.tenant_id
        ).first()
        
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            # Generate new slug only if name changes
            if data['name'] != category.name:
                new_slug = slugify(data['name'])
                # Check if new slug already exists
                existing_category = Category.query.filter_by(
                    tenant_id=current_user.tenant_id,
                    slug=new_slug
                ).first()
                if existing_category and existing_category.id != category_id:
                    return jsonify({
                        'success': False,
                        'message': 'A category with this name already exists'
                    }), 400
                category.slug = new_slug
            category.name = data['name']
        
        if 'description' in data:
            category.description = data['description']
        
        if 'icon' in data:
            category.icon = data['icon']
        
        if 'parent_id' in data:
            category.parent_id = data['parent_id']
        
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category updated successfully',
            'category': category.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating category: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error updating category: {str(e)}"
        }), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    """Delete a category"""
    try:
        category = Category.query.filter_by(
            id=category_id,
            tenant_id=current_user.tenant_id
        ).first()
        
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404
        
        # Check if category has subcategories
        if category.subcategories:
            return jsonify({
                'success': False,
                'message': 'Cannot delete category with subcategories'
            }), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting category: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error deleting category: {str(e)}"
        }), 500 