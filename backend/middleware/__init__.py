"""
Middleware package for the backend.

This package contains middleware for the Flask application.
"""

from .error_middleware import setup_middleware, request_logger

__all__ = ['setup_middleware', 'request_logger']
