"""
Utility functions for language detection and multilingual processing
"""
import re
import logging
from typing import Dict, List, Any, Tuple, Optional
import emoji
from langdetect import detect, LangDetectException
from googletrans import Translator
from flask import current_app

logger = logging.getLogger(__name__)

# Initialize translator
translator = Translator()

def detect_language(text: str) -> str:
    """
    Detect the language of a text

    Args:
        text: The text to analyze

    Returns:
        The language code (e.g., 'en', 'es', 'fr')
    """
    if not text or len(text.strip()) < 3:
        return 'en'  # Default to English for very short texts

    try:
        return detect(text)
    except LangDetectException:
        logger.warning(f"Could not detect language for text: {text[:50]}...")
        return 'en'  # Default to English

def translate_to_english(text: str, source_lang: Optional[str] = None) -> str:
    """
    Translate text to English for consistent sentiment analysis

    Args:
        text: The text to translate
        source_lang: The source language code (if known)

    Returns:
        The translated text in English
    """
    if not text or len(text.strip()) < 3:
        return text

    # Skip translation if already in English
    if source_lang == 'en':
        return text

    try:
        if not source_lang:
            source_lang = detect_language(text)

        if source_lang == 'en':
            return text

        translation = translator.translate(text, src=source_lang, dest='en')
        return translation.text
    except Exception as e:
        logger.warning(f"Translation error: {str(e)} for text: {text[:50]}...")
        return text  # Return original text if translation fails

def extract_emojis(text: str) -> List[str]:
    """
    Extract emojis from text

    Args:
        text: The text to analyze

    Returns:
        List of emojis found in the text
    """
    return [c for c in text if c in emoji.EMOJI_DATA]

def interpret_emojis(emojis: List[str]) -> Dict[str, float]:
    """
    Interpret the sentiment of emojis

    Args:
        emojis: List of emojis to analyze

    Returns:
        Dictionary with sentiment scores for the emojis
    """
    if not emojis:
        return {
            'positive': 0.0,
            'neutral': 0.0,
            'negative': 0.0
        }

    # Define emoji sentiment mappings
    positive_emojis = ['😀', '😃', '😄', '😁', '😆', '😊', '😍', '🥰', '😘', '😗',
                      '😙', '😚', '🙂', '🤗', '🤩', '👍', '❤️', '💕', '💯', '✅',
                      '👏', '🎉', '🔥', '💪', '👌', '😎', '🤣', '😂', '😇', '👼']

    negative_emojis = ['😠', '😡', '🤬', '😞', '😟', '😤', '😢', '😭', '😦', '😧',
                       '😨', '😩', '😰', '😱', '😳', '😵', '😖', '😣', '😫', '👎',
                       '💔', '⛔', '❌', '🚫', '😒', '🙄', '😑', '😐', '🤢', '🤮']

    # Count emoji sentiments
    positive_count = sum(1 for e in emojis if e in positive_emojis)
    negative_count = sum(1 for e in emojis if e in negative_emojis)
    neutral_count = len(emojis) - positive_count - negative_count

    total = len(emojis)

    return {
        'positive': positive_count / total if total > 0 else 0.0,
        'neutral': neutral_count / total if total > 0 else 0.0,
        'negative': negative_count / total if total > 0 else 0.0
    }

def preprocess_text(text: str) -> str:
    """
    Preprocess text for sentiment analysis

    Args:
        text: The text to preprocess

    Returns:
        Preprocessed text
    """
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)

    # Remove social media artifacts like "1d1 likeReply"
    from .text_cleaner import clean_social_media_text
    text = clean_social_media_text(text)

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def detect_emotions(text: str, emojis: List[str] = None) -> Dict[str, float]:
    """
    Detect emotions in text and emojis

    Args:
        text: The text to analyze
        emojis: List of emojis (if already extracted)

    Returns:
        Dictionary with emotion scores
    """
    if not emojis:
        emojis = extract_emojis(text)

    # Define emotion keywords
    emotions = {
        'joy': ['happy', 'joy', 'delighted', 'thrilled', 'excited', 'glad', 'pleased', 'love', 'wonderful', 'amazing'],
        'sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'heartbroken', 'gloomy', 'disappointed', 'upset', 'crying'],
        'anger': ['angry', 'furious', 'outraged', 'annoyed', 'irritated', 'mad', 'hate', 'rage', 'frustrated'],
        'fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous', 'panic'],
        'surprise': ['surprised', 'shocked', 'astonished', 'amazed', 'stunned', 'unexpected', 'wow'],
        'disgust': ['disgusted', 'gross', 'revolting', 'nasty', 'yuck', 'eww', 'repulsed']
    }

    # Define emoji emotion mappings
    emoji_emotions = {
        'joy': ['😀', '😃', '😄', '😁', '😆', '😊', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩'],
        'sadness': ['😞', '😟', '😢', '😭', '😦', '😧', '😨', '😩', '😰', '😿'],
        'anger': ['😠', '😡', '🤬', '😤', '👿', '💢'],
        'fear': ['😱', '😨', '😰', '😥', '😓', '🙀'],
        'surprise': ['😲', '😮', '😯', '😳', '😵', '🤯', '😱'],
        'disgust': ['🤢', '🤮', '😖', '😫', '😣']
    }

    # Initialize emotion scores
    emotion_scores = {emotion: 0.0 for emotion in emotions.keys()}

    # Analyze text for emotions
    text_lower = text.lower()
    for emotion, keywords in emotions.items():
        for keyword in keywords:
            if keyword in text_lower:
                emotion_scores[emotion] += 1

    # Analyze emojis for emotions
    for emotion, emoji_list in emoji_emotions.items():
        for e in emojis:
            if e in emoji_list:
                emotion_scores[emotion] += 2  # Give emojis more weight

    # Normalize scores
    total_score = sum(emotion_scores.values())
    if total_score > 0:
        for emotion in emotion_scores:
            emotion_scores[emotion] /= total_score

    return emotion_scores

def analyze_text_with_language_detection(text: str) -> Dict[str, Any]:
    """
    Analyze text with language detection and emoji interpretation

    Args:
        text: The text to analyze

    Returns:
        Dictionary with analysis results
    """
    # Preprocess text
    preprocessed_text = preprocess_text(text)

    # Extract emojis
    emojis = extract_emojis(preprocessed_text)

    # Detect language
    lang = detect_language(preprocessed_text)

    # Translate if not in English
    if lang != 'en':
        translated_text = translate_to_english(preprocessed_text, lang)
    else:
        translated_text = preprocessed_text

    # Interpret emojis
    emoji_sentiment = interpret_emojis(emojis)

    # Detect emotions
    emotions = detect_emotions(translated_text, emojis)

    return {
        'original_text': text,
        'preprocessed_text': preprocessed_text,
        'language': lang,
        'translated_text': translated_text,
        'emojis': emojis,
        'emoji_sentiment': emoji_sentiment,
        'emotions': emotions
    }
