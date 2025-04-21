"""
Utility functions for AI integration with OpenAI and Hugging Face
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional, Union
import requests
from flask import current_app

logger = logging.getLogger(__name__)

def get_openai_completion(prompt: str, max_tokens: int = 500) -> Optional[str]:
    """
    Get a completion from OpenAI API
    
    Args:
        prompt: The prompt to send to OpenAI
        max_tokens: Maximum number of tokens to generate
        
    Returns:
        The generated text or None if there was an error
    """
    api_key = current_app.config.get('OPENAI_API_KEY')
    
    if not api_key:
        logger.warning("OpenAI API key not found, using fallback insights")
        return None
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful data analysis assistant that provides concise, insightful analysis."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        else:
            logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return None

def get_huggingface_completion(prompt: str, max_tokens: int = 500) -> Optional[str]:
    """
    Get a completion from Hugging Face Inference API
    
    Args:
        prompt: The prompt to send to Hugging Face
        max_tokens: Maximum number of tokens to generate
        
    Returns:
        The generated text or None if there was an error
    """
    api_key = current_app.config.get('HUGGINGFACE_API_KEY')
    
    if not api_key:
        logger.warning("Hugging Face API key not found, using fallback insights")
        return None
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        
        data = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        # Using a general text generation model
        model_url = "https://api-inference.huggingface.co/models/google/flan-t5-xl"
        
        response = requests.post(
            model_url,
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "").strip()
            return None
        else:
            logger.error(f"Hugging Face API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error calling Hugging Face API: {str(e)}")
        return None

def generate_enhanced_insights(data_type: str, analysis_data: Dict[str, Any]) -> str:
    """
    Generate enhanced AI insights based on analysis data
    
    Args:
        data_type: The type of data ('text', 'csv', 'twitter', 'youtube')
        analysis_data: The analysis data
        
    Returns:
        Enhanced AI insights
    """
    # Try to use OpenAI first
    prompt = create_prompt_for_data_type(data_type, analysis_data)
    
    if not prompt:
        return fallback_insights(data_type, analysis_data)
    
    # Try OpenAI first
    openai_response = get_openai_completion(prompt)
    if openai_response:
        return openai_response
    
    # Fall back to Hugging Face if OpenAI fails
    huggingface_response = get_huggingface_completion(prompt)
    if huggingface_response:
        return huggingface_response
    
    # If both fail, use fallback insights
    return fallback_insights(data_type, analysis_data)

def create_prompt_for_data_type(data_type: str, analysis_data: Dict[str, Any]) -> Optional[str]:
    """
    Create a prompt for the AI based on the data type and analysis data
    
    Args:
        data_type: The type of data ('text', 'csv', 'twitter', 'youtube')
        analysis_data: The analysis data
        
    Returns:
        A prompt for the AI or None if the data type is not supported
    """
    if data_type == 'text':
        return create_text_prompt(analysis_data)
    elif data_type == 'csv':
        return create_csv_prompt(analysis_data)
    elif data_type == 'twitter':
        return create_twitter_prompt(analysis_data)
    elif data_type == 'youtube':
        return create_youtube_prompt(analysis_data)
    else:
        return None

def create_text_prompt(analysis_data: Dict[str, Any]) -> str:
    """
    Create a prompt for text sentiment analysis
    
    Args:
        analysis_data: The sentiment analysis data
        
    Returns:
        A prompt for the AI
    """
    text = analysis_data.get('text', '')
    sentiment = analysis_data.get('sentiment', 'neutral')
    positive_score = analysis_data.get('positive_score', 0)
    neutral_score = analysis_data.get('neutral_score', 0)
    negative_score = analysis_data.get('negative_score', 0)
    
    prompt = f"""
    Analyze the sentiment of the following text and provide insightful commentary:
    
    Text: "{text}"
    
    Sentiment scores:
    - Positive: {positive_score:.2f}
    - Neutral: {neutral_score:.2f}
    - Negative: {negative_score:.2f}
    
    Please provide:
    1. A brief interpretation of the sentiment (positive, negative, or neutral)
    2. Key emotional themes or tones detected in the text
    3. Potential implications or context for this sentiment
    4. Any nuances or subtleties in the sentiment expression
    
    Keep your response concise but insightful, focusing on what the sentiment reveals about the writer's perspective.
    """
    
    return prompt

def create_csv_prompt(analysis_data: Dict[str, Any]) -> str:
    """
    Create a prompt for CSV data analysis
    
    Args:
        analysis_data: The CSV analysis data
        
    Returns:
        A prompt for the AI
    """
    summary = analysis_data.get('summary', {})
    rows = summary.get('rows', 0)
    columns = summary.get('columns', 0)
    column_names = summary.get('column_names', [])
    missing_values = summary.get('missing_values', 0)
    duplicate_rows = summary.get('duplicate_rows', 0)
    
    # Get column information
    columns_info = analysis_data.get('columns', [])
    column_details = []
    
    for col in columns_info[:10]:  # Limit to first 10 columns to avoid token limits
        col_type = col.get('type', 'unknown')
        col_name = col.get('name', 'unnamed')
        
        if col_type == 'numeric':
            min_val = col.get('min', 'N/A')
            max_val = col.get('max', 'N/A')
            mean = col.get('mean', 'N/A')
            median = col.get('median', 'N/A')
            column_details.append(f"- {col_name} (numeric): min={min_val}, max={max_val}, mean={mean}, median={median}")
        elif col_type == 'categorical':
            unique_values = col.get('unique_values', 0)
            column_details.append(f"- {col_name} (categorical): {unique_values} unique values")
        else:
            column_details.append(f"- {col_name} ({col_type})")
    
    # Get correlation information
    correlations = analysis_data.get('correlations', [])
    correlation_details = []
    
    for corr in correlations[:5]:  # Limit to top 5 correlations
        col1 = corr.get('column1', '')
        col2 = corr.get('column2', '')
        corr_value = corr.get('correlation', 0)
        correlation_details.append(f"- {col1} and {col2}: {corr_value:.2f}")
    
    column_details_str = "\n".join(column_details)
    correlation_details_str = "\n".join(correlation_details)
    
    prompt = f"""
    Analyze the following dataset and provide insightful commentary:
    
    Dataset Summary:
    - Rows: {rows}
    - Columns: {columns}
    - Column names: {', '.join(column_names[:10])}{'...' if len(column_names) > 10 else ''}
    - Missing values: {missing_values}
    - Duplicate rows: {duplicate_rows}
    
    Column Details:
    {column_details_str}
    
    {'Top Correlations:' if correlation_details_str else ''}
    {correlation_details_str}
    
    Please provide:
    1. A concise summary of what this dataset appears to represent
    2. Key observations about the data structure and quality
    3. Potential insights or patterns suggested by the column distributions and correlations
    4. Recommendations for further analysis or data preparation
    5. Potential business or practical implications of these findings
    
    Focus on providing meaningful, contextual insights rather than just repeating the statistics.
    """
    
    return prompt

def create_twitter_prompt(analysis_data: Dict[str, Any]) -> str:
    """
    Create a prompt for Twitter sentiment analysis
    
    Args:
        analysis_data: The Twitter analysis data
        
    Returns:
        A prompt for the AI
    """
    username = analysis_data.get('username', '')
    sentiment_summary = analysis_data.get('sentiment_summary', {})
    positive = sentiment_summary.get('positive', 0)
    neutral = sentiment_summary.get('neutral', 0)
    negative = sentiment_summary.get('negative', 0)
    total_tweets = sentiment_summary.get('total_tweets', 0)
    
    # Get sample tweets
    tweets = analysis_data.get('tweets', [])
    tweet_samples = []
    
    # Try to get a mix of sentiments
    pos_samples = [t.get('text', '') for t in tweets if t.get('sentiment') == 'positive'][:2]
    neu_samples = [t.get('text', '') for t in tweets if t.get('sentiment') == 'neutral'][:2]
    neg_samples = [t.get('text', '') for t in tweets if t.get('sentiment') == 'negative'][:2]
    
    tweet_samples = pos_samples + neu_samples + neg_samples
    tweet_samples_str = "\n".join([f"- \"{t}\"" for t in tweet_samples[:5]])
    
    prompt = f"""
    Analyze the Twitter sentiment for user @{username} and provide insightful commentary:
    
    Sentiment Summary:
    - Positive: {positive:.1%}
    - Neutral: {neutral:.1%}
    - Negative: {negative:.1%}
    - Total tweets analyzed: {total_tweets}
    
    Sample tweets:
    {tweet_samples_str}
    
    Please provide:
    1. An overall assessment of the Twitter account's sentiment profile
    2. Insights into what might be driving the positive or negative sentiment
    3. Patterns or themes that might be present in the tweets
    4. How this sentiment profile might impact audience perception or engagement
    5. Recommendations for the account owner based on this sentiment analysis
    
    Focus on providing actionable insights rather than just describing the sentiment scores.
    """
    
    return prompt

def create_youtube_prompt(analysis_data: Dict[str, Any]) -> str:
    """
    Create a prompt for YouTube sentiment analysis
    
    Args:
        analysis_data: The YouTube analysis data
        
    Returns:
        A prompt for the AI
    """
    video_info = analysis_data.get('video_info', {})
    video_title = video_info.get('title', '')
    sentiment_summary = analysis_data.get('sentiment_summary', {})
    positive = sentiment_summary.get('positive', 0)
    neutral = sentiment_summary.get('neutral', 0)
    negative = sentiment_summary.get('negative', 0)
    total_comments = sentiment_summary.get('total_comments', 0)
    
    # Get sample comments
    comments = analysis_data.get('comments', [])
    comment_samples = []
    
    # Try to get a mix of sentiments
    pos_samples = [c.get('text', '') for c in comments if c.get('sentiment') == 'positive'][:2]
    neu_samples = [c.get('text', '') for c in comments if c.get('sentiment') == 'neutral'][:2]
    neg_samples = [c.get('text', '') for c in comments if c.get('sentiment') == 'negative'][:2]
    
    comment_samples = pos_samples + neu_samples + neg_samples
    comment_samples_str = "\n".join([f"- \"{c}\"" for c in comment_samples[:5]])
    
    prompt = f"""
    Analyze the YouTube comment sentiment for the video "{video_title}" and provide insightful commentary:
    
    Sentiment Summary:
    - Positive: {positive:.1%}
    - Neutral: {neutral:.1%}
    - Negative: {negative:.1%}
    - Total comments analyzed: {total_comments}
    
    Sample comments:
    {comment_samples_str}
    
    Please provide:
    1. An overall assessment of the audience sentiment toward this video
    2. Insights into what aspects of the video might be driving positive or negative reactions
    3. Patterns or themes that might be present in the comments
    4. How this sentiment profile compares to typical YouTube videos
    5. Recommendations for the content creator based on this sentiment analysis
    
    Focus on providing actionable insights that could help the content creator understand their audience better.
    """
    
    return prompt

def fallback_insights(data_type: str, analysis_data: Dict[str, Any]) -> str:
    """
    Generate fallback insights when AI APIs are not available
    
    Args:
        data_type: The type of data ('text', 'csv', 'twitter', 'youtube')
        analysis_data: The analysis data
        
    Returns:
        Fallback insights
    """
    if data_type == 'text':
        sentiment = analysis_data.get('sentiment', 'neutral')
        positive_score = analysis_data.get('positive_score', 0)
        neutral_score = analysis_data.get('neutral_score', 0)
        negative_score = analysis_data.get('negative_score', 0)
        
        if sentiment == 'positive':
            return f"The text expresses a positive sentiment (score: {positive_score:.2f}), indicating satisfaction or approval. This suggests the author has a favorable opinion or experience."
        elif sentiment == 'negative':
            return f"The text expresses a negative sentiment (score: {negative_score:.2f}), indicating dissatisfaction or criticism. This suggests the author has concerns or issues that may need addressing."
        else:
            return f"The text expresses a neutral sentiment (score: {neutral_score:.2f}), indicating a balanced or objective perspective. This suggests factual reporting or a mix of positive and negative elements."
    
    elif data_type == 'csv':
        summary = analysis_data.get('summary', {})
        rows = summary.get('rows', 0)
        columns = summary.get('columns', 0)
        missing_values = summary.get('missing_values', 0)
        
        insights = f"This dataset contains {rows} rows and {columns} columns. "
        
        if missing_values > 0:
            insights += f"There are {missing_values} missing values that may require attention. "
        else:
            insights += "The dataset is complete with no missing values. "
        
        # Add correlation insights if available
        correlations = analysis_data.get('correlations', [])
        if correlations and len(correlations) > 0:
            top_corr = correlations[0]
            corr_value = top_corr.get('correlation', 0)
            if abs(corr_value) > 0.7:
                direction = "positive" if corr_value > 0 else "negative"
                insights += f"There is a strong {direction} correlation ({corr_value:.2f}) between '{top_corr.get('column1', '')}' and '{top_corr.get('column2', '')}'. "
        
        insights += "\n\nRecommendations for analysis:\n"
        insights += "- Explore relationships between key variables\n"
        insights += "- Consider data visualization to identify patterns\n"
        if missing_values > 0:
            insights += "- Address missing values through imputation or removal\n"
        
        return insights
    
    elif data_type == 'twitter':
        username = analysis_data.get('username', '')
        sentiment_summary = analysis_data.get('sentiment_summary', {})
        positive = sentiment_summary.get('positive', 0)
        neutral = sentiment_summary.get('neutral', 0)
        negative = sentiment_summary.get('negative', 0)
        total_tweets = sentiment_summary.get('total_tweets', 0)
        
        insights = f"Analysis of @{username}'s {total_tweets} tweets shows "
        
        if positive > 0.6:
            insights += f"a predominantly positive tone ({positive:.1%}), suggesting an optimistic or promotional communication style. "
        elif negative > 0.6:
            insights += f"a predominantly negative tone ({negative:.1%}), suggesting critical or concerned communication. "
        elif neutral > 0.6:
            insights += f"a predominantly neutral tone ({neutral:.1%}), suggesting factual or objective communication. "
        else:
            insights += f"a mixed sentiment profile (positive: {positive:.1%}, neutral: {neutral:.1%}, negative: {negative:.1%}), suggesting varied communication. "
        
        insights += "\n\nRecommendations:\n"
        if negative > 0.3:
            insights += "- Consider addressing common concerns in negative tweets\n"
        if positive > 0.3:
            insights += "- Leverage positive aspects in your communication strategy\n"
        insights += "- Monitor sentiment trends over time for changes\n"
        
        return insights
    
    elif data_type == 'youtube':
        video_info = analysis_data.get('video_info', {})
        video_title = video_info.get('title', '')
        sentiment_summary = analysis_data.get('sentiment_summary', {})
        positive = sentiment_summary.get('positive', 0)
        neutral = sentiment_summary.get('neutral', 0)
        negative = sentiment_summary.get('negative', 0)
        total_comments = sentiment_summary.get('total_comments', 0)
        
        insights = f"Analysis of {total_comments} comments on \"{video_title}\" shows "
        
        if positive > 0.6:
            insights += f"a predominantly positive reception ({positive:.1%}), suggesting audience satisfaction with the content. "
        elif negative > 0.6:
            insights += f"a predominantly negative reception ({negative:.1%}), suggesting audience dissatisfaction or criticism. "
        elif neutral > 0.6:
            insights += f"a predominantly neutral reception ({neutral:.1%}), suggesting factual or objective audience engagement. "
        else:
            insights += f"a mixed reception (positive: {positive:.1%}, neutral: {neutral:.1%}, negative: {negative:.1%}), suggesting divided audience opinions. "
        
        insights += "\n\nRecommendations for content creation:\n"
        if negative > 0.3:
            insights += "- Address common concerns raised in negative comments\n"
        if positive > 0.3:
            insights += "- Build on aspects that received positive feedback\n"
        insights += "- Continue monitoring audience sentiment for future videos\n"
        
        return insights
    
    else:
        return "No insights available for this type of analysis."
