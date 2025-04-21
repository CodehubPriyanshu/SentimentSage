from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import secrets
from db.mongo_client import get_db

class User:
    """User model for MongoDB"""

    collection_name = 'users'

    @classmethod
    def get_collection(cls):
        """Get the MongoDB collection for users"""
        return get_db()[cls.collection_name]

    @classmethod
    def create(cls, email, password, full_name):
        """Create a new user"""
        # Check if user already exists
        if cls.find_by_email(email):
            raise ValueError("Email already registered")

        # Create user document
        user_doc = {
            'email': email.lower(),
            'password_hash': generate_password_hash(password),
            'full_name': full_name,
            'profile_photo': None,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        # Insert user document
        result = cls.get_collection().insert_one(user_doc)
        user_doc['_id'] = result.inserted_id

        return user_doc

    @classmethod
    def find_by_id(cls, user_id):
        """Find user by ID"""
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except:
                return None

        return cls.get_collection().find_one({'_id': user_id})

    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        if not email:
            return None
        return cls.get_collection().find_one({'email': email.lower()})

    @classmethod
    def update(cls, user_id, update_data):
        """Update user data"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # Don't allow updating email or password through this method
        if 'email' in update_data:
            del update_data['email']
        if 'password_hash' in update_data:
            del update_data['password_hash']

        update_data['updated_at'] = datetime.now()

        result = cls.get_collection().update_one(
            {'_id': user_id},
            {'$set': update_data}
        )

        return result.modified_count > 0

    @classmethod
    def update_password(cls, user_id, new_password):
        """Update user password"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        result = cls.get_collection().update_one(
            {'_id': user_id},
            {
                '$set': {
                    'password_hash': generate_password_hash(new_password),
                    'updated_at': datetime.now()
                }
            }
        )

        return result.modified_count > 0

    @classmethod
    def verify_password(cls, user_doc, password):
        """Verify user password"""
        if not user_doc or 'password_hash' not in user_doc:
            return False

        return check_password_hash(user_doc['password_hash'], password)

    @classmethod
    def create_password_reset_token(cls, email):
        """Create a password reset token for a user

        Args:
            email: User's email address

        Returns:
            A tuple of (reset_token, otp) if successful, None otherwise
        """
        user_doc = cls.find_by_email(email)
        if not user_doc:
            return None

        # Generate a secure token and OTP
        reset_token = secrets.token_urlsafe(32)
        otp = ''.join(secrets.choice('0123456789') for _ in range(6))

        # Set expiration time (15 minutes from now)
        expires_at = datetime.now() + timedelta(minutes=15)

        # Update user document with reset token info
        result = cls.get_collection().update_one(
            {'_id': user_doc['_id']},
            {
                '$set': {
                    'password_reset': {
                        'token': reset_token,
                        'otp': otp,
                        'expires_at': expires_at
                    },
                    'updated_at': datetime.now()
                }
            }
        )

        if result.modified_count > 0:
            return (reset_token, otp)
        return None

    @classmethod
    def verify_reset_token_and_otp(cls, reset_token, otp):
        """Verify a password reset token and OTP

        Args:
            reset_token: The reset token
            otp: The one-time password

        Returns:
            The user document if verification is successful, None otherwise
        """
        # Find user with the given reset token
        user_doc = cls.get_collection().find_one({
            'password_reset.token': reset_token
        })

        if not user_doc:
            return None

        # Check if reset token is expired
        reset_info = user_doc.get('password_reset', {})
        expires_at = reset_info.get('expires_at')
        stored_otp = reset_info.get('otp')

        if not expires_at or not stored_otp:
            return None

        # Check if token is expired
        if expires_at < datetime.now():
            return None

        # Verify OTP
        if stored_otp != otp:
            return None

        return user_doc

    @classmethod
    def reset_password_with_token(cls, reset_token, otp, new_password):
        """Reset a user's password using a reset token and OTP

        Args:
            reset_token: The reset token
            otp: The one-time password
            new_password: The new password

        Returns:
            True if password was reset successfully, False otherwise
        """
        # Verify reset token and OTP
        user_doc = cls.verify_reset_token_and_otp(reset_token, otp)
        if not user_doc:
            return False

        # Update password and clear reset token
        result = cls.get_collection().update_one(
            {'_id': user_doc['_id']},
            {
                '$set': {
                    'password_hash': generate_password_hash(new_password),
                    'updated_at': datetime.now(datetime.timezone.utc)
                },
                '$unset': {
                    'password_reset': ''
                }
            }
        )

        return result.modified_count > 0

    @classmethod
    def to_json(cls, user_doc):
        """Convert user document to JSON"""
        if not user_doc:
            return None

        # Create a copy to avoid modifying the original
        user_json = dict(user_doc)

        # Convert ObjectId to string
        if '_id' in user_json:
            user_json['id'] = str(user_json['_id'])
            del user_json['_id']

        # Remove sensitive data
        if 'password_hash' in user_json:
            del user_json['password_hash']

        # Remove password reset info
        if 'password_reset' in user_json:
            del user_json['password_reset']

        # Convert datetime objects to ISO format strings
        for key in ['created_at', 'updated_at']:
            if key in user_json and user_json[key]:
                user_json[key] = user_json[key].isoformat()

        return user_json
