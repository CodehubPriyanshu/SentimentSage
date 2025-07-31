"""
Enhanced sentiment analysis with multilingual support and emoji interpretation
"""
import logging
import re
from typing import Dict, List, Any, Tuple, Optional
from flask import current_app
# import emoji  # Temporarily commented out for testing
import numpy as np

from .language_detection import (
    detect_language,
    translate_to_english,
    extract_emojis,
    interpret_emojis,
    preprocess_text,
    detect_emotions,
    analyze_text_with_language_detection
)

from .huggingface_sentiment import analyze_sentiment_huggingface
from .sentiment_analysis import analyze_sentiment

logger = logging.getLogger(__name__)

def analyze_sentiment_enhanced(text: str) -> Dict[str, Any]:
    """
    Enhanced sentiment analysis with language detection and emoji interpretation

    Args:
        text: The text to analyze

    Returns:
        Dictionary with sentiment analysis results
    """
    if not text or not text.strip():
        return {
            'sentiment': 'neutral',
            'positive_score': 0.0,
            'negative_score': 0.0,
            'neutral_score': 1.0,
            'explanation': "Empty text provided.",
            'language': 'en',
            'emotions': {},
            'has_emojis': False
        }

    # Get language and emoji analysis
    language_analysis = analyze_text_with_language_detection(text)

    # Use Hugging Face for sentiment analysis on the translated text
    try:
        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        if api_key:
            sentiment_result = analyze_sentiment_huggingface(language_analysis['translated_text'])
        else:
            # Fall back to basic sentiment analysis
            sentiment_result = analyze_sentiment(language_analysis['translated_text'])
    except Exception as e:
        logger.warning(f"Error in Hugging Face sentiment analysis: {str(e)}")
        # Fall back to basic sentiment analysis
        sentiment_result = analyze_sentiment(language_analysis['translated_text'])

    # Combine text sentiment with emoji sentiment
    emoji_sentiment = language_analysis['emoji_sentiment']
    has_emojis = len(language_analysis['emojis']) > 0

    if has_emojis:
        # Weight: 70% text sentiment, 30% emoji sentiment
        combined_positive = sentiment_result['positive_score'] * 0.7 + emoji_sentiment['positive'] * 0.3
        combined_neutral = sentiment_result['neutral_score'] * 0.7 + emoji_sentiment['neutral'] * 0.3
        combined_negative = sentiment_result['negative_score'] * 0.7 + emoji_sentiment['negative'] * 0.3

        # Normalize scores
        total = combined_positive + combined_neutral + combined_negative
        if total > 0:
            combined_positive /= total
            combined_neutral /= total
            combined_negative /= total
    else:
        combined_positive = sentiment_result['positive_score']
        combined_neutral = sentiment_result['neutral_score']
        combined_negative = sentiment_result['negative_score']

    # Determine overall sentiment
    if combined_positive > combined_negative and combined_positive > combined_neutral:
        sentiment = 'positive'
    elif combined_negative > combined_positive and combined_negative > combined_neutral:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    # Generate explanation
    if language_analysis['language'] != 'en':
        lang_explanation = f"This text is in {language_analysis['language']} and was translated for analysis. "
    else:
        lang_explanation = ""

    if has_emojis:
        emoji_explanation = f"The text contains {len(language_analysis['emojis'])} emojis which were also analyzed. "
    else:
        emoji_explanation = ""

    if sentiment == 'positive':
        sentiment_explanation = f"The overall sentiment is positive with {combined_positive:.2%} confidence."
    elif sentiment == 'negative':
        sentiment_explanation = f"The overall sentiment is negative with {combined_negative:.2%} confidence."
    else:
        sentiment_explanation = "The overall sentiment is neutral or balanced between positive and negative elements."

    explanation = lang_explanation + emoji_explanation + sentiment_explanation

    # Return combined results
    return {
        'sentiment': sentiment,
        'positive_score': combined_positive,
        'negative_score': combined_negative,
        'neutral_score': combined_neutral,
        'explanation': explanation,
        'language': language_analysis['language'],
        'emotions': language_analysis['emotions'],
        'has_emojis': has_emojis,
        'emojis': language_analysis['emojis'] if has_emojis else [],
        'original_text': language_analysis['original_text'],
        'translated_text': language_analysis['translated_text'] if language_analysis['language'] != 'en' else None
    }

