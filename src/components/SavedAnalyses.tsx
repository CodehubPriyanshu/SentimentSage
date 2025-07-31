import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  Youtube,
  Twitter,
  FileText,
  Database,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileApi } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

interface DatasetSummary {
  rows: number;
  columns: number;
  missing_values: number;
  duplicate_rows: number;
  column_names?: string[];
  insights_preview?: string;
}

interface AnalysisData {
  dataset_summary?: DatasetSummary;
  sentiment_scores?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  comments_data?: string;
  tweets_data?: string;
  ai_insights?: string;
  // Allow for additional properties with unknown type
  [key: string]: unknown;
}

interface Analysis {
  id: number | string;
  user_id: number | string;
  created_at: string;
  positive_sentiment: number;
  neutral_sentiment: number;
  negative_sentiment: number;
  ai_insights?: string;
  ai_insights_preview?: string;
  analysis_type: "text" | "csv" | "twitter" | "youtube";
  type?: "text" | "csv" | "twitter" | "youtube"; // For backward compatibility
  text_content?: string;
  text_preview?: string;
  filename?: string;
  row_count?: number;
  username?: string;
  tweet_count?: number;
  video_title?: string;
  video_url?: string;
  comment_count?: number;
  dataset_summary?: DatasetSummary;
  data?: AnalysisData;
}

const SavedAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await profileApi.getAnalyses();
      setAnalyses(response.analyses || []);
    } catch (error) {
      console.error("Error loading analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getSentimentEmoji = (
    positive: number,
    negative: number,
    neutral: number
  ) => {
    if (positive > negative && positive > neutral) {
      return "😊";
    } else if (negative > positive && negative > neutral) {
      return "😞";
    } else {
      return "😐";
    }
  };

  const getSentimentColor = (
    positive: number,
    negative: number,
    neutral: number
  ) => {
    if (positive > negative && positive > neutral) {
      return "text-green-500";
    } else if (negative > positive && negative > neutral) {
      return "text-red-500";
    } else {
      return "text-gray-400";
    }
  };

  const getSentimentText = (
    positive: number,
    negative: number,
    neutral: number
  ) => {
    if (positive > negative && positive > neutral) {
      return "Positive";
    } else if (negative > positive && negative > neutral) {
      return "Negative";
    } else {
      return "Neutral";
    }
  };

  if (loading) {
    return (
      <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your analyses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
            No saved analyses yet. Analyze some content to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Categorize analyses by type (supporting both old and new field names)
  const youtubeAnalyses = analyses.filter(
    (a) => a.type === "youtube" || a.analysis_type === "youtube"
  );
  const twitterAnalyses = analyses.filter(
    (a) => a.type === "twitter" || a.analysis_type === "twitter"
  );
  const textAnalyses = analyses.filter(
    (a) => a.type === "text" || a.analysis_type === "text"
  );
  const csvAnalyses = analyses.filter(
    (a) => a.type === "csv" || a.analysis_type === "csv"
  );

  // Log analyses for debugging
  console.log("All analyses:", analyses);
  console.log("Twitter analyses:", twitterAnalyses);

  const AnalysisItem = ({ analysis }: { analysis: Analysis }) => (
    <div key={analysis.id} className="p-4 border border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">
          {formatDate(analysis.created_at)}
        </span>
        <span className="text-xl">
          {getSentimentEmoji(
            analysis.positive_sentiment,
            analysis.negative_sentiment,
            analysis.neutral_sentiment
          )}
        </span>
      </div>
      <div className="mb-2">
        <span className="font-bold text-white dark:text-white light:text-navy mr-2">
          Sentiment:
        </span>
        <span
          className={getSentimentColor(
            analysis.positive_sentiment,
            analysis.negative_sentiment,
            analysis.neutral_sentiment
          )}
        >
          {getSentimentText(
            analysis.positive_sentiment,
            analysis.negative_sentiment,
            analysis.neutral_sentiment
          )}
        </span>
      </div>

      {/* Source-specific information */}
      {(analysis.type === "text" || analysis.analysis_type === "text") && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-white dark:text-white light:text-navy mr-2">
              Saved Comment Analysis
            </span>
            <span className="text-xs bg-blue text-white px-2 py-1 rounded">
              Text Analysis
            </span>
          </div>

          {/* Display text content if available */}
          {(analysis.text_content ||
            analysis.text_preview ||
            analysis.text ||
            analysis.data?.text) && (
            <div className="mb-2">
              <span className="font-bold text-white dark:text-white light:text-navy mr-2">
                Text:
              </span>
              <span className="text-gray-400 break-words line-clamp-2">
                {analysis.text_preview ||
                  analysis.text_content ||
                  analysis.text ||
                  analysis.data?.text ||
                  "Text analysis"}
              </span>
            </div>
          )}

          {/* Try to parse and display metadata if available */}
          {(analysis.metadata || analysis.data?.metadata) && (
            <div className="mt-2">
              {(() => {
                try {
                  // Try to parse metadata from either direct property or data object
                  const metadataStr =
                    analysis.metadata || analysis.data?.metadata;
                  const metadata =
                    typeof metadataStr === "string"
                      ? JSON.parse(metadataStr)
                      : metadataStr;

                  return (
                    <div className="text-gray-400 text-sm">
                      {metadata.total_comments && (
                        <div className="mb-1">
                          <span className="font-medium">
                            Comments analyzed:
                          </span>{" "}
                          {metadata.total_comments}
                        </div>
                      )}
                      {metadata.timestamp && (
                        <div className="mb-1">
                          <span className="font-medium">Analyzed on:</span>{" "}
                          {new Date(metadata.timestamp).toLocaleString()}
                        </div>
                      )}
                      {metadata.keywords && metadata.keywords.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium block mb-1">
                            Key themes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {metadata.keywords
                              .slice(0, 5)
                              .map((keyword: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-navy dark:bg-navy light:bg-gray-200 px-2 py-0.5 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Display emotions if available */}
                      {metadata.emotions &&
                        Object.keys(metadata.emotions).length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium block mb-1">
                              Emotions detected:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(metadata.emotions)
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 3)
                                .map(
                                  (
                                    [emotion, value]: [string, any],
                                    idx: number
                                  ) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-navy dark:bg-navy light:bg-gray-200 px-2 py-0.5 rounded"
                                    >
                                      {emotion}:{" "}
                                      {typeof value === "number"
                                        ? Math.round(value)
                                        : value}
                                      %
                                    </span>
                                  )
                                )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                } catch (e) {
                  console.error("Error parsing metadata:", e);
                  return null;
                }
              })()}
            </div>
          )}
        </div>
      )}

      {(analysis.type === "csv" || analysis.analysis_type === "csv") && (
        <>
          <div className="mb-2">
            <span className="font-bold text-white dark:text-white light:text-navy mr-2">
              File:
            </span>
            <span className="text-gray-400 break-words">
              {analysis.filename}
            </span>
          </div>
          {/* Display dataset summary from either the new format or the old format */}
          {(analysis.dataset_summary || analysis.data?.dataset_summary) && (
            <div className="mb-2">
              <div className="font-bold text-white dark:text-white light:text-navy mb-1">
                Dataset Summary:
              </div>
              <div className="text-gray-400 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span>Rows:</span>
                  <span>
                    {analysis.dataset_summary?.rows ||
                      analysis.data?.dataset_summary?.rows ||
                      analysis.row_count ||
                      0}
                  </span>
                  <span>Columns:</span>
                  <span>
                    {analysis.dataset_summary?.columns ||
                      analysis.data?.dataset_summary?.columns ||
                      0}
                  </span>
                  <span>Missing Values:</span>
                  <span>
                    {analysis.dataset_summary?.missing_values ||
                      analysis.data?.dataset_summary?.missing_values ||
                      0}
                  </span>
                  <span>Duplicate Rows:</span>
                  <span>
                    {analysis.dataset_summary?.duplicate_rows ||
                      analysis.data?.dataset_summary?.duplicate_rows ||
                      0}
                  </span>
                </div>
                {/* Display insights preview */}
                {(analysis.dataset_summary?.insights_preview ||
                  analysis.data?.dataset_summary?.insights_preview ||
                  analysis.ai_insights_preview) && (
                  <div className="mt-2">
                    <span className="font-bold text-white dark:text-white light:text-navy mr-2">
                      Insights:
                    </span>
                    <span className="text-gray-400 text-sm line-clamp-2">
                      {analysis.dataset_summary?.insights_preview ||
                        analysis.data?.dataset_summary?.insights_preview ||
                        analysis.ai_insights_preview}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {(analysis.type === "twitter" ||
        analysis.analysis_type === "twitter") && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-bold text-white dark:text-white light:text-navy mr-2">
                User:
              </span>
              <span className="text-gray-400 break-words">
                @{analysis.username || analysis.data?.username || "unknown"}
              </span>
              {(analysis.tweet_count || analysis.data?.tweet_count) && (
                <span className="text-gray-400 text-sm ml-2">
                  ({analysis.tweet_count || analysis.data?.tweet_count} tweets)
                </span>
              )}
            </div>
            <span className="text-xs bg-blue text-white px-2 py-1 rounded">
              Twitter Analysis
            </span>
          </div>

          {/* Display sentiment distribution */}
          <div className="mb-3">
            <div className="font-bold text-white dark:text-white light:text-navy mb-1">
              Sentiment Distribution:
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-green-500 font-medium">Positive: </span>
                <span className="text-gray-400">
                  {Math.round(
                    (analysis.positive_sentiment ||
                      analysis.data?.sentiment_scores?.positive ||
                      0) * 100
                  )}
                  %
                </span>
              </div>
              <div>
                <span className="text-blue-500 font-medium">Neutral: </span>
                <span className="text-gray-400">
                  {Math.round(
                    (analysis.neutral_sentiment ||
                      analysis.data?.sentiment_scores?.neutral ||
                      0) * 100
                  )}
                  %
                </span>
              </div>
              <div>
                <span className="text-red-500 font-medium">Negative: </span>
                <span className="text-gray-400">
                  {Math.round(
                    (analysis.negative_sentiment ||
                      analysis.data?.sentiment_scores?.negative ||
                      0) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Try to parse and display tweet data if available */}
          {(analysis.tweets_data || analysis.data?.tweets_data) && (
            <div className="mt-3">
              <span className="font-bold text-white dark:text-white light:text-navy block mb-1">
                Sample Tweets:
              </span>
              <div className="max-h-32 overflow-y-auto">
                {(() => {
                  try {
                    // Try to get tweets data from either direct property or nested data object
                    const tweetsDataStr =
                      analysis.tweets_data || analysis.data?.tweets_data;
                    const tweetData =
                      typeof tweetsDataStr === "string"
                        ? JSON.parse(tweetsDataStr)
                        : tweetsDataStr;

                    return Array.isArray(tweetData) && tweetData.length > 0 ? (
                      tweetData.slice(0, 3).map((tweet: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-gray-400 text-sm mb-2 border-l-2 border-blue pl-2"
                        >
                          <p className="line-clamp-2">{tweet.text}</p>
                          <div className="flex items-center mt-1">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                                tweet.sentiment === "positive"
                                  ? "bg-green-500 text-white"
                                  : tweet.sentiment === "negative"
                                  ? "bg-red-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {tweet.sentiment}
                            </span>
                            <span className="text-xs text-gray-500">
                              {tweet.created_at
                                ? new Date(
                                    tweet.created_at
                                  ).toLocaleDateString()
                                : "Unknown date"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        No tweet data available
                      </p>
                    );
                  } catch (e) {
                    console.error("Error parsing tweet data:", e);
                    return (
                      <p className="text-gray-400 text-sm italic">
                        Tweet data not available
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Display AI insights if available */}
          {(analysis.ai_insights || analysis.data?.ai_insights) && (
            <div className="mt-3">
              <span className="font-bold text-white dark:text-white light:text-navy block mb-1">
                AI Insights:
              </span>
              <p className="text-gray-400 text-sm line-clamp-3">
                {analysis.ai_insights || analysis.data?.ai_insights}
              </p>
            </div>
          )}
        </div>
      )}

      {(analysis.type === "youtube" ||
        analysis.analysis_type === "youtube") && (
        <div className="mb-2">
          <span className="font-bold text-white dark:text-white light:text-navy mr-2">
            Video:
          </span>
          <span className="text-gray-400 break-words line-clamp-1">
            {analysis.video_title || analysis.video_id || "YouTube Video"}
          </span>
          {analysis.comment_count && (
            <span className="text-gray-400 text-sm ml-2">
              ({analysis.comment_count} comments)
            </span>
          )}
        </div>
      )}

      {/* AI Insights */}
      {(analysis.ai_insights || analysis.ai_insights_preview) && (
        <div className="mt-3">
          <span className="font-bold text-white dark:text-white light:text-navy block mb-1">
            AI Insights:
          </span>
          <p className="text-gray-400 text-sm italic line-clamp-2">
            {analysis.ai_insights_preview || analysis.ai_insights}
          </p>
        </div>
      )}
    </div>
  );

  const AnalysisList = ({
    items,
    expanded,
    icon,
  }: {
    items: Analysis[];
    expanded: boolean;
    icon: React.ReactNode;
  }) => {
    const visibleItems = expanded ? items : items.slice(0, 5);
    const hasMore = items.length > 5;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-navy">
            {items.length} {items.length === 1 ? "Analysis" : "Analyses"}
          </h3>
        </div>

        <ScrollArea
          className={expanded && items.length > 5 ? "h-[300px]" : "max-h-full"}
        >
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
              {expanded ? "Show Less" : "Show More"}{" "}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light mb-6">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="text" disabled={textAnalyses.length === 0}>
                Text
              </TabsTrigger>
              <TabsTrigger value="csv" disabled={csvAnalyses.length === 0}>
                CSV
              </TabsTrigger>
              <TabsTrigger
                value="twitter"
                disabled={twitterAnalyses.length === 0}
              >
                Twitter
              </TabsTrigger>
              <TabsTrigger
                value="youtube"
                disabled={youtubeAnalyses.length === 0}
              >
                YouTube
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-8">
                {csvAnalyses.length > 0 && (
                  <div>
                    <AnalysisList
                      items={csvAnalyses}
                      expanded={expanded}
                      icon={<Database className="h-5 w-5 text-green-500" />}
                    />
                  </div>
                )}

                {youtubeAnalyses.length > 0 && (
                  <div>
                    <AnalysisList
                      items={youtubeAnalyses}
                      expanded={expanded}
                      icon={<Youtube className="h-5 w-5 text-red-500" />}
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

            <TabsContent value="text">
              <AnalysisList
                items={textAnalyses}
                expanded={expanded}
                icon={<FileText className="h-5 w-5 text-blue" />}
              />
            </TabsContent>

            <TabsContent value="csv">
              <AnalysisList
                items={csvAnalyses}
                expanded={expanded}
                icon={<Database className="h-5 w-5 text-green-500" />}
              />
            </TabsContent>

            <TabsContent value="twitter">
              <AnalysisList
                items={twitterAnalyses}
                expanded={expanded}
                icon={<Twitter className="h-5 w-5 text-blue" />}
              />
            </TabsContent>

            <TabsContent value="youtube">
              <AnalysisList
                items={youtubeAnalyses}
                expanded={expanded}
                icon={<Youtube className="h-5 w-5 text-red-500" />}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dedicated Twitter Analysis Section */}
      {twitterAnalyses.length > 0 && (
        <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
          <CardHeader>
            <div className="flex items-center">
              <Twitter className="h-5 w-5 text-blue mr-2" />
              <CardTitle className="text-white dark:text-white light:text-navy">
                Twitter Analyses
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {twitterAnalyses.slice(0, 5).map((analysis) => (
                <AnalysisItem key={analysis.id} analysis={analysis} />
              ))}
              {twitterAnalyses.length > 5 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    className="btn-secondary"
                    onClick={() => {}}
                  >
                    View All Twitter Analyses
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SavedAnalyses;
