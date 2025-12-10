import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False') == 'True'

    # MongoDB configuration
    MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/sage_sentiment')
    MONGODB_DB_NAME = os.environ.get('MONGODB_DB_NAME', 'sage_sentiment')

    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # File upload configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
    PROFILE_PHOTOS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/profile_photos')
    FRONTEND_ASSETS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/public/assets')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size

    # API Keys (should be set in environment variables in production)
    YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
    TWITTER_API_KEY = os.environ.get('TWITTER_API_KEY', '')
    TWITTER_API_SECRET = os.environ.get('TWITTER_API_SECRET', '')
    TWITTER_ACCESS_TOKEN = os.environ.get('TWITTER_ACCESS_TOKEN', '')
    TWITTER_ACCESS_SECRET = os.environ.get('TWITTER_ACCESS_SECRET', '')

    # AI Configuration
    AI_ENABLED = os.environ.get('AI_ENABLED', 'True') == 'True'
    AI_PROVIDER = os.environ.get('AI_PROVIDER', 'openai')  # 'openai' or 'huggingface'

    # Email configuration
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    EMAIL_FROM = os.environ.get('EMAIL_FROM', 'sentimentsagemails@gmail.com')
    USE_MOCK_EMAIL = os.environ.get('USE_MOCK_EMAIL', 'True').lower() in ('true', '1', 't')

    # CORS configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    MONGODB_URI = 'mongodb://localhost:27017/sage_sentiment_test'
    MONGODB_DB_NAME = 'sage_sentiment_test'
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # In production, ensure all secret keys are set via environment variables

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}