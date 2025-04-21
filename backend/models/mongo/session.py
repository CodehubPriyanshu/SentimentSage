from datetime import datetime
from bson import ObjectId
from db.mongo_client import get_db

class Session:
    """Session model for MongoDB"""

    collection_name = 'sessions'

    @classmethod
    def get_collection(cls):
        """Get the MongoDB collection for sessions"""
        return get_db()[cls.collection_name]

    @classmethod
    def create(cls, user_id, token, refresh_token, expires_at):
        """Create a new session"""
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except:
                raise ValueError("Invalid user ID")

        # Create session document
        session_doc = {
            'user_id': user_id,
            'token': token,
            'refresh_token': refresh_token,
            'expires_at': expires_at,
            'created_at': datetime.utcnow(),
            'is_active': True
        }

        # Insert session document
        result = cls.get_collection().insert_one(session_doc)
        session_doc['_id'] = result.inserted_id

        return session_doc

    @classmethod
    def find_by_token(cls, token):
        """Find session by token"""
        return cls.get_collection().find_one({'token': token, 'is_active': True})

    @classmethod
    def find_by_refresh_token(cls, refresh_token):
        """Find session by refresh token"""
        return cls.get_collection().find_one({'refresh_token': refresh_token, 'is_active': True})

    @classmethod
    def deactivate(cls, token):
        """Deactivate session"""
        result = cls.get_collection().update_one(
            {'token': token},
            {'$set': {'is_active': False}}
        )

        return result.modified_count > 0

    @classmethod
    def deactivate_all_for_user(cls, user_id, except_token=None):
        """Deactivate all sessions for a user

        Args:
            user_id: The user ID
            except_token: Optional token to exclude from deactivation

        Returns:
            Number of sessions deactivated
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        query = {'user_id': user_id, 'is_active': True}

        # If except_token is provided, exclude it from deactivation
        if except_token:
            query['token'] = {'$ne': except_token}

        result = cls.get_collection().update_many(
            query,
            {'$set': {'is_active': False}}
        )

        return result.modified_count

    @classmethod
    def update_token(cls, refresh_token, new_token, new_expires_at):
        """Update session token"""
        result = cls.get_collection().update_one(
            {'refresh_token': refresh_token, 'is_active': True},
            {
                '$set': {
                    'token': new_token,
                    'expires_at': new_expires_at
                }
            }
        )

        return result.modified_count > 0

    @classmethod
    def clean_expired(cls):
        """Clean expired sessions"""
        now = datetime.utcnow()

        result = cls.get_collection().update_many(
            {'expires_at': {'$lt': now}, 'is_active': True},
            {'$set': {'is_active': False}}
        )

        return result.modified_count
