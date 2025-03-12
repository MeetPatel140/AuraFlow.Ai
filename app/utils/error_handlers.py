from flask import jsonify, render_template, request

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(400)
    def bad_request_error(error):
        """Handle 400 Bad Request errors"""
        if request.path.startswith('/api'):
            return jsonify({
                'error': 'Bad Request',
                'message': str(error),
                'status_code': 400
            }), 400
        return render_template('errors/400.html'), 400
    
    @app.errorhandler(401)
    def unauthorized_error(error):
        """Handle 401 Unauthorized errors"""
        if request.path.startswith('/api'):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Authentication is required to access this resource',
                'status_code': 401
            }), 401
        return render_template('errors/401.html'), 401
    
    @app.errorhandler(403)
    def forbidden_error(error):
        """Handle 403 Forbidden errors"""
        if request.path.startswith('/api'):
            return jsonify({
                'error': 'Forbidden',
                'message': 'You do not have permission to access this resource',
                'status_code': 403
            }), 403
        return render_template('errors/403.html'), 403
    
    @app.errorhandler(404)
    def not_found_error(error):
        """Handle 404 Not Found errors"""
        if request.path.startswith('/api'):
            return jsonify({
                'error': 'Not Found',
                'message': 'The requested resource was not found',
                'status_code': 404
            }), 404
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server Error"""
        if request.path.startswith('/api'):
            return jsonify({
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred',
                'status_code': 500
            }), 500
        return render_template('errors/500.html'), 500 