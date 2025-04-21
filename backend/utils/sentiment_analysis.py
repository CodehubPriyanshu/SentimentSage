"""
Utility functions for sentiment analysis
"""
import re
import numpy as np
from typing import Dict, List, Tuple, Union, Any

# Simple keyword-based sentiment analysis
def analyze_sentiment(text: str) -> Dict[str, Union[str, float, str]]:
    """
    Analyze the sentiment of a text using a simple keyword-based approach.

    Args:
        text: The text to analyze

    Returns:
        A dictionary with sentiment analysis results
    """
    # Convert text to lowercase for case-insensitive matching
    text = text.lower()

    # Define positive and negative keywords
    positive_keywords = [
        'good', 'great', 'excellent', 'amazing', 'love', 'happy', 'wonderful',
        'fantastic', 'best', 'awesome', 'brilliant', 'outstanding', 'perfect',
        'enjoy', 'pleased', 'delighted', 'glad', 'satisfied', 'impressive'
    ]

    negative_keywords = [
        'bad', 'terrible', 'horrible', 'hate', 'awful', 'worst', 'poor',
        'disappointed', 'unhappy', 'sad', 'annoying', 'frustrating', 'useless',
        'waste', 'dislike', 'failure', 'problem', 'difficult', 'complaint'
    ]

    # Count occurrences of positive and negative keywords
    positive_count = sum(1 for keyword in positive_keywords if keyword in text)
    negative_count = sum(1 for keyword in negative_keywords if keyword in text)

    # Calculate sentiment scores
    total_keywords = positive_count + negative_count
    if total_keywords == 0:
        positive_score = 0.5
        negative_score = 0.5
        sentiment = 'neutral'
    else:
        positive_score = positive_count / total_keywords
        negative_score = negative_count / total_keywords

        if positive_score > negative_score:
            sentiment = 'positive'
        elif negative_score > positive_score:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

    # Generate explanation
    if sentiment == 'positive':
        explanation = "This text has a positive tone due to words expressing satisfaction or approval."
    elif sentiment == 'negative':
        explanation = "This text has a negative tone due to words expressing dissatisfaction or criticism."
    else:
        explanation = "This text appears to have a neutral tone or balanced positive and negative elements."

    return {
        'sentiment': sentiment,
        'positive_score': positive_score,
        'negative_score': negative_score,
        'neutral_score': 1.0 - (positive_score + negative_score),
        'explanation': explanation
    }

def analyze_multiple_texts(texts: List[str]) -> Dict[str, Any]:
    """
    Analyze multiple texts and return aggregated sentiment results.

    Args:
        texts: List of texts to analyze

    Returns:
        Dictionary with aggregated sentiment analysis results
    """
    if not texts:
        return {
            'positive': 0,
            'neutral': 0,
            'negative': 0,
            'total': 0,
            'sentiments': []
        }

    results = [analyze_sentiment(text) for text in texts]

    # Count sentiment categories
    positive_count = sum(1 for r in results if r['sentiment'] == 'positive')
    neutral_count = sum(1 for r in results if r['sentiment'] == 'neutral')
    negative_count = sum(1 for r in results if r['sentiment'] == 'negative')
    total = len(results)

    # Calculate percentages
    positive_percentage = positive_count / total if total > 0 else 0
    neutral_percentage = neutral_count / total if total > 0 else 0
    negative_percentage = negative_count / total if total > 0 else 0

    return {
        'positive': positive_percentage,
        'neutral': neutral_percentage,
        'negative': negative_percentage,
        'total': total,
        'sentiments': results
    }

from .ai_integration import generate_enhanced_insights

def generate_ai_insights(analysis_result: Dict[str, Any], source_type: str, source_data: Any = None) -> str:
    """
    Generate AI insights based on sentiment analysis results.

    Args:
        analysis_result: The sentiment analysis results
        source_type: The type of source data ('text', 'csv', 'twitter', 'youtube')
        source_data: Additional data about the source

    Returns:
        A string with AI-generated insights
    """
    # Prepare the data for AI processing
    if source_type == 'text':
        # For text analysis, we need to include the text itself
        if source_data and isinstance(source_data, str):
            analysis_result['text'] = source_data

    # Use the enhanced AI insights generator
    try:
        return generate_enhanced_insights(source_type, analysis_result)
    except Exception as e:
        # Fall back to basic insights if there's an error
        print(f"Error generating enhanced insights: {str(e)}")
        return generate_basic_insights(analysis_result, source_type, source_data)

def generate_basic_insights(analysis_result: Dict[str, Any], source_type: str, source_data: Any = None) -> str:
    """
    Generate basic AI insights based on sentiment analysis results.
    This is a fallback method when the enhanced AI insights generator fails.

    Args:
        analysis_result: The sentiment analysis results
        source_type: The type of source data ('text', 'csv', 'twitter', 'youtube')
        source_data: Additional data about the source

    Returns:
        A string with basic AI-generated insights
    """
    insights = ""

    if source_type == 'text':
        # Insights for text analysis
        sentiment = analysis_result.get('sentiment', 'neutral')
        if sentiment == 'positive':
            insights = "The text has a positive sentiment, indicating satisfaction or approval. "
            insights += "This suggests a favorable opinion or experience being expressed."
        elif sentiment == 'negative':
            insights = "The text has a negative sentiment, indicating dissatisfaction or criticism. "
            insights += "This suggests concerns or issues being raised that may need addressing."
        else:
            insights = "The text has a neutral sentiment, indicating a balanced or objective perspective. "
            insights += "This suggests factual reporting or a mix of positive and negative elements."

    elif source_type in ['twitter', 'youtube']:
        # Insights for social media analysis
        positive = analysis_result.get('positive', 0)
        neutral = analysis_result.get('neutral', 0)
        negative = analysis_result.get('negative', 0)
        total = analysis_result.get('total', 0)

        source_name = "tweets" if source_type == 'twitter' else "comments"

        insights = f"Analysis of {total} {source_name} shows: "

        if positive > 0.5:
            insights += f"predominantly positive sentiment ({positive:.1%}), "
            insights += "indicating strong audience satisfaction. "
        elif negative > 0.5:
            insights += f"predominantly negative sentiment ({negative:.1%}), "
            insights += "indicating significant audience concerns. "
        elif positive > negative:
            insights += f"moderately positive sentiment ({positive:.1%} positive vs {negative:.1%} negative), "
            insights += "suggesting general audience satisfaction with some concerns. "
        elif negative > positive:
            insights += f"moderately negative sentiment ({negative:.1%} negative vs {positive:.1%} positive), "
            insights += "suggesting general audience dissatisfaction with some positive aspects. "
        else:
            insights += f"balanced sentiment ({neutral:.1%} neutral), "
            insights += "indicating mixed audience reactions or factual discussions. "

        # Add recommendations
        insights += "\n\nRecommendations: "
        if negative > 0.3:
            insights += "Address common concerns in the negative feedback. "
        if positive > 0.3:
            insights += "Leverage positive aspects highlighted in favorable feedback. "
        insights += "Continue monitoring sentiment trends over time for changes."

    elif source_type == 'csv':
        # Insights for CSV data analysis
        if source_data and 'summary' in source_data:
            summary = source_data['summary']
            insights = "Dataset analysis reveals: "

            # Add insights based on the CSV summary statistics
            if 'rows' in summary and 'columns' in summary:
                insights += f"The dataset contains {summary['rows']} rows and {summary['columns']} columns. "

            if 'missing_values' in summary:
                missing = summary['missing_values']
                if missing > 0:
                    insights += f"There are {missing} missing values that may require attention. "
                else:
                    insights += "The dataset is complete with no missing values. "

            # Add recommendations
            insights += "\n\nRecommendations for data analysis: "
            insights += "Explore relationships between key variables. "
            insights += "Consider data visualization to identify patterns. "
            if 'missing_values' in summary and summary['missing_values'] > 0:
                insights += "Address missing values through imputation or removal. "

    return insights
