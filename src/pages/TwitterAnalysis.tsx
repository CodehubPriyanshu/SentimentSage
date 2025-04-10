
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Send, Twitter } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Tweet {
  id: string;
  text: string;
  author: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

const TwitterAnalysis = () => {
  const [twitterHandle, setTwitterHandle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);

  const handleFetch = () => {
    if (!twitterHandle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Twitter handle",
        variant: "destructive"
      });
      return;
    }
    
    setIsFetching(true);
    
    // Mock fetching tweets - replace with actual Twitter API call
    setTimeout(() => {
      // Generate mock tweets
      const mockTweets: Tweet[] = [
        {
          id: '1',
          text: "I absolutely love the new features! This is a game-changer for how I work.",
          author: "@happyuser123",
          sentiment: 'positive',
          score: 0.92
        },
        {
          id: '2',
          text: "The update is fine, but I was expecting more improvements to the interface.",
          author: "@neutraluser",
          sentiment: 'neutral',
          score: 0.56
        },
        {
          id: '3',
          text: "This is the worst update ever. Nothing works anymore and I've lost all my settings.",
          author: "@angryuser",
          sentiment: 'negative',
          score: 0.12
        },
        {
          id: '4',
          text: "Great customer service experience today. The team was so helpful!",
          author: "@satisfied_customer",
          sentiment: 'positive',
          score: 0.89
        },
        {
          id: '5',
          text: "Not sure how I feel about this change. Some things are better, others worse.",
          author: "@undecided_user",
          sentiment: 'neutral',
          score: 0.45
        }
      ];
      
      setTweets(mockTweets);
      setIsFetching(false);
      
      toast({
        title: "Tweets Fetched",
        description: `Analyzed ${mockTweets.length} tweets for @${twitterHandle}`,
      });
    }, 2000);
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    const colors = {
      positive: 'bg-sentiment-positive text-white',
      neutral: 'bg-sentiment-neutral text-navy-dark',
      negative: 'bg-sentiment-negative text-white',
    };
    return colors[sentiment];
  };
  
  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            Twitter/X <span className="text-blue">Sentiment Analysis</span>
          </h1>
          
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-12">
            Analyze tweets to understand audience sentiment and engagement
          </p>
          
          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                <Twitter className="h-5 w-5 mr-2 text-blue" />
                Twitter/X Analysis
              </CardTitle>
              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                Enter a Twitter/X handle to analyze recent tweets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <Input 
                      placeholder="username"
                      className="input-field pl-8"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="btn-primary flex-shrink-0"
                    onClick={handleFetch}
                    disabled={isFetching || !twitterHandle.trim()}
                  >
                    {isFetching ? (
                      <>Fetching...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Fetch Tweets
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!tweets.length && !isFetching && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white dark:text-white light:text-navy">Getting Started</AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                Enter a Twitter/X handle above to begin analysis. The AI will categorize each tweet as positive, neutral, or negative.
              </AlertDescription>
            </Alert>
          )}
          
          {tweets.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy">Tweet Analysis Results</h2>
              
              {tweets.map((tweet) => (
                <Card key={tweet.id} className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="text-gray-200 dark:text-gray-200 light:text-gray-700 mb-2">{tweet.text}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">{tweet.author}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-sm font-medium ml-4 ${getSentimentColor(tweet.sentiment)}`}>
                        {tweet.sentiment.charAt(0).toUpperCase() + tweet.sentiment.slice(1)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="card p-6 mt-8">
                <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-4">Sentiment Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">Positive Tweets</span>
                      <span className="text-white dark:text-white light:text-navy">
                        {tweets.filter(t => t.sentiment === 'positive').length} / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-sentiment-positive"
                        style={{ width: `${(tweets.filter(t => t.sentiment === 'positive').length / tweets.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">Neutral Tweets</span>
                      <span className="text-white dark:text-white light:text-navy">
                        {tweets.filter(t => t.sentiment === 'neutral').length} / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-sentiment-neutral"
                        style={{ width: `${(tweets.filter(t => t.sentiment === 'neutral').length / tweets.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">Negative Tweets</span>
                      <span className="text-white dark:text-white light:text-navy">
                        {tweets.filter(t => t.sentiment === 'negative').length} / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-sentiment-negative"
                        style={{ width: `${(tweets.filter(t => t.sentiment === 'negative').length / tweets.length) * 100}%` }}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterAnalysis;
