from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import uuid

developer_bp = Blueprint('developer', __name__, url_prefix='/api/developer')

@developer_bp.route('/photo', methods=['POST'])
def upload_developer_photo():
    """Upload developer photo"""
    try:
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
            # Save the file with the fixed name
            filename = "priyanshu_kumar.jpg"
            
            # Get the path to the frontend assets directory
            assets_folder = os.path.join(current_app.config['FRONTEND_ASSETS_FOLDER'])
            
            # Ensure the directory exists
            os.makedirs(assets_folder, exist_ok=True)
            
            # Save the file
            photo_path = os.path.join(assets_folder, filename)
            photo.save(photo_path)

            return jsonify({
                'message': 'Developer photo uploaded successfully',
                'path': f"/assets/{filename}"
            }), 200
    except Exception as e:
        current_app.logger.error(f"Error uploading developer photo: {str(e)}")
        return jsonify({'error': 'Failed to upload developer photo'}), 500
