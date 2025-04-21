import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class MongoConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoConnection, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
            cls._instance.initialize_connection()
        return cls._instance

    def initialize_connection(self):
        """Initialize MongoDB connection"""
        try:
            mongo_uri = os.getenv('MONGODB_URI')
            if not mongo_uri:
                raise ValueError("MongoDB URI not found in environment variables")

            self.client = MongoClient(mongo_uri)
            self.db = self.client[os.getenv('MONGODB_DB_NAME', 'sage_sentiment')]

            # Test connection
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def get_db(self):
        """Get database instance"""
        if self.db is None:
            self.initialize_connection()
        return self.db

    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed")

# Create a singleton instance
mongo_connection = MongoConnection()

def get_db():
    """Get database instance"""
    db = mongo_connection.get_db()
    if db is None:
        raise ValueError("MongoDB connection failed")
    return db

def close_db_connection():
    """Close database connection"""
    mongo_connection.close_connection()
