from models.mongo import Analysis
from db.mongo_client import get_db

print('Checking Twitter analyses...')
db = get_db()
twitter_analyses = list(db.analyses.find({'analysis_type': 'twitter'}))
print(f'Found {len(twitter_analyses)} Twitter analyses')

if twitter_analyses:
    print('Sample analysis:')
    print(list(twitter_analyses[0].keys()))
    print('Username:', twitter_analyses[0].get('data', {}).get('username', 'N/A'))
    print('Tweet count:', twitter_analyses[0].get('data', {}).get('tweet_count', 'N/A'))
else:
    print('No Twitter analyses found')
