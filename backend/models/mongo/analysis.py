from datetime import datetime, timezone
from bson import ObjectId
from db.mongo_client import get_db

class Analysis:
    """Base Analysis model for MongoDB"""

    collection_name = 'analyses'

    @classmethod
    def get_collection(cls):
        """Get the MongoDB collection for analyses"""
        return get_db()[cls.collection_name]

    @classmethod
    def create(cls, user_id, analysis_type, data):
        """Create a new analysis"""
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except:
                raise ValueError("Invalid user ID")

        # Create base analysis document
        analysis_doc = {
            'user_id': user_id,
            'analysis_type': analysis_type,
            'created_at': datetime.now(timezone.utc),
            'data': data
        }

        # Insert analysis document
        result = cls.get_collection().insert_one(analysis_doc)
        analysis_doc['_id'] = result.inserted_id

        return analysis_doc

    @classmethod
    def find_by_id(cls, analysis_id):
        """Find analysis by ID"""
        if isinstance(analysis_id, str):
            try:
                analysis_id = ObjectId(analysis_id)
            except:
                return None

        return cls.get_collection().find_one({'_id': analysis_id})

    @classmethod
    def find_by_user(cls, user_id, analysis_type=None, limit=10, skip=0):
        """Find analyses by user ID"""
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except:
                return []

        query = {'user_id': user_id}
        if analysis_type:
            query['analysis_type'] = analysis_type

        return list(cls.get_collection().find(query).sort('created_at', -1).skip(skip).limit(limit))

    @classmethod
    def to_json(cls, analysis_doc):
        """Convert analysis document to JSON"""
        if not analysis_doc:
            return None

        # Create a copy to avoid modifying the original
        analysis_json = dict(analysis_doc)

        # Convert ObjectId to string
        if '_id' in analysis_json:
            analysis_json['id'] = str(analysis_json['_id'])
            del analysis_json['_id']

        if 'user_id' in analysis_json:
            analysis_json['user_id'] = str(analysis_json['user_id'])

        # Convert datetime objects to ISO format strings
        if 'created_at' in analysis_json and analysis_json['created_at']:
            analysis_json['created_at'] = analysis_json['created_at'].isoformat()

        # Add sentiment scores for easier access in the frontend
        if 'data' in analysis_json:
            # Extract sentiment scores
            if 'sentiment_scores' in analysis_json['data']:
                sentiment = analysis_json['data']['sentiment_scores']
                analysis_json['positive_sentiment'] = sentiment.get('positive', 0)
                analysis_json['neutral_sentiment'] = sentiment.get('neutral', 0)
                analysis_json['negative_sentiment'] = sentiment.get('negative', 0)
            elif 'sentiment_distribution' in analysis_json['data']:
                sentiment = analysis_json['data']['sentiment_distribution']
                analysis_json['positive_sentiment'] = sentiment.get('positive', 0)
                analysis_json['neutral_sentiment'] = sentiment.get('neutral', 0)
                analysis_json['negative_sentiment'] = sentiment.get('negative', 0)

            # Add analysis type specific data
            analysis_json['analysis_type'] = analysis_json.get('analysis_type', 'unknown')

            # For CSV analyses, add dataset summary
            if analysis_json['analysis_type'] == 'csv' and 'dataset_summary' in analysis_json['data']:
                analysis_json['dataset_summary'] = analysis_json['data']['dataset_summary']
                analysis_json['filename'] = analysis_json['data'].get('filename', 'unknown.csv')
                analysis_json['row_count'] = analysis_json['data'].get('row_count', 0)

            # For Twitter analyses, add username
            elif analysis_json['analysis_type'] == 'twitter':
                analysis_json['username'] = analysis_json['data'].get('username', '')
                analysis_json['tweet_count'] = analysis_json['data'].get('tweet_count', 0)

            # For YouTube analyses, add video info
            elif analysis_json['analysis_type'] == 'youtube':
                analysis_json['video_title'] = analysis_json['data'].get('video_title', '')
                analysis_json['video_url'] = analysis_json['data'].get('video_url', '')
                analysis_json['comment_count'] = analysis_json['data'].get('comment_count', 0)

            # For text analyses, add text preview
            elif analysis_json['analysis_type'] == 'text':
                text = analysis_json['data'].get('text', '')
                analysis_json['text_preview'] = text[:100] + '...' if len(text) > 100 else text

            # Add AI insights preview
            if 'ai_insights' in analysis_json['data']:
                insights = analysis_json['data']['ai_insights']
                analysis_json['ai_insights_preview'] = insights[:200] + '...' if len(insights) > 200 else insights

        return analysis_json

class TextAnalysis:
    """Text Analysis helper methods"""

    @classmethod
    def create(cls, user_id, text, sentiment_scores, ai_insights):
        """Create a new text analysis"""
        data = {
            'text': text,
            'text_content': text,  # For backward compatibility
            'text_preview': text[:150] + '...' if len(text) > 150 else text,  # Add a preview
            'sentiment_scores': sentiment_scores,
            'positive_sentiment': sentiment_scores.get('positive', 0),  # Add direct sentiment values
            'neutral_sentiment': sentiment_scores.get('neutral', 0),
            'negative_sentiment': sentiment_scores.get('negative', 0),
            'ai_insights': ai_insights,
            'ai_insights_preview': ai_insights[:100] + '...' if len(ai_insights) > 100 else ai_insights,
            'created_at': datetime.now(timezone.utc),  # Add timestamp
            'analysis_type': 'text',  # Explicitly set type
            'type': 'text'  # For backward compatibility
        }

        return Analysis.create(user_id, 'text', data)

class TwitterAnalysis:
    """Twitter Analysis helper methods"""

    @classmethod
    def create(cls, user_id, username, tweets_data, tweet_count, sentiment_scores, ai_insights, metadata=None):
        """Create a new Twitter analysis"""
        data = {
            'username': username,
            'tweets_data': tweets_data,
            'tweet_count': tweet_count,
            'sentiment_scores': sentiment_scores,
            'ai_insights': ai_insights,
            'metadata': metadata or '{}'
        }

        return Analysis.create(user_id, 'twitter', data)

class YouTubeAnalysis:
    """YouTube Analysis helper methods"""

    @classmethod
    def create(cls, user_id, video_url, video_title, comments_data, comment_count, sentiment_scores, ai_insights):
        """Create a new YouTube analysis"""
        data = {
            'video_url': video_url,
            'video_title': video_title,
            'comments_data': comments_data,
            'comment_count': comment_count,
            'sentiment_scores': sentiment_scores,
            'ai_insights': ai_insights
        }

        return Analysis.create(user_id, 'youtube', data)

class CSVAnalysis:
    """CSV Analysis helper methods"""

    @classmethod
    def create(cls, user_id, filename, file_path, column_analyzed, row_count, sentiment_distribution, ai_insights, summary_stats=None, dataset_summary=None):
        """Create a new CSV analysis"""
        data = {
            'filename': filename,
            'file_path': file_path,
            'column_analyzed': column_analyzed,
            'row_count': row_count,
            'sentiment_distribution': sentiment_distribution,
            'ai_insights': ai_insights,
            'summary_stats': summary_stats or {},
            'dataset_summary': dataset_summary or {},
            'created_at': datetime.now(timezone.utc)  # Add timestamp directly in the data for easier access
        }

        return Analysis.create(user_id, 'csv', data)
