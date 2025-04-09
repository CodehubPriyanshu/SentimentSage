
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Send } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const Analyze = () => {
  const [comments, setComments] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | {
    positive: number;
    neutral: number;
    negative: number;
  }>(null);
  
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
  
  return (
    <div className="min-h-screen bg-navy">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Analyze Social Media <span className="text-blue">Comments</span>
          </h1>
          
          <p className="text-gray-300 text-lg text-center mb-12">
            Paste your social media comments below to get instant sentiment analysis
          </p>
          
          <Card className="bg-navy-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Comment Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Enter comments from social media, reviews, or feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste your comments here, one per line..."
                className="input-field min-h-[200px]"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
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
                disabled={isAnalyzing}
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
          
          {!results && !isAnalyzing && (
            <Alert className="bg-navy-dark border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white">Getting Started</AlertTitle>
              <AlertDescription className="text-gray-300">
                Enter some comments above or upload a CSV file to begin analysis. The AI will categorize each comment as positive, neutral, or negative.
              </AlertDescription>
            </Alert>
          )}
          
          {results && (
            <div className="card p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Analysis Results</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Positive Sentiment</span>
                    <span className="text-white">{results.positive}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sentiment-positive"
                      style={{ width: `${results.positive}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Neutral Sentiment</span>
                    <span className="text-white">{results.neutral}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sentiment-neutral"
                      style={{ width: `${results.neutral}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Negative Sentiment</span>
                    <span className="text-white">{results.negative}%</span>
                  </div>
                  <div className="h-4 bg-navy-dark rounded-full overflow-hidden">
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
