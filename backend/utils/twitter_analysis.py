"""
Utility functions for Twitter tweet analysis
"""
import tweepy
import json
import re
import time
from typing import Dict, List, Any, Tuple, Optional
from .sentiment_analysis import analyze_sentiment, analyze_multiple_texts

# Import for Hugging Face sentiment analysis
import requests
from transformers import pipeline
# from emoji import demojize  # Temporarily commented out for testing
import os

# Initialize Hugging Face sentiment analysis model
_sentiment_analyzer = None

def get_sentiment_analyzer():
    """
    Get or initialize the Hugging Face sentiment analysis model

    Returns:
        Sentiment analysis pipeline
    """
    global _sentiment_analyzer
    if _sentiment_analyzer is None:
        try:
            # Use a model that's good for social media text
            _sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error loading sentiment model: {str(e)}", exc_info=True)
            # Fallback to a smaller model if the first one fails
            _sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
    return _sentiment_analyzer

def setup_twitter_api_v1(api_key: str, api_secret: str, access_token: str, access_secret: str) -> tweepy.API:
    """
    Set up the Twitter API v1.1 client

    Args:
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret

    Returns:
        Tweepy API client
    """
    auth = tweepy.OAuth1UserHandler(
        api_key, api_secret, access_token, access_secret
    )
    return tweepy.API(auth)

def setup_twitter_api_v2(api_key: str, api_secret: str, access_token: str, access_secret: str) -> tweepy.Client:
    """
    Set up the Twitter API v2 client

    Args:
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret

    Returns:
        Tweepy Client for API v2
    """
    return tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )

# For backward compatibility
setup_twitter_api = setup_twitter_api_v1

