// Simple sentiment analysis function using keyword matching
export const analyzeSentiment = (
  text: string
): { sentiment: "positive" | "negative" | "neutral"; explanation: string } => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // English positive keywords
  const englishPositive = [
    "good",
    "great",
    "excellent",
    "amazing",
    "love",
    "happy",
    "wonderful",
    "fantastic",
    "best",
    "awesome",
  ];
  // English negative keywords
  const englishNegative = [
    "bad",
    "terrible",
    "horrible",
    "hate",
    "awful",
    "worst",
    "poor",
    "disappointed",
    "unhappy",
    "sad",
  ];

  // Spanish keywords
  const spanishPositive = [
    "bueno",
    "excelente",
    "increíble",
    "amor",
    "feliz",
    "maravilloso",
    "fantástico",
    "mejor",
    "asombroso",
  ];
  const spanishNegative = [
    "malo",
    "terrible",
    "horrible",
    "odio",
    "peor",
    "pobre",
    "decepcionado",
    "infeliz",
    "triste",
  ];

  // French keywords
  const frenchPositive = [
    "bon",
    "excellent",
    "incroyable",
    "amour",
    "heureux",
    "merveilleux",
    "fantastique",
    "meilleur",
  ];
  const frenchNegative = [
    "mauvais",
    "terrible",
    "horrible",
    "déteste",
    "pire",
    "pauvre",
    "déçu",
    "malheureux",
    "triste",
  ];

  // German keywords
  const germanPositive = [
    "gut",
    "ausgezeichnet",
    "erstaunlich",
    "liebe",
    "glücklich",
    "wunderbar",
    "fantastisch",
    "beste",
  ];
  const germanNegative = [
    "schlecht",
    "schrecklich",
    "hassen",
    "schlimmste",
    "arm",
    "enttäuscht",
    "unglücklich",
    "traurig",
  ];

  // Russian keywords (transliterated)
  const russianPositive = [
    "хорошо",
    "отлично",
    "удивительно",
    "любовь",
    "счастливый",
    "замечательно",
    "фантастический",
    "лучший",
  ];
  const russianNegative = [
    "плохо",
    "ужасно",
    "ненавидеть",
    "худший",
    "разочарованный",
    "несчастный",
    "грустный",
  ];

  // Hindi keywords (transliterated)
  const hindiPositive = [
    "अच्छा",
    "उत्कृष्ट",
    "अद्भुत",
    "प्यार",
    "खुश",
    "शानदार",
    "बेहतरीन",
  ];
  const hindiNegative = [
    "बुरा",
    "भयानक",
    "नफरत",
    "बदतरीन",
    "निराश",
    "दुखी",
    "उदास",
  ];

  // Combine all positive and negative keywords
  const positiveKeywords = [
    ...englishPositive,
    ...spanishPositive,
    ...frenchPositive,
    ...germanPositive,
    ...russianPositive,
    ...hindiPositive,
  ];

  const negativeKeywords = [
    ...englishNegative,
    ...spanishNegative,
    ...frenchNegative,
    ...germanNegative,
    ...russianNegative,
    ...hindiNegative,
  ];

  // Count occurrences of positive and negative keywords
  let positiveCount = 0;
  const positiveWords: string[] = [];
  let negativeCount = 0;
  const negativeWords: string[] = [];

  positiveKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      positiveCount++;
      positiveWords.push(keyword);
    }
  });

  negativeKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      negativeCount++;
      negativeWords.push(keyword);
    }
  });

  // Determine sentiment based on counts
  if (positiveCount > negativeCount) {
    return {
      sentiment: "positive",
      explanation:
        positiveWords.length > 0
          ? `This text has a positive tone due to words like: ${positiveWords
              .slice(0, 3)
              .join(", ")}.`
          : "This text has a positive tone due to enthusiastic words.",
    };
  } else if (negativeCount > positiveCount) {
    return {
      sentiment: "negative",
      explanation:
        negativeWords.length > 0
          ? `This text has a negative tone due to words like: ${negativeWords
              .slice(0, 3)
              .join(", ")}.`
          : "This text has a negative tone due to critical words.",
    };
  } else {
    return {
      sentiment: "neutral",
      explanation:
        "This text appears to have a neutral tone or balanced positive and negative elements.",
    };
  }
};
