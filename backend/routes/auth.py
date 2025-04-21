from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import datetime, timezone

from models.mongo import User, Session
from utils.email_service import send_password_reset_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Missing required fields'}), 400

    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    try:
        # Create new user
        user_doc = User.create(email, password, full_name)

        # Generate tokens
        access_token = create_access_token(identity=str(user_doc['_id']))
        refresh_token = create_refresh_token(identity=str(user_doc['_id']))

        # Calculate token expiry time
        expires_at = datetime.now(timezone.utc) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']

        # Save session to database
        Session.create(
            user_id=user_doc['_id'],
            token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at
        )

        # Log the successful registration
        current_app.logger.info(f"User registered successfully: {email}")

        return jsonify({
            'message': 'User registered successfully',
            'user': User.to_json(user_doc),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except ValueError as e:
        current_app.logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': str(e)}), 409
    except Exception as e:
        current_app.logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user. Please try again.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    email = data.get('email')
    password = data.get('password')

    try:
        # Find user by email
        user_doc = User.find_by_email(email)
        if not user_doc:
            return jsonify({'error': 'Invalid email or password'}), 401

        # Verify password
        if not User.verify_password(user_doc, password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Generate tokens
        access_token = create_access_token(identity=str(user_doc['_id']))
        refresh_token = create_refresh_token(identity=str(user_doc['_id']))

        # Calculate token expiry time
        expires_at = datetime.now(timezone.utc) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']

        # Save session to database
        Session.create(
            user_id=user_doc['_id'],
            token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at
        )

        # Log the successful login
        current_app.logger.info(f"User logged in successfully: {email}")

        return jsonify({
            'message': 'Login successful',
            'user': User.to_json(user_doc),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error logging in: {str(e)}")
        return jsonify({'error': 'Failed to log in. Please try again.'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)

    return jsonify({
        'access_token': access_token
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400

    email = data.get('email')

    try:
        # Check if user exists
        user_doc = User.find_by_email(email)
        if not user_doc:
            # Don't reveal that the user doesn't exist for security reasons
            return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200

        # Create password reset token and OTP
        result = User.create_password_reset_token(email)
        if not result:
            return jsonify({'error': 'Failed to create password reset token'}), 500

        reset_token, otp = result

        # Send password reset email
        email_sent = send_password_reset_email(email, otp, reset_token)

        if not email_sent:
            return jsonify({'error': 'Failed to send password reset email'}), 500

        # Log the password reset request
        current_app.logger.info(f"Password reset requested for: {email}")

        return jsonify({
            'message': 'Password reset email sent',
            'reset_token': reset_token  # This will be used in the verification step
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in forgot password: {str(e)}")
        return jsonify({'error': 'Failed to process password reset request'}), 500

@auth_bp.route('/verify-reset', methods=['POST'])
def verify_reset():
    """Verify password reset OTP"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('reset_token') or not data.get('otp'):
        return jsonify({'error': 'Reset token and OTP are required'}), 400

    reset_token = data.get('reset_token')
    otp = data.get('otp')

    try:
        # Verify reset token and OTP
        user_doc = User.verify_reset_token_and_otp(reset_token, otp)

        if not user_doc:
            return jsonify({'error': 'Invalid or expired reset token or OTP'}), 400

        return jsonify({
            'message': 'OTP verified successfully',
            'reset_token': reset_token,
            'email': user_doc['email']
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in verify reset: {str(e)}")
        return jsonify({'error': 'Failed to verify reset token'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token and OTP"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('reset_token') or not data.get('otp') or not data.get('new_password'):
        return jsonify({'error': 'Reset token, OTP, and new password are required'}), 400

    reset_token = data.get('reset_token')
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Validate password strength
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    try:
        # Reset password
        success = User.reset_password_with_token(reset_token, otp, new_password)

        if not success:
            return jsonify({'error': 'Failed to reset password'}), 400

        # Log the successful password reset
        current_app.logger.info(f"Password reset successful for token: {reset_token[:10]}...")

        return jsonify({
            'message': 'Password reset successful'
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in reset password: {str(e)}")
        return jsonify({'error': 'Failed to reset password'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout a user"""
    try:
        # Get JWT token
        token = get_jwt()['jti']

        # Deactivate session
        Session.deactivate(token)

        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        current_app.logger.error(f"Error logging out: {str(e)}")
        return jsonify({'error': 'Failed to log out. Please try again.'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': User.to_json(user_doc)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error getting current user: {str(e)}")
        return jsonify({'error': 'Authentication failed. Please log in again.'}), 401
