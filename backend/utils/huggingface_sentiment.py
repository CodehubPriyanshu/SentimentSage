"""
Utility functions for sentiment analysis using Hugging Face
"""
import requests
import logging
from typing import Dict, List, Any, Optional
from flask import current_app

logger = logging.getLogger(__name__)

def analyze_sentiment_huggingface(text: str) -> Dict[str, Any]:
    """
    Analyze the sentiment of a text using Hugging Face API

    Args:
        text: The text to analyze

    Returns:
        A dictionary with sentiment analysis results
    """
    # Handle empty text
    if not text or not text.strip():
        return {
            'sentiment': 'neutral',
            'positive_score': 0.0,
            'negative_score': 0.0,
            'neutral_score': 1.0,
            'explanation': "Empty text provided."
        }

    # Limit text length to avoid API issues
    if len(text) > 1000:
        text = text[:1000] + "..."

    # Check for API key
    try:
        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
    except Exception:
        # If we're outside of a Flask context
        api_key = None

    if not api_key:
        logger.warning("Hugging Face API key not found, using fallback sentiment analysis")
        from .sentiment_analysis import analyze_sentiment
        return analyze_sentiment(text)

    try:
        headers = {
            "Authorization": f"Bearer {api_key}"
        }

        # Using a sentiment analysis model
        model_url = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"

        response = requests.post(
            model_url,
            headers=headers,
            json={"inputs": text},
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()

            # Process the result
            if isinstance(result, list) and len(result) > 0:
                sentiment_data = result[0]

                # Extract sentiment labels and scores
                positive_score = 0.0
                negative_score = 0.0

                for item in sentiment_data:
                    if item['label'] == 'POSITIVE':
                        positive_score = item['score']
                    elif item['label'] == 'NEGATIVE':
                        negative_score = item['score']

                # Calculate neutral score
                neutral_score = 1.0 - (positive_score + negative_score)
                if neutral_score < 0:
                    neutral_score = 0.0

                # Determine overall sentiment
                if positive_score > negative_score and positive_score > neutral_score:
                    sentiment = 'positive'
                elif negative_score > positive_score and negative_score > neutral_score:
                    sentiment = 'negative'
                else:
                    sentiment = 'neutral'

                # Generate explanation
                if sentiment == 'positive':
                    explanation = f"This text has a positive tone with {positive_score:.2%} confidence."
                elif sentiment == 'negative':
                    explanation = f"This text has a negative tone with {negative_score:.2%} confidence."
                else:
                    explanation = "This text appears to have a neutral tone or balanced positive and negative elements."

                return {
                    'sentiment': sentiment,
                    'positive_score': positive_score,
                    'negative_score': negative_score,
                    'neutral_score': neutral_score,
                    'explanation': explanation
                }

        # If we get here, something went wrong with the API call
        logger.warning(f"Hugging Face API error: {response.status_code} - {response.text}")
        from .sentiment_analysis import analyze_sentiment
        return analyze_sentiment(text)

    except Exception as e:
        logger.warning(f"Error calling Hugging Face API: {str(e)}")
        # Fall back to basic sentiment analysis
        from .sentiment_analysis import analyze_sentiment
        return analyze_sentiment(text)

def analyze_multiple_texts_huggingface(texts: List[str]) -> Dict[str, Any]:
    """
    Analyze multiple texts and return sentiment distribution

    Args:
        texts: List of texts to analyze

    Returns:
        A dictionary with sentiment distribution
    """
    # Handle empty or None input
    if not texts:
        return {
            'positive': 0.33,  # Default to balanced distribution
            'neutral': 0.34,
            'negative': 0.33,
            'total': 0,
            'sentiments': []
        }

    try:
        # Filter out empty texts
        filtered_texts = [text for text in texts if text and text.strip()]

        if not filtered_texts:
            return {
                'positive': 0.33,
                'neutral': 0.34,
                'negative': 0.33,
                'total': 0,
                'sentiments': []
            }

        # Analyze each text with a limit to avoid overloading the API
        max_texts = min(len(filtered_texts), 50)  # Limit to 50 texts
        results = [analyze_sentiment_huggingface(text) for text in filtered_texts[:max_texts]]

        # Count sentiment categories
        positive_count = sum(1 for r in results if r['sentiment'] == 'positive')
        neutral_count = sum(1 for r in results if r['sentiment'] == 'neutral')
        negative_count = sum(1 for r in results if r['sentiment'] == 'negative')
        total = len(results)

        # Calculate percentages
        positive_percentage = positive_count / total if total > 0 else 0.33
        neutral_percentage = neutral_count / total if total > 0 else 0.34
        negative_percentage = negative_count / total if total > 0 else 0.33

        return {
            'positive': positive_percentage,
            'neutral': neutral_percentage,
            'negative': negative_percentage,
            'total': total,
            'sentiments': results
        }
    except Exception as e:
        logger.warning(f"Error analyzing multiple texts: {str(e)}")
        # Return default values in case of error
        return {
            'positive': 0.33,
            'neutral': 0.34,
            'negative': 0.33,
            'total': len(texts),
            'sentiments': [analyze_sentiment_huggingface(text) for text in texts[:3]]  # Just analyze a few for the response
        }

def analyze_youtube_engagement(video_info: Dict[str, Any]) -> Dict[str, float]:
    """
    Analyze YouTube engagement metrics (likes, views, comments)

    Args:
        video_info: Dictionary containing video information

    Returns:
        A dictionary with engagement sentiment scores
    """
    try:
        # Extract metrics
        view_count = int(video_info.get('view_count', 0))
        like_count = int(video_info.get('like_count', 0))
        comment_count = int(video_info.get('comment_count', 0))

        # Calculate engagement rates
        if view_count > 0:
            like_rate = like_count / view_count
            comment_rate = comment_count / view_count
        else:
            like_rate = 0
            comment_rate = 0

        # Normalize rates to a 0-1 scale
        # These thresholds can be adjusted based on typical YouTube engagement rates
        normalized_like_rate = min(1.0, like_rate * 100)  # 1% like rate is considered very good
        normalized_comment_rate = min(1.0, comment_rate * 100)  # 1% comment rate is considered very good

        # Calculate sentiment scores based on engagement
        # Higher engagement generally indicates more positive sentiment
        positive_score = normalized_like_rate * 0.7 + normalized_comment_rate * 0.3
        negative_score = 0.1  # Base negative score
        neutral_score = 1.0 - positive_score - negative_score

        return {
            'positive': positive_score,
            'neutral': neutral_score,
            'negative': negative_score
        }
    except Exception as e:
        logger.error(f"Error analyzing YouTube engagement: {str(e)}")
        return {
            'positive': 0.33,
            'neutral': 0.34,
            'negative': 0.33
        }
