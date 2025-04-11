
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from 'lucide-react';

interface SavedAnalysis {
  id: string;
  date: string;
  comments: string;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  explanation: string | null;
}

const SavedAnalyses = () => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const savedAnalysesJson = localStorage.getItem('sentimentSage-savedAnalyses');
      if (savedAnalysesJson) {
        const savedAnalyses: SavedAnalysis[] = JSON.parse(savedAnalysesJson);
        setAnalyses(savedAnalyses);
      }
    } catch (error) {
      console.error('Error loading saved analyses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSentimentEmoji = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return '👍';
      case 'negative': return '👎';
      case 'neutral': return '🤷';
      default: return '';
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return 'text-sentiment-positive';
      case 'negative': return 'text-sentiment-negative';
      case 'neutral': return 'text-sentiment-neutral';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">Recent Comment Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray dark:text-gray light:text-gray-dark">Loading saved analyses...</p>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">Recent Comment Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray dark:text-gray light:text-gray-dark">No saved analyses yet. Analyze some comments and save them to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  const visibleAnalyses = expanded ? analyses : analyses.slice(0, 5);
  const hasMore = analyses.length > 5;

  return (
    <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
      <CardHeader>
        <CardTitle className="text-white dark:text-white light:text-navy">Recent Comment Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={expanded ? "h-[300px]" : "max-h-full"}>
          <div className="space-y-4">
            {visibleAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">{formatDate(analysis.date)}</span>
                  <span className="text-xl">{getSentimentEmoji(analysis.sentiment)}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-white dark:text-white light:text-navy mr-2">Sentiment:</span>
                  <span className={`${getSentimentColor(analysis.sentiment)}`}>
                    {analysis.sentiment ? analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1) : 'Unknown'}
                  </span>
                </div>
                <p className="text-gray dark:text-gray light:text-gray-dark line-clamp-3 mb-2">{analysis.comments}</p>
                {analysis.explanation && (
                  <p className="text-gray-400 text-sm italic line-clamp-2">{analysis.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {hasMore && (
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              className="btn-secondary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"} <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedAnalyses;
