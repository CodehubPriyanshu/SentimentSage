import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Send,
  Youtube,
  Bot,
  Save,
  Download,
  Globe,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
// Removed pie chart imports
import { useAuth } from "@/hooks/useAuth";
import { saveYouTubeAnalysis } from "@/utils/youtubeAnalysis";
import { analysisApi } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import LoadingIndicator from "@/components/LoadingIndicator";
import LoadingFallback from "@/components/LoadingFallback";
import ErrorDisplay from "@/components/ErrorDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import errorLogger from "@/utils/errorLogger";
import { ApiError } from "@/utils/errorHandler";
import { exportAnalysisAsPDF } from "@/utils/pdfExport";

interface Comment {
  id: string;
  text: string;
  author: string;
  published_at: string;
  like_count: number;
  sentiment: string;
  sentiment_score: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface VideoInfo {
  video_id: string;
  title: string;
  channel: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  thumbnail: string;
}

interface Topic {
  id: number;
  words: string[];
  weights: number[];
}

interface AnalysisResult {
  summary?: string;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords?: string[];
  aiInsights?: string;
  video_info?: VideoInfo;
  comments?: Comment[];
  sentiment_summary?: {
    positive: number;
    neutral: number;
    negative: number;
    total_comments: number;
  };
  engagement_metrics?: {
    view_count: number;
    like_count: number;
    comment_count: number;
    engagement_sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  languages?: Record<string, number>;
  multilingual?: boolean;
  emoji_count?: number;
  key_topics?: Topic[];
  topic_names?: string[];
}

const YoutubeAnalysis = () => {
  const { user } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [error, setError] = useState<Error | ApiError | string | null>(null);
  const [partialResults, setPartialResults] = useState<{
    videoInfo: boolean;
    sentimentData: boolean;
    comments: boolean;
    emotions: boolean;
    topics: boolean;
  }>({
    videoInfo: false,
    sentimentData: false,
    comments: false,
    emotions: false,
    topics: false,
  });

  // Clear error when URL changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [youtubeUrl]);

  const handleSaveAnalysis = async () => {
    if (!user || !result || !result.aiInsights || !result.video_info) {
      const errorMessage =
        "You must be logged in and have analyzed a video to save results";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Log the save attempt
      errorLogger.info("Saving YouTube analysis", {
        videoId: result.video_info.video_id,
        title: result.video_info.title,
        userId: user.id,
      });

      // The API already saves the analysis when we analyze the video
      // This is just a notification to the user
      toast({
        title: "Success",
        description: "Analysis saved to your profile",
      });
    } catch (err) {
      // Log the error
      errorLogger.error(err, {
        context: "Save YouTube analysis",
        videoId: result.video_info.video_id,
        userId: user.id,
      });

      // Set error state
      setError(err);

      // Show error toast
      toast({
        title: "Error",
        description:
          typeof err === "string"
            ? err
            : "Failed to save analysis. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add a cache for analyzed URLs
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, AnalysisResult>
  >({});

  // Add a state for tracking analysis progress
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Add a state for tracking if we're showing partial results
  const [showingPartial, setShowingPartial] = useState<boolean>(false);

  // Add a function to extract video ID from URL for caching
  const extractVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&\?\n]+)/,
      /(?:youtube\.com\/shorts\/)([^&\?\n]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return url; // Fallback to using the full URL as key
  };

  const handleFetch = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube video URL");
      toast({
        title: "Error",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    // Extract video ID for caching
    const videoId = extractVideoId(youtubeUrl);

    // Check if we have this video in cache
    if (analysisCache[videoId]) {
      // Use cached result
      setResult(analysisCache[videoId]);
      setPartialResults({
        videoInfo: true,
        sentimentData: true,
        comments: true,
        emotions: true,
        topics: true,
      });
      setLoadingStage("");
      setIsFetching(false);

      toast({
        title: "Analysis Loaded from Cache",
        description: "Showing previously analyzed results",
      });

      return;
    }

    // Reset state
    setIsFetching(true);
    setResult(null); // Clear previous results
    setError(null); // Clear any previous errors
    setPartialResults({
      videoInfo: false,
      sentimentData: false,
      comments: false,
      emotions: false,
      topics: false,
    });
    setAnalysisProgress(0);
    setShowingPartial(false);
    setLoadingStage("Initializing analysis...");

    try {
      // Log the analysis attempt
      errorLogger.info("Starting YouTube analysis", {
        url: youtubeUrl,
        timestamp: new Date().toISOString(),
      });

      // Initial toast to show we're starting
      toast({
        title: "Starting Analysis",
        description: "Fetching video information...",
      });

      // Create a partial result that we'll update progressively
      const partialResult: Partial<AnalysisResult> = {};
      const startTime = Date.now();

      // Use the streaming API for real-time updates
      const response = await analysisApi.analyzeYouTubeStreaming(
        youtubeUrl,
        (streamData) => {
          // Update progress based on the stream data
          if (streamData.progress) {
            setAnalysisProgress(streamData.progress);
          }

          // Update loading stage
          if (streamData.status) {
            setLoadingStage(streamData.status);
          }

          // Process partial results as they come in
          if (streamData.result) {
            // Step 1: Show video info immediately
            if (streamData.result.video_info && !partialResults.videoInfo) {
              partialResult.video_info = streamData.result.video_info;
              setPartialResults((prev) => ({ ...prev, videoInfo: true }));
              setResult(partialResult as AnalysisResult);
              setShowingPartial(true);

              // Log progress
              errorLogger.info("YouTube analysis progress: video info loaded", {
                videoId: streamData.result.video_info.video_id,
                title: streamData.result.video_info.title,
              });
            }

            // Step 2: Add sentiment data as soon as it's available
            if (
              (streamData.result.sentiment_summary ||
                streamData.result.partial_sentiment_summary) &&
              !partialResults.sentimentData
            ) {
              partialResult.sentiment_summary =
                streamData.result.sentiment_summary ||
                streamData.result.partial_sentiment_summary;
              setPartialResults((prev) => ({ ...prev, sentimentData: true }));
              setResult(partialResult as AnalysisResult);

              // Log progress
              errorLogger.info(
                "YouTube analysis progress: sentiment data processed",
                {
                  totalComments:
                    partialResult.sentiment_summary?.total_comments || 0,
                }
              );
            }

            // Step 3: Add comments data
            if (
              (streamData.result.comments ||
                streamData.result.partial_comments) &&
              !partialResults.comments
            ) {
              partialResult.comments =
                streamData.result.comments ||
                streamData.result.partial_comments;
              setPartialResults((prev) => ({ ...prev, comments: true }));
              setResult(partialResult as AnalysisResult);
            }

            // Step 4: Add emotions and other data
            if (streamData.result.emotions && !partialResults.emotions) {
              partialResult.emotions = streamData.result.emotions;
              partialResult.languages = streamData.result.languages;
              partialResult.multilingual = streamData.result.multilingual;
              partialResult.emoji_count = streamData.result.emoji_count;
              setPartialResults((prev) => ({ ...prev, emotions: true }));
              setResult(partialResult as AnalysisResult);
            }

            // Step 5: Add key topics if available
            if (streamData.result.key_topics && !partialResults.topics) {
              partialResult.key_topics = streamData.result.key_topics;
              partialResult.topic_names = streamData.result.topic_names;
              setPartialResults((prev) => ({ ...prev, topics: true }));
              setResult(partialResult as AnalysisResult);
            }

            // Step 6: Add AI insights if available
            if (streamData.ai_insights && !partialResult.aiInsights) {
              partialResult.aiInsights = streamData.ai_insights;
              partialResult.keywords = extractKeywords(streamData.ai_insights);
              if (partialResult.sentiment_summary) {
                partialResult.summary = generateSummary(
                  streamData.ai_insights,
                  partialResult.sentiment_summary
                );
              }
              setResult(partialResult as AnalysisResult);
            }

            // Check if analysis is complete
            if (streamData.is_complete) {
              // Final update with complete data
              const finalResult = partialResult as AnalysisResult;

              // Make sure we set the result first before clearing loading state
              setResult(finalResult);

              // Clear all loading states
              setLoadingStage("");
              setIsFetching(false);
              setAnalysisProgress(100);
              setShowingPartial(false);

              // Add to cache
              setAnalysisCache((prev) => ({
                ...prev,
                [videoId]: finalResult,
              }));

              // Calculate processing time
              const processingTime = (Date.now() - startTime) / 1000;

              // Show completion toast
              toast({
                title: "Analysis Complete",
                description: `Successfully analyzed ${
                  finalResult.sentiment_summary?.total_comments || 0
                } comments in ${processingTime.toFixed(1)}s`,
              });

              // Log successful completion
              errorLogger.info("YouTube analysis completed successfully", {
                videoId: finalResult.video_info?.video_id,
                totalComments:
                  finalResult.sentiment_summary?.total_comments || 0,
                processingTime: streamData.result.processing_time,
                clientProcessingTime: processingTime,
              });

              // Force a re-render to ensure loading overlay is removed
              setTimeout(() => {
                setIsFetching(false);
              }, 100);
            }
          }
        }
      );

      // If we get here and still fetching, it means the streaming completed but didn't mark as complete
      if (isFetching) {
        // Make sure we have a result before clearing loading state
        if (partialResult.video_info) {
          const finalResult = partialResult as AnalysisResult;

          // Set the result first
          setResult(finalResult);

          // Add to cache
          setAnalysisCache((prev) => ({
            ...prev,
            [videoId]: finalResult,
          }));
        }

        // Clear all loading states
        setIsFetching(false);
        setLoadingStage("");
        setAnalysisProgress(100);
        setShowingPartial(false);

        // Force a re-render to ensure loading overlay is removed
        setTimeout(() => {
          setIsFetching(false);
        }, 100);
      }
    } catch (error) {
      setIsFetching(false);
      setLoadingStage("");
      setAnalysisProgress(0);
      setShowingPartial(false);

      // Set the error state
      setError(error);

      // Log the error
      errorLogger.error(error, {
        context: "YouTube analysis",
        url: youtubeUrl,
      });

      // Show error toast
      toast({
        title: "Analysis Failed",
        description:
          typeof error === "string"
            ? error
            : error instanceof Error
            ? error.message
            : "Failed to analyze YouTube video. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to retry analysis after an error
  const handleRetry = () => {
    setError(null);
    handleFetch();
  };

  // Function to handle exporting analysis as PDF
  const handleExportAnalysis = async () => {
    if (!result) {
      toast({
        title: "Error",
        description: "You must analyze a video before exporting results",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    // Show exporting toast
    toast({
      title: "Preparing Report",
      description: "Generating your YouTube analysis report...",
    });

    try {
      // Prepare data for PDF export with enhanced metadata
      const analysisData = {
        title: `YouTube Analysis for ${result.video_info?.title || youtubeUrl}`,
        date: new Date().toISOString(),
        comments:
          result.comments?.map((comment) => ({
            id: comment.id,
            text: comment.text,
            sentiment: comment.sentiment,
            language: comment.language || "en",
            emotions: comment.emotions,
            published_at: comment.published_at,
            author: comment.author,
            like_count: comment.like_count,
          })) || [],
        summary: {
          positive: result.sentiment_summary
            ? Math.round(
                (result.sentiment_summary.positive /
                  result.sentiment_summary.total_comments) *
                  100
              )
            : 0,
          neutral: result.sentiment_summary
            ? Math.round(
                (result.sentiment_summary.neutral /
                  result.sentiment_summary.total_comments) *
                  100
              )
            : 0,
          negative: result.sentiment_summary
            ? Math.round(
                (result.sentiment_summary.negative /
                  result.sentiment_summary.total_comments) *
                  100
              )
            : 0,
          totalComments: result.sentiment_summary?.total_comments || 0,
          languages: result.languages || {},
          toxicCount: 0, // Not applicable for YouTube
          emotions: result.emotions || {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
          },
          keywords: result.keywords || [],
        },
        video_info: result.video_info,
        aiInsights: result.aiInsights,
        key_topics: result.key_topics || [],
        topic_names: result.topic_names || [],
        // Add sample comments for each sentiment category
        commentSamples: {
          positive:
            result.comments
              ?.filter((c) => c.sentiment === "positive")
              .slice(0, 3) || [],
          neutral:
            result.comments
              ?.filter((c) => c.sentiment === "neutral")
              .slice(0, 3) || [],
          negative:
            result.comments
              ?.filter((c) => c.sentiment === "negative")
              .slice(0, 3) || [],
        },
      };

      // Export as PDF
      await exportAnalysisAsPDF(analysisData);

      toast({
        title: "Report Downloaded",
        description: (
          <div className="space-y-2">
            <p>
              Your YouTube analysis report has been downloaded successfully.
            </p>
            <p className="text-xs">
              The report includes sentiment analysis, comment samples, and AI
              insights.
            </p>
          </div>
        ),
      });
    } catch (err) {
      console.error("Error exporting analysis:", err);

      toast({
        title: "Error Generating Report",
        description: (
          <div className="space-y-2">
            <p>Failed to generate report. Please try again later.</p>
            <p className="text-xs">
              If this problem persists, try using a different browser.
            </p>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to extract keywords from AI insights
  const extractKeywords = (insights: string): string[] => {
    if (!insights) return [];

    // Simple extraction based on common patterns
    const words = insights.split(/\s+/);
    const filteredWords = words.filter(
      (word) =>
        word.length > 4 &&
        ![
          "about",
          "these",
          "those",
          "their",
          "there",
          "would",
          "should",
          "could",
        ].includes(word.toLowerCase())
    );

    // Get unique words and limit to 8
    const uniqueWords = [...new Set(filteredWords)];
    return uniqueWords
      .slice(0, 8)
      .map((word) => word.replace(/[^a-zA-Z]/g, ""));
  };

  // Define the type for sentiment summary
  interface SentimentSummary {
    positive: number;
    neutral: number;
    negative: number;
    total_comments?: number;
  }

  // Helper function to get language name from language code
  const getLanguageName = (langCode: string): string => {
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      hi: "Hindi",
      bn: "Bengali",
      pa: "Punjabi",
      jv: "Javanese",
      te: "Telugu",
      mr: "Marathi",
      ta: "Tamil",
      ur: "Urdu",
      gu: "Gujarati",
      kn: "Kannada",
      ml: "Malayalam",
      vi: "Vietnamese",
      th: "Thai",
      tr: "Turkish",
      nl: "Dutch",
      pl: "Polish",
      uk: "Ukrainian",
      ro: "Romanian",
      el: "Greek",
      cs: "Czech",
      hu: "Hungarian",
      sv: "Swedish",
      da: "Danish",
      fi: "Finnish",
      no: "Norwegian",
      id: "Indonesian",
      ms: "Malay",
      fil: "Filipino",
      he: "Hebrew",
      fa: "Persian",
      unknown: "Unknown",
    };

    return languageNames[langCode] || langCode;
  };

  // Helper function to generate a summary from AI insights
  const generateSummary = (
    insights: string,
    sentimentSummary: SentimentSummary
  ): string => {
    if (!insights) return "No insights available";

    // Take the first 2 sentences as summary
    const sentences = insights.split(/\.\s+/);
    let summary = sentences.slice(0, 2).join(". ") + ".";

    // Add sentiment information
    if (sentimentSummary) {
      const { positive, neutral, negative } = sentimentSummary;
      const total = positive + neutral + negative;

      const posPercent = Math.round((positive / total) * 100);
      const negPercent = Math.round((negative / total) * 100);
      const neuPercent = Math.round((neutral / total) * 100);

      summary += ` Overall sentiment is ${posPercent}% positive, ${neuPercent}% neutral, and ${negPercent}% negative.`;
    }

    return summary;
  };

  const sentimentData =
    result && result.sentiment_summary
      ? [
          {
            name: "Positive",
            value: Math.round(
              (result.sentiment_summary.positive /
                result.sentiment_summary.total_comments) *
                100
            ),
            color: "#4CAF50", // Green
          },
          {
            name: "Neutral",
            value: Math.round(
              (result.sentiment_summary.neutral /
                result.sentiment_summary.total_comments) *
                100
            ),
            color: "#FFCA28", // Yellow
          },
          {
            name: "Negative",
            value: Math.round(
              (result.sentiment_summary.negative /
                result.sentiment_summary.total_comments) *
                100
            ),
            color: "#F44336", // Red
          },
        ]
      : [];

  return (
    <ErrorBoundary componentName="YoutubeAnalysis">
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
                      className={`input-field flex-grow ${
                        error && !youtubeUrl.trim() ? "border-red-500" : ""
                      }`}
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      aria-invalid={
                        error && !youtubeUrl.trim() ? "true" : "false"
                      }
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

            {/* Empty state */}
            {!result && !isFetching && !error && (
              <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
                <AlertCircle className="h-4 w-4 text-blue" />
                <AlertTitle className="text-white dark:text-white light:text-navy">
                  Getting Started
                </AlertTitle>
                <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                  Enter a YouTube video URL above to begin analysis. Our AI will
                  analyze the comments and transcript to provide sentiment
                  analysis and key insights.
                </AlertDescription>
              </Alert>
            )}

            {/* Simple Loading state without animation - only show when fetching and no results yet */}
            {isFetching && !result && (
              <div className="fixed inset-0 flex items-center justify-center bg-navy bg-opacity-90 z-50">
                <div className="bg-navy-light p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-medium text-white">
                        Analyzing YouTube Video
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Please wait while we analyze the video comments.
                      </p>
                    </div>

                    {/* Static progress indicator */}
                    <div className="w-full bg-navy-dark rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue h-3 rounded-full"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Video Information */}
                {result.video_info && (
                  <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={result.video_info.thumbnail}
                          alt={result.video_info.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <h2 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">
                          {result.video_info.title}
                        </h2>
                        <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 mb-4">
                          Channel: {result.video_info.channel}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <div>
                            <span className="font-semibold">Views:</span>{" "}
                            {result.video_info.view_count.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-semibold">Likes:</span>{" "}
                            {result.video_info.like_count.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-semibold">Comments:</span>{" "}
                            {result.video_info.comment_count.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Analysis Summary */}
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy">
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">
                      {result.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Sentiment Analysis Description */}
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mb-6">
                  <CardContent className="pt-6">
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700 mb-4">
                      Dive into the emotional landscape of your YouTube video.
                      Using Hugging Face AI and advanced metrics analysis, we've
                      analyzed real-time comments, likes, views, and engagement
                      patterns to detect audience sentiment — whether they loved
                      it, hated it, or felt neutral.
                    </p>
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700 mb-4">
                      The results are visualized in the bar chart below, giving
                      you a clear snapshot of how viewers are reacting to your
                      content based on both their comments and engagement
                      behavior.
                    </p>
                    <h3 className="text-white dark:text-white light:text-navy text-lg font-medium mb-2">
                      🔍 What We Analyze:
                    </h3>
                    <ul className="text-gray-200 dark:text-gray-200 light:text-gray-700 list-disc pl-6 space-y-1">
                      <li>
                        Comments: Text-based sentiment using Hugging Face AI
                        models
                      </li>
                      <li>Likes & Views: Engagement metrics and ratios</li>
                      <li>
                        Combined Analysis: Weighted sentiment from both comments
                        and engagement
                      </li>
                      <li>
                        AI-Powered Sentiment Scores: Positive, Neutral, Negative
                        percentages
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Enhanced Comment Analysis Summary */}
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy">
                      Comment Analysis Summary
                    </CardTitle>
                    <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                      Comprehensive analysis of{" "}
                      {result?.sentiment_summary?.total_comments || 0} comments
                      from this video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-start justify-between gap-6">
                      {/* Main insights panel */}
                      <div className="w-full p-4 bg-navy-light rounded-lg border border-gray-700">
                        <h3 className="text-white text-lg font-semibold mb-3">
                          Key Insights
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Based on our in-depth analysis of{" "}
                          <span className="font-semibold">
                            {result?.sentiment_summary?.total_comments || 0}{" "}
                            comments
                          </span>
                          ,{" "}
                          <span className="font-semibold">
                            {result?.engagement_metrics?.like_count.toLocaleString() ||
                              0}{" "}
                            likes
                          </span>
                          , and{" "}
                          <span className="font-semibold">
                            {result?.engagement_metrics?.view_count.toLocaleString() ||
                              0}{" "}
                            views
                          </span>
                          , the audience reaction to this video content is
                          predominantly
                          {sentimentData[0]?.value >= sentimentData[1]?.value &&
                          sentimentData[0]?.value >= sentimentData[2]?.value ? (
                            <span className="text-green-500 font-bold">
                              {" "}
                              positive
                            </span>
                          ) : sentimentData[1]?.value >=
                              sentimentData[0]?.value &&
                            sentimentData[1]?.value >=
                              sentimentData[2]?.value ? (
                            <span className="text-yellow-500 font-bold">
                              {" "}
                              neutral
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold">
                              {" "}
                              negative
                            </span>
                          )}
                          .
                        </p>

                        {/* Detailed sentiment analysis */}
                        <div className="bg-navy-dark p-4 rounded-md mb-4">
                          <h4 className="text-white text-md font-medium mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Detailed Sentiment Analysis
                          </h4>
                          <p className="text-gray-300 text-sm mb-3">
                            Our AI has analyzed the emotional tone of all{" "}
                            {result?.sentiment_summary?.total_comments || 0}{" "}
                            comments:
                          </p>
                          <ul className="space-y-2 text-gray-300 text-sm pl-4">
                            <li>
                              <span className="font-medium text-green-500">
                                Positive Sentiment:
                              </span>{" "}
                              {sentimentData.find(
                                (item) => item.name === "Positive"
                              )?.value || 0}
                              % of comments express appreciation, enthusiasm, or
                              satisfaction with the content.
                            </li>
                            <li>
                              <span className="font-medium text-yellow-500">
                                Neutral Sentiment:
                              </span>{" "}
                              {sentimentData.find(
                                (item) => item.name === "Neutral"
                              )?.value || 0}
                              % of comments are factual, questioning, or
                              balanced in tone.
                            </li>
                            <li>
                              <span className="font-medium text-red-500">
                                Negative Sentiment:
                              </span>{" "}
                              {sentimentData.find(
                                (item) => item.name === "Negative"
                              )?.value || 0}
                              % of comments express criticism, disappointment,
                              or dissatisfaction.
                            </li>
                          </ul>
                        </div>

                        {/* Content reception analysis */}
                        <div className="bg-navy-dark p-4 rounded-md mb-4">
                          <h4 className="text-white text-md font-medium mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Content Reception Analysis
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            {sentimentData[0]?.value >=
                              sentimentData[1]?.value &&
                            sentimentData[0]?.value >=
                              sentimentData[2]?.value ? (
                              <>
                                This video content{" "}
                                <span className="text-green-500 font-medium">
                                  resonates strongly
                                </span>{" "}
                                with viewers. The high positive sentiment
                                indicates audience appreciation for the video's
                                message, quality, and delivery. Viewers are
                                actively engaging with supportive comments and
                                positive feedback.
                              </>
                            ) : sentimentData[1]?.value >=
                                sentimentData[0]?.value &&
                              sentimentData[1]?.value >=
                                sentimentData[2]?.value ? (
                              <>
                                This video content has generated{" "}
                                <span className="text-yellow-500 font-medium">
                                  mixed reactions
                                </span>
                                . The predominantly neutral sentiment suggests
                                viewers are either undecided or have balanced
                                opinions about the content. The video may be
                                informational rather than emotionally engaging.
                              </>
                            ) : (
                              <>
                                This video content has triggered{" "}
                                <span className="text-red-500 font-medium">
                                  critical responses
                                </span>
                                . The high negative sentiment indicates
                                potential issues with the video's message,
                                quality, or delivery that should be addressed.
                                Viewers are expressing disagreement or
                                disappointment.
                              </>
                            )}
                          </p>
                        </div>

                        {/* Engagement correlation */}
                        <div className="bg-navy-dark p-4 rounded-md mb-4">
                          <h4 className="text-white text-md font-medium mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Engagement Correlation
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {result?.engagement_metrics?.like_count > 0 &&
                            result?.engagement_metrics?.view_count > 0 ? (
                              <>
                                The like-to-view ratio of{" "}
                                {(
                                  (result.engagement_metrics.like_count /
                                    result.engagement_metrics.view_count) *
                                  100
                                ).toFixed(2)}
                                %
                                {(result.engagement_metrics.like_count /
                                  result.engagement_metrics.view_count) *
                                  100 >
                                4 ? (
                                  <span>
                                    is{" "}
                                    <span className="text-green-500 font-medium">
                                      above average
                                    </span>
                                    , indicating strong viewer approval
                                  </span>
                                ) : (result.engagement_metrics.like_count /
                                    result.engagement_metrics.view_count) *
                                    100 >
                                  2 ? (
                                  <span>
                                    is{" "}
                                    <span className="text-yellow-500 font-medium">
                                      average
                                    </span>
                                    , suggesting typical viewer engagement
                                  </span>
                                ) : (
                                  <span>
                                    is{" "}
                                    <span className="text-red-500 font-medium">
                                      below average
                                    </span>
                                    , indicating potential engagement issues
                                  </span>
                                )}
                                . The comment-to-view ratio of{" "}
                                {(
                                  (result.engagement_metrics.comment_count /
                                    result.engagement_metrics.view_count) *
                                  100
                                ).toFixed(3)}
                                % shows
                                {(result.engagement_metrics.comment_count /
                                  result.engagement_metrics.view_count) *
                                  100 >
                                0.1 ? (
                                  <span>
                                    a{" "}
                                    <span className="text-green-500 font-medium">
                                      highly engaged
                                    </span>{" "}
                                    audience
                                  </span>
                                ) : (result.engagement_metrics.comment_count /
                                    result.engagement_metrics.view_count) *
                                    100 >
                                  0.05 ? (
                                  <span>
                                    a{" "}
                                    <span className="text-yellow-500 font-medium">
                                      moderately engaged
                                    </span>{" "}
                                    audience
                                  </span>
                                ) : (
                                  <span>
                                    a{" "}
                                    <span className="text-red-500 font-medium">
                                      passively engaged
                                    </span>{" "}
                                    audience
                                  </span>
                                )}
                                .
                              </>
                            ) : (
                              <>
                                Engagement metrics are not available for
                                complete analysis.
                              </>
                            )}
                          </p>
                        </div>

                        {/* Multilingual analysis */}
                        {result.multilingual && (
                          <div className="bg-navy-dark p-4 rounded-md mb-4">
                            <h4 className="text-white text-md font-medium mb-3 flex items-center">
                              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                              Multilingual Analysis
                            </h4>
                            <p className="text-gray-300 text-sm">
                              This video has attracted a{" "}
                              <span className="text-blue-400 font-medium">
                                diverse international audience
                              </span>
                              . Comments were detected in{" "}
                              {Object.keys(result.languages || {}).length}{" "}
                              different languages, with the most common being{" "}
                              {Object.entries(result.languages || {}).sort(
                                ([, a], [, b]) => (b as number) - (a as number)
                              )[0]?.[0] || "English"}
                              . All non-English comments were automatically
                              translated and analyzed to ensure accurate
                              sentiment scoring.
                            </p>
                          </div>
                        )}

                        {/* Methodology explanation */}
                        <div className="bg-navy-dark p-4 rounded-md">
                          <h4 className="text-white text-md font-medium mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Analysis Methodology
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Our comprehensive YouTube comment analysis combines
                            multiple advanced techniques:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                            <li>
                              <span className="font-medium">
                                AI-Powered Sentiment Analysis:
                              </span>{" "}
                              Each comment is processed using Hugging Face's
                              state-of-the-art NLP models
                            </li>
                            <li>
                              <span className="font-medium">
                                Multilingual Support:
                              </span>{" "}
                              Automatic language detection and translation for
                              non-English comments
                            </li>
                            <li>
                              <span className="font-medium">
                                Emoji Interpretation:
                              </span>{" "}
                              Analysis of emoji usage to enhance sentiment
                              accuracy
                            </li>
                            <li>
                              <span className="font-medium">
                                Engagement Metrics:
                              </span>{" "}
                              Integration of like-to-view and comment-to-view
                              ratios
                            </li>
                            <li>
                              <span className="font-medium">
                                Weighted Scoring:
                              </span>{" "}
                              Comment sentiment (70%) combined with engagement
                              metrics (30%)
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Engagement Metrics */}
                      {result?.engagement_metrics && (
                        <div className="w-full mt-4 p-4 bg-navy-light rounded-lg">
                          <h3 className="text-white text-lg font-semibold mb-3">
                            Engagement Analysis
                          </h3>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue">
                                {result.engagement_metrics.view_count.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-400">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-500">
                                {result.engagement_metrics.like_count.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-400">Likes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-500">
                                {result.engagement_metrics.comment_count.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-400">
                                Comments
                              </div>
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="text-white text-md font-medium mb-3">
                              Engagement-Based Sentiment
                            </h4>

                            {/* Positive Sentiment from Engagement */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  <span className="text-gray-300 text-sm">
                                    Positive Engagement
                                  </span>
                                </div>
                                <span className="text-gray-300 text-sm font-semibold">
                                  {Math.round(
                                    result.engagement_metrics
                                      .engagement_sentiment.positive * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.round(
                                      result.engagement_metrics
                                        .engagement_sentiment.positive * 100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">
                                Based on like-to-view ratio:{" "}
                                {(
                                  (result.engagement_metrics.like_count /
                                    Math.max(
                                      1,
                                      result.engagement_metrics.view_count
                                    )) *
                                  100
                                ).toFixed(2)}
                                %
                              </p>
                            </div>

                            {/* Neutral Sentiment from Engagement */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                  <span className="text-gray-300 text-sm">
                                    Neutral Engagement
                                  </span>
                                </div>
                                <span className="text-gray-300 text-sm font-semibold">
                                  {Math.round(
                                    result.engagement_metrics
                                      .engagement_sentiment.neutral * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.round(
                                      result.engagement_metrics
                                        .engagement_sentiment.neutral * 100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">
                                Based on comment-to-view ratio:{" "}
                                {(
                                  (result.engagement_metrics.comment_count /
                                    Math.max(
                                      1,
                                      result.engagement_metrics.view_count
                                    )) *
                                  100
                                ).toFixed(2)}
                                %
                              </p>
                            </div>

                            {/* Negative Sentiment from Engagement */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                  <span className="text-gray-300 text-sm">
                                    Negative Engagement
                                  </span>
                                </div>
                                <span className="text-gray-300 text-sm font-semibold">
                                  {Math.round(
                                    result.engagement_metrics
                                      .engagement_sentiment.negative * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.round(
                                      result.engagement_metrics
                                        .engagement_sentiment.negative * 100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Key Topics */}
                  <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                    <CardHeader>
                      <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2 text-blue" />
                        Key Topics
                      </CardTitle>
                      <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                        Main themes discussed in comments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.key_topics && result.key_topics.length > 0 ? (
                        <div className="space-y-4">
                          {result.key_topics.map((topic, topicIndex) => (
                            <div key={topicIndex}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 mr-2 rounded-full ${
                                      topicIndex === 0
                                        ? "bg-blue"
                                        : topicIndex === 1
                                        ? "bg-purple-500"
                                        : topicIndex === 2
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                                  ></div>
                                  <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                    {result.topic_names &&
                                    result.topic_names[topicIndex]
                                      ? result.topic_names[topicIndex]
                                      : topic.words.slice(0, 2).join("/")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1 mb-3">
                                {topic.words.map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                      wordIndex === 0
                                        ? "bg-blue/20 text-blue"
                                        : "bg-navy-light text-gray-300"
                                    }`}
                                  >
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-4">
                          {result.keywords &&
                            result.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-navy-light dark:bg-navy-light light:bg-gray-200 rounded-full text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Emotion Analysis */}
                  {result.emotions && (
                    <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                      <CardHeader>
                        <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-pink-500" />
                          Emotion Analysis
                        </CardTitle>
                        <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                          Emotional tone detected in comments
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Joy */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-400 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Joy
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.joy * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.joy * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Sadness */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Sadness
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.sadness * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.sadness * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Anger */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Anger
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.anger * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.anger * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Fear */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Fear
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.fear * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.fear * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Surprise */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-cyan-400 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Surprise
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.surprise * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-cyan-400 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.surprise * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Disgust */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-600 mr-2 rounded-full"></div>
                                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                  Disgust
                                </span>
                              </div>
                              <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                {Math.round(result.emotions.disgust * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    result.emotions.disgust * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Language Analysis */}
                {result.languages &&
                  Object.keys(result.languages).length > 0 && (
                    <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mt-6">
                      <CardHeader>
                        <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                          <Globe className="h-5 w-5 mr-2 text-blue" />
                          Language Analysis
                        </CardTitle>
                        <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                          {result.multilingual
                            ? "Multilingual comments detected"
                            : "Language distribution in comments"}
                          {result.emoji_count && result.emoji_count > 0
                            ? ` • ${result.emoji_count} emojis found`
                            : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(result.languages)
                            .sort(
                              ([, a], [, b]) => (b as number) - (a as number)
                            )
                            .map(([lang, percentage]) => (
                              <div key={lang}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm font-medium">
                                      {getLanguageName(lang)}
                                    </span>
                                  </div>
                                  <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm">
                                    {Math.round(percentage as number)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.round(
                                        percentage as number
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                        </div>

                        {result.multilingual && (
                          <div className="mt-4 p-3 bg-navy-light rounded-lg">
                            <p className="text-gray-300 text-sm">
                              <span className="font-medium">
                                Multilingual Analysis:
                              </span>{" "}
                              Comments in different languages were automatically
                              detected and translated for accurate sentiment
                              analysis.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {/* AI Insights Section */}
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mt-6">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-blue" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">
                      {result.aiInsights}
                    </p>
                  </CardContent>
                </Card>

                {/* Comment Samples */}
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mt-6">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-blue" />
                      Comment Samples
                    </CardTitle>
                    <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                      {result.multilingual
                        ? "Showing comments in multiple languages with translations"
                        : "Sample comments from the video"}
                      {result.emoji_count && result.emoji_count > 0
                        ? ` • Includes emoji analysis`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.comments && (
                        <>
                          {/* Show all available comments */}
                          {result.comments
                            .slice(0, 10)
                            .map((comment, index) => (
                              <div
                                key={index}
                                className="p-4 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-md"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium text-gray-200 dark:text-gray-200 light:text-gray-800">
                                    {comment.author}
                                    {comment.language &&
                                      comment.language !== "en" && (
                                        <span className="ml-2 text-xs text-blue-400 font-normal">
                                          {getLanguageName(comment.language)}
                                        </span>
                                      )}
                                  </div>
                                  <Badge
                                    className={`ml-2 ${
                                      comment.sentiment === "positive"
                                        ? "bg-green-600"
                                        : comment.sentiment === "negative"
                                        ? "bg-red-600"
                                        : "bg-yellow-600"
                                    }`}
                                  >
                                    {comment.sentiment.charAt(0).toUpperCase() +
                                      comment.sentiment.slice(1)}
                                  </Badge>
                                </div>

                                <p className="text-gray-200 dark:text-gray-200 light:text-gray-800 mt-2">
                                  {comment.text}
                                  {comment.has_emojis &&
                                    comment.emojis &&
                                    comment.emojis.length > 0 && (
                                      <span className="ml-1">
                                        {comment.emojis.slice(0, 3).join(" ")}
                                      </span>
                                    )}
                                </p>

                                {comment.translated_text && (
                                  <div className="mt-2 p-2 bg-navy-dark rounded-md">
                                    <p className="text-gray-400 text-sm italic">
                                      <span className="text-blue-400 font-medium">
                                        Translated:
                                      </span>{" "}
                                      {comment.translated_text}
                                    </p>
                                  </div>
                                )}

                                <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                                  <div>
                                    {new Date(
                                      comment.published_at
                                    ).toLocaleDateString()}{" "}
                                    • {comment.like_count} likes
                                  </div>
                                  {comment.emotions &&
                                    Object.entries(comment.emotions).length >
                                      0 && (
                                      <div className="text-xs">
                                        {Object.entries(comment.emotions)
                                          .sort(
                                            ([, a], [, b]) =>
                                              (b as number) - (a as number)
                                          )
                                          .slice(0, 1)
                                          .map(([emotion, score]) => (
                                            <span
                                              key={emotion}
                                              className="capitalize"
                                            >
                                              {emotion}:{" "}
                                              {Math.round(
                                                (score as number) * 100
                                              )}
                                              %
                                            </span>
                                          ))}
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                      {result.comments && result.comments.length > 10 && (
                        <p className="text-center text-gray-400 text-sm mt-4">
                          Showing 10 of {result.comments.length} comments.
                          Download the report to see all comments.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="mt-8 text-center flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="btn-secondary"
                    onClick={handleSaveAnalysis}
                    disabled={isSaving || !user}
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-secondary"
                    onClick={handleExportAnalysis}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>Generating PDF...</>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default YoutubeAnalysis;
