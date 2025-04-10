
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Send, Youtube } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AnalysisResult {
  summary: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords: string[];
}

const YoutubeAnalysis = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFetch = () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsFetching(true);
    
    // Mock fetching YouTube data - replace with actual API call
    setTimeout(() => {
      // Generate mock analysis result
      const mockResult: AnalysisResult = {
        summary: "This video has received mostly positive feedback. Viewers appreciate the clear explanations and practical examples provided. Some negative comments focus on the audio quality in certain segments. The overall sentiment is positive with engagement metrics showing above-average viewer retention.",
        sentiment: {
          positive: 68,
          neutral: 22,
          negative: 10
        },
        keywords: ["helpful", "informative", "clear", "audio issues", "useful examples", "well-explained"]
      };
      
      setResult(mockResult);
      setIsFetching(false);
      
      toast({
        title: "Analysis Complete",
        description: "YouTube video comments have been analyzed",
      });
    }, 3000);
  };

  const sentimentData = result ? [
    { name: 'Positive', value: result.sentiment.positive, color: '#4CAF50' },
    { name: 'Neutral', value: result.sentiment.neutral, color: '#FFCA28' },
    { name: 'Negative', value: result.sentiment.negative, color: '#F44336' }
  ] : [];
  
  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            YouTube <span className="text-blue">Sentiment Analysis</span>
          </h1>
          
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-12">
            Analyze YouTube video comments and transcripts for deeper insights
          </p>
          
          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                <Youtube className="h-5 w-5 mr-2 text-blue" />
                YouTube Analysis
              </CardTitle>
              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                Enter a YouTube video URL to analyze comments and transcript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input-field flex-grow"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  <Button 
                    className="btn-primary flex-shrink-0"
                    onClick={handleFetch}
                    disabled={isFetching || !youtubeUrl.trim()}
                  >
                    {isFetching ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Analyze Video
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!result && !isFetching && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white dark:text-white light:text-navy">Getting Started</AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                Enter a YouTube video URL above to begin analysis. Our AI will analyze the comments and transcript to provide sentiment analysis and key insights.
              </AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="space-y-6">
              <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">{result.summary}</p>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy">Sentiment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center pt-4">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sentimentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {sentimentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value}%`}
                            contentStyle={{
                              backgroundColor: 'rgba(22, 22, 26, 0.9)',
                              borderColor: '#666',
                              color: '#fff'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy">Key Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 pt-4">
                      {result.keywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-navy-light dark:bg-navy-light light:bg-gray-200 rounded-full text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 text-center">
                <Button variant="outline" className="btn-secondary">
                  Download Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeAnalysis;
