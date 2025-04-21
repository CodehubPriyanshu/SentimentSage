from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
import os
import uuid
import re

from models.mongo import User, Analysis, Session

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'profile': User.to_json(user_doc)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error getting profile: {str(e)}")
        return jsonify({'error': 'Failed to get profile'}), 500

@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Only allow updating certain fields
        allowed_fields = ['full_name']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Update user
        success = User.update(current_user_id, update_data)

        if not success:
            return jsonify({'error': 'Failed to update profile'}), 500

        # Get updated user
        updated_user = User.find_by_id(current_user_id)

        return jsonify({
            'message': 'Profile updated successfully',
            'profile': User.to_json(updated_user)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@profile_bp.route('/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload profile photo"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400

        photo = request.files['photo']

        if photo.filename == '':
            return jsonify({'error': 'No photo selected'}), 400

        # Check if the file is an image
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if '.' not in photo.filename or photo.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'File must be an image (PNG, JPG, JPEG, GIF)'}), 400

        if photo:
            # Create a unique filename
            filename = secure_filename(photo.filename)
            ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            unique_filename = f"{uuid.uuid4().hex}.{ext}"

            # Save the file
            photo_path = os.path.join(current_app.config['PROFILE_PHOTOS_FOLDER'], unique_filename)
            photo.save(photo_path)

            # Remove old profile photo if it exists
            old_photo = user_doc.get('profile_photo')
            if old_photo and os.path.exists(os.path.join(current_app.config['PROFILE_PHOTOS_FOLDER'], os.path.basename(old_photo))):
                try:
                    os.remove(os.path.join(current_app.config['PROFILE_PHOTOS_FOLDER'], os.path.basename(old_photo)))
                except Exception as e:
                    current_app.logger.warning(f"Failed to remove old profile photo: {str(e)}")

            # Update user profile with photo path
            relative_path = f"profile_photos/{unique_filename}"
            success = User.update(current_user_id, {'profile_photo': relative_path})

            if not success:
                return jsonify({'error': 'Failed to update profile photo'}), 500

            # Get updated user
            updated_user = User.find_by_id(current_user_id)

            return jsonify({
                'message': 'Profile photo uploaded successfully',
                'profile': User.to_json(updated_user)
            }), 200
    except Exception as e:
        current_app.logger.error(f"Error uploading profile photo: {str(e)}")
        return jsonify({'error': 'Failed to upload profile photo'}), 500

@profile_bp.route('/analyses', methods=['GET'])
@jwt_required()
def get_analyses():
    """Get user analyses"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        # Get analyses
        analyses = Analysis.find_by_user(current_user_id)

        # Log the request
        current_app.logger.info(f"Retrieved {len(analyses)} analyses for user ID {current_user_id}")

        return jsonify({
            'analyses': [Analysis.to_json(analysis) for analysis in analyses]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error getting analyses: {str(e)}")
        return jsonify({'error': 'Failed to get analyses'}), 500

@profile_bp.route('/photo/<path:filename>', methods=['GET'])
def get_profile_photo(filename):
    """Get profile photo"""
    try:
        return send_from_directory(current_app.config['PROFILE_PHOTOS_FOLDER'], filename)
    except Exception as e:
        current_app.logger.error(f"Error getting profile photo: {str(e)}")
        return jsonify({'error': 'Failed to get profile photo'}), 404

@profile_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract password data
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400

        # Verify current password
        if not User.verify_password(user_doc, current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Check if new password is the same as current password
        if current_password == new_password:
            return jsonify({'error': 'New password must be different from current password'}), 400

        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        # Check for at least one number and one special character
        if not re.search(r'\d', new_password):
            return jsonify({'error': 'Password must contain at least one number'}), 400

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
            return jsonify({'error': 'Password must contain at least one special character'}), 400

        # Update password
        success = User.update_password(current_user_id, new_password)

        if not success:
            return jsonify({'error': 'Failed to update password'}), 500

        # Invalidate all user sessions
        token_jti = get_jwt()['jti']
        Session.deactivate_all_for_user(current_user_id, except_token=token_jti)

        return jsonify({
            'message': 'Password changed successfully',
            'logout_required': True
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error changing password: {str(e)}")
        return jsonify({'error': 'Failed to change password'}), 500