def preprocess_tweet_text(text: str) -> str:
    """
    Preprocess tweet text for better sentiment analysis

    Args:
        text: The tweet text to preprocess

    Returns:
        Preprocessed text
    """
    # Convert emojis to text representation (temporarily disabled)
    # text = demojize(text)

    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # Remove mentions but keep the username for context
    text = re.sub(r'@(\w+)', r'\1', text)

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def analyze_tweet_sentiment_with_huggingface(text: str) -> Dict[str, Any]:
    """
    Analyze tweet sentiment using Hugging Face model

    Args:
        text: The tweet text to analyze

    Returns:
        Sentiment analysis results
    """
    if not text or text.isspace():
        return {
            'sentiment': 'neutral',
            'positive_score': 0.33,
            'negative_score': 0.33,
            'neutral_score': 0.34,
            'explanation': 'Empty or whitespace-only text'
        }

    try:
        # Preprocess the text
        processed_text = preprocess_tweet_text(text)

        # Get the sentiment analyzer
        analyzer = get_sentiment_analyzer()

        # Analyze sentiment
        result = analyzer(processed_text)

        # Extract the label and score
        label = result[0]['label'].lower()
        score = result[0]['score']

        # Map the label to our format
        if 'positive' in label:
            sentiment = 'positive'
            positive_score = score
            negative_score = (1 - score) / 2
            neutral_score = (1 - score) / 2
        elif 'negative' in label:
            sentiment = 'negative'
            positive_score = (1 - score) / 2
            negative_score = score
            neutral_score = (1 - score) / 2
        else:  # neutral
            sentiment = 'neutral'
            positive_score = (1 - score) / 2
            negative_score = (1 - score) / 2
            neutral_score = score

        # Generate explanation
        if sentiment == 'positive':
            explanation = "This tweet has a positive tone expressing satisfaction or approval."
        elif sentiment == 'negative':
            explanation = "This tweet has a negative tone expressing dissatisfaction or criticism."
        else:
            explanation = "This tweet has a neutral tone or balanced positive and negative elements."

        return {
            'sentiment': sentiment,
            'positive_score': positive_score,
            'negative_score': negative_score,
            'neutral_score': neutral_score,
            'explanation': explanation
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error analyzing sentiment with Hugging Face: {str(e)}", exc_info=True)
        # Fall back to basic sentiment analysis
        return analyze_sentiment(text)

def get_user_tweets_v1(username: str, api_key: str, api_secret: str,
                   access_token: str, access_secret: str,
                   count: int = 100, include_rts: bool = False) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get tweets from a Twitter user using API v1.1

    Args:
        username: Twitter username
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret
        count: Maximum number of tweets to retrieve
        include_rts: Whether to include retweets

    Returns:
        A tuple of (tweets list, user info)
    """
    try:
        # Set up API client
        api = setup_twitter_api_v1(api_key, api_secret, access_token, access_secret)

        # Get user info
        user = api.get_user(screen_name=username)
        user_info = {
            'id': user.id_str,
            'name': user.name,
            'screen_name': user.screen_name,
            'description': user.description,
            'followers_count': user.followers_count,
            'friends_count': user.friends_count,
            'statuses_count': user.statuses_count,
            'profile_image_url': user.profile_image_url_https
        }

        # Get tweets
        tweets = []
        for tweet in tweepy.Cursor(api.user_timeline,
                                  screen_name=username,
                                  tweet_mode='extended',
                                  include_rts=include_rts).items(count):
            tweet_data = {
                'id': tweet.id_str,
                'created_at': tweet.created_at.isoformat(),
                'text': tweet.full_text,
                'author': f'@{username}',
                'user_id': user_info['id'],  # Add user_id from user_info
                'retweet_count': tweet.retweet_count,
                'favorite_count': tweet.favorite_count,
                'is_retweet': hasattr(tweet, 'retweeted_status')
            }

            # Handle retweets
            if hasattr(tweet, 'retweeted_status'):
                tweet_data['original_author'] = tweet.retweeted_status.user.screen_name

            tweets.append(tweet_data)

        return tweets, user_info

    except tweepy.TweepyException as e:
        if 'User not found' in str(e):
            return [], {'error': f'User @{username} not found'}
        elif 'Rate limit exceeded' in str(e):
            return [], {'error': 'Twitter API rate limit exceeded. Please try again later.'}
        else:
            return [], {'error': f'Twitter API error: {str(e)}'}
    except Exception as e:
        return [], {'error': f'Error fetching tweets: {str(e)}'}

def get_user_tweets_v2(username: str, api_key: str, api_secret: str,
                     access_token: str, access_secret: str,
                     count: int = 100, include_rts: bool = False,
                     exclude_replies: bool = False) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get tweets from a Twitter user using API v2

    Args:
        username: Twitter username or user ID
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret
        count: Maximum number of tweets to retrieve
        include_rts: Whether to include retweets
        exclude_replies: Whether to exclude replies

    Returns:
        A tuple of (tweets list, user info)
    """
    try:
        # Set up API client
        client = setup_twitter_api_v2(api_key, api_secret, access_token, access_secret)

        # Determine if username is a user ID or screen name
        is_user_id = username.isdigit()

        # Get user info
        if is_user_id:
            user_response = client.get_user(id=username, user_fields=['description', 'public_metrics', 'profile_image_url'])
        else:
            # Remove @ if present
            clean_username = username.lstrip('@')
            user_response = client.get_user(username=clean_username, user_fields=['description', 'public_metrics', 'profile_image_url'])

        if not user_response or not user_response.data:
            return [], {'error': f'User {username} not found'}

        user = user_response.data

        # Extract user info
        user_info = {
            'id': user.id,
            'name': user.name,
            'screen_name': user.username,
            'description': getattr(user, 'description', ''),
            'followers_count': user.public_metrics['followers_count'],
            'friends_count': user.public_metrics['following_count'],
            'statuses_count': user.public_metrics['tweet_count'],
            'profile_image_url': getattr(user, 'profile_image_url', '')
        }

        # Prepare query parameters
        tweet_fields = ['created_at', 'public_metrics', 'referenced_tweets', 'entities']
        expansions = ['referenced_tweets.id', 'referenced_tweets.id.author_id']

        # Build exclude filter
        excludes = []
        if not include_rts:
            excludes.append('retweets')
        if exclude_replies:
            excludes.append('replies')

        # Get tweets
        if is_user_id:
            tweets_response = client.get_users_tweets(
                id=username,
                max_results=min(count, 100),  # API v2 has a max of 100 per request
                tweet_fields=tweet_fields,
                expansions=expansions,
                exclude=excludes if excludes else None
            )
        else:
            # First get the user ID from the username
            tweets_response = client.get_users_tweets(
                id=user.id,
                max_results=min(count, 100),
                tweet_fields=tweet_fields,
                expansions=expansions,
                exclude=excludes if excludes else None
            )

        if not tweets_response or not tweets_response.data:
            return [], user_info

        # Process tweets
        tweets = []
        for tweet in tweets_response.data:
            # Check if it's a retweet
            is_retweet = False
            original_author = None
            if hasattr(tweet, 'referenced_tweets') and tweet.referenced_tweets:
                for ref in tweet.referenced_tweets:
                    if ref.type == 'retweeted':
                        is_retweet = True
                        # Try to find the original author
                        if tweets_response.includes and 'tweets' in tweets_response.includes:
                            for included_tweet in tweets_response.includes['tweets']:
                                if included_tweet.id == ref.id:
                                    original_author = included_tweet.author_id
                                    break

            # Create tweet data
            tweet_data = {
                'id': tweet.id,
                'created_at': tweet.created_at.isoformat() if hasattr(tweet, 'created_at') else None,
                'text': tweet.text,
                'author': f'@{user_info["screen_name"]}',
                'user_id': user_info['id'],
                'retweet_count': tweet.public_metrics['retweet_count'],
                'favorite_count': tweet.public_metrics['like_count'],
                'is_retweet': is_retweet
            }

            if original_author:
                tweet_data['original_author'] = original_author

            # Analyze sentiment using Hugging Face
            sentiment_result = analyze_tweet_sentiment_with_huggingface(tweet.text)
            tweet_data['sentiment'] = sentiment_result['sentiment']
            tweet_data['sentiment_score'] = {
                'positive': sentiment_result['positive_score'],
                'neutral': sentiment_result['neutral_score'],
                'negative': sentiment_result['negative_score']
            }

            tweets.append(tweet_data)

            # Check if we have enough tweets
            if len(tweets) >= count:
                break

        # If we need more tweets and there are more pages, fetch them
        pagination_token = getattr(tweets_response.meta, 'next_token', None)
        remaining = count - len(tweets)

        while pagination_token and remaining > 0 and len(tweets) < count:
            # Add a small delay to avoid rate limiting
            time.sleep(1)

            # Fetch the next page
            if is_user_id:
                next_response = client.get_users_tweets(
                    id=username,
                    max_results=min(remaining, 100),
                    tweet_fields=tweet_fields,
                    expansions=expansions,
                    exclude=excludes if excludes else None,
                    pagination_token=pagination_token
                )
            else:
                next_response = client.get_users_tweets(
                    id=user.id,
                    max_results=min(remaining, 100),
                    tweet_fields=tweet_fields,
                    expansions=expansions,
                    exclude=excludes if excludes else None,
                    pagination_token=pagination_token
                )

            if not next_response or not next_response.data:
                break

            # Process tweets from this page
            for tweet in next_response.data:
                # Check if it's a retweet
                is_retweet = False
                original_author = None
                if hasattr(tweet, 'referenced_tweets') and tweet.referenced_tweets:
                    for ref in tweet.referenced_tweets:
                        if ref.type == 'retweeted':
                            is_retweet = True
                            # Try to find the original author
                            if next_response.includes and 'tweets' in next_response.includes:
                                for included_tweet in next_response.includes['tweets']:
                                    if included_tweet.id == ref.id:
                                        original_author = included_tweet.author_id
                                        break

                # Create tweet data
                tweet_data = {
                    'id': tweet.id,
                    'created_at': tweet.created_at.isoformat() if hasattr(tweet, 'created_at') else None,
                    'text': tweet.text,
                    'author': f'@{user_info["screen_name"]}',
                    'user_id': user_info['id'],
                    'retweet_count': tweet.public_metrics['retweet_count'],
                    'favorite_count': tweet.public_metrics['like_count'],
                    'is_retweet': is_retweet
                }

                if original_author:
                    tweet_data['original_author'] = original_author

                # Analyze sentiment using Hugging Face
                sentiment_result = analyze_tweet_sentiment_with_huggingface(tweet.text)
                tweet_data['sentiment'] = sentiment_result['sentiment']
                tweet_data['sentiment_score'] = {
                    'positive': sentiment_result['positive_score'],
                    'neutral': sentiment_result['neutral_score'],
                    'negative': sentiment_result['negative_score']
                }

                tweets.append(tweet_data)

                # Check if we have enough tweets
                if len(tweets) >= count:
                    break

            # Update pagination token and remaining count
            pagination_token = getattr(next_response.meta, 'next_token', None)
            remaining = count - len(tweets)

        return tweets, user_info

    except tweepy.TweepyException as e:
        error_msg = str(e)
        if 'User not found' in error_msg or 'Could not find user' in error_msg:
            return [], {'error': f'User {username} not found'}
        elif 'Rate limit exceeded' in error_msg:
            return [], {'error': 'Twitter API rate limit exceeded. Please try again later.'}
        elif 'Authorization Error' in error_msg:
            return [], {'error': 'Twitter API authorization error. Please check your API credentials.'}
        elif 'Not authorized' in error_msg:
            return [], {'error': 'Not authorized to view this user\'s tweets. The account may be private.'}
        else:
            return [], {'error': f'Twitter API error: {error_msg}'}
    except Exception as e:
        return [], {'error': f'Error fetching tweets: {str(e)}'}

# Use v2 API by default, fall back to v1 if needed
def get_user_tweets(username: str, api_key: str, api_secret: str,
                   access_token: str, access_secret: str,
                   count: int = 100, include_rts: bool = False) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get tweets from a Twitter user

    Args:
        username: Twitter username or user ID
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret
        count: Maximum number of tweets to retrieve
        include_rts: Whether to include retweets

    Returns:
        A tuple of (tweets list, user info)
    """
    try:
        # First try with API v2
        tweets, user_info = get_user_tweets_v2(
            username, api_key, api_secret, access_token, access_secret, count, include_rts
        )

        # If we got an error but not a rate limit error, try with API v1
        if not tweets and user_info and 'error' in user_info and 'rate limit' not in user_info['error'].lower():
            print(f"Falling back to Twitter API v1.1: {user_info['error']}")
            return get_user_tweets_v1(
                username, api_key, api_secret, access_token, access_secret, count, include_rts
            )

        return tweets, user_info

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in get_user_tweets: {str(e)}", exc_info=True)
        # Fall back to v1 API
        try:
            return get_user_tweets_v1(
                username, api_key, api_secret, access_token, access_secret, count, include_rts
            )
        except Exception as e2:
            logger.error(f"Error in fallback to v1 API: {str(e2)}", exc_info=True)
            return [], {'error': f'Error fetching tweets: {str(e2)}'}

import threading

# Global cache for Twitter analysis results
_twitter_cache = {}

# Thread-local storage for models
_thread_local = threading.local()

# Global variable for the sentiment analyzer

def analyze_twitter_user(username: str, api_key: str, api_secret: str,
                        access_token: str, access_secret: str,
                        count: int = 100, include_rts: bool = False,
                        exclude_replies: bool = False) -> Dict[str, Any]:
    """
    Analyze tweets from a Twitter user with optimized processing and caching

    Args:
        username: Twitter username or user ID
        api_key: Twitter API key
        api_secret: Twitter API secret
        access_token: Twitter access token
        access_secret: Twitter access token secret
        count: Maximum number of tweets to analyze
        include_rts: Whether to include retweets
        exclude_replies: Whether to exclude replies

    Returns:
        A dictionary with analysis results
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed
    import numpy as np
    from collections import defaultdict

    global _twitter_cache, _thread_local

    # Remove @ symbol if present
    username = username.lstrip('@')

    # Create a cache key based on parameters
    cache_key = f"{username}_{count}_{include_rts}_{exclude_replies}"

    # Check if we have cached results
    if cache_key in _twitter_cache:
        # Return cached result with updated timestamp
        cached_result = _twitter_cache[cache_key].copy()
        cached_result['cached'] = True
        cached_result['metadata']['cache_time'] = time.time()
        return cached_result

    # Get tweets and user info
    tweets, user_info = get_user_tweets(
        username, api_key, api_secret, access_token, access_secret, count, include_rts
    )

    if not tweets and user_info and 'error' in user_info:
        return user_info

    # Process tweets in parallel for faster sentiment analysis
    # Only needed if sentiment analysis wasn't already done during fetching
    tweets_to_analyze = [t for t in tweets if 'sentiment' not in t]

    if tweets_to_analyze:
        # Define batch processing function
        def process_tweet_batch(batch):
            # Use thread-local storage for models
            if not hasattr(_thread_local, 'sentiment_model'):
                _thread_local.sentiment_model = True  # Placeholder for actual model initialization

            results = []
            for tweet in batch:
                try:
                    # Analyze sentiment if not already done
                    if 'sentiment' not in tweet:
                        sentiment_result = analyze_tweet_sentiment_with_huggingface(tweet['text'])
                        tweet['sentiment'] = sentiment_result['sentiment']
                        tweet['sentiment_score'] = {
                            'positive': sentiment_result['positive_score'],
                            'neutral': sentiment_result['neutral_score'],
                            'negative': sentiment_result['negative_score']
                        }
                    results.append(tweet)
                except Exception as e:
                    print(f"Error analyzing tweet {tweet.get('id', 'unknown')}: {str(e)}")
                    # Add with neutral sentiment as fallback
                    tweet['sentiment'] = 'neutral'
                    tweet['sentiment_score'] = {'positive': 0.33, 'neutral': 0.34, 'negative': 0.33}
                    results.append(tweet)
            return results

        # Determine optimal batch size and worker count
        total_tweets = len(tweets_to_analyze)
        if total_tweets <= 20:
            batch_size = total_tweets  # Process all at once for small sets
            max_workers = 1
        elif total_tweets <= 100:
            batch_size = 20  # Medium batch size
            max_workers = min(4, (total_tweets + 19) // 20)  # Up to 4 workers
        else:
            batch_size = 25  # Larger batch size
            max_workers = 8  # Maximum workers

        # Create batches
        batches = [tweets_to_analyze[i:i + batch_size] for i in range(0, total_tweets, batch_size)]

        # Process in parallel
        processed_tweets = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_batch = {executor.submit(process_tweet_batch, batch): i for i, batch in enumerate(batches)}
            for future in as_completed(future_to_batch):
                processed_tweets.extend(future.result())

        # Update the original tweets list with processed tweets
        tweet_map = {t['id']: t for t in processed_tweets}
        for i, tweet in enumerate(tweets):
            if tweet['id'] in tweet_map:
                tweets[i] = tweet_map[tweet['id']]

    # Calculate sentiment summary using numpy for speed
    sentiments = np.array([t.get('sentiment', 'neutral') for t in tweets])
    positive_count = np.sum(sentiments == 'positive')
    neutral_count = np.sum(sentiments == 'neutral')
    negative_count = np.sum(sentiments == 'negative')
    total = len(tweets)

    # Calculate percentages
    positive_percentage = float(positive_count / total if total > 0 else 0)
    neutral_percentage = float(neutral_count / total if total > 0 else 0)
    negative_percentage = float(negative_count / total if total > 0 else 0)

    # Prepare result
    result = {
        'user_info': user_info,
        'tweets': tweets,
        'sentiment_summary': {
            'positive': positive_percentage,
            'neutral': neutral_percentage,
            'negative': negative_percentage,
            'total_tweets': total
        }
    }

    # Add additional metadata
    result['metadata'] = {
        'include_retweets': include_rts,
        'exclude_replies': exclude_replies,
        'analysis_timestamp': time.time(),
        'api_version': 'v2',
        'processing_time': {
            'total': 0  # Will be updated below
        }
    }

    # Add to cache for future requests
    _twitter_cache[cache_key] = result

    return result

# Mock implementation for development without Twitter API keys
def mock_twitter_analysis(username: str) -> Dict[str, Any]:
    """
    Generate mock Twitter analysis results for development

    Args:
        username: Twitter username

    Returns:
        A dictionary with mock analysis results
    """
    # Mock user info
    user_info = {
        'id': '123456789',
        'name': f'{username.capitalize()} User',
        'screen_name': username,
        'description': f'This is a mock profile for @{username}',
        'followers_count': 1000 + hash(username) % 9000,
        'friends_count': 500 + hash(username) % 500,
        'statuses_count': 2000 + hash(username) % 8000,
        'profile_image_url': 'https://via.placeholder.com/128'
    }

    # Generate mock tweets
    tweets = []
    tweet_templates = [
        "Just tried the new {product} and it's absolutely amazing! #excited",
        "Can't believe how {adjective} today's {event} was. Definitely worth watching!",
        "Having some issues with {product} today. Anyone else experiencing this?",
        "The weather in {location} is {weather} today. Perfect for {activity}!",
        "Just finished reading {book}. It was {opinion}. Would recommend to {audience}.",
        "Attended {event} yesterday. The {aspect} was {quality}, but overall it was {overall}.",
        "Working on a new {project} today. Making {progress} progress!",
        "Just updated my {software} and now it's {state}. {emotion} about this change.",
        "The customer service at {company} is {quality}. They really {action} their customers.",
        "Can anyone recommend a good {product} for {purpose}? Looking to upgrade soon."
    ]

    products = ["smartphone", "laptop", "headphones", "coffee maker", "fitness tracker"]
    adjectives = ["amazing", "disappointing", "surprising", "ordinary", "fantastic"]
    events = ["conference", "concert", "webinar", "meeting", "workshop"]
    locations = ["New York", "London", "Tokyo", "Paris", "Sydney"]
    weather = ["sunny", "rainy", "cloudy", "windy", "perfect"]
    activities = ["hiking", "reading", "shopping", "working", "relaxing"]
    books = ["new novel", "biography", "self-help book", "technical guide", "classic"]
    opinions = ["insightful", "boring", "life-changing", "mediocre", "thought-provoking"]
    audiences = ["everyone", "tech enthusiasts", "casual readers", "professionals", "students"]
    aspects = ["venue", "content", "organization", "speakers", "food"]
    qualities = ["excellent", "terrible", "decent", "outstanding", "disappointing"]
    overalls = ["worth it", "a waste of time", "memorable", "just okay", "fantastic"]
    projects = ["website", "app", "presentation", "report", "design"]
    progress = ["great", "slow", "steady", "incredible", "minimal"]
    software = ["phone", "computer", "app", "operating system", "browser"]
    states = ["faster", "slower", "better", "worse", "completely different"]
    emotions = ["Happy", "Frustrated", "Excited", "Confused", "Impressed"]
    companies = ["Amazon", "Apple", "Google", "Microsoft", "Netflix"]
    actions = ["value", "ignore", "appreciate", "understand", "support"]
    purposes = ["work", "gaming", "streaming", "productivity", "travel"]

    # Generate tweets with varying sentiment
    for i in range(20):
        # Select a template based on the username and index
        template_index = (hash(username) + i) % len(tweet_templates)
        tweet_text = tweet_templates[template_index]

        # Replace placeholders with random values
        tweet_text = tweet_text.replace("{product}", products[(hash(username) + i) % len(products)])
        tweet_text = tweet_text.replace("{adjective}", adjectives[(hash(username) + i) % len(adjectives)])
        tweet_text = tweet_text.replace("{event}", events[(hash(username) + i) % len(events)])
        tweet_text = tweet_text.replace("{location}", locations[(hash(username) + i) % len(locations)])
        tweet_text = tweet_text.replace("{weather}", weather[(hash(username) + i) % len(weather)])
        tweet_text = tweet_text.replace("{activity}", activities[(hash(username) + i) % len(activities)])
        tweet_text = tweet_text.replace("{book}", books[(hash(username) + i) % len(books)])
        tweet_text = tweet_text.replace("{opinion}", opinions[(hash(username) + i) % len(opinions)])
        tweet_text = tweet_text.replace("{audience}", audiences[(hash(username) + i) % len(audiences)])
        tweet_text = tweet_text.replace("{aspect}", aspects[(hash(username) + i) % len(aspects)])
        tweet_text = tweet_text.replace("{quality}", qualities[(hash(username) + i) % len(qualities)])
        tweet_text = tweet_text.replace("{overall}", overalls[(hash(username) + i) % len(overalls)])
        tweet_text = tweet_text.replace("{project}", projects[(hash(username) + i) % len(projects)])
        tweet_text = tweet_text.replace("{progress}", progress[(hash(username) + i) % len(progress)])
        tweet_text = tweet_text.replace("{software}", software[(hash(username) + i) % len(software)])
        tweet_text = tweet_text.replace("{state}", states[(hash(username) + i) % len(states)])
        tweet_text = tweet_text.replace("{emotion}", emotions[(hash(username) + i) % len(emotions)])
        tweet_text = tweet_text.replace("{company}", companies[(hash(username) + i) % len(companies)])
        tweet_text = tweet_text.replace("{action}", actions[(hash(username) + i) % len(actions)])
        tweet_text = tweet_text.replace("{purpose}", purposes[(hash(username) + i) % len(purposes)])

        # Analyze sentiment
        sentiment_result = analyze_sentiment(tweet_text)

        # Create tweet object
        tweet = {
            'id': f'{i + 1}',
            'created_at': f'2023-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T12:00:00Z',
            'text': tweet_text,
            'author': f'@{username}',
            'user_id': user_info['id'],  # Add user_id from user_info
            'retweet_count': i % 10,
            'favorite_count': i % 20,
            'is_retweet': i % 5 == 0,
            'sentiment': sentiment_result['sentiment'],
            'sentiment_score': {
                'positive': sentiment_result['positive_score'],
                'neutral': sentiment_result['neutral_score'],
                'negative': sentiment_result['negative_score']
            }
        }

        tweets.append(tweet)

    # Calculate sentiment summary
    positive_count = sum(1 for t in tweets if t['sentiment'] == 'positive')
    neutral_count = sum(1 for t in tweets if t['sentiment'] == 'neutral')
    negative_count = sum(1 for t in tweets if t['sentiment'] == 'negative')
    total = len(tweets)

    sentiment_summary = {
        'positive': positive_count / total if total > 0 else 0,
        'neutral': neutral_count / total if total > 0 else 0,
        'negative': negative_count / total if total > 0 else 0,
        'total_tweets': total
    }

    # Prepare result
    result = {
        'user_info': user_info,
        'tweets': tweets,
        'sentiment_summary': sentiment_summary
    }

    return result
