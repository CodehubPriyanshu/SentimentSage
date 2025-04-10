
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Send, Copy, Clipboard } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { analyzeSentiment } from "@/utils/sentimentAnalysis";

const Analyze = () => {
  const [comments, setComments] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | {
    positive: number;
    neutral: number;
    negative: number;
  }>(null);
  const [sentimentResult, setSentimentResult] = useState<null | {
    sentiment: 'positive' | 'negative' | 'neutral';
    explanation: string;
  }>(null);
  
  useEffect(() => {
    if (comments.trim()) {
      const analysis = analyzeSentiment(comments);
      setSentimentResult(analysis);
    } else {
      setSentimentResult(null);
    }
  }, [comments]);

  const handleAnalyze = () => {
    if (!comments.trim()) {
      toast({
        title: "Error",
        description: "Please enter some comments to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Mock analysis - replace with actual API call
    setTimeout(() => {
      // Generate random results for demonstration
      const positive = Math.floor(Math.random() * 60) + 20; // 20-80%
      const negative = Math.floor(Math.random() * (100 - positive - 10)) + 5; // 5-75%
      const neutral = 100 - positive - negative;
      
      setResults({
        positive,
        neutral,
        negative
      });
      
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your comments have been analyzed successfully",
      });
    }, 2000);
  };
  
  const handleUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "File upload functionality will be available in the next release",
    });
  };

  const handleCopy = () => {
    if (navigator.clipboard && comments.trim()) {
      navigator.clipboard.writeText(comments)
        .then(() => {
          toast({
            title: "Copied",
            description: "Text copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Could not copy text to clipboard",
            variant: "destructive"
          });
        });
    }
  };

  const handlePaste = async () => {
    if (navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        setComments(text);
        toast({
          title: "Pasted",
          description: "Text pasted from clipboard",
        });
      } catch (error) {
        toast({
          title: "Paste Failed",
          description: "Could not read from clipboard. Make sure you have permission.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Clipboard API not supported",
        description: "Your browser doesn't support clipboard operations",
        variant: "destructive"
      });
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
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            Analyze Social Media <span className="text-blue">Comments</span>
          </h1>
          
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-12">
            Paste your social media comments below to get instant sentiment analysis
          </p>
          
          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy">Comment Analysis</CardTitle>
              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                Enter comments from social media, reviews, or feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Paste your comments here, one per line..."
                  className="input-field min-h-[200px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline" 
                    className="btn-secondary"
                    onClick={handleCopy}
                    disabled={!comments.trim()}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline" 
                    className="btn-secondary"
                    onClick={handlePaste}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Paste
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline" 
                className="btn-secondary"
                onClick={handleUpload}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <Button 
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !comments.trim()}
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Analyze Comments
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {sentimentResult && comments.trim() && (
            <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                  Real-Time Analysis <span className="ml-2 text-2xl">{sentimentEmoji[sentimentResult.sentiment]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2 text-white dark:text-white light:text-navy">Sentiment:</span>
                    <span className={`text-lg font-medium ${sentimentColor[sentimentResult.sentiment]}`}>
                      {sentimentResult.sentiment.charAt(0).toUpperCase() + sentimentResult.sentiment.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sentimentResult && comments.trim() && (
            <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-blue dark:text-blue light:text-blue">
                  Why This Message Got This Reaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray dark:text-gray light:text-gray-dark">
                  {sentimentResult.explanation}
                </p>
              </CardContent>
            </Card>
          )}
          
          {!sentimentResult && !isAnalyzing && !comments.trim() && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white dark:text-white light:text-navy">Getting Started</AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                Enter some comments above or upload a CSV file to begin analysis. The AI will categorize each comment as positive, neutral, or negative.
              </AlertDescription>
            </Alert>
          )}
          
          {results && (
            <div className="card p-6 mb-8 bg-navy-light dark:bg-navy-light light:bg-gray-light">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-4">Analysis Results</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white dark:text-white light:text-navy">Positive Sentiment</span>
                    <span className="text-white dark:text-white light:text-navy">{results.positive}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sentiment-positive"
                      style={{ width: `${results.positive}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white dark:text-white light:text-navy">Neutral Sentiment</span>
                    <span className="text-white dark:text-white light:text-navy">{results.neutral}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sentiment-neutral"
                      style={{ width: `${results.neutral}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white dark:text-white light:text-navy">Negative Sentiment</span>
                    <span className="text-white dark:text-white light:text-navy">{results.negative}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sentiment-negative"
                      style={{ width: `${results.negative}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button variant="outline" className="btn-secondary">
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
