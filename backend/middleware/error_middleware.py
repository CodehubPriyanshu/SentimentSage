"""
Error handling middleware for the backend.

This module provides middleware for handling errors in a consistent way
across the application.
"""

import time
import logging
import traceback
import json
from flask import request, g, current_app
from functools import wraps

# Configure logger
logger = logging.getLogger(__name__)

class RequestLogMiddleware:
    """Middleware to log requests and responses."""
    
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        # Store the start time
        request_start_time = time.time()
        
        # Define a wrapper for start_response to capture the status
        def _start_response(status, headers, exc_info=None):
            # Log the request and response
            self._log_request(environ, status, request_start_time)
            return start_response(status, headers, exc_info)
        
        # Process the request
        return self.app(environ, _start_response)
    
    def _log_request(self, environ, status, start_time):
        """Log the request and response."""
        # Calculate request duration
        duration = time.time() - start_time
        
        # Extract request information
        method = environ.get('REQUEST_METHOD', 'UNKNOWN')
        path = environ.get('PATH_INFO', 'UNKNOWN')
        query = environ.get('QUERY_STRING', '')
        remote_addr = environ.get('REMOTE_ADDR', 'UNKNOWN')
        user_agent = environ.get('HTTP_USER_AGENT', 'UNKNOWN')
        
        # Extract status code
        status_code = int(status.split(' ')[0])
        
        # Determine log level based on status code
        if status_code >= 500:
            log_level = logging.ERROR
        elif status_code >= 400:
            log_level = logging.WARNING
        else:
            log_level = logging.INFO
        
        # Log the request
        logger.log(
            log_level,
            f"{method} {path}{f'?{query}' if query else ''} {status} {duration:.3f}s",
            extra={
                'method': method,
                'path': path,
                'query': query,
                'status': status_code,
                'duration': duration,
                'remote_addr': remote_addr,
                'user_agent': user_agent
            }
        )

def request_logger():
    """Decorator to log request details."""
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Store the start time
            g.request_start_time = time.time()
            
            # Log the request
            logger.info(f"Request: {request.method} {request.path}", extra={
                'method': request.method,
                'path': request.path,
                'query': request.query_string.decode('utf-8'),
                'remote_addr': request.remote_addr,
                'user_agent': request.user_agent.string
            })
            
            # Process the request
            response = f(*args, **kwargs)
            
            # Calculate request duration
            duration = time.time() - g.request_start_time
            
            # Log the response
            logger.info(f"Response: {request.method} {request.path} {response.status_code} {duration:.3f}s", extra={
                'method': request.method,
                'path': request.path,
                'status': response.status_code,
                'duration': duration
            })
            
            return response
        
        return decorated_function
    
    return decorator

def setup_middleware(app):
    """Set up middleware for the Flask app."""
    
    # Register the request logger middleware
    app.wsgi_app = RequestLogMiddleware(app.wsgi_app)
    
    # Register before_request handler to log requests
    @app.before_request
    def before_request():
        g.request_start_time = time.time()
    
    # Register after_request handler to log responses
    @app.after_request
    def after_request(response):
        # Calculate request duration
        duration = time.time() - g.request_start_time
        
        # Determine log level based on status code
        if response.status_code >= 500:
            log_level = logging.ERROR
        elif response.status_code >= 400:
            log_level = logging.WARNING
        else:
            log_level = logging.INFO
        
        # Log the response
        logger.log(
            log_level,
            f"Response: {request.method} {request.path} {response.status_code} {duration:.3f}s",
            extra={
                'method': request.method,
                'path': request.path,
                'status': response.status_code,
                'duration': duration
            }
        )
        
        return response
    
    return app
