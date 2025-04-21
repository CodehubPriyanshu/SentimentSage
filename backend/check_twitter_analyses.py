from models.mongo import Analysis
from db.mongo_client import get_db
import json

print('Checking Twitter analyses in the database...')
db = get_db()

# Find all Twitter analyses
twitter_analyses = list(db.analyses.find({'analysis_type': 'twitter'}))
print(f'Found {len(twitter_analyses)} Twitter analyses')

if twitter_analyses:
    print('\nSample Twitter analysis:')
    sample = twitter_analyses[0]
    print('ID:', sample.get('_id'))
    print('User ID:', sample.get('user_id'))
    print('Created at:', sample.get('created_at'))
    print('Analysis type:', sample.get('analysis_type'))
    
    # Print data fields
    data = sample.get('data', {})
    print('\nData fields:')
    print('Username:', data.get('username'))
    print('Tweet count:', data.get('tweet_count'))
    print('AI insights:', data.get('ai_insights')[:100] + '...' if data.get('ai_insights') else None)
    
    # Check sentiment scores
    sentiment_scores = data.get('sentiment_scores', {})
    print('\nSentiment scores:')
    print('Positive:', sentiment_scores.get('positive'))
    print('Neutral:', sentiment_scores.get('neutral'))
    print('Negative:', sentiment_scores.get('negative'))
    
    # Check tweets data
    tweets_data = data.get('tweets_data')
    if tweets_data:
        try:
            tweets = json.loads(tweets_data) if isinstance(tweets_data, str) else tweets_data
            print('\nTweets data:')
            print(f'Number of tweets: {len(tweets) if isinstance(tweets, list) else "N/A"}')
            if isinstance(tweets, list) and len(tweets) > 0:
                sample_tweet = tweets[0]
                print('\nSample tweet:')
                print('Text:', sample_tweet.get('text'))
                print('Sentiment:', sample_tweet.get('sentiment'))
        except Exception as e:
            print('Error parsing tweets data:', str(e))
else:
    print('No Twitter analyses found in the database')
