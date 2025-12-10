from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import logging
import sys
import traceback
import time

from config import config
from models import init_db
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.analysis import analysis_bp
from routes.developer import developer_bp
from utils.error_handler import setup_error_handlers
from middleware import setup_middleware

def create_app(config_name='default'):
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config.from_object(config[config_name])

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Configure CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    # Initialize JWT manager
    JWTManager(app)
    init_db(app)

    # Ensure upload directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROFILE_PHOTOS_FOLDER'], exist_ok=True)
    os.makedirs(app.config['FRONTEND_ASSETS_FOLDER'], exist_ok=True)
    
    # Ensure static directory exists for Railway
    os.makedirs('static', exist_ok=True)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(developer_bp)

    # Set up error handlers
    setup_error_handlers(app)

    # Set up middleware
    setup_middleware(app)

    # Add ping endpoint for health checks
    @app.route('/api/ping', methods=['GET', 'HEAD'])
    def ping():  # pylint: disable=unused-variable
        return jsonify({'status': 'ok', 'timestamp': time.time()}), 200

    # Serve React frontend build files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):  # pylint: disable=unused-variable
        if path and os.path.exists(os.path.join("static", path)):
            return send_from_directory("static", path)
        return send_from_directory("static", "index.html")

    return app

# Create the app for Railway deployment
app = create_app(os.getenv('FLASK_CONFIG', 'production'))

if __name__ == '__main__':
    try:
        # Set up logging to console
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logging.getLogger().addHandler(handler)
        logging.getLogger().setLevel(logging.DEBUG)

        # Log startup information
        logging.info("Starting Sage Sentiment Spark backend")

        # Get port from environment variable or default to 8080 for Railway
        port = int(os.environ.get('PORT', 8080))
        
        # Create and run the app for Railway deployment
        app = create_app(os.getenv('FLASK_CONFIG', 'production'))
        logging.info(f"Configuration: {os.getenv('FLASK_CONFIG', 'production')}")
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        # Log any exceptions during startup
        print(f"ERROR: Failed to start application: {str(e)}")
        traceback.print_exc()
        sys.exit(1)