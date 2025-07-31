// Simple language detection based on common words and patterns
export const detectLanguage = (text: string): string => {
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Common words in different languages
  const languagePatterns: Record<string, string[]> = {
    'en': ['the', 'and', 'is', 'in', 'to', 'it', 'that', 'was', 'for', 'on', 'are', 'with', 'they', 'be', 'at'],
    'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para'],
    'fr': ['le', 'la', 'de', 'et', 'est', 'en', 'un', 'une', 'du', 'dans', 'qui', 'que', 'pour', 'pas', 'au'],
    'de': ['der', 'die', 'das', 'und', 'ist', 'in', 'zu', 'den', 'mit', 'nicht', 'von', 'sie', 'für', 'auf', 'dem'],
    'it': ['il', 'la', 'di', 'e', 'che', 'è', 'un', 'in', 'per', 'non', 'sono', 'con', 'mi', 'si', 'ho'],
    'pt': ['o', 'a', 'de', 'que', 'e', 'é', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os'],
    'nl': ['de', 'het', 'een', 'in', 'is', 'dat', 'op', 'te', 'en', 'van', 'voor', 'niet', 'met', 'zijn', 'aan'],
    'ru': ['и', 'в', 'не', 'на', 'я', 'что', 'тот', 'быть', 'с', 'он', 'а', 'весь', 'это', 'как', 'она'],
    'zh': ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '他'],
    'ja': ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 'も'],
    'ar': ['في', 'من', 'على', 'هو', 'أن', 'إلى', 'التي', 'كان', 'لا', 'هذا', 'ما', 'مع', 'عن', 'هي', 'أو'],
    'hi': ['है', 'का', 'में', 'की', 'और', 'को', 'से', 'पर', 'एक', 'यह', 'कि', 'था', 'हैं', 'थे', 'वह'],
    'ko': ['이', '는', '을', '가', '에', '의', '을', '를', '와', '과', '하다', '이다', '있다', '것', '그'],
    'tr': ['bir', 've', 'bu', 'için', 'de', 'da', 'ne', 'çok', 'daha', 'var', 'ben', 'mi', 'ile', 'gibi', 'kadar'],
  };
  
  // Count matches for each language
  const scores: Record<string, number> = {};
  
  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    scores[lang] = 0;
    
    for (const pattern of patterns) {
      // Check for whole word matches using regex
      const regex = new RegExp(`\\b${pattern}\\b`, 'g');
      const matches = lowerText.match(regex);
      
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }
  
  // Find the language with the highest score
  let detectedLanguage = 'en'; // Default to English
  let highestScore = 0;
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang;
    }
  }
  
  // If no clear language is detected (very short text or no common words)
  if (highestScore === 0) {
    return 'en'; // Default to English
  }
  
  return detectedLanguage;
};

// Clean text by removing excessive whitespace, normalizing quotes, etc.
export const cleanText = (text: string): string => {
  return text
    .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/['']/g, "'") // Normalize apostrophes
    .trim(); // Remove leading/trailing whitespace
};

// Detect potentially toxic or sensitive content
export const detectToxicity = (text: string): number => {
  const lowerText = text.toLowerCase();
  
  // List of potentially toxic or sensitive words/phrases
  const toxicPatterns = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'hell', 'bastard', 'dick', 'cunt', 'whore', 'slut',
    'idiot', 'stupid', 'dumb', 'retard', 'moron', 'hate', 'kill', 'die', 'death', 'suicide', 'murder',
    'racist', 'sexist', 'nazi', 'terrorism', 'terrorist', 'bomb', 'shooting', 'attack', 'threat',
    'abuse', 'rape', 'molest', 'assault', 'harass', 'bully', 'victim', 'trauma',
  ];
  
  // Count matches
  let toxicCount = 0;
  
  for (const pattern of toxicPatterns) {
    // Check for whole word matches using regex
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    const matches = lowerText.match(regex);
    
    if (matches) {
      toxicCount += matches.length;
    }
  }
  
  // Calculate toxicity score (0-1)
  const words = lowerText.split(/\s+/).length;
  const toxicityScore = words > 0 ? Math.min(1, toxicCount / (words * 0.25)) : 0;
  
  return toxicityScore;
};

// Extract keywords from text
export const extractKeywords = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  
  // Remove common stop words
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'ought',
    'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve', 'you\'ve',
    'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d', 'i\'ll', 'you\'ll',
    'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t',
    'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t',
    'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s',
    'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s',
  ];
  
  // Split text into words
  const words = lowerText
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopWords.includes(word)); // Filter out stop words and short words
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {};
  
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }
  
  // Sort words by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
  
  // Return top keywords (up to 10)
  return sortedWords.slice(0, 10);
};

// Detect emotions in text
export const detectEmotions = (text: string): { joy: number; sadness: number; anger: number; fear: number; surprise: number } => {
  const lowerText = text.toLowerCase();
  
  // Emotion word lists
  const emotionWords = {
    joy: [
      'happy', 'joy', 'delighted', 'pleased', 'glad', 'thrilled', 'excited', 'cheerful', 'content',
      'satisfied', 'enjoy', 'love', 'wonderful', 'fantastic', 'great', 'awesome', 'excellent', 'amazing',
      'smile', 'laugh', 'celebrate', 'congratulations', 'proud', 'pleasure', 'grateful', 'thankful',
    ],
    sadness: [
      'sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'disappointed', 'upset', 'distressed',
      'heartbroken', 'grief', 'sorrow', 'regret', 'despair', 'hopeless', 'lonely', 'alone', 'abandoned',
      'rejected', 'hurt', 'pain', 'suffering', 'cry', 'tears', 'miss', 'lost', 'failure', 'sorry',
    ],
    anger: [
      'angry', 'mad', 'furious', 'outraged', 'annoyed', 'irritated', 'frustrated', 'enraged', 'hate',
      'resent', 'disgusted', 'offended', 'hostile', 'bitter', 'dislike', 'rage', 'temper', 'aggressive',
      'violent', 'fight', 'argument', 'conflict', 'dispute', 'complaint', 'blame', 'criticize',
    ],
    fear: [
      'afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'horror',
      'terror', 'dread', 'fear', 'alarmed', 'threatened', 'intimidated', 'insecure', 'uneasy', 'concern',
      'apprehensive', 'suspicious', 'doubt', 'uncertain', 'hesitant', 'risk', 'danger', 'threat',
    ],
    surprise: [
      'surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'startled', 'unexpected', 'sudden',
      'wonder', 'awe', 'disbelief', 'incredible', 'unbelievable', 'extraordinary', 'remarkable',
      'speechless', 'wow', 'omg', 'gosh', 'whoa', 'really', 'unexpected', 'revelation', 'discovery',
    ],
  };
  
  // Count emotion words
  const emotionCounts = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
  };
  
  // Count matches for each emotion
  for (const [emotion, words] of Object.entries(emotionWords)) {
    for (const word of words) {
      // Check for whole word matches using regex
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      
      if (matches) {
        emotionCounts[emotion as keyof typeof emotionCounts] += matches.length;
      }
    }
  }
  
  // Calculate percentages
  const totalEmotionWords = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  
  if (totalEmotionWords === 0) {
    // Default to neutral if no emotion words are found
    return {
      joy: 20,
      sadness: 20,
      anger: 20,
      fear: 20,
      surprise: 20,
    };
  }
  
  return {
    joy: Math.round((emotionCounts.joy / totalEmotionWords) * 100) || 0,
    sadness: Math.round((emotionCounts.sadness / totalEmotionWords) * 100) || 0,
    anger: Math.round((emotionCounts.anger / totalEmotionWords) * 100) || 0,
    fear: Math.round((emotionCounts.fear / totalEmotionWords) * 100) || 0,
    surprise: Math.round((emotionCounts.surprise / totalEmotionWords) * 100) || 0,
  };
};
