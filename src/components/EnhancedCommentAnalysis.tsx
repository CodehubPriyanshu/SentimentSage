import React, { useState, useEffect } from "react";
import { exportAnalysisAsPDF } from "@/utils/pdfExport";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed pie chart imports
import {
  AlertCircle,
  Filter,
  Download,
  Languages,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { analysisApi } from "@/utils/api";

// Define the comment interface
interface Comment {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  language: string;
  toxicity?: number;
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  keywords?: string[];
}

// Define the analysis results interface
interface AnalysisResults {
  comments: Comment[];
  summary: {
    positive: number;
    neutral: number;
    negative: number;
    totalComments: number;
    languages: Record<string, number>;
    toxicCount: number;
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
    };
    keywords: string[];
  };
}

interface EnhancedCommentAnalysisProps {
  comments: string;
  results: AnalysisResults | null;
  isAnalyzing: boolean;
}

const EnhancedCommentAnalysis: React.FC<EnhancedCommentAnalysisProps> = ({
  comments,
  results,
  isAnalyzing,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<
    "all" | "positive" | "neutral" | "negative"
  >("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (results) {
      // Apply filters
      let filtered = results.comments;

      // Apply sentiment filter
      if (filter !== "all") {
        filtered = filtered.filter((comment) => comment.sentiment === filter);
      }

      // Apply language filter
      if (languageFilter !== "all") {
        filtered = filtered.filter(
          (comment) => comment.language === languageFilter
        );
      }

      setFilteredComments(filtered);

      // Get unique languages
      const languages = [
        ...new Set(results.comments.map((comment) => comment.language)),
      ];
      setDetectedLanguages(languages);
    }
  }, [results, filter, languageFilter]);

  if (isAnalyzing) {
    return (
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mb-8 animate-pulse">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Analyzing Comments...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  // Removed pie chart data preparation

  // Prepare data for emotions chart
  const emotionsData = [
    { name: "Joy", value: results.summary.emotions.joy, color: "#4CAF50" },
    {
      name: "Sadness",
      value: results.summary.emotions.sadness,
      color: "#2196F3",
    },
    { name: "Anger", value: results.summary.emotions.anger, color: "#F44336" },
    { name: "Fear", value: results.summary.emotions.fear, color: "#9C27B0" },
    {
      name: "Surprise",
      value: results.summary.emotions.surprise,
      color: "#FF9800",
    },
  ];

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-sentiment-positive text-white";
      case "negative":
        return "bg-sentiment-negative text-white";
      default:
        return "bg-sentiment-neutral text-black";
    }
  };

  // Get language display name
  const getLanguageDisplayName = (code: string) => {
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      ru: "Russian",
      hi: "Hindi",
      zh: "Chinese",
      ja: "Japanese",
      ar: "Arabic",
      pt: "Portuguese",
      it: "Italian",
      nl: "Dutch",
      ko: "Korean",
      tr: "Turkish",
      pl: "Polish",
      sv: "Swedish",
    };

    return languageNames[code] || code;
  };

  // Handle saving the analysis to the user's profile
  const handleSaveAnalysis = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save analysis results",
        variant: "destructive",
      });
      return;
    }

    if (!results) {
      toast({
        title: "No Analysis",
        description: "There is no analysis to save",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Show saving toast
      toast({
        title: "Saving Analysis",
        description: "Saving your comment analysis to your profile...",
      });

      // Prepare the data to save
      const analysisData = {
        user_id: user.id,
        text: comments,
        text_content: comments, // Add text_content for backward compatibility
        text_preview:
          comments.length > 150 ? comments.substring(0, 150) + "..." : comments, // Add a preview
        sentiment_scores: {
          positive: results.summary.positive / 100, // Convert from percentage to decimal
          neutral: results.summary.neutral / 100,
          negative: results.summary.negative / 100,
        },
        positive_sentiment: results.summary.positive / 100, // Add these fields directly
        neutral_sentiment: results.summary.neutral / 100,
        negative_sentiment: results.summary.negative / 100,
        ai_insights: generateInsightsFromResults(results),
        ai_insights_preview:
          generateInsightsFromResults(results).substring(0, 100) + "...", // Add a preview
        analysis_type: "text", // Explicitly set the analysis type
        type: "text", // Add type for backward compatibility
        created_at: new Date().toISOString(), // Add timestamp directly
        metadata: JSON.stringify({
          total_comments: results.summary.totalComments,
          languages: results.summary.languages,
          emotions: results.summary.emotions,
          keywords: results.summary.keywords,
          timestamp: new Date().toISOString(),
        }),
      };

      // Call the API to save the analysis
      const response = await analysisApi.saveCommentAnalysis(analysisData);

      if (response && response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Analysis Saved Successfully",
        description:
          "Your comment analysis has been saved to your profile under the Text section",
      });

      console.log("Saved analysis:", response);
    } catch (err) {
      console.error("Error saving analysis:", err);

      toast({
        title: "Error Saving Analysis",
        description:
          typeof err === "string"
            ? err
            : err instanceof Error && err.message
            ? err.message
            : "Failed to save analysis. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate insights from the analysis results
  const generateInsightsFromResults = (results: AnalysisResults): string => {
    const { positive, neutral, negative } = results.summary;
    const dominantSentiment =
      Math.max(positive, neutral, negative) === positive
        ? "positive"
        : Math.max(positive, neutral, negative) === negative
        ? "negative"
        : "neutral";

    // Get the dominant emotion and its value
    const emotionEntries = Object.entries(results.summary.emotions);
    const dominantEmotionEntry = emotionEntries.sort((a, b) => b[1] - a[1])[0];
    const dominantEmotion = dominantEmotionEntry[0];
    const dominantEmotionValue = dominantEmotionEntry[1];

    // Get secondary emotion if it's significant
    let secondaryEmotionText = "";
    if (emotionEntries.length > 1) {
      const secondaryEmotionEntry = emotionEntries.sort(
        (a, b) => b[1] - a[1]
      )[1];
      if (secondaryEmotionEntry[1] > 20) {
        // Only mention if it's above 20%
        secondaryEmotionText = ` with notable ${secondaryEmotionEntry[0]} (${secondaryEmotionEntry[1]}%)`;
      }
    }

    // Get language information if available
    let languageText = "";
    if (
      results.summary.languages &&
      Object.keys(results.summary.languages).length > 0
    ) {
      const primaryLanguage = Object.entries(results.summary.languages).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const langName =
        primaryLanguage[0] === "en"
          ? "English"
          : primaryLanguage[0] === "es"
          ? "Spanish"
          : primaryLanguage[0] === "fr"
          ? "French"
          : primaryLanguage[0];
      languageText = ` Content is primarily in ${langName}.`;
    }

    const topKeywords = results.summary.keywords.slice(0, 5).join(", ");

    return `Analysis of ${
      results.summary.totalComments
    } comments shows a predominantly ${dominantSentiment} sentiment (${Math.max(
      positive,
      neutral,
      negative
    )}%). The dominant emotion detected is ${dominantEmotion} (${dominantEmotionValue}%)${secondaryEmotionText}.${languageText} Key themes include: ${topKeywords}.`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-blue" />
            Comment Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Sentiment Breakdown */}
            <div>
              <h3 className="text-lg font-medium text-white dark:text-white light:text-navy mb-4">
                Sentiment Breakdown
              </h3>
              <div className="space-y-2 bg-navy-light dark:bg-navy-light light:bg-gray-100 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-sentiment-positive rounded-full mr-2"></div>
                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-medium">
                      Positive
                    </span>
                  </div>
                  <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-bold text-lg">
                    {results.summary.positive}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: "#64B5F6" }}
                    ></div>
                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-medium">
                      Neutral
                    </span>
                  </div>
                  <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-bold text-lg">
                    {results.summary.neutral}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-sentiment-negative rounded-full mr-2"></div>
                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-medium">
                      Negative
                    </span>
                  </div>
                  <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 font-bold text-lg">
                    {results.summary.negative}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Key Insights */}
            <div>
              <h3 className="text-lg font-medium text-white dark:text-white light:text-navy mb-4">
                Key Insights
              </h3>

              <div className="space-y-4">
                <div className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-4 w-4 text-blue mr-2" />
                    <span className="text-white dark:text-white light:text-navy font-medium">
                      Detected Languages
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(results.summary.languages).map(
                      ([code, count]) => (
                        <Badge
                          key={code}
                          variant="outline"
                          className="bg-navy dark:bg-navy light:bg-gray-200"
                        >
                          {getLanguageDisplayName(code)} ({count})
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                {results.summary.toxicCount > 0 && (
                  <div className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-white dark:text-white light:text-navy font-medium">
                        Potentially Sensitive Content
                      </span>
                    </div>
                    <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm">
                      {results.summary.toxicCount} comment
                      {results.summary.toxicCount !== 1 ? "s" : ""} may contain
                      sensitive or toxic content.
                    </p>
                  </div>
                )}

                <div className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-4 w-4 text-blue mr-2" />
                    <span className="text-white dark:text-white light:text-navy font-medium">
                      Common Themes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.summary.keywords
                      .slice(0, 8)
                      .map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-blue/10 text-blue border-blue/30"
                        >
                          {keyword}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emotions Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white dark:text-white light:text-navy mb-4">
              Emotional Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {emotionsData.map((emotion) => (
                <div
                  key={emotion.name}
                  className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-3 rounded-md"
                >
                  <div className="text-center mb-2">
                    <span className="text-white dark:text-white light:text-navy font-medium">
                      {emotion.name}
                    </span>
                  </div>
                  <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${emotion.value}%`,
                        backgroundColor: emotion.color,
                      }}
                    ></div>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm">
                      {emotion.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-white dark:text-white light:text-navy">
              Individual Comments ({filteredComments.length} of{" "}
              {results.summary.totalComments})
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {/* Sentiment Filter */}
              <div className="flex items-center bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-md p-1">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all" ? "bg-blue text-white" : "text-gray-300"
                  }
                >
                  All
                </Button>
                <Button
                  variant={filter === "positive" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("positive")}
                  className={
                    filter === "positive"
                      ? "bg-sentiment-positive text-white"
                      : "text-gray-300"
                  }
                >
                  Positive
                </Button>
                <Button
                  variant={filter === "neutral" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("neutral")}
                  className={
                    filter === "neutral"
                      ? "bg-sentiment-neutral text-black"
                      : "text-gray-300"
                  }
                >
                  Neutral
                </Button>
                <Button
                  variant={filter === "negative" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("negative")}
                  className={
                    filter === "negative"
                      ? "bg-sentiment-negative text-white"
                      : "text-gray-300"
                  }
                >
                  Negative
                </Button>
              </div>

              {/* Language Filter */}
              {detectedLanguages.length > 1 && (
                <select
                  className="bg-navy-light dark:bg-navy-light light:bg-gray-100 text-gray-300 dark:text-gray-300 light:text-gray-700 rounded-md p-2 text-sm border-none focus:ring-blue"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                >
                  <option value="all">All Languages</option>
                  {detectedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageDisplayName(lang)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-700">
                  No comments match your current filters.
                </p>
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-4 rounded-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(comment.sentiment)}>
                        {comment.sentiment.charAt(0).toUpperCase() +
                          comment.sentiment.slice(1)}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="bg-navy dark:bg-navy light:bg-gray-200"
                      >
                        {getLanguageDisplayName(comment.language)}
                      </Badge>

                      {comment.toxicity && comment.toxicity > 0.7 && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500 border-red-500/30"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Sensitive
                        </Badge>
                      )}
                    </div>

                    {comment.emotions && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">Emotions:</span>
                        {comment.emotions.joy > 30 && (
                          <span className="text-green-500">Joy</span>
                        )}
                        {comment.emotions.sadness > 30 && (
                          <span className="text-blue-500">Sadness</span>
                        )}
                        {comment.emotions.anger > 30 && (
                          <span className="text-red-500">Anger</span>
                        )}
                        {comment.emotions.fear > 30 && (
                          <span className="text-purple-500">Fear</span>
                        )}
                        {comment.emotions.surprise > 30 && (
                          <span className="text-orange-500">Surprise</span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-200 dark:text-gray-200 light:text-gray-800">
                    {comment.text}
                  </p>

                  {comment.keywords && comment.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {comment.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-navy dark:bg-navy light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 px-2 py-0.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            {/* Feature Access Banner for Unauthenticated Users */}
            {!user && (
              <div className="w-full bg-blue/10 border border-blue/20 rounded-lg p-3 mb-2 text-center">
                <p className="text-blue text-sm">
                  <a href="/login" className="underline hover:text-blue-light">
                    Sign in
                  </a>{" "}
                  or{" "}
                  <a href="/signup" className="underline hover:text-blue-light">
                    create an account
                  </a>{" "}
                  to save and export your analysis
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {/* Save Analysis Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        className="border-blue text-blue hover:bg-blue/10"
                        onClick={handleSaveAnalysis}
                        disabled={!user || isSaving}
                      >
                        {isSaving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!user && (
                    <TooltipContent>
                      <p>Please log in to save analysis</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Export Analysis Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        className="border-blue text-blue hover:bg-blue/10"
                        onClick={() => {
                          if (user) {
                            setIsExporting(true);
                            exportAnalysisAsPDF(
                              results,
                              filter,
                              languageFilter
                            ).finally(() => setIsExporting(false));
                          }
                        }}
                        disabled={!user || isExporting}
                      >
                        {isExporting ? (
                          <>Exporting...</>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!user && (
                    <TooltipContent>
                      <p>Please log in to export analysis</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCommentAnalysis;
