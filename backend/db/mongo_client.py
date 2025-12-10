import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class MockDB:
    """Mock database for when MongoDB is not available"""
    def __init__(self):
        self.collections = {}
    
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

class MockCollection:
    """Mock collection for when MongoDB is not available"""
    def __init__(self, name):
        self.name = name
        self.documents = []
    
    def find_one(self, query=None):
        return None
    
    def find(self, query=None):
        return []
    
    def insert_one(self, document):
        # Assign a mock ID if not present
        if '_id' not in document:
            import uuid
            document['_id'] = str(uuid.uuid4())
        self.documents.append(document)
        return MockInsertResult(document['_id'])
    
    def update_one(self, filter, update, upsert=False):
        return MockUpdateResult()
    
    def delete_one(self, filter):
        return MockDeleteResult()

class MockInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class MockUpdateResult:
    def __init__(self):
        self.modified_count = 0

class MockDeleteResult:
    def __init__(self):
        self.deleted_count = 0

class MongoConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoConnection, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
            cls._instance.mock_mode = False
            cls._instance.initialize_connection()
        return cls._instance

    def initialize_connection(self):
        """Initialize MongoDB connection"""
        try:
            mongo_uri = os.getenv('MONGODB_URI')
            if not mongo_uri:
                raise ValueError("MongoDB URI not found in environment variables")

            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[os.getenv('MONGODB_DB_NAME', 'sage_sentiment')]

            # Test connection
            self.client.admin.command('ping')
            self.mock_mode = False
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.warning(f"Failed to connect to MongoDB: {str(e)}. Running in mock mode.")
            self.client = None
            self.db = MockDB()
            self.mock_mode = True

    def get_db(self):
        """Get database instance"""
        return self.db

    def close_connection(self):
        """Close MongoDB connection"""
        if self.client and not self.mock_mode:
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed")

# Create a singleton instance
mongo_connection = MongoConnection()

def get_db():
    """Get database instance"""
    return mongo_connection.get_db()

def close_db_connection():
    """Close database connection"""
    mongo_connection.close_connection()