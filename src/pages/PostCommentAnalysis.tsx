
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Simple sentiment analysis function using keyword matching
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'negative' | 'neutral', explanation: string } => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // English positive keywords
  const englishPositive = ['good', 'great', 'excellent', 'amazing', 'love', 'happy', 'wonderful', 'fantastic', 'best', 'awesome'];
  // English negative keywords
  const englishNegative = ['bad', 'terrible', 'horrible', 'hate', 'awful', 'worst', 'poor', 'disappointed', 'unhappy', 'sad'];
  
  // Spanish keywords
  const spanishPositive = ['bueno', 'excelente', 'increíble', 'amor', 'feliz', 'maravilloso', 'fantástico', 'mejor', 'asombroso'];
  const spanishNegative = ['malo', 'terrible', 'horrible', 'odio', 'peor', 'pobre', 'decepcionado', 'infeliz', 'triste'];
  
  // French keywords
  const frenchPositive = ['bon', 'excellent', 'incroyable', 'amour', 'heureux', 'merveilleux', 'fantastique', 'meilleur'];
  const frenchNegative = ['mauvais', 'terrible', 'horrible', 'déteste', 'pire', 'pauvre', 'déçu', 'malheureux', 'triste'];
  
  // German keywords
  const germanPositive = ['gut', 'ausgezeichnet', 'erstaunlich', 'liebe', 'glücklich', 'wunderbar', 'fantastisch', 'beste'];
  const germanNegative = ['schlecht', 'schrecklich', 'hassen', 'schlimmste', 'arm', 'enttäuscht', 'unglücklich', 'traurig'];
  
  // Russian keywords (transliterated)
  const russianPositive = ['хорошо', 'отлично', 'удивительно', 'любовь', 'счастливый', 'замечательно', 'фантастический', 'лучший'];
  const russianNegative = ['плохо', 'ужасно', 'ненавидеть', 'худший', 'разочарованный', 'несчастный', 'грустный'];
  
  // Hindi keywords (transliterated)
  const hindiPositive = ['अच्छा', 'उत्कृष्ट', 'अद्भुत', 'प्यार', 'खुश', 'शानदार', 'बेहतरीन'];
  const hindiNegative = ['बुरा', 'भयानक', 'नफरत', 'बदतरीन', 'निराश', 'दुखी', 'उदास'];
  
  // Combine all positive and negative keywords
  const positiveKeywords = [
    ...englishPositive, ...spanishPositive, ...frenchPositive, 
    ...germanPositive, ...russianPositive, ...hindiPositive
  ];
  
  const negativeKeywords = [
    ...englishNegative, ...spanishNegative, ...frenchNegative, 
    ...germanNegative, ...russianNegative, ...hindiNegative
  ];
  
  // Count occurrences of positive and negative keywords
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveCount++;
    }
  });
  
  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeCount++;
    }
  });
  
  // Determine sentiment based on counts
  if (positiveCount > negativeCount) {
    return { 
      sentiment: 'positive',
      explanation: "This text has a positive tone due to enthusiastic words." 
    };
  } else if (negativeCount > positiveCount) {
    return { 
      sentiment: 'negative',
      explanation: "This text has a negative tone due to critical words." 
    };
  } else {
    return { 
      sentiment: 'neutral',
      explanation: "This text appears to have a neutral tone or balanced positive and negative elements." 
    };
  }
};

const PostCommentAnalysis = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ 
    sentiment: 'positive' | 'negative' | 'neutral', 
    explanation: string 
  } | null>(null);
  
  const handleAnalyze = () => {
    if (text.trim()) {
      const analysis = analyzeSentiment(text);
      setResult(analysis);
    }
  };
  
  const sentimentEmoji = {
    positive: '👍',
    negative: '👎',
    neutral: '🤷'
  };
  
  const sentimentColor = {
    positive: 'text-sentiment-positive',
    negative: 'text-sentiment-negative',
    neutral: 'text-sentiment-neutral'
  };
  
  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white dark:text-white light:text-navy mb-8 text-center">
          Post Comment <span className="text-blue">Analysis</span>
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <Card className="dark:bg-navy-light light:bg-gray-light mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy">
                Analyze Your Comment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea 
                  className="w-full h-32 px-4 py-2 rounded-lg bg-navy-dark dark:bg-navy-dark light:bg-white text-white dark:text-white light:text-navy-dark border border-border resize-none focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Paste your comment here in any supported language (English, Spanish, French, German, Russian, Hindi)..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
                
                <Button 
                  className="w-full bg-blue hover:bg-blue-light text-white font-medium py-3 rounded-full transition-transform hover:scale-105"
                  onClick={handleAnalyze}
                  disabled={!text.trim()}
                >
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {result && (
            <Card className="dark:bg-navy-light light:bg-gray-light animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                  Result <span className="ml-2 text-2xl">{sentimentEmoji[result.sentiment]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">Sentiment:</span>
                    <span className={`text-lg font-medium ${sentimentColor[result.sentiment]}`}>
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-lg font-bold">Explanation:</span>
                    <p className="mt-1 text-gray dark:text-gray light:text-gray-dark">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCommentAnalysis;
