from datetime import datetime
from . import db

class BaseAnalysis(db.Model):
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    positive_sentiment = db.Column(db.Float, nullable=True)
    neutral_sentiment = db.Column(db.Float, nullable=True)
    negative_sentiment = db.Column(db.Float, nullable=True)
    ai_insights = db.Column(db.Text, nullable=True)

class TextAnalysis(BaseAnalysis):
    __tablename__ = 'text_analyses'
    
    text_content = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'positive_sentiment': self.positive_sentiment,
            'neutral_sentiment': self.neutral_sentiment,
            'negative_sentiment': self.negative_sentiment,
            'ai_insights': self.ai_insights,
            'text_content': self.text_content,
            'type': 'text'
        }

class CSVAnalysis(BaseAnalysis):
    __tablename__ = 'csv_analyses'
    
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    row_count = db.Column(db.Integer, nullable=True)
    column_count = db.Column(db.Integer, nullable=True)
    summary_stats = db.Column(db.Text, nullable=True)  # JSON string of summary statistics
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'positive_sentiment': self.positive_sentiment,
            'neutral_sentiment': self.neutral_sentiment,
            'negative_sentiment': self.negative_sentiment,
            'ai_insights': self.ai_insights,
            'filename': self.filename,
            'row_count': self.row_count,
            'column_count': self.column_count,
            'summary_stats': self.summary_stats,
            'type': 'csv'
        }

class TwitterAnalysis(BaseAnalysis):
    __tablename__ = 'twitter_analyses'
    
    username = db.Column(db.String(100), nullable=False)
    tweet_count = db.Column(db.Integer, nullable=True)
    tweets_data = db.Column(db.Text, nullable=True)  # JSON string of tweet data
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'positive_sentiment': self.positive_sentiment,
            'neutral_sentiment': self.neutral_sentiment,
            'negative_sentiment': self.negative_sentiment,
            'ai_insights': self.ai_insights,
            'username': self.username,
            'tweet_count': self.tweet_count,
            'type': 'twitter'
        }

class YoutubeAnalysis(BaseAnalysis):
    __tablename__ = 'youtube_analyses'
    
    video_id = db.Column(db.String(20), nullable=False)
    video_title = db.Column(db.String(255), nullable=True)
    comment_count = db.Column(db.Integer, nullable=True)
    comments_data = db.Column(db.Text, nullable=True)  # JSON string of comment data
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'positive_sentiment': self.positive_sentiment,
            'neutral_sentiment': self.neutral_sentiment,
            'negative_sentiment': self.negative_sentiment,
            'ai_insights': self.ai_insights,
            'video_id': self.video_id,
            'video_title': self.video_title,
            'comment_count': self.comment_count,
            'type': 'youtube'
        }
