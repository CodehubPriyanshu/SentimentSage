/**
 * Utility functions for cleaning text before sentiment analysis
 */

/**
 * Clean social media text by removing common artifacts like "1d1 likeReply"
 * and other non-meaningful patterns
 *
 * @param text The text to clean
 * @returns Cleaned text
 */
export const cleanSocialMediaText = (text: string): string => {
  if (!text) return "";

  try {
    // First, try to identify and extract complete sentences
    // This helps preserve the actual content when mixed with formatting
    const sentences = extractCompleteSentences(text);
    if (sentences && sentences.length > 20) {
      // If we found substantial complete sentences
      return sentences;
    }

    // Remove common social media patterns
    let cleanedText = text;

    // Instagram-specific patterns
    // Remove time indicators like "36w" (36 weeks), "2d" (2 days), etc.
    cleanedText = cleanedText.replace(/\b\d+[wdhms]\b/gi, "");

    // Remove like counts (e.g., "875 likes")
    cleanedText = cleanedText.replace(/\b\d+\s*likes?\b/gi, "");

    // Remove Instagram engagement buttons/text
    cleanedText = cleanedText.replace(
      /\b(?:Reply|Like|Report|See\s+Translation|Translate)\b/gi,
      ""
    );

    // Remove verified badges and similar indicators
    cleanedText = cleanedText.replace(/\bVerified\b/gi, "");

    // Remove "View X replies" and similar UI text
    cleanedText = cleanedText.replace(
      /\bView\s+\d*\s*(?:replies|more)\b/gi,
      ""
    );
    cleanedText = cleanedText.replace(
      /\bHide\s+\d*\s*(?:replies|more)\b/gi,
      ""
    );

    // Remove "__________(any number) w/d ______(any number) likeReply" pattern
    // This handles the specific format mentioned in the requirements
    cleanedText = cleanedText.replace(
      /_{2,}\s*\(\d+\)\s*w\/d\s*_{2,}\s*\(\d+\)\s*likeReply/gi,
      ""
    );

    // Remove any pattern with underscores followed by numbers in parentheses
    cleanedText = cleanedText.replace(/_{2,}\s*\(\d+\)\s*/gi, "");

    // Remove "w/d" followed by underscores and numbers
    cleanedText = cleanedText.replace(/\bw\/d\s*_{2,}\s*\(\d+\)\s*/gi, "");

    // Remove "1d1 likeReply" and similar patterns (time + likeReply)
    // More aggressive pattern matching to catch variations
    cleanedText = cleanedText.replace(
      /\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b/gi,
      ""
    );
    cleanedText = cleanedText.replace(
      /\b\d+[dhmsw]\d*\s*(?:reply|repl)\b/gi,
      ""
    );

    // Remove any variation of likeReply, even if it's part of another word
    cleanedText = cleanedText.replace(/like\s*reply|like\s*comment/gi, "");

    // Remove standalone "likeReply" and variations with more flexibility
    cleanedText = cleanedText.replace(
      /\b(?:like\s*reply|reply|comment|share|likeReply)\b/gi,
      ""
    );

    // Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
    cleanedText = cleanedText.replace(/likeReply|like_reply|like-reply/gi, "");

    // Remove timestamps with more variations (e.g., "2d", "5h", "3w", "1d1")
    cleanedText = cleanedText.replace(/\b\d+[dhmsw]\d*\b/gi, "");

    // Remove user mentions
    cleanedText = cleanedText.replace(/@[\w.-]+/g, "");

    // Remove URLs
    cleanedText = cleanedText.replace(/https?:\/\/\S+/g, "");

    // Remove hashtags
    cleanedText = cleanedText.replace(/#\w+/g, "");

    // Remove common social media UI elements
    cleanedText = cleanedText.replace(
      /\b(?:view\s+\d+\s+(?:more\s+)?(?:replies?|comments?)|show\s+\d+\s+(?:more\s+)?(?:replies?|comments?))\b/gi,
      ""
    );

    // Remove numbers of likes/comments (e.g., "15 likes", "3 comments")
    cleanedText = cleanedText.replace(
      /\b\d+\s+(?:likes?|comments?|shares?|views?)\b/gi,
      ""
    );

    // Remove excessive whitespace (including multiple newlines)
    cleanedText = cleanedText.replace(/\s+/g, " ").trim();

    // If the text is very short after cleaning, it might be just metadata
    // But we want to be more lenient to avoid losing actual content
    const words = cleanedText.split(/\s+/);

    // More lenient check: if it has at least 2 words OR 5 characters, consider it meaningful
    if (words.length < 2 && cleanedText.length < 5) {
      // Check if it's just emojis (which are meaningful)
      const emojiRegex = /[\p{Emoji}]/gu;
      const emojis = cleanedText.match(emojiRegex);

      // If it's just emojis, keep it
      if (emojis && emojis.length > 0) {
        return cleanedText;
      }

      // Otherwise, it's probably not meaningful text
      return "";
    }

    return cleanedText;
  } catch (error) {
    console.error("Error cleaning social media text:", error);
    // Return the original text if cleaning fails
    return text;
  }
};

/**
 * Clean a batch of comments, filtering out non-meaningful ones
 *
 * @param comments Text with multiple comments (one per line)
 * @returns Cleaned text with meaningful comments only
 */
export const cleanComments = (comments: string): string => {
  if (!comments) return "";

  try {
    // First, try to extract complete sentences from the entire text
    // This helps when the text is a mix of comments and formatting
    const completeText = extractCompleteSentences(comments);
    if (completeText && completeText.length > comments.length / 2) {
      // If we found substantial complete sentences, use that
      return completeText;
    }

    // Instagram comments often have username at the beginning of each line
    // Try to identify and preserve this pattern while removing metadata

    // Split by newlines and other common separators
    // This handles various copy-paste formats from different platforms
    const commentLines = comments.split(
      /\\r?\\n|\r?\n|\u2028|\u2029|\s*\|\s*|\s*\u2022\s*/
    );

    // Clean each comment and filter out empty ones
    const cleanedComments = [];
    for (const comment of commentLines) {
      // Check if this looks like an Instagram comment (username followed by content)
      const instagramCommentMatch = comment.trim().match(/^([\w._]+)\s+(.*)/);

      if (instagramCommentMatch) {
        // Extract username and comment content
        const username = instagramCommentMatch[1];
        const content = instagramCommentMatch[2];

        // Clean just the content part
        const cleanedContent = cleanSocialMediaText(content);

        if (cleanedContent.trim()) {
          // Reconstruct with username and cleaned content
          cleanedComments.push(`${username} ${cleanedContent}`);
          continue;
        }
      }

      // If not an Instagram comment or cleaning removed all content,
      // fall back to regular processing
      const sentences = extractCompleteSentences(comment);
      if (sentences && sentences.length > 10) {
        // If we found a substantial sentence
        cleanedComments.push(sentences);
      } else {
        // Otherwise use regular cleaning
        const cleaned = cleanSocialMediaText(comment);
        if (cleaned.trim()) {
          cleanedComments.push(cleaned);
        }
      }
    }

    // If we lost too much content, try a more conservative approach
    if (
      cleanedComments.length < commentLines.length * 0.5 &&
      commentLines.length > 1
    ) {
      // Try again with less aggressive filtering
      const conservativeCleanedComments = [];
      for (const comment of commentLines) {
        // Check for Instagram comment pattern first
        const instagramCommentMatch = comment.trim().match(/^([\w._]+)\s+(.*)/);

        if (instagramCommentMatch) {
          // Extract username and comment content
          const username = instagramCommentMatch[1];
          const content = instagramCommentMatch[2];

          // Apply minimal cleaning to the content
          let cleanedContent = content;
          // Remove Instagram-specific patterns - more aggressive
          cleanedContent = cleanedContent.replace(/\b\d+[wdhms]\b/gi, ""); // Time indicators
          cleanedContent = cleanedContent.replace(/\b\d+\s*likes?\b/gi, ""); // Like counts
          cleanedContent = cleanedContent.replace(
            /\b(?:Reply|Like|Report|See\s+Translation|Translate)\b/gi,
            ""
          ); // Buttons

          // Remove any variation of likeReply, even if it's part of another word
          cleanedContent = cleanedContent.replace(
            /like\s*reply|like\s*comment/gi,
            ""
          );

          // Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
          cleanedContent = cleanedContent.replace(
            /likeReply|like_reply|like-reply/gi,
            ""
          );
          cleanedContent = cleanedContent.trim();

          if (cleanedContent) {
            // Reconstruct with username and minimally cleaned content
            conservativeCleanedComments.push(`${username} ${cleanedContent}`);
            continue;
          }
        }

        // If not an Instagram comment or cleaning removed all content,
        // apply minimal cleaning
        let cleaned = comment;
        // Remove only the most obvious social media artifacts
        cleaned = cleaned.replace(
          /\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b/gi,
          ""
        );

        // Remove any variation of likeReply, even if it's part of another word
        cleaned = cleaned.replace(/like\s*reply|like\s*comment/gi, "");

        // Remove standalone engagement terms
        cleaned = cleaned.replace(
          /\b(?:like|reply|comment|share|likeReply)\b/gi,
          ""
        );

        // Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
        cleaned = cleaned.replace(/likeReply|like_reply|like-reply/gi, "");

        cleaned = cleaned.trim();

        if (cleaned) {
          conservativeCleanedComments.push(cleaned);
        }
      }

      if (conservativeCleanedComments.length > cleanedComments.length) {
        return conservativeCleanedComments.join("\n");
      }
    }

    // Join back with newlines
    return cleanedComments.join("\n");
  } catch (error) {
    console.error("Error cleaning comments:", error);
    // Return the original comments if cleaning fails
    return comments;
  }
};

/**
 * Detect if text contains complete sentences
 *
 * @param text The text to analyze
 * @returns True if the text contains at least one complete sentence
 */
export const hasCompleteSentences = (text: string): boolean => {
  if (!text || text.length < 10) return false;

  // Simple heuristic: check for sentence-ending punctuation
  const sentenceEndRegex = /[.!?]\s*$/;

  // Split by common sentence separators
  const sentences = text.split(/[.!?]+\s+/);

  // Check if at least one sentence is complete
  return sentences.length > 1 || sentenceEndRegex.test(text);
};

/**
 * Extract complete sentences from text
 *
 * @param text The text to process
 * @returns Text containing only complete sentences
 */
export const extractCompleteSentences = (text: string): string => {
  if (!text) return "";

  try {
    // Check if this looks like an Instagram comment (username followed by content)
    const instagramCommentMatch = text.trim().match(/^([\w._]+)\s+(.*)/);
    if (instagramCommentMatch) {
      // Extract username and comment content
      const username = instagramCommentMatch[1];
      const content = instagramCommentMatch[2];

      // Clean just the content part and then reconstruct
      const cleanedContent = _extractSentencesFromContent(content);
      if (cleanedContent.trim()) {
        return `${username} ${cleanedContent}`;
      }
    }

    // If not an Instagram comment or cleaning removed all content,
    // process the entire text
    return _extractSentencesFromContent(text);
  } catch (error) {
    console.error("Error extracting complete sentences:", error);
    // Return the original text if extraction fails
    return text;
  }
};

/**
 * Helper function to extract sentences from content
 *
 * @param content The content to process
 * @returns Text containing only complete sentences
 */
const _extractSentencesFromContent = (content: string): string => {
  // First, clean up obvious social media artifacts that might interfere with sentence detection
  let cleanedText = content;

  // Instagram-specific patterns
  // Remove time indicators like "36w" (36 weeks), "2d" (2 days), etc.
  cleanedText = cleanedText.replace(/\b\d+[wdhms]\b/gi, "");

  // Remove like counts (e.g., "875 likes")
  cleanedText = cleanedText.replace(/\b\d+\s*likes?\b/gi, "");

  // Remove Instagram engagement buttons/text
  cleanedText = cleanedText.replace(
    /\b(?:Reply|Like|Report|See\s+Translation|Translate)\b/gi,
    ""
  );

  // Remove "View X replies" and similar UI text
  cleanedText = cleanedText.replace(/\bView\s+\d*\s*(?:replies|more)\b/gi, "");
  cleanedText = cleanedText.replace(/\bHide\s+\d*\s*(?:replies|more)\b/gi, "");

  // Remove "__________(any number) w/d ______(any number) likeReply" pattern
  cleanedText = cleanedText.replace(
    /_{2,}\s*\(\d+\)\s*w\/d\s*_{2,}\s*\(\d+\)\s*likeReply/gi,
    ""
  );

  // Remove any pattern with underscores followed by numbers in parentheses
  cleanedText = cleanedText.replace(/_{2,}\s*\(\d+\)\s*/gi, "");

  // Remove "w/d" followed by underscores and numbers
  cleanedText = cleanedText.replace(/\bw\/d\s*_{2,}\s*\(\d+\)\s*/gi, "");

  // Remove "1d1 likeReply" and similar patterns - more aggressive
  cleanedText = cleanedText.replace(
    /\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b/gi,
    ""
  );

  // Remove any variation of likeReply, even if it's part of another word
  cleanedText = cleanedText.replace(/like\s*reply|like\s*comment/gi, "");

  // Remove standalone engagement terms
  cleanedText = cleanedText.replace(
    /\b(?:like\s*reply|reply|comment|share|likeReply)\b/gi,
    ""
  );

  // Remove any remaining instances of 'likeReply' that might be without spaces or in different formats
  cleanedText = cleanedText.replace(/likeReply|like_reply|like-reply/gi, "");

  // Remove timestamps
  cleanedText = cleanedText.replace(/\b\d+[dhmsw]\d*\b/gi, "");

  // Split by common sentence separators
  // More comprehensive regex to catch various sentence endings
  const sentenceSplitRegex = /([.!?]+["'\)\]]*\s+)/;
  const parts = cleanedText.split(sentenceSplitRegex);

  let result = "";
  let currentSentence = "";

  for (let i = 0; i < parts.length; i++) {
    currentSentence += parts[i];

    // If this part ends with sentence-ending punctuation
    if (i % 2 === 1) {
      // Add the complete sentence to the result
      result += currentSentence;
      currentSentence = "";
    }
  }

  // Check if the last sentence is complete
  if (currentSentence.trim() && /[.!?]["'\)\]]*\s*$/.test(currentSentence)) {
    result += currentSentence;
  }

  // If we didn't find any complete sentences but the text is substantial,
  // treat the whole text as a sentence if it's meaningful
  if (!result.trim() && cleanedText.trim().length > 20) {
    // Check if it has at least 5 words
    const words = cleanedText.trim().split(/\s+/);
    if (words.length >= 5) {
      return cleanedText.trim();
    }
  }

  return result.trim();
};

export default {
  cleanSocialMediaText,
  cleanComments,
  hasCompleteSentences,
  extractCompleteSentences,
};
