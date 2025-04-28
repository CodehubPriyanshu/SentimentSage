"""
Utility functions for topic extraction from text
"""
import re
import string
from collections import Counter
from typing import List, Dict, Any, Optional
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

# Download required NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Get stopwords
stop_words = set(stopwords.words('english'))
# Add custom stopwords
custom_stopwords = {
    'video', 'youtube', 'channel', 'subscribe', 'like', 'comment', 'watch',
    'please', 'thanks', 'thank', 'good', 'great', 'nice', 'awesome',
    'amazing', 'wow', 'cool', 'best', 'better', 'worse', 'worst',
    'love', 'hate', 'lol', 'haha', 'yeah', 'yes', 'no', 'ok', 'okay',
    'sure', 'definitely', 'absolutely', 'totally', 'really', 'actually',
    'basically', 'literally', 'honestly', 'seriously', 'simply', 'just',
    'get', 'got', 'getting', 'goes', 'going', 'gone', 'went', 'come',
    'came', 'coming', 'goes', 'going', 'gone', 'make', 'made', 'making',
    'say', 'said', 'saying', 'says', 'see', 'saw', 'seeing', 'seen',
    'know', 'knew', 'knowing', 'known', 'think', 'thought', 'thinking',
    'want', 'wanted', 'wanting', 'wants', 'need', 'needed', 'needing',
    'needs', 'use', 'used', 'using', 'uses', 'try', 'tried', 'trying',
    'tries', 'look', 'looked', 'looking', 'looks', 'feel', 'felt',
    'feeling', 'feels', 'seem', 'seemed', 'seeming', 'seems'
}
stop_words.update(custom_stopwords)

def preprocess_text(text: str) -> str:
    """
    Preprocess text for topic extraction
    
    Args:
        text: The text to preprocess
        
    Returns:
        Preprocessed text
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and short words
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]
    
    # Lemmatize
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    
    # Join tokens back into text
    return ' '.join(tokens)

def extract_key_topics(text: str, num_topics: int = 5, num_words: int = 5) -> List[Dict[str, Any]]:
    """
    Extract key topics from text using TF-IDF and LDA
    
    Args:
        text: The text to extract topics from
        num_topics: Number of topics to extract
        num_words: Number of words per topic
        
    Returns:
        List of topics with words and weights
    """
    # Preprocess text
    preprocessed_text = preprocess_text(text)
    
    # If text is too short, use simple keyword extraction
    if len(preprocessed_text.split()) < 20:
        return extract_keywords_from_text(text, num_topics)
    
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer(max_features=100)
    
    # Fit and transform text
    try:
        X = vectorizer.fit_transform([preprocessed_text])
        
        # Create LDA model
        lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
        
        # Fit LDA model
        lda.fit(X)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Extract topics
        topics = []
        for topic_idx, topic in enumerate(lda.components_):
            # Get top words for this topic
            top_words_idx = topic.argsort()[:-num_words-1:-1]
            top_words = [feature_names[i] for i in top_words_idx]
            
            # Calculate weights
            weights = [topic[i] for i in top_words_idx]
            
            # Normalize weights
            total_weight = sum(weights)
            if total_weight > 0:
                weights = [w / total_weight for w in weights]
            
            # Create topic dictionary
            topics.append({
                'id': topic_idx,
                'words': top_words,
                'weights': weights
            })
        
        return topics
    except Exception as e:
        print(f"Error in LDA topic extraction: {str(e)}")
        # Fall back to simple keyword extraction
        return extract_keywords_from_text(text, num_topics)

def extract_keywords_from_text(text: str, num_keywords: int = 5) -> List[Dict[str, Any]]:
    """
    Extract keywords from text using simple frequency counting
    
    Args:
        text: The text to extract keywords from
        num_keywords: Number of keywords to extract
        
    Returns:
        List of keywords with weights
    """
    # Preprocess text
    preprocessed_text = preprocess_text(text)
    
    # Tokenize
    tokens = preprocessed_text.split()
    
    # Count token frequencies
    counter = Counter(tokens)
    
    # Get most common tokens
    most_common = counter.most_common(num_keywords)
    
    # Calculate total frequency for normalization
    total_freq = sum(freq for _, freq in most_common)
    
    # Create keyword dictionary
    if total_freq > 0:
        keywords = [{
            'id': 0,
            'words': [word for word, _ in most_common],
            'weights': [freq / total_freq for _, freq in most_common]
        }]
    else:
        keywords = [{
            'id': 0,
            'words': [],
            'weights': []
        }]
    
    return keywords

def extract_topics_from_comments(comments: List[Dict[str, Any]], num_topics: int = 5) -> List[Dict[str, Any]]:
    """
    Extract topics from a list of comments
    
    Args:
        comments: List of comment dictionaries
        num_topics: Number of topics to extract
        
    Returns:
        List of topics with words and weights
    """
    # Extract text from comments
    texts = [comment.get('text', '') for comment in comments if comment.get('text')]
    
    # If no comments, return empty list
    if not texts:
        return []
    
    # Combine all texts
    combined_text = ' '.join(texts)
    
    # Extract topics
    return extract_key_topics(combined_text, num_topics)

def get_topic_names(topics: List[Dict[str, Any]]) -> List[str]:
    """
    Generate descriptive names for topics
    
    Args:
        topics: List of topics with words and weights
        
    Returns:
        List of topic names
    """
    topic_names = []
    
    for topic in topics:
        # Get top 2 words for this topic
        top_words = topic.get('words', [])[:2]
        
        if top_words:
            # Join words with '/'
            topic_name = '/'.join(top_words)
            topic_names.append(topic_name)
    
    return topic_names
