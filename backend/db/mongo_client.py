import os
import threading
import time
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

    def _build_uri(self):
        mongo_uri = os.getenv('MONGODB_URI')
        if not mongo_uri:
            return None
        if 'retryWrites' not in mongo_uri and '?' in mongo_uri:
            mongo_uri += '&retryWrites=true&w=majority'
        elif 'retryWrites' not in mongo_uri:
            mongo_uri += '?retryWrites=true&w=majority'
        return mongo_uri

    def _try_connect(self, mongo_uri):
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
        db = client[os.getenv('MONGODB_DB_NAME', 'sage_sentiment')]
        client.admin.command('ping')
        return client, db

    def initialize_connection(self):
        """Initialize MongoDB connection. Non-blocking: tries once quickly,
        then retries in a background thread so startup never stalls."""
        try:
            mongo_uri = self._build_uri()
            if not mongo_uri:
                raise ValueError("MongoDB URI not found in environment variables")

            self.client, self.db = self._try_connect(mongo_uri)
            self.mock_mode = False
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.warning(f"Initial MongoDB connection failed: {str(e)}. Retrying in background.")
            self.client = None
            self.db = MockDB()
            self.mock_mode = True
            threading.Thread(target=self._retry_loop, args=(mongo_uri,), daemon=True).start()

    def _retry_loop(self, mongo_uri):
        """Background retry until MongoDB becomes reachable."""
        attempt = 0
        while True:
            attempt += 1
            time.sleep(10)
            try:
                client, db = self._try_connect(mongo_uri)
                self.client = client
                self.db = db
                self.mock_mode = False
                logger.info(f"Connected to MongoDB on background retry (attempt {attempt})")
                return
            except Exception as e:
                logger.warning(f"Background MongoDB retry {attempt} failed: {str(e)}")
                if attempt >= 50:
                    logger.warning("Giving up background MongoDB retries after 50 attempts.")
                    return

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