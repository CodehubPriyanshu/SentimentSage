"""
Utility functions for YouTube comment analysis
"""
import os
import json
import re
import threading
from typing import Dict, List, Any, Tuple, Optional, Generator, Union
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from .sentiment_analysis import analyze_sentiment, analyze_multiple_texts
from .huggingface_sentiment import analyze_sentiment_huggingface, analyze_multiple_texts_huggingface, analyze_youtube_engagement
from .enhanced_sentiment import analyze_sentiment_enhanced, analyze_multiple_texts_enhanced
from .language_detection import detect_language, translate_to_english, extract_emojis, interpret_emojis
from .topic_extraction import extract_key_topics, extract_topics_from_comments, get_topic_names

def extract_video_id(url: str) -> Optional[str]:
    """
    Extract the YouTube video ID from a URL

    Args:
        url: The YouTube video URL

    Returns:
        The video ID or None if not found
    """
    # Regular expressions for different YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&\?\n]+)',
        r'(?:youtube\.com\/shorts\/)([^&\?\n]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return None

def get_video_info(video_id: str, api_key: str) -> Dict[str, Any]:
    """
    Get information about a YouTube video

    Args:
        video_id: The YouTube video ID
        api_key: The YouTube API key

    Returns:
        A dictionary with video information
    """
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)

        # Get video details
        video_response = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()

        if not video_response['items']:
            return {'error': 'Video not found'}

        video_data = video_response['items'][0]
        snippet = video_data['snippet']
        statistics = video_data['statistics']

        return {
            'video_id': video_id,
            'title': snippet.get('title', ''),
            'channel': snippet.get('channelTitle', ''),
            'published_at': snippet.get('publishedAt', ''),
            'view_count': int(statistics.get('viewCount', 0)),
            'like_count': int(statistics.get('likeCount', 0)),
            'comment_count': int(statistics.get('commentCount', 0)),
            'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url', '')
        }

    except HttpError as e:
        return {'error': f'YouTube API error: {str(e)}'}
    except Exception as e:
        return {'error': f'Error fetching video info: {str(e)}'}

def get_video_comments(video_id: str, api_key: str, max_comments: int = 100) -> List[Dict[str, Any]]:
    """
    Get comments for a YouTube video

    Args:
        video_id: The YouTube video ID
        api_key: The YouTube API key
        max_comments: Maximum number of comments to retrieve

    Returns:
        A list of comment dictionaries
    """
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)

        comments = []
        next_page_token = None

        while len(comments) < max_comments:
            # Get comments
            response = youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=min(100, max_comments - len(comments)),
                pageToken=next_page_token,
                textFormat='plainText'
            ).execute()

            # Process comments
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'id': item['id'],
                    'text': comment['textDisplay'],
                    'author': comment['authorDisplayName'],
                    'published_at': comment['publishedAt'],
                    'like_count': comment['likeCount']
                })

            # Check if there are more comments
            next_page_token = response.get('nextPageToken')
            if not next_page_token or len(comments) >= max_comments:
                break

        return comments

    except HttpError as e:
        if 'commentsDisabled' in str(e):
            return [{'error': 'Comments are disabled for this video'}]
        return [{'error': f'YouTube API error: {str(e)}'}]
    except Exception as e:
        return [{'error': f'Error fetching comments: {str(e)}'}]

def mock_youtube_analysis(video_url: str) -> Dict[str, Any]:
    """
    Generate mock YouTube analysis when API key is not available

    Args:
        video_url: The YouTube video URL

    Returns:
        A dictionary with mock analysis results
    """
    # Extract video ID
    video_id = extract_video_id(video_url)
    if not video_id:
        return {'error': 'Invalid YouTube URL'}

    # Create mock video info
    video_info = {
        'video_id': video_id,
        'title': f'Sample Video {video_id}',
        'channel': 'Sample Channel',
        'published_at': '2023-01-01T00:00:00Z',
        'view_count': 10000,
        'like_count': 500,
        'comment_count': 100,
        'thumbnail': f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
    }

    # Create mock comments
    comments = []
    for i in range(10):
        sentiment = 'positive' if i % 3 == 0 else ('neutral' if i % 3 == 1 else 'negative')
        comments.append({
            'id': f'comment_{i}',
            'text': f'This is a sample {sentiment} comment #{i} for testing purposes.',
            'author': f'User_{i}',
            'published_at': '2023-01-01T00:00:00Z',
            'like_count': i * 5,
            'sentiment': sentiment,
            'sentiment_score': {
                'positive': 0.7 if sentiment == 'positive' else 0.1,
                'neutral': 0.7 if sentiment == 'neutral' else 0.1,
                'negative': 0.7 if sentiment == 'negative' else 0.1
            }
        })

    # Calculate sentiment distribution
    positive_count = sum(1 for c in comments if c['sentiment'] == 'positive')
    neutral_count = sum(1 for c in comments if c['sentiment'] == 'neutral')
    negative_count = sum(1 for c in comments if c['sentiment'] == 'negative')
    total = len(comments)

    # Create mock engagement sentiment
    engagement_sentiment = {
        'positive': 0.6,
        'neutral': 0.3,
        'negative': 0.1
    }

    # Create mock topics
    mock_topics = [
        {
            'id': 0,
            'words': ['content', 'quality', 'production', 'value', 'editing'],
            'weights': [0.3, 0.25, 0.2, 0.15, 0.1]
        },
        {
            'id': 1,
            'words': ['information', 'helpful', 'educational', 'learning', 'knowledge'],
            'weights': [0.35, 0.25, 0.2, 0.1, 0.1]
        },
        {
            'id': 2,
            'words': ['entertainment', 'funny', 'enjoyable', 'humor', 'laugh'],
            'weights': [0.4, 0.3, 0.15, 0.1, 0.05]
        }
    ]

    # Create mock topic names
    mock_topic_names = ['content/quality', 'information/helpful', 'entertainment/funny']

    # Return mock result
    return {
        'video_info': video_info,
        'comments': comments,
        'sentiment_summary': {
            'positive': positive_count / total,
            'neutral': neutral_count / total,
            'negative': negative_count / total,
            'total_comments': total
        },
        'engagement_metrics': {
            'view_count': video_info['view_count'],
            'like_count': video_info['like_count'],
            'comment_count': video_info['comment_count'],
            'engagement_sentiment': engagement_sentiment
        },
        'emotions': {
            'joy': 0.4,
            'sadness': 0.1,
            'anger': 0.1,
            'fear': 0.05,
            'surprise': 0.25,
            'disgust': 0.1
        },
        'languages': {'en': 100.0},
        'multilingual': False,
        'emoji_count': 3,
        'key_topics': mock_topics,
        'topic_names': mock_topic_names
    }

# Global cache for previously analyzed videos
_video_cache = {}

# Create a thread-local cache for sentiment analysis
_thread_local = threading.local()

def analyze_youtube_comments(video_url: str, api_key: str, max_comments: int = 100, stream_results: bool = False) -> Union[Dict[str, Any], Generator[Dict[str, Any], None, None]]:
    """
    Analyze comments for a YouTube video with highly optimized parallel processing

    Args:
        video_url: The YouTube video URL
        api_key: The YouTube API key
        max_comments: Maximum number of comments to analyze
        stream_results: If True, returns partial results as they become available

    Returns:
        A dictionary with analysis results. If stream_results is True, returns partial results
        with a 'processing_status' field indicating the current stage.
    """
    import time
    from concurrent.futures import ThreadPoolExecutor, as_completed
    from collections import defaultdict
    import numpy as np

    global _video_cache, _thread_local

    # Check if this video has been analyzed before
    video_id = extract_video_id(video_url)
    cache_key = f"{video_id}_{max_comments}"

    if cache_key in _video_cache:
        # Return cached result with a timestamp update
        cached_result = _video_cache[cache_key].copy()
        cached_result['cached'] = True
        cached_result['cache_time'] = time.time()
        return cached_result

    start_time = time.time()

    # If API key is empty, use mock data
    if not api_key:
        mock_result = mock_youtube_analysis(video_url)
        _video_cache[cache_key] = mock_result
        return mock_result

    # Extract video ID
    if not video_id:
        return {'error': 'Invalid YouTube URL'}

    # Get video info - this is fast, so do it first
    video_info = get_video_info(video_id, api_key)
    if 'error' in video_info:
        return video_info

    # Prepare initial result with video info
    result = {
        'video_info': video_info,
        'processing_status': 'fetching_comments',
        'processing_time': {
            'video_info': time.time() - start_time
        },
        'progress': 10  # 10% progress after getting video info
    }

    # Return partial results if streaming is enabled
    if stream_results:
        yield result.copy()

    # Get comments with optimized fetching
    comments_start = time.time()
    comments = get_video_comments(video_id, api_key, max_comments)
    if comments and 'error' in comments[0]:
        return comments[0]

    result['processing_time']['comments_fetch'] = time.time() - comments_start
    result['processing_status'] = 'analyzing_sentiment'
    result['progress'] = 25  # 25% progress after fetching comments

    # Return partial results if streaming is enabled
    if stream_results:
        yield result.copy()

    # Optimized batch processing with dynamic sizing
    # Use larger batches for more comments to reduce overhead
    total_comments = len(comments)

    # Determine optimal batch size based on total comments
    if total_comments <= 50:
        batch_size = total_comments  # Process all at once for small sets
    elif total_comments <= 200:
        batch_size = 50  # Medium batch size for medium sets
    else:
        batch_size = 100  # Large batch size for large sets

    # Process all comments in optimized parallel batches
    sentiment_start = time.time()

    # Prepare batches
    batches = [comments[i:i + batch_size] for i in range(0, total_comments, batch_size)]

    # Define an optimized chunk processor with caching
    def process_chunk(chunk, chunk_index):
        # Use thread-local storage for models to avoid reloading
        if not hasattr(_thread_local, 'sentiment_model'):
            # Initialize models for this thread
            _thread_local.sentiment_model = True  # Placeholder for actual model initialization

        # Extract all texts at once
        chunk_texts = [comment['text'] for comment in chunk]

        # Analyze all texts in the chunk at once
        try:
            chunk_results = analyze_multiple_texts_enhanced(chunk_texts)

            # Process results in a more efficient way
            for i, comment in enumerate(chunk):
                if i < len(chunk_results['sentiments']):
                    sentiment_data = chunk_results['sentiments'][i]

                    # Update comment with sentiment data using efficient dict updates
                    comment.update({
                        'sentiment': sentiment_data['sentiment'],
                        'sentiment_score': {
                            'positive': sentiment_data['positive_score'],
                            'neutral': sentiment_data['neutral_score'],
                            'negative': sentiment_data['negative_score']
                        },
                        'language': sentiment_data.get('language', 'en'),
                        'emotions': sentiment_data.get('emotions', {}),
                        'has_emojis': sentiment_data.get('has_emojis', False),
                        'emojis': sentiment_data.get('emojis', [])
                    })

                    # Add translated text if available
                    if sentiment_data.get('translated_text'):
                        comment['translated_text'] = sentiment_data['translated_text']

            return {
                'chunk_index': chunk_index,
                'comments': chunk,
                'success': True
            }
        except Exception as e:
            # Handle errors gracefully with proper logging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing chunk {chunk_index}: {str(e)}", exc_info=True)

            # Return partial results if possible
            return {
                'chunk_index': chunk_index,
                'comments': chunk,
                'success': False,
                'error': str(e)
            }

    # Use ThreadPoolExecutor with more workers for faster processing
    max_workers = min(8, len(batches))  # Use up to 8 workers, but no more than needed

    all_comments = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_chunk = {executor.submit(process_chunk, chunk, i): i for i, chunk in enumerate(batches)}

        # Process results as they complete
        completed_chunks = 0
        for future in as_completed(future_to_chunk):
            chunk_result = future.result()
            if chunk_result['success']:
                all_comments.extend(chunk_result['comments'])

            # Update progress based on completed chunks
            completed_chunks += 1
            progress_pct = 25 + (completed_chunks / len(batches)) * 40  # 25-65% range for sentiment analysis
            result['progress'] = min(65, progress_pct)  # Cap at 65%

            # Stream partial results if enabled
            if stream_results and completed_chunks % max(1, len(batches) // 3) == 0:  # Update every ~third of processing
                result['processing_status'] = f'analyzing_sentiment ({completed_chunks}/{len(batches)} batches)'
                result['partial_comments'] = all_comments.copy()
                yield result.copy()

    # Sort comments back into original order if needed
    # all_comments.sort(key=lambda x: comments.index(x))  # Uncomment if order matters

    result['processing_time']['sentiment_analysis'] = time.time() - sentiment_start
    result['processing_status'] = 'analyzing_engagement'
    result['progress'] = 70  # 70% progress after sentiment analysis

    # Return partial results with sentiment data if streaming is enabled
    if stream_results:
        # Add partial sentiment summary
        sentiments = np.array([c.get('sentiment', 'neutral') for c in all_comments])
        positive_count = np.sum(sentiments == 'positive')
        neutral_count = np.sum(sentiments == 'neutral')
        negative_count = np.sum(sentiments == 'negative')
        total = len(all_comments)

        result['partial_sentiment_summary'] = {
            'positive': positive_count / total if total > 0 else 0,
            'neutral': neutral_count / total if total > 0 else 0,
            'negative': negative_count / total if total > 0 else 0,
            'total_comments': total
        }
        result['comments'] = all_comments[:min(10, len(all_comments))]  # Send a few sample comments
        yield result.copy()

    # Calculate sentiment distribution using numpy for speed
    sentiments = np.array([c.get('sentiment', 'neutral') for c in all_comments])
    positive_count = np.sum(sentiments == 'positive')
    neutral_count = np.sum(sentiments == 'neutral')
    negative_count = np.sum(sentiments == 'negative')
    total = len(all_comments)

    # Analyze video engagement metrics (likes, views, comments)
    engagement_start = time.time()
    engagement_sentiment = analyze_youtube_engagement(video_info)
    result['processing_time']['engagement_analysis'] = time.time() - engagement_start

    # Combine comment sentiment with engagement metrics
    # Weight: 70% comments, 30% engagement
    combined_positive = (positive_count / total if total > 0 else 0) * 0.7 + engagement_sentiment['positive'] * 0.3
    combined_neutral = (neutral_count / total if total > 0 else 0) * 0.7 + engagement_sentiment['neutral'] * 0.3
    combined_negative = (negative_count / total if total > 0 else 0) * 0.7 + engagement_sentiment['negative'] * 0.3

    # Calculate emotions and languages using defaultdict for efficiency
    emotions = defaultdict(float)
    languages = defaultdict(int)
    emoji_count = 0

    # Process all comments to extract emotions, languages, and emoji counts
    for comment in all_comments:
        # Add emotions
        for emotion, score in comment.get('emotions', {}).items():
            emotions[emotion] += score

        # Count languages
        lang = comment.get('language', 'unknown')
        languages[lang] += 1

        # Count emojis
        if comment.get('has_emojis', False):
            emoji_count += len(comment.get('emojis', []))

    # Normalize emotions
    for emotion in emotions:
        emotions[emotion] /= total if total > 0 else 1

    # Convert language counts to percentages
    for lang in languages:
        languages[lang] = (languages[lang] / total) * 100 if total > 0 else 0

    # Calculate total processing time
    total_processing_time = time.time() - start_time
    result['processing_time']['total'] = total_processing_time

    # Extract key topics from comments
    topics_start = time.time()
    result['processing_status'] = 'extracting_topics'
    result['progress'] = 85  # 85% progress when starting topic extraction

    # Return partial results with engagement data if streaming is enabled
    if stream_results:
        result['sentiment_summary'] = {
            'positive': combined_positive,
            'neutral': combined_neutral,
            'negative': combined_negative,
            'total_comments': total
        }
        result['engagement_metrics'] = {
            'view_count': video_info.get('view_count', 0),
            'like_count': video_info.get('like_count', 0),
            'comment_count': video_info.get('comment_count', 0),
            'engagement_sentiment': engagement_sentiment
        }
        result['emotions'] = dict(emotions)
        result['languages'] = dict(languages)
        yield result.copy()

    # Extract topics from all comments
    topics = extract_topics_from_comments(all_comments, num_topics=5)

    # Generate topic names
    topic_names = []
    for topic in topics:
        # Create a name from the top 2 words in the topic
        if len(topic['words']) >= 2:
            topic_names.append(f"{topic['words'][0]}/{topic['words'][1]}")
        elif len(topic['words']) == 1:
            topic_names.append(topic['words'][0])
        else:
            topic_names.append(f"Topic {topic['id']}")

    result['processing_time']['topic_extraction'] = time.time() - topics_start

    # Prepare final result
    final_result = {
        'video_info': video_info,
        'comments': all_comments,
        'sentiment_summary': {
            'positive': combined_positive,
            'neutral': combined_neutral,
            'negative': combined_negative,
            'total_comments': total
        },
        'engagement_metrics': {
            'view_count': video_info.get('view_count', 0),
            'like_count': video_info.get('like_count', 0),
            'comment_count': video_info.get('comment_count', 0),
            'engagement_sentiment': engagement_sentiment
        },
        'emotions': dict(emotions),  # Convert defaultdict to regular dict
        'languages': dict(languages),  # Convert defaultdict to regular dict
        'multilingual': len(languages) > 1,
        'emoji_count': emoji_count,
        'key_topics': topics,
        'topic_names': topic_names,
        'processing_time': result['processing_time'],
        'processing_status': 'completed'
    }

    # Cache the result for future requests
    _video_cache[cache_key] = final_result

    # Final update with 100% progress if streaming
    if stream_results:
        final_result['progress'] = 100
        yield final_result
    else:
        return final_result
