from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
import json
import time
from datetime import datetime

from models.mongo import User, Analysis, TextAnalysis, CSVAnalysis, TwitterAnalysis, YouTubeAnalysis
from utils.sentiment_analysis import analyze_sentiment, generate_ai_insights
from utils.csv_analysis import analyze_csv
from utils.twitter_analysis import analyze_twitter_user, mock_twitter_analysis, get_user_tweets, get_user_tweets_v2
from utils.youtube_analysis import analyze_youtube_comments, extract_video_id

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analyze')

@analysis_bp.route('/text', methods=['POST'])
def analyze_text():
    """Analyze text sentiment"""
    try:
        # Authentication temporarily disabled for testing
        current_user_id = None
        user_doc = None

        data = request.get_json()
        if not data or not data.get('text'):
            return jsonify({'error': 'No text provided'}), 400

        text = data.get('text')

        # Clean the text to remove social media artifacts including patterns like
        # "__________(any number) w/d ______(any number) likeReply"
        from utils.text_cleaner import clean_comments
        cleaned_text = clean_comments(text)

        # If cleaning removed all meaningful content, don't return an error
        # Just analyze what we have or return empty results
        if not cleaned_text.strip():
            # Return a neutral sentiment result instead of an error
            # This ensures the frontend doesn't show an error notification
            return jsonify({
                'result': {
                    'sentiment': 'neutral',
                    'positive_score': 0.33,
                    'negative_score': 0.33,
                    'neutral_score': 0.34,
                    'explanation': 'No meaningful content to analyze'
                },
                'ai_insights': 'The provided text appears to contain only formatting or non-meaningful content.',
                'analysis': {
                    'id': 'empty_analysis',
                    'analysis_type': 'text',
                    'created_at': datetime.now().isoformat(),
                    'user_id': 'test_user',
                    'data': {
                        'text': text,
                        'sentiment_scores': {
                            'positive': 0.33,
                            'neutral': 0.34,
                            'negative': 0.33
                        },
                        'ai_insights': 'The provided text appears to contain only formatting or non-meaningful content.'
                    }
                }
            }), 200

        # Analyze sentiment using the cleaned text
        result = analyze_sentiment(cleaned_text)

        # Generate enhanced AI insights
        insights = generate_ai_insights(result, 'text', text)

        # Skip saving to database for testing
        sentiment_scores = {
            'positive': result['positive_score'],
            'neutral': result['neutral_score'],
            'negative': result['negative_score']
        }

        # Skip creating a database document

        # Create a mock JSON response
        analysis_json = {
            'id': 'test_id',
            'analysis_type': 'text',
            'created_at': datetime.now().isoformat(),
            'user_id': 'test_user',
            'data': {
                'text': text,
                'sentiment_scores': sentiment_scores,
                'ai_insights': insights
            }
        }

        return jsonify({
            'result': result,
            'ai_insights': insights,
            'analysis': analysis_json
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error analyzing text: {str(e)}")
        return jsonify({'error': f'Failed to analyze text: {str(e)}'}), 500

@analysis_bp.route('/csv', methods=['POST'])
def analyze_csv_file():
    """Analyze CSV data"""
    try:
        # Check if file is in the request
        if 'file' not in request.files:
            return jsonify({'error': 'No file found'}), 400

        file = request.files['file']

        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Validate file type by extension
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'Please upload a valid CSV file. Only .csv files are supported.'}), 400

        # Check MIME type (additional validation)
        content_type = file.content_type
        valid_types = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain']
        if content_type and content_type not in valid_types and not content_type.startswith('text/'):
            return jsonify({'error': 'Invalid file type. Please upload a valid CSV file.'}), 400

        # Check file size (limit to 10MB)
        if file.content_length and file.content_length > 10 * 1024 * 1024:  # 10MB
            return jsonify({'error': 'File too large. Please upload a CSV file smaller than 10MB.'}), 400

        # Generate a unique filename
        filename = secure_filename(file.filename)
        new_filename = f"{uuid.uuid4().hex}_{filename}"

        # Save the file
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)

        # Read the file from disk to avoid stream issues
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
        except UnicodeDecodeError:
            # Try with a different encoding if UTF-8 fails
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    file_content = f.read()
            except Exception as e:
                return jsonify({'error': f'Unable to read the CSV file: {str(e)}'}), 400
        except Exception as e:
            return jsonify({'error': f'Error reading the file: {str(e)}'}), 400

        # Validate that the file has CSV structure (contains commas or semicolons)
        if ',' not in file_content and ';' not in file_content:
            return jsonify({'error': 'The file does not appear to be a valid CSV. Please check the file format.'}), 400

        # Analyze the CSV
        try:
            analysis_result = analyze_csv(file_content)

            # Check if there was an error in analysis
            if 'error' in analysis_result:
                return jsonify({'error': f'Analysis failed: {analysis_result["error"]}'}), 400
        except Exception as e:
            return jsonify({'error': f'Failed to analyze CSV: {str(e)}'}), 400

        # Generate enhanced AI insights
        insights = generate_ai_insights(
            analysis_result,
            'csv',
            source_data=analysis_result
        )

        # Calculate sentiment scores (if applicable)
        sentiment_distribution = {
            'positive': 0,  # Default values
            'neutral': 0,
            'negative': 0
        }

        # Create summary stats
        summary_stats = {
            'rows': analysis_result['summary']['rows'],
            'columns': analysis_result['summary']['columns'],
            'column_names': analysis_result['summary'].get('column_names', []),
            'data_types': analysis_result['summary'].get('data_types', {})
        }

        # Create dataset summary for persistence
        dataset_summary = {
            'rows': analysis_result['summary']['rows'],
            'columns': analysis_result['summary']['columns'],
            'missing_values': analysis_result['summary'].get('missing_values', 0),
            'duplicate_rows': analysis_result['summary'].get('duplicate_rows', 0),
            'column_names': analysis_result['summary'].get('column_names', [])[:10],  # Limit to first 10 columns
            'insights_preview': insights[:200] + '...' if insights and len(insights) > 200 else insights,  # Preview of insights
            'filename': filename  # Store the original filename
        }

        # Get user ID if authenticated
        current_user_id = None
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                from flask_jwt_extended import decode_token
                token = auth_header.split(' ')[1]
                decoded = decode_token(token)
                current_user_id = decoded.get('sub')
        except Exception as e:
            current_app.logger.warning(f"Could not decode token: {str(e)}")

        # Save analysis to database if user is authenticated
        if current_user_id:
            try:
                user_doc = User.find_by_id(current_user_id)
                if user_doc:
                    analysis_doc = CSVAnalysis.create(
                        user_id=current_user_id,
                        filename=filename,
                        file_path=file_path,
                        column_analyzed='',  # Update based on actual column analyzed
                        row_count=analysis_result['summary']['rows'],
                        sentiment_distribution=sentiment_distribution,
                        ai_insights=insights,
                        summary_stats=summary_stats,
                        dataset_summary=dataset_summary
                    )
                    analysis_json = Analysis.to_json(analysis_doc)
                else:
                    analysis_json = None
            except Exception as e:
                current_app.logger.error(f"Error saving analysis to database: {str(e)}")
                analysis_json = None
        else:
            # Create a mock analysis JSON for unauthenticated users
            analysis_json = {
                'id': 'temp_id',
                'analysis_type': 'csv',
                'created_at': datetime.now().isoformat(),
                'data': {
                    'filename': filename,
                    'row_count': analysis_result['summary']['rows'],
                    'sentiment_distribution': sentiment_distribution,
                    'ai_insights': insights,
                    'summary_stats': summary_stats,
                    'dataset_summary': dataset_summary
                }
            }

        return jsonify({
            'result': analysis_result,
            'ai_insights': insights,
            'analysis': analysis_json
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error analyzing CSV: {str(e)}")
        return jsonify({'error': f'Failed to analyze CSV: {str(e)}'}), 500

@analysis_bp.route('/text/save', methods=['POST'])
@jwt_required()
def save_text_analysis():
    """Save text analysis results"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract required fields
        text = data.get('text', '')
        text_content = data.get('text_content', text)
        text_preview = data.get('text_preview', text[:150] + '...' if len(text) > 150 else text)

        # Get sentiment scores
        sentiment_scores = data.get('sentiment_scores', {})
        if not sentiment_scores:
            # Try to get individual sentiment values
            sentiment_scores = {
                'positive': data.get('positive_sentiment', 0),
                'neutral': data.get('neutral_sentiment', 0),
                'negative': data.get('negative_sentiment', 0)
            }

        ai_insights = data.get('ai_insights', '')
        metadata = data.get('metadata', '{}')

        # Save analysis to database
        analysis_doc = TextAnalysis.create(
            user_id=current_user_id,
            text=text_content,
            sentiment_scores=sentiment_scores,
            ai_insights=ai_insights
        )

        # Update with additional fields if needed
        if hasattr(analysis_doc, 'update'):
            analysis_doc.update({
                'text_preview': text_preview,
                'metadata': metadata
            })

        return jsonify({
            'success': True,
            'message': 'Text analysis saved successfully',
            'analysis': Analysis.to_json(analysis_doc)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error saving text analysis: {str(e)}")
        return jsonify({'error': f'Failed to save text analysis: {str(e)}'}), 500

@analysis_bp.route('/csv/save', methods=['POST'])
@jwt_required()
def save_csv_analysis():
    """Save CSV analysis results"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract required fields
        filename = data.get('filename', 'unknown.csv')
        row_count = data.get('row_count', 0)
        sentiment_distribution = data.get('sentiment_distribution', {'positive': 0, 'neutral': 0, 'negative': 0})
        ai_insights = data.get('ai_insights', '')
        summary_stats = data.get('summary_stats', {})
        dataset_summary = data.get('dataset_summary', {})

        # Create a placeholder file path
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}_{filename}")

        # Save analysis to database
        analysis_doc = CSVAnalysis.create(
            user_id=current_user_id,
            filename=filename,
            file_path=file_path,
            column_analyzed='',
            row_count=row_count,
            sentiment_distribution=sentiment_distribution,
            ai_insights=ai_insights,
            summary_stats=summary_stats,
            dataset_summary=dataset_summary
        )

        return jsonify({
            'success': True,
            'message': 'CSV analysis saved successfully',
            'analysis': Analysis.to_json(analysis_doc)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error saving CSV analysis: {str(e)}")
        return jsonify({'error': f'Failed to save CSV analysis: {str(e)}'}), 500

@analysis_bp.route('/twitter/fetch', methods=['GET'])
def fetch_twitter_tweets():
    """Fetch tweets from a Twitter user without analysis"""
    try:
        # Get username from query parameters
        username = request.args.get('username')
        if not username:
            return jsonify({'error': 'No username provided'}), 400

        # Get filter parameters
        include_rts = request.args.get('include_rts', 'false').lower() == 'true'
        exclude_replies = request.args.get('exclude_replies', 'false').lower() == 'true'
        count = int(request.args.get('count', '50'))

        # Limit count to reasonable values
        count = min(max(count, 10), 100)

        # Remove @ symbol if present
        username = username.strip().lstrip('@')

        # Check if we have Twitter API keys
        api_key = current_app.config.get('TWITTER_API_KEY')
        api_secret = current_app.config.get('TWITTER_API_SECRET')
        access_token = current_app.config.get('TWITTER_ACCESS_TOKEN')
        access_secret = current_app.config.get('TWITTER_ACCESS_SECRET')

        # Log the API keys (without revealing full values)
        current_app.logger.info(f"Twitter API Key: {api_key[:5]}...")
        current_app.logger.info(f"Twitter API Secret: {api_secret[:5]}...")
        current_app.logger.info(f"Twitter Access Token: {access_token[:5]}...")
        current_app.logger.info(f"Twitter Access Secret: {access_secret[:5]}...")

        # Use mock data if no API keys are available
        if not api_key or not api_secret or not access_token or not access_secret:
            current_app.logger.warning("Using mock Twitter data (no API keys)")
            result = mock_twitter_analysis(username)
            return jsonify({
                'tweets': result['tweets'],
                'user_info': result['user_info'],
                'metadata': {
                    'is_mock': True,
                    'include_retweets': include_rts,
                    'exclude_replies': exclude_replies,
                    'count': count
                }
            }), 200

        # Get tweets using the Twitter API
        tweets, user_info = get_user_tweets_v2(
            username, api_key, api_secret, access_token, access_secret,
            count=count, include_rts=include_rts, exclude_replies=exclude_replies
        )

        # Check if there was an error
        if not tweets and user_info and 'error' in user_info:
            return jsonify({'error': user_info['error']}), 400

        # Return the tweets and user info
        return jsonify({
            'tweets': tweets,
            'user_info': user_info,
            'metadata': {
                'is_mock': False,
                'include_retweets': include_rts,
                'exclude_replies': exclude_replies,
                'count': count,
                'api_version': 'v2',
                'timestamp': time.time()
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching tweets: {str(e)}")
        return jsonify({'error': f'Failed to fetch tweets: {str(e)}'}), 500

@analysis_bp.route('/twitter', methods=['POST'])
@jwt_required()
def analyze_twitter():
    """Analyze Twitter user tweets"""
    try:
        current_user_id = get_jwt_identity()
        user_doc = User.find_by_id(current_user_id)

        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if not data or not data.get('username'):
            return jsonify({'error': 'No username provided'}), 400

        username = data.get('username').strip().lstrip('@')

        # Check if this is a save request with pre-analyzed data
        if data.get('tweets_data') and data.get('ai_insights'):
            current_app.logger.info(f"Saving pre-analyzed Twitter data for user {current_user_id} and username {username}")

            # Extract data from request
            tweets_data = data.get('tweets_data')
            tweet_count = data.get('tweet_count', 0)
            positive_sentiment = data.get('positive_sentiment', 0)
            neutral_sentiment = data.get('neutral_sentiment', 0)
            negative_sentiment = data.get('negative_sentiment', 0)
            ai_insights = data.get('ai_insights', '')
            metadata = data.get('metadata', '{}')

            # Create sentiment scores dictionary
            sentiment_scores = {
                'positive': positive_sentiment,
                'neutral': neutral_sentiment,
                'negative': negative_sentiment
            }

            # Save analysis to database
            analysis_doc = TwitterAnalysis.create(
                user_id=current_user_id,
                username=username,
                tweets_data=tweets_data,
                tweet_count=tweet_count,
                sentiment_scores=sentiment_scores,
                ai_insights=ai_insights,
                metadata=metadata
            )

            current_app.logger.info(f"Successfully saved Twitter analysis for user {current_user_id}")

            return jsonify({
                'success': True,
                'message': 'Twitter analysis saved successfully',
                'analysis': Analysis.to_json(analysis_doc)
            }), 200

        # If not a save request, proceed with analysis
        # Get filter parameters
        include_rts = data.get('include_rts', False)
        exclude_replies = data.get('exclude_replies', False)
        count = int(data.get('count', 100))

        # Limit count to reasonable values
        count = min(max(count, 10), 100)

        # Check if we have Twitter API keys
        api_key = current_app.config.get('TWITTER_API_KEY')
        api_secret = current_app.config.get('TWITTER_API_SECRET')
        access_token = current_app.config.get('TWITTER_ACCESS_TOKEN')
        access_secret = current_app.config.get('TWITTER_ACCESS_SECRET')

        # Use mock data if no API keys are available
        if not api_key or not api_secret or not access_token or not access_secret:
            current_app.logger.warning("Using mock Twitter data (no API keys)")
            result = mock_twitter_analysis(username)
        else:
            result = analyze_twitter_user(
                username, api_key, api_secret, access_token, access_secret,
                count=count, include_rts=include_rts, exclude_replies=exclude_replies
            )

        if 'error' in result:
            return jsonify({'error': result['error']}), 400

        # Generate enhanced AI insights
        insights = generate_ai_insights(
            result,
            'twitter',
            source_data=result
        )

        # Save analysis to database
        sentiment_scores = {
            'positive': result['sentiment_summary']['positive'],
            'neutral': result['sentiment_summary']['neutral'],
            'negative': result['sentiment_summary']['negative']
        }

        analysis_doc = TwitterAnalysis.create(
            user_id=current_user_id,
            username=username,
            tweets_data=json.dumps(result['tweets']),
            tweet_count=result['sentiment_summary']['total_tweets'],
            sentiment_scores=sentiment_scores,
            ai_insights=insights,
            metadata=json.dumps(result.get('metadata', {}))
        )

        return jsonify({
            'result': result,
            'ai_insights': insights,
            'analysis': Analysis.to_json(analysis_doc)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error analyzing Twitter: {str(e)}")
        return jsonify({'error': f'Failed to analyze Twitter: {str(e)}'}), 500

@analysis_bp.route('/youtube', methods=['POST'])
def analyze_youtube():
    """Analyze YouTube video comments"""
    try:
        # Get user ID if authenticated
        current_user_id = None
        user_doc = None
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                from flask_jwt_extended import decode_token
                token = auth_header.split(' ')[1]
                decoded = decode_token(token)
                current_user_id = decoded.get('sub')
                if current_user_id:
                    user_doc = User.find_by_id(current_user_id)
        except Exception as e:
            current_app.logger.warning(f"Could not decode token: {str(e)}")
            # Continue without authentication

        data = request.get_json()

        if not data or not data.get('video_url'):
            return jsonify({'error': 'No video URL provided'}), 400

        video_url = data.get('video_url')

        # Extract video ID
        video_id = extract_video_id(video_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400

        # Get YouTube API key
        api_key = current_app.config.get('YOUTUBE_API_KEY')

        # Analyze YouTube comments (will use mock data if API key is missing)
        result = analyze_youtube_comments(video_url, api_key)

        if 'error' in result:
            return jsonify({'error': result['error']}), 400

        # Generate enhanced AI insights
        insights = generate_ai_insights(
            result,
            'youtube',
            source_data=result
        )

        # Prepare sentiment scores
        sentiment_scores = {
            'positive': result['sentiment_summary']['positive'],
            'neutral': result['sentiment_summary']['neutral'],
            'negative': result['sentiment_summary']['negative']
        }

        # Save analysis to database if user is authenticated
        if current_user_id and user_doc:
            try:
                analysis_doc = YouTubeAnalysis.create(
                    user_id=current_user_id,
                    video_url=video_url,
                    video_title=result['video_info'].get('title', ''),
                    comments_data=json.dumps(result['comments']),
                    comment_count=result['sentiment_summary']['total_comments'],
                    sentiment_scores=sentiment_scores,
                    ai_insights=insights
                )
                analysis_json = Analysis.to_json(analysis_doc)
            except Exception as e:
                current_app.logger.error(f"Error saving analysis to database: {str(e)}")
                analysis_json = None
        else:
            # Create a mock analysis JSON for unauthenticated users
            analysis_json = {
                'id': 'temp_id',
                'analysis_type': 'youtube',
                'created_at': datetime.now().isoformat(),
                'data': {
                    'video_url': video_url,
                    'video_title': result['video_info'].get('title', ''),
                    'comment_count': result['sentiment_summary']['total_comments'],
                    'sentiment_scores': sentiment_scores,
                    'ai_insights': insights
                }
            }

        return jsonify({
            'result': result,
            'ai_insights': insights,
            'analysis': analysis_json
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error analyzing YouTube: {str(e)}")
        return jsonify({'error': f'Failed to analyze YouTube: {str(e)}'}), 500
