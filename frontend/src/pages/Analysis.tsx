import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  FileUp,
  Send,
  Copy,
  Clipboard,
  Save,
  Upload,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { analyzeSentiment } from "@/utils/sentimentAnalysis";
import { cleanComments, cleanSocialMediaText } from "@/utils/textCleaner";
import {
  analyzeCSVFile,
  generateAIInsights,
  CSVAnalysisResult,
} from "@/utils/csvAnalysis";
import SocialMediaModal from "@/components/SocialMediaModal";
import CSVAnalysisResults from "@/components/CSVAnalysisResults";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { analysisApi } from "@/utils/api";
import EnhancedCommentAnalysis from "@/components/EnhancedCommentAnalysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  detectLanguage,
  cleanText,
  detectToxicity,
  extractKeywords,
  detectEmotions,
} from "@/utils/languageDetection";

interface SavedAnalysis {
  id: string;
  date: string;
  comments: string;
  sentiment: "positive" | "negative" | "neutral" | null;
  explanation: string | null;
}

const Analysis = () => {
  // Track the active analysis mode
  const [analysisMode, setAnalysisMode] = useState<"comments" | "csv" | null>(
    null
  );

  const [comments, setComments] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | {
    positive: number;
    neutral: number;
    negative: number;
  }>(null);
  const [sentimentResult, setSentimentResult] = useState<null | {
    sentiment: "positive" | "negative" | "neutral";
    explanation: string;
  }>(null);

  // Enhanced analysis state
  const [enhancedResults, setEnhancedResults] = useState<{
    comments: Array<{
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
    }>;
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
  } | null>(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const { user } = useAuth();

  // CSV analysis state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvAnalysisResult, setCsvAnalysisResult] =
    useState<CSVAnalysisResult | null>(null);
  const [csvAiInsights, setCsvAiInsights] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only perform analysis if there's text to analyze
    if (!comments.trim()) {
      setSentimentResult(null);
      setEnhancedResults(null);
      setAnalysisMode(null);
      return;
    }

    // Set analysis mode to comments when text is entered
    setAnalysisMode("comments");

    // Clear CSV analysis when switching to comments mode
    setCsvAnalysisResult(null);
    setCsvAiInsights("");

    // Clean the text to remove social media artifacts like "__________(any number) w/d ______(any number) likeReply"
    // and other formats like "1d1 likeReply"
    const cleanedText = cleanComments(comments);

    // If cleaning removed all meaningful content, don't analyze
    // But don't show any error notifications - just silently skip analysis
    if (!cleanedText.trim()) {
      setSentimentResult(null);
      return;
    }

    // Set basic sentiment analysis on the cleaned text
    const analysis = analyzeSentiment(cleanedText);
    setSentimentResult(analysis);

    // Debounce the enhanced analysis to avoid excessive processing
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);

      try {
        // Split comments by line breaks for enhanced analysis
        // Use the cleaned text instead of raw comments
        const commentLines = cleanedText
          .split("\n")
          .filter((line) => line.trim() !== "");

        // Enhanced analysis with language detection and more
        const enhancedComments = commentLines.map((comment, index) => {
          // Apply both our standard text cleaning and social media cleaning
          const cleanedComment = cleanSocialMediaText(cleanText(comment));
          const sentimentResult = analyzeSentiment(cleanedComment);
          const language = detectLanguage(cleanedComment);
          const toxicity = detectToxicity(cleanedComment);
          const emotions = detectEmotions(cleanedComment);
          const keywords = extractKeywords(cleanedComment);

          return {
            id: `comment-${index}`,
            text: comment,
            sentiment: sentimentResult.sentiment,
            language,
            toxicity,
            emotions,
            keywords,
          };
        });

        // Calculate percentages for traditional results
        const totalComments = enhancedComments.length;
        const positiveCount = enhancedComments.filter(
          (c) => c.sentiment === "positive"
        ).length;
        const neutralCount = enhancedComments.filter(
          (c) => c.sentiment === "neutral"
        ).length;
        const negativeCount = enhancedComments.filter(
          (c) => c.sentiment === "negative"
        ).length;

        const positivePercentage = Math.round(
          (positiveCount / totalComments) * 100
        );
        const neutralPercentage = Math.round(
          (neutralCount / totalComments) * 100
        );
        const negativePercentage = Math.round(
          (negativeCount / totalComments) * 100
        );

        // Calculate language distribution
        const languages: Record<string, number> = {};
        enhancedComments.forEach((comment) => {
          languages[comment.language] = (languages[comment.language] || 0) + 1;
        });

        // Count toxic comments
        const toxicCount = enhancedComments.filter(
          (comment) => comment.toxicity > 0.7
        ).length;

        // Calculate average emotions
        const totalEmotions = {
          joy: 0,
          sadness: 0,
          anger: 0,
          fear: 0,
          surprise: 0,
        };

        enhancedComments.forEach((comment) => {
          if (comment.emotions) {
            totalEmotions.joy += comment.emotions.joy;
            totalEmotions.sadness += comment.emotions.sadness;
            totalEmotions.anger += comment.emotions.anger;
            totalEmotions.fear += comment.emotions.fear;
            totalEmotions.surprise += comment.emotions.surprise;
          }
        });

        const averageEmotions = {
          joy: Math.round(totalEmotions.joy / totalComments),
          sadness: Math.round(totalEmotions.sadness / totalComments),
          anger: Math.round(totalEmotions.anger / totalComments),
          fear: Math.round(totalEmotions.fear / totalComments),
          surprise: Math.round(totalEmotions.surprise / totalComments),
        };

        // Extract common keywords
        const allKeywords: string[] = [];
        enhancedComments.forEach((comment) => {
          if (comment.keywords) {
            allKeywords.push(...comment.keywords);
          }
        });

        // Count keyword frequencies
        const keywordCounts: Record<string, number> = {};
        allKeywords.forEach((keyword) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });

        // Get top keywords
        const topKeywords = Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([keyword]) => keyword);

        // Set enhanced results
        setEnhancedResults({
          comments: enhancedComments,
          summary: {
            positive: positivePercentage,
            neutral: neutralPercentage,
            negative: negativePercentage,
            totalComments,
            languages,
            toxicCount,
            emotions: averageEmotions,
            keywords: topKeywords,
          },
        });

        // Also update the basic results for compatibility
        setResults({
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage,
        });
      } catch (error) {
        console.error("Error in real-time analysis:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500); // 500ms debounce

    // Cleanup the timer on component unmount or when comments change
    return () => clearTimeout(timer);
  }, [comments]);

  const handleAnalyze = async () => {
    if (!comments.trim()) {
      toast({
        title: "Error",
        description: "Please enter some comments to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setEnhancedResults(null);

    try {
      // Clean the text one final time before analysis
      // This will remove patterns like "__________(any number) w/d ______(any number) likeReply"
      // and other social media artifacts
      const cleanedComments = cleanComments(comments);

      // If cleaning removed all meaningful content, don't show an error
      // Just silently skip analysis and return
      if (!cleanedComments.trim()) {
        // Don't show any error toast - just silently return
        console.log(
          "Text contains only social media formatting, skipping analysis"
        );
        setIsAnalyzing(false);
        return;
      }

      // Call the backend API to analyze the text
      const response = await analysisApi.analyzeText(cleanedComments);

      // Set the results from the API response
      if (response && response.result) {
        setResults({
          positive: response.result.sentiment_scores.positive,
          neutral: response.result.sentiment_scores.neutral,
          negative: response.result.sentiment_scores.negative,
        });

        // Split comments by line breaks for enhanced analysis
        // Use the cleaned comments instead of raw comments
        const commentLines = cleanedComments
          .split("\n")
          .filter((line) => line.trim() !== "");

        // Enhanced analysis with language detection and more
        const enhancedComments = commentLines.map((comment, index) => {
          // Apply both our standard text cleaning and social media cleaning
          const cleanedComment = cleanSocialMediaText(cleanText(comment));
          const sentimentResult = analyzeSentiment(cleanedComment);
          const language = detectLanguage(cleanedComment);
          const toxicity = detectToxicity(cleanedComment);
          const emotions = detectEmotions(cleanedComment);
          const keywords = extractKeywords(cleanedComment);

          return {
            id: `comment-${index}`,
            text: comment,
            sentiment: sentimentResult.sentiment,
            language,
            toxicity,
            emotions,
            keywords,
          };
        });

        // Calculate percentages for traditional results
        const totalComments = enhancedComments.length;
        const positiveCount = enhancedComments.filter(
          (c) => c.sentiment === "positive"
        ).length;
        const neutralCount = enhancedComments.filter(
          (c) => c.sentiment === "neutral"
        ).length;
        const negativeCount = enhancedComments.filter(
          (c) => c.sentiment === "negative"
        ).length;

        const positivePercentage = Math.round(
          (positiveCount / totalComments) * 100
        );
        const neutralPercentage = Math.round(
          (neutralCount / totalComments) * 100
        );
        const negativePercentage = Math.round(
          (negativeCount / totalComments) * 100
        );

        // Calculate language distribution
        const languages: Record<string, number> = {};
        enhancedComments.forEach((comment) => {
          languages[comment.language] = (languages[comment.language] || 0) + 1;
        });

        // Count toxic comments
        const toxicCount = enhancedComments.filter(
          (comment) => comment.toxicity > 0.7
        ).length;

        // Calculate average emotions
        const totalEmotions = {
          joy: 0,
          sadness: 0,
          anger: 0,
          fear: 0,
          surprise: 0,
        };

        enhancedComments.forEach((comment) => {
          if (comment.emotions) {
            totalEmotions.joy += comment.emotions.joy;
            totalEmotions.sadness += comment.emotions.sadness;
            totalEmotions.anger += comment.emotions.anger;
            totalEmotions.fear += comment.emotions.fear;
            totalEmotions.surprise += comment.emotions.surprise;
          }
        });

        const averageEmotions = {
          joy: Math.round(totalEmotions.joy / totalComments),
          sadness: Math.round(totalEmotions.sadness / totalComments),
          anger: Math.round(totalEmotions.anger / totalComments),
          fear: Math.round(totalEmotions.fear / totalComments),
          surprise: Math.round(totalEmotions.surprise / totalComments),
        };

        // Extract common keywords
        const allKeywords: string[] = [];
        enhancedComments.forEach((comment) => {
          if (comment.keywords) {
            allKeywords.push(...comment.keywords);
          }
        });

        // Count keyword frequencies
        const keywordCounts: Record<string, number> = {};
        allKeywords.forEach((keyword) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });

        // Get top keywords
        const topKeywords = Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([keyword]) => keyword);

        // Set enhanced results
        setEnhancedResults({
          comments: enhancedComments,
          summary: {
            positive: positivePercentage,
            neutral: neutralPercentage,
            negative: negativePercentage,
            totalComments,
            languages,
            toxicCount,
            emotions: averageEmotions,
            keywords: topKeywords,
          },
        });

        toast({
          title: "Analysis Complete",
          description: `Analyzed ${totalComments} comments with language detection and emotion analysis`,
        });
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "Failed to analyze text",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Set analysis mode to CSV when a file is uploaded
    setAnalysisMode("csv");

    // Clear comment analysis when switching to CSV mode
    setComments("");
    setSentimentResult(null);
    setEnhancedResults(null);

    // Check if it's a CSV file by extension
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({
        title: "Invalid File Type",
        description:
          "Please upload a valid CSV file. Only .csv files are supported.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please upload a CSV file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    });

    // Automatically start analysis
    await handleAnalyzeCSV(file);
  };

  const handleAnalyzeCSV = async (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }

    // File validation is already done in handleFileChange
    // so we don't need to repeat it here

    setIsUploadingCsv(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Call the API to analyze the CSV file
      const result = await analyzeCSVFile(file);

      // Check if result is valid
      if (!result || !result.summary) {
        throw new Error("Invalid response from server");
      }

      setCsvAnalysisResult(result);

      // Generate AI insights from the backend response
      if (result.insights && result.insights.length > 0) {
        // Format insights into a cohesive paragraph
        let aiInsight = "## Data Analysis Summary\n\n";

        // Add basic dataset information
        aiInsight += result.insights.join("\n\n");

        setCsvAiInsights(aiInsight);
      } else {
        // Fallback to frontend-generated insights if backend doesn't provide them
        const insights = generateAIInsights(result);
        setCsvAiInsights(insights);
      }

      // Complete progress
      setUploadProgress(100);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}`,
      });
    } catch (error) {
      console.error("Error analyzing CSV:", error);

      // Clear any previous results
      setCsvAnalysisResult(null);
      setCsvAiInsights("");

      // Show a user-friendly error message
      let errorMessage = "Failed to analyze CSV file";
      if (error instanceof Error) {
        // Extract the most relevant part of the error message
        const message = error.message;
        if (message.includes("Failed to analyze CSV:")) {
          errorMessage = message;
        } else if (message.includes("Only CSV files are supported")) {
          errorMessage = "Please upload a valid CSV file";
        } else if (message.includes("No file found")) {
          errorMessage = "No file was received by the server";
        } else {
          errorMessage = `Analysis failed: ${message}`;
        }
      }

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploadingCsv(false);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && comments.trim()) {
      navigator.clipboard
        .writeText(comments)
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
            variant: "destructive",
          });
        });
    }
  };

  const handlePaste = async () => {
    if (navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();

        // Clean the pasted text to remove social media artifacts
        const cleanedText = cleanComments(text);

        // Set the cleaned text
        setComments(cleanedText);

        // Set analysis mode to comments when text is pasted
        setAnalysisMode("comments");

        // Clear CSV analysis when switching to comments mode
        setCsvAnalysisResult(null);
        setCsvAiInsights("");

        // Only show toast if we have meaningful content after cleaning
        if (cleanedText.trim()) {
          toast({
            title: "Pasted",
            description: "Text pasted and cleaned for analysis",
          });
        } else {
          // If no meaningful content, just set empty comments without showing error
          console.log(
            "Pasted text contains only social media formatting, skipping analysis"
          );
        }
      } catch (error) {
        toast({
          title: "Paste Failed",
          description:
            "Could not read from clipboard. Make sure you have permission.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Clipboard API not supported",
        description: "Your browser doesn't support clipboard operations",
        variant: "destructive",
      });
    }
  };

  // Save Analysis functionality removed

  const sentimentEmoji = {
    positive: "👍",
    negative: "👎",
    neutral: "🤷",
  };

  const sentimentColor = {
    positive: "text-sentiment-positive",
    negative: "text-sentiment-negative",
    neutral: "text-sentiment-neutral",
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            <span className="text-navy dark:text-blue light:text-navy">
              Analysis
            </span>{" "}
            Dashboard
          </h1>

          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-8">
            Choose a platform to analyze or paste a single comment below for
            quick sentiment analysis
          </p>

          {/* Login Prompt Banner for Unauthenticated Users */}
          {!user && (
            <div className="bg-blue/10 border border-blue/20 rounded-lg p-4 mb-8 animate-fade-in">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-blue font-medium text-lg">
                    Unlock Full Features
                  </h3>
                  <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                    Sign in or create an account to save your analyses and
                    export results.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-blue text-blue hover:bg-blue/10"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue hover:bg-blue-light text-white"
                    onClick={() => (window.location.href = "/signup")}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Analysis Section */}
          <div className="mb-10 text-center">
            <Button
              className="bg-blue hover:bg-blue-light rounded-full text-white px-6 py-3 text-lg transition-transform hover:scale-105"
              onClick={() => setSocialModalOpen(true)}
            >
              Choose a Social Platform
            </Button>
          </div>

          {/* Text Analysis Section */}
          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy">
                Comment Analysis
              </CardTitle>
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
                  onChange={(e) => {
                    // Store the raw input value
                    const rawText = e.target.value;

                    // Check if the text contains social media formatting patterns
                    const hasSocialMediaFormatting =
                      /\b\d+[dhmsw]\d*\s*like(?:Reply|Comment|Share)?\b|\b(?:like\s*reply)\b/gi.test(
                        rawText
                      );

                    // If it has social media formatting or is substantially different
                    if (
                      hasSocialMediaFormatting ||
                      Math.abs(rawText.length - comments.length) > 10
                    ) {
                      // Clean the text to remove social media artifacts
                      const cleanedText = cleanComments(rawText);

                      // Set the cleaned text without showing any error notifications
                      setComments(cleanedText);
                    } else {
                      // For minor changes, just set the raw text
                      setComments(rawText);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="btn-secondary transition-transform hover:scale-105"
                    onClick={handlePaste}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Paste
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="btn-secondary transition-transform hover:scale-105"
                  onClick={handleUpload}
                  disabled={isUploadingCsv}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Save Analysis button removed */}
              </div>
            </CardFooter>
          </Card>

          {analysisMode === "comments" &&
            sentimentResult &&
            comments.trim() && (
              <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                    Real-Time Analysis{" "}
                    <span className="ml-2 text-2xl">
                      {sentimentEmoji[sentimentResult.sentiment]}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-lg font-bold mr-2 text-white dark:text-white light:text-navy">
                        Sentiment:
                      </span>
                      <span
                        className={`text-lg font-medium ${
                          sentimentColor[sentimentResult.sentiment]
                        }`}
                      >
                        {sentimentResult.sentiment.charAt(0).toUpperCase() +
                          sentimentResult.sentiment.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {analysisMode === "comments" &&
            sentimentResult &&
            comments.trim() && (
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

          {analysisMode === "csv" && isUploadingCsv && (
            <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue" />
                  Processing CSV File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-white dark:text-white light:text-navy mr-2">
                      {csvFile?.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({csvFile?.size ? (csvFile.size / 1024).toFixed(2) : 0}{" "}
                      KB)
                    </span>
                  </div>
                  <Progress
                    value={uploadProgress}
                    className="h-2 bg-navy-light"
                  />
                  <p className="text-gray-300">
                    {uploadProgress < 100
                      ? "Analyzing data..."
                      : "Analysis complete!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!sentimentResult &&
            !isAnalyzing &&
            !comments.trim() &&
            !isUploadingCsv &&
            !csvAnalysisResult && (
              <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
                <AlertCircle className="h-4 w-4 text-blue" />
                <AlertTitle className="text-white dark:text-white light:text-navy">
                  Getting Started
                </AlertTitle>
                <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                  Enter or paste comments above to see real-time analysis. The
                  AI will automatically categorize each comment as positive,
                  neutral, or negative as you type.
                </AlertDescription>
              </Alert>
            )}

          {/* Show CSV Analysis only when in CSV mode */}
          {analysisMode === "csv" && csvAnalysisResult && csvAiInsights && (
            <CSVAnalysisResults
              result={csvAnalysisResult}
              aiInsights={csvAiInsights}
            />
          )}

          {/* Show Enhanced Comment Analysis only when in comments mode */}
          {analysisMode === "comments" && enhancedResults && (
            <EnhancedCommentAnalysis
              comments={comments}
              results={enhancedResults}
              isAnalyzing={isAnalyzing}
            />
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

export default Analysis;