def analyze_multiple_texts_enhanced(texts: List[str]) -> Dict[str, Any]:
    """
    Analyze multiple texts with enhanced sentiment analysis

    Args:
        texts: List of texts to analyze

    Returns:
        Dictionary with aggregated sentiment analysis results
    """
    # Handle empty or None input
    if not texts:
        return {
            'positive': 0.33,  # Default to balanced distribution
            'neutral': 0.34,
            'negative': 0.33,
            'total': 0,
            'sentiments': [],
            'emotions': {
                'joy': 0.0,
                'sadness': 0.0,
                'anger': 0.0,
                'fear': 0.0,
                'surprise': 0.0,
                'disgust': 0.0
            },
            'languages': {}
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
                'sentiments': [],
                'emotions': {
                    'joy': 0.0,
                    'sadness': 0.0,
                    'anger': 0.0,
                    'fear': 0.0,
                    'surprise': 0.0,
                    'disgust': 0.0
                },
                'languages': {}
            }

        # Analyze texts in parallel for better performance
        import time
        from concurrent.futures import ThreadPoolExecutor

        start_time = time.time()
        max_texts = min(len(filtered_texts), 100)  # Limit to 100 texts

        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(analyze_sentiment_enhanced, filtered_texts[:max_texts]))

        processing_time = time.time() - start_time
        logger.info(f"Processed {len(results)} texts in {processing_time:.2f} seconds")

        # Count sentiment categories
        positive_count = sum(1 for r in results if r['sentiment'] == 'positive')
        neutral_count = sum(1 for r in results if r['sentiment'] == 'neutral')
        negative_count = sum(1 for r in results if r['sentiment'] == 'negative')
        total = len(results)

        # Calculate percentages
        positive_percentage = positive_count / total if total > 0 else 0.33
        neutral_percentage = neutral_count / total if total > 0 else 0.34
        negative_percentage = negative_count / total if total > 0 else 0.33

        # Aggregate emotions
        emotions = {
            'joy': 0.0,
            'sadness': 0.0,
            'anger': 0.0,
            'fear': 0.0,
            'surprise': 0.0,
            'disgust': 0.0
        }

        for result in results:
            for emotion, score in result.get('emotions', {}).items():
                if emotion in emotions:
                    emotions[emotion] += score

        # Normalize emotions
        for emotion in emotions:
            emotions[emotion] /= total if total > 0 else 1

        # Count languages
        languages = {}
        for result in results:
            lang = result.get('language', 'unknown')
            languages[lang] = languages.get(lang, 0) + 1

        # Convert to percentages
        for lang in languages:
            languages[lang] = (languages[lang] / total) * 100 if total > 0 else 0

        return {
            'positive': positive_percentage,
            'neutral': neutral_percentage,
            'negative': negative_percentage,
            'total': total,
            'sentiments': results,
            'emotions': emotions,
            'languages': languages,
            'processing_time': processing_time
        }
    except Exception as e:
        logger.warning(f"Error analyzing multiple texts: {str(e)}")
        # Return default values in case of error
        return {
            'positive': 0.33,
            'neutral': 0.34,
            'negative': 0.33,
            'total': len(texts),
            'sentiments': [],
            'emotions': {
                'joy': 0.0,
                'sadness': 0.0,
                'anger': 0.0,
                'fear': 0.0,
                'surprise': 0.0,
                'disgust': 0.0
            },
            'languages': {'unknown': 100.0},
            'processing_time': 0.0,
            'error': str(e)
        }
