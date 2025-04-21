from flask import Flask
import os
import logging

def init_db(app: Flask):
    """Initialize database connection"""
    # Load MongoDB configuration from environment variables
    app.config['MONGODB_URI'] = os.getenv('MONGODB_URI')
    app.config['MONGODB_DB_NAME'] = os.getenv('MONGODB_DB_NAME', 'sage_sentiment')

    # Log database connection
    if app.config['MONGODB_URI']:
        app.logger.info(f"MongoDB connection initialized for database: {app.config['MONGODB_DB_NAME']}")
    else:
        app.logger.warning("MongoDB URI not found in environment variables")

    return app
