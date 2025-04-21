"""
Error handling utilities for the backend.

This module provides functions for handling errors in a consistent way
across the application.
"""

import traceback
import logging
import json
from functools import wraps
from flask import jsonify, current_app, request
from werkzeug.exceptions import HTTPException

# Configure logger
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base class for API errors."""
    
    def __init__(self, message, status_code=500, error_code=None, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'api_error'
        self.details = details
    
    def to_dict(self):
        """Convert error to dictionary for JSON response."""
        error_dict = {
            'error': self.message,
            'status': self.status_code,
            'code': self.error_code
        }
        
        if self.details:
            error_dict['details'] = self.details
            
        return error_dict

class ValidationError(APIError):
    """Error raised when validation fails."""
    
    def __init__(self, message, details=None):
        super().__init__(
            message=message,
            status_code=400,
            error_code='validation_error',
            details=details
        )

class AuthenticationError(APIError):
    """Error raised when authentication fails."""
    
    def __init__(self, message='Authentication required'):
        super().__init__(
            message=message,
            status_code=401,
            error_code='authentication_error'
        )

class AuthorizationError(APIError):
    """Error raised when authorization fails."""
    
    def __init__(self, message='You do not have permission to perform this action'):
        super().__init__(
            message=message,
            status_code=403,
            error_code='authorization_error'
        )

class NotFoundError(APIError):
    """Error raised when a resource is not found."""
    
    def __init__(self, message='Resource not found'):
        super().__init__(
            message=message,
            status_code=404,
            error_code='not_found'
        )

class ServerError(APIError):
    """Error raised when a server error occurs."""
    
    def __init__(self, message='An unexpected error occurred', details=None):
        super().__init__(
            message=message,
            status_code=500,
            error_code='server_error',
            details=details
        )

def handle_error(error):
    """Handle an error and return an appropriate response."""
    
    # Get request information for logging
    request_info = {
        'url': request.url,
        'method': request.method,
        'headers': dict(request.headers),
        'args': dict(request.args),
        'remote_addr': request.remote_addr
    }
    
    # Handle APIError instances
    if isinstance(error, APIError):
        logger.error(f"API Error: {error.message}", extra={
            'status_code': error.status_code,
            'error_code': error.error_code,
            'request': request_info
        })
        return jsonify(error.to_dict()), error.status_code
    
    # Handle HTTPException instances (e.g., abort(404))
    if isinstance(error, HTTPException):
        logger.error(f"HTTP Exception: {error}", extra={
            'status_code': error.code,
            'request': request_info
        })
        return jsonify({
            'error': error.description,
            'status': error.code,
            'code': f'http_{error.code}'
        }), error.code
    
    # Handle all other exceptions
    logger.error(f"Unhandled Exception: {str(error)}", extra={
        'traceback': traceback.format_exc(),
        'request': request_info
    })
    
    # In production, don't expose the actual error
    if current_app.config.get('ENV') == 'production':
        return jsonify({
            'error': 'An unexpected error occurred',
            'status': 500,
            'code': 'server_error'
        }), 500
    
    # In development, include the error details
    return jsonify({
        'error': str(error),
        'status': 500,
        'code': 'server_error',
        'traceback': traceback.format_exc()
    }), 500

def error_handler(f):
    """Decorator to handle errors in routes."""
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return handle_error(e)
    
    return decorated_function

def setup_error_handlers(app):
    """Set up error handlers for the Flask app."""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return handle_error(error)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return handle_error(error)
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        return handle_error(error)
    
    return app
