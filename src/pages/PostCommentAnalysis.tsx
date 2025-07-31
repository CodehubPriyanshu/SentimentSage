
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Send, ArrowRight } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import SocialMediaModal from "@/components/SocialMediaModal";
import { useAuth } from "@/hooks/useAuth";

const PostCommentAnalysis = () => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    explanation: string;
  }>(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const handleAnalyze = () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Mock analysis - replace with actual API call
    setTimeout(() => {
      // Determine sentiment based on content
      let sentiment: 'positive' | 'neutral' | 'negative';
      let score: number;
      let explanation: string;
      
      const lowerComment = comment.toLowerCase();
      
      if (lowerComment.includes('love') || lowerComment.includes('great') || lowerComment.includes('good') || lowerComment.includes('amazing')) {
        sentiment = 'positive';
        score = Math.random() * 0.3 + 0.7; // 0.7 - 1.0
        explanation = "This message is positive because it contains enthusiastic words like 'love', 'great', or 'amazing'. The tone appears to express satisfaction or happiness.";
      } else if (lowerComment.includes('bad') || lowerComment.includes('hate') || lowerComment.includes('terrible') || lowerComment.includes('awful')) {
        sentiment = 'negative';
        score = Math.random() * 0.3; // 0.0 - 0.3
        explanation = "This message is negative because it contains critical words like 'bad', 'hate', or 'terrible'. The tone appears to express dissatisfaction or frustration.";
      } else {
        sentiment = 'neutral';
        score = Math.random() * 0.4 + 0.3; // 0.3 - 0.7
        explanation = "This message is neutral because it doesn't contain strongly positive or negative language. The tone appears to be balanced or factual.";
      }
      
      setResult({
        sentiment,
        score,
        explanation
      });
      
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your comment has been analyzed",
      });
    }, 1500);
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    const colors = {
      positive: 'bg-sentiment-positive text-white',
      neutral: 'bg-sentiment-neutral text-navy-dark',
      negative: 'bg-sentiment-negative text-white',
    };
    return colors[sentiment];
  };

  const getSentimentEmoji = (sentiment: 'positive' | 'neutral' | 'negative') => {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😞',
    };
    return emojis[sentiment];
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            {user ? "Select Social Media to Analyze" : "Post Comment Analysis"}
          </h1>
          
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-8">
            {user 
              ? "Choose a platform to analyze or paste a single comment below for quick sentiment analysis"
              : "Paste a comment below to see how our sentiment analysis works"
            }
          </p>

          {user && (
            <div className="flex justify-center mb-8">
              <Button 
                className="bg-blue hover:bg-blue-light text-white font-medium rounded-full px-6 py-3 transition-transform hover:scale-105"
                onClick={() => setSocialModalOpen(true)}
              >
                Choose a Social Platform <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
          
          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy">Single Comment Analysis</CardTitle>
              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                Paste a single comment to analyze its sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Enter a comment to analyze..."
                  className="input-field min-h-[120px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !comment.trim()}
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Analyze Comment
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {!result && !isAnalyzing && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white dark:text-white light:text-navy">How It Works</AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                Enter a comment above and click "Analyze Comment" to see the sentiment analysis results. Our AI will classify the comment as positive, neutral, or negative and provide an explanation.
                {user && <p className="mt-2">For more comprehensive analysis, click "Choose a Social Platform" above to analyze multiple comments from Twitter/X or YouTube.</p>}
              </AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="space-y-6">
              <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                    Analysis Result <span className="ml-2 text-2xl">{getSentimentEmoji(result.sentiment)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-200 dark:text-gray-200 light:text-gray-700">Sentiment:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(result.sentiment)}`}>
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-lg font-bold text-gray-200 dark:text-gray-200 light:text-gray-700">Confidence:</span>
                    <div className="h-4 bg-navy-light dark:bg-navy-light light:bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${result.sentiment === 'positive' ? 'bg-sentiment-positive' : result.sentiment === 'negative' ? 'bg-sentiment-negative' : 'bg-sentiment-neutral'}`}
                        style={{ width: `${result.score * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                      {Math.round(result.score * 100)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <h3 className="text-blue dark:text-blue light:text-blue text-lg font-bold">Why This Message Got This Reaction</h3>
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">
                      {result.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {user && (
                <div className="text-center">
                  <Button 
                    className="bg-blue hover:bg-blue-light text-white font-medium rounded-full px-6 py-3 transition-transform hover:scale-105"
                    onClick={() => setSocialModalOpen(true)}
                  >
                    Try with Social Media Content <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SocialMediaModal 
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
      />
    </div>
  );
};

export default PostCommentAnalysis;
