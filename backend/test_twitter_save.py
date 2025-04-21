from models.mongo import Analysis, TwitterAnalysis
from db.mongo_client import get_db
import json
import time
from datetime import datetime

print('Testing Twitter analysis save functionality...')

# Create a test user ID (this should be a valid ObjectId in your database)
test_user_id = '6123456789abcdef01234567'  # Replace with a valid user ID from your database

# Create test data
username = 'testuser'
tweets_data = json.dumps([
    {
        'id': 'test-1',
        'text': 'This is a test tweet with positive sentiment',
        'author': '@testuser',
        'user_id': '123456',
        'sentiment': 'positive',
        'sentiment_score': {
            'positive': 0.8,
            'neutral': 0.1,
            'negative': 0.1
        },
        'created_at': datetime.now().isoformat()
    },
    {
        'id': 'test-2',
        'text': 'This is a test tweet with neutral sentiment',
        'author': '@testuser',
        'user_id': '123456',
        'sentiment': 'neutral',
        'sentiment_score': {
            'positive': 0.2,
            'neutral': 0.7,
            'negative': 0.1
        },
        'created_at': datetime.now().isoformat()
    }
])
tweet_count = 2
sentiment_scores = {
    'positive': 0.5,
    'neutral': 0.3,
    'negative': 0.2
}
ai_insights = 'This is a test AI insight for Twitter analysis'
metadata = json.dumps({
    'analysis_date': datetime.now().isoformat(),
    'tweet_count': 2,
    'sentiment_distribution': {
        'positive': 0.5,
        'neutral': 0.3,
        'negative': 0.2
    },
    'username': username
})

try:
    # Save analysis to database
    print('Creating Twitter analysis...')
    analysis_doc = TwitterAnalysis.create(
        user_id=test_user_id,
        username=username,
        tweets_data=tweets_data,
        tweet_count=tweet_count,
        sentiment_scores=sentiment_scores,
        ai_insights=ai_insights,
        metadata=metadata
    )
    
    print('Twitter analysis created successfully!')
    print('Analysis ID:', analysis_doc.get('_id'))
    
    # Verify the analysis was saved
    db = get_db()
    saved_analysis = db.analyses.find_one({'_id': analysis_doc.get('_id')})
    
    if saved_analysis:
        print('Analysis found in database!')
        print('Analysis type:', saved_analysis.get('analysis_type'))
        print('Username:', saved_analysis.get('data', {}).get('username'))
        print('Tweet count:', saved_analysis.get('data', {}).get('tweet_count'))
    else:
        print('Error: Analysis not found in database!')
    
except Exception as e:
    print('Error creating Twitter analysis:', str(e))
