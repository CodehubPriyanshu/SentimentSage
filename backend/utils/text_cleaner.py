"""
Utility functions for cleaning text before sentiment analysis
"""
import re
from typing import List, Optional

def clean_social_media_text(text: str) -> str:
    """
    Clean social media text by removing common artifacts like "1d1 likeReply"
    and other non-meaningful patterns, with enhanced support for Instagram formats

    Args:
        text: The text to clean

    Returns:
        Cleaned text
    """
    if not text:
        return ''

    try:
        # Remove common social media patterns
        cleaned_text = text

        # Instagram-specific patterns
        # Remove time indicators like "36w" (36 weeks), "2d" (2 days), etc.
        cleaned_text = re.sub(r'\b\d+[wdhms]\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove like counts (e.g., "875 likes")
        cleaned_text = re.sub(r'\b\d+\s*likes?\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove Instagram engagement buttons/text
        cleaned_text = re.sub(r'\b(?:Reply|Like|Report|See\s+Translation|Translate)\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove verified badges and similar indicators
        cleaned_text = re.sub(r'\bVerified\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove "View X replies" and similar UI text
        cleaned_text = re.sub(r'\bView\s+\d*\s*(?:replies|more)\b', '', cleaned_text, flags=re.IGNORECASE)
        cleaned_text = re.sub(r'\bHide\s+\d*\s*(?:replies|more)\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove "__________(any number) w/d ______(any number) likeReply" pattern
        # This handles the specific format mentioned in the requirements
        cleaned_text = re.sub(r'_{2,}\s*\(\d+\)\s*w\/d\s*_{2,}\s*\(\d+\)\s*likeReply', '', cleaned_text, flags=re.IGNORECASE)

        # Remove any pattern with underscores followed by numbers in parentheses
        cleaned_text = re.sub(r'_{2,}\s*\(\d+\)\s*', '', cleaned_text, flags=re.IGNORECASE)

        # Remove "w/d" followed by underscores and numbers
        cleaned_text = re.sub(r'\bw\/d\s*_{2,}\s*\(\d+\)\s*', '', cleaned_text, flags=re.IGNORECASE)

        # Remove "1d1 likeReply" and similar patterns (time + likeReply) - more aggressive pattern
        cleaned_text = re.sub(r'\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove any variation of likeReply, even if it's part of another word
        cleaned_text = re.sub(r'like\s*reply|like\s*comment', '', cleaned_text, flags=re.IGNORECASE)

        # Remove standalone engagement terms
        cleaned_text = re.sub(r'\b(?:like|reply|comment|share|likeReply)\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
        cleaned_text = re.sub(r'likeReply|like_reply|like-reply', '', cleaned_text, flags=re.IGNORECASE)

        # Remove timestamps (e.g., "2d", "5h", "3w")
        cleaned_text = re.sub(r'\b\d+[dhmsw]\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove user mentions
        cleaned_text = re.sub(r'@[\w.-]+', '', cleaned_text)

        # Remove URLs
        cleaned_text = re.sub(r'https?://\S+', '', cleaned_text)

        # Remove hashtags
        cleaned_text = re.sub(r'#\w+', '', cleaned_text)

        # Remove common social media UI elements
        cleaned_text = re.sub(
            r'\b(?:view\s+\d+\s+(?:more\s+)?(?:replies?|comments?)|show\s+\d+\s+(?:more\s+)?(?:replies?|comments?))\b',
            '',
            cleaned_text,
            flags=re.IGNORECASE
        )

        # Remove numbers of likes/comments (e.g., "15 likes", "3 comments")
        cleaned_text = re.sub(r'\b\d+\s+(?:likes?|comments?|shares?|views?)\b', '', cleaned_text, flags=re.IGNORECASE)

        # Remove excessive whitespace
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()

        # Only return text if it contains meaningful content
        # Check if the text has at least 3 words and 10 characters after cleaning
        words = cleaned_text.split()
        if len(words) < 3 or len(cleaned_text) < 10:
            # Check if it's just emojis (which are meaningful)
            import emoji
            emojis = emoji.emoji_list(cleaned_text)

            # If it's just emojis, keep it
            if emojis and len(emojis) > 0:
                return cleaned_text

            # Otherwise, it's probably not meaningful text
            return ''

        return cleaned_text
    except Exception as e:
        # Log the error but don't crash
        import logging
        logging.error(f"Error cleaning social media text: {str(e)}")
        # Return the original text if cleaning fails
        return text

def clean_comments(comments: str) -> str:
    """
    Clean a batch of comments, filtering out non-meaningful ones
    Enhanced to better handle Instagram comment formats

    Args:
        comments: Text with multiple comments (one per line)

    Returns:
        Cleaned text with meaningful comments only
    """
    if not comments:
        return ''

    try:
        # First, try to extract complete sentences from the entire text
        # This helps when the text is a mix of comments and formatting
        complete_text = extract_complete_sentences(comments)
        if complete_text and len(complete_text) > len(comments) / 2:
            # If we found substantial complete sentences, use that
            return complete_text

        # Instagram comments often have username at the beginning of each line
        # Try to identify and preserve this pattern while removing metadata

        # Split by newlines and other common separators
        comment_lines = re.split(r'\\r?\\n|\r?\n|\u2028|\u2029|\s*\|\s*|\s*\u2022\s*', comments)

        # Clean each comment and filter out empty ones
        cleaned_comments = []
        for comment in comment_lines:
            # Check if this looks like an Instagram comment (username followed by content)
            instagram_comment_match = re.match(r'^([\w._]+)\s+(.*)', comment.strip())

            if instagram_comment_match:
                # Extract username and comment content
                username = instagram_comment_match.group(1)
                content = instagram_comment_match.group(2)

                # Clean just the content part
                cleaned_content = clean_social_media_text(content)

                if cleaned_content.strip():
                    # Reconstruct with username and cleaned content
                    cleaned_comments.append(f"{username} {cleaned_content}")
                    continue

            # If not an Instagram comment or cleaning removed all content,
            # fall back to regular processing
            sentences = extract_complete_sentences(comment)
            if sentences and len(sentences) > 10:
                # If we found a substantial sentence
                cleaned_comments.append(sentences)
            else:
                # Otherwise use regular cleaning
                cleaned = clean_social_media_text(comment)
                if cleaned.strip():
                    cleaned_comments.append(cleaned)

        # If we lost too much content, try a more conservative approach
        if len(cleaned_comments) < len(comment_lines) * 0.5 and len(comment_lines) > 1:
            # Try again with less aggressive filtering
            conservative_cleaned_comments = []
            for comment in comment_lines:
                # Check for Instagram comment pattern first
                instagram_comment_match = re.match(r'^([\w._]+)\s+(.*)', comment.strip())

                if instagram_comment_match:
                    # Extract username and comment content
                    username = instagram_comment_match.group(1)
                    content = instagram_comment_match.group(2)

                    # Apply minimal cleaning to the content
                    cleaned_content = content
                    # Remove Instagram-specific patterns - more aggressive
                    cleaned_content = re.sub(r'\b\d+[wdhms]\b', '', cleaned_content, flags=re.IGNORECASE)  # Time indicators
                    cleaned_content = re.sub(r'\b\d+\s*likes?\b', '', cleaned_content, flags=re.IGNORECASE)  # Like counts
                    cleaned_content = re.sub(r'\b(?:Reply|Like|Report|See\s+Translation|Translate)\b', '', cleaned_content, flags=re.IGNORECASE)  # Buttons

                    # Remove any variation of likeReply, even if it's part of another word
                    cleaned_content = re.sub(r'like\s*reply|like\s*comment', '', cleaned_content, flags=re.IGNORECASE)

                    # Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
                    cleaned_content = re.sub(r'likeReply|like_reply|like-reply', '', cleaned_content, flags=re.IGNORECASE)
                    cleaned_content = cleaned_content.strip()

                    if cleaned_content:
                        # Reconstruct with username and minimally cleaned content
                        conservative_cleaned_comments.append(f"{username} {cleaned_content}")
                        continue

                # If not an Instagram comment or cleaning removed all content,
                # apply minimal cleaning
                cleaned = comment
                # Remove "__________(any number) w/d ______(any number) likeReply" pattern
                cleaned = re.sub(r'_{2,}\s*\(\d+\)\s*w\/d\s*_{2,}\s*\(\d+\)\s*likeReply', '', cleaned, flags=re.IGNORECASE)
                cleaned = re.sub(r'\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b', '', cleaned, flags=re.IGNORECASE)

                # Remove any variation of likeReply, even if it's part of another word
                cleaned = re.sub(r'like\s*reply|like\s*comment', '', cleaned, flags=re.IGNORECASE)

                # Remove standalone engagement terms
                cleaned = re.sub(r'\b(?:like|reply|comment|share|likeReply)\b', '', cleaned, flags=re.IGNORECASE)

                # Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
                cleaned = re.sub(r'likeReply|like_reply|like-reply', '', cleaned, flags=re.IGNORECASE)
                cleaned = cleaned.strip()

                if cleaned:
                    conservative_cleaned_comments.append(cleaned)

            if len(conservative_cleaned_comments) > len(cleaned_comments):
                return '\n'.join(conservative_cleaned_comments)

        # Join back with newlines
        return '\n'.join(cleaned_comments)
    except Exception as e:
        # Log the error but don't crash
        import logging
        logging.error(f"Error cleaning comments: {str(e)}")
        # Return the original comments if cleaning fails
        return comments

def has_complete_sentences(text: str) -> bool:
    """
    Detect if text contains complete sentences

    Args:
        text: The text to analyze

    Returns:
        True if the text contains at least one complete sentence
    """
    if not text or len(text) < 10:
        return False

    # Simple heuristic: check for sentence-ending punctuation
    sentence_end_regex = re.compile(r'[.!?]\s*$')

    # Split by common sentence separators
    sentences = re.split(r'[.!?]+\s+', text)

    # Check if at least one sentence is complete
    return len(sentences) > 1 or sentence_end_regex.search(text) is not None

def extract_complete_sentences(text: str) -> str:
    """
    Extract complete sentences from text, with enhanced support for Instagram comment formats

    Args:
        text: The text to process

    Returns:
        Text containing only complete sentences
    """
    if not text:
        return ''

    try:
        # Check if this looks like an Instagram comment (username followed by content)
        instagram_comment_match = re.match(r'^([\w._]+)\s+(.*)', text.strip())
        if instagram_comment_match:
            # Extract username and comment content
            username = instagram_comment_match.group(1)
            content = instagram_comment_match.group(2)

            # Clean just the content part and then reconstruct
            cleaned_content = _extract_sentences_from_content(content)
            if cleaned_content.strip():
                return f"{username} {cleaned_content}"

        # If not an Instagram comment or cleaning removed all content,
        # process the entire text
        return _extract_sentences_from_content(text)
    except Exception as e:
        # Log the error but don't crash
        import logging
        logging.error(f"Error extracting complete sentences: {str(e)}")
        # Return the original text if extraction fails
        return text

def _extract_sentences_from_content(content: str) -> str:
    """
    Helper function to extract sentences from content

    Args:
        content: The content to process

    Returns:
        Text containing only complete sentences
    """
    # First, clean up obvious social media artifacts that might interfere with sentence detection
    cleaned_text = content

    # Instagram-specific patterns
    # Remove time indicators like "36w" (36 weeks), "2d" (2 days), etc.
    cleaned_text = re.sub(r'\b\d+[wdhms]\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove like counts (e.g., "875 likes")
    cleaned_text = re.sub(r'\b\d+\s*likes?\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove Instagram engagement buttons/text
    cleaned_text = re.sub(r'\b(?:Reply|Like|Report|See\s+Translation|Translate)\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove "View X replies" and similar UI text
    cleaned_text = re.sub(r'\bView\s+\d*\s*(?:replies|more)\b', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'\bHide\s+\d*\s*(?:replies|more)\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove "__________(any number) w/d ______(any number) likeReply" pattern
    cleaned_text = re.sub(r'_{2,}\s*\(\d+\)\s*w\/d\s*_{2,}\s*\(\d+\)\s*likeReply', '', cleaned_text, flags=re.IGNORECASE)

    # Remove any pattern with underscores followed by numbers in parentheses
    cleaned_text = re.sub(r'_{2,}\s*\(\d+\)\s*', '', cleaned_text, flags=re.IGNORECASE)

    # Remove "w/d" followed by underscores and numbers
    cleaned_text = re.sub(r'\bw\/d\s*_{2,}\s*\(\d+\)\s*', '', cleaned_text, flags=re.IGNORECASE)

    # Remove "1d1 likeReply" and similar patterns - more aggressive pattern
    cleaned_text = re.sub(r'\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove any variation of likeReply, even if it's part of another word
    cleaned_text = re.sub(r'like\s*reply|like\s*comment', '', cleaned_text, flags=re.IGNORECASE)

    # Remove standalone engagement terms
    cleaned_text = re.sub(r'\b(?:like|reply|comment|share|likeReply)\b', '', cleaned_text, flags=re.IGNORECASE)

    # Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
    cleaned_text = re.sub(r'likeReply|like_reply|like-reply', '', cleaned_text, flags=re.IGNORECASE)

    # Remove timestamps
    cleaned_text = re.sub(r'\b\d+[dhmsw]\d*\b', '', cleaned_text, flags=re.IGNORECASE)

    # Split by common sentence separators
    sentence_split_regex = re.compile(r'([.!?]+\s+)')
    parts = sentence_split_regex.split(cleaned_text)

    result = ''
    current_sentence = ''

    for i, part in enumerate(parts):
        current_sentence += part

        # If this part ends with sentence-ending punctuation
        if i % 2 == 1:
            # Add the complete sentence to the result
            result += current_sentence
            current_sentence = ''

    # Check if the last sentence is complete
    if current_sentence.strip() and re.search(r'[.!?]\s*$', current_sentence):
        result += current_sentence

    # If we didn't find any complete sentences but the text is substantial,
    # treat the whole text as a sentence if it's meaningful
    if not result.strip() and cleaned_text.strip() and len(cleaned_text.strip()) > 20:
        # Check if it has at least 5 words
        words = cleaned_text.strip().split()
        if len(words) >= 5:
            return cleaned_text.strip()

    return result.strip()
