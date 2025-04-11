
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Youtube, Twitter, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SavedAnalysis {
  id: string;
  date: string;
  comments: string;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  explanation: string | null;
  source: 'youtube' | 'twitter' | 'text';
  sourceData?: string; // URL or username
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

  // Categorize analyses by source
  const youtubeAnalyses = analyses.filter(a => a.source === 'youtube');
  const twitterAnalyses = analyses.filter(a => a.source === 'twitter');
  const textAnalyses = analyses.filter(a => a.source === 'text');

  const AnalysisItem = ({ analysis }: { analysis: SavedAnalysis }) => (
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
      {analysis.sourceData && (
        <div className="mb-2">
          <span className="font-bold text-white dark:text-white light:text-navy mr-2">
            {analysis.source === 'youtube' ? 'Video:' : analysis.source === 'twitter' ? 'User:' : 'Source:'}
          </span>
          <span className="text-gray-400 break-words">{analysis.sourceData}</span>
        </div>
      )}
      <p className="text-gray dark:text-gray light:text-gray-dark line-clamp-3 mb-2">{analysis.comments}</p>
      {analysis.explanation && (
        <p className="text-gray-400 text-sm italic line-clamp-2">{analysis.explanation}</p>
      )}
    </div>
  );

  const AnalysisList = ({ items, expanded, icon }: { items: SavedAnalysis[], expanded: boolean, icon: React.ReactNode }) => {
    const visibleItems = expanded ? items : items.slice(0, 5);
    const hasMore = items.length > 5;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-navy">
            {items.length} {items.length === 1 ? 'Analysis' : 'Analyses'}
          </h3>
        </div>
        
        <ScrollArea className={expanded && items.length > 5 ? "h-[300px]" : "max-h-full"}>
          <div className="space-y-4">
            {visibleItems.map((analysis) => (
              <AnalysisItem key={analysis.id} analysis={analysis} />
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
      </div>
    );
  };

  return (
    <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
      <CardHeader>
        <CardTitle className="text-white dark:text-white light:text-navy">Recent Comment Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="youtube" disabled={youtubeAnalyses.length === 0}>YouTube</TabsTrigger>
            <TabsTrigger value="twitter" disabled={twitterAnalyses.length === 0}>Twitter/X</TabsTrigger>
            <TabsTrigger value="text" disabled={textAnalyses.length === 0}>Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-8">
              {youtubeAnalyses.length > 0 && (
                <div>
                  <AnalysisList 
                    items={youtubeAnalyses} 
                    expanded={expanded} 
                    icon={<Youtube className="h-5 w-5 text-blue" />} 
                  />
                </div>
              )}
              
              {twitterAnalyses.length > 0 && (
                <div>
                  <AnalysisList 
                    items={twitterAnalyses} 
                    expanded={expanded} 
                    icon={<Twitter className="h-5 w-5 text-blue" />} 
                  />
                </div>
              )}
              
              {textAnalyses.length > 0 && (
                <div>
                  <AnalysisList 
                    items={textAnalyses} 
                    expanded={expanded} 
                    icon={<FileText className="h-5 w-5 text-blue" />} 
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="youtube">
            <AnalysisList 
              items={youtubeAnalyses} 
              expanded={expanded} 
              icon={<Youtube className="h-5 w-5 text-blue" />} 
            />
          </TabsContent>
          
          <TabsContent value="twitter">
            <AnalysisList 
              items={twitterAnalyses} 
              expanded={expanded} 
              icon={<Twitter className="h-5 w-5 text-blue" />} 
            />
          </TabsContent>
          
          <TabsContent value="text">
            <AnalysisList 
              items={textAnalyses} 
              expanded={expanded} 
              icon={<FileText className="h-5 w-5 text-blue" />} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SavedAnalyses;
