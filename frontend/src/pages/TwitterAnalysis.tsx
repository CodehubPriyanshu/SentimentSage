import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  Twitter,
  Bot,
  Save,
  Heart,
  Repeat,
  Calendar,
  ExternalLink,
  User,
  Users,
  Download,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  fetchUserTweets,
  generateTweetInsights,
  saveTwitterAnalysis,
  Tweet,
} from "@/utils/twitterApi";
import { useAuth } from "@/hooks/useAuth";
import LoadingIndicator from "@/components/LoadingIndicator";
import { exportAnalysisAsPDF } from "@/utils/pdfExport";

// Tweet interface is now imported from twitterApi.ts

// Define the user info interface
interface TwitterUserInfo {
  id: string;
  name: string;
  screen_name: string;
  description?: string;
  followers_count: number;
  friends_count: number;
  statuses_count: number;
  profile_image_url?: string;
}

const TwitterAnalysis = () => {
  const { user } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [userInfo, setUserInfo] = useState<TwitterUserInfo | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add filter state
  const [includeRetweets, setIncludeRetweets] = useState(false);
  const [excludeReplies, setExcludeReplies] = useState(false);
  const [tweetCount, setTweetCount] = useState(50);

  // Add a cache for analyzed Twitter handles
  const [analysisCache, setAnalysisCache] = useState<
    Record<
      string,
      {
        tweets: Tweet[];
        userInfo: TwitterUserInfo | null;
        aiInsights: string | null;
      }
    >
  >({});

  // Add a state for tracking analysis progress
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  const handleFetch = async () => {
    // Validate input
    if (!twitterHandle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Twitter/X username or user ID",
        variant: "destructive",
      });
      return;
    }

    // Remove @ symbol if included
    const cleanHandle = twitterHandle.trim().replace(/^@/, "");

    // Check if we have this handle in cache
    if (analysisCache[cleanHandle]) {
      // Use cached result
      const cachedData = analysisCache[cleanHandle];
      setTweets(cachedData.tweets);
      setUserInfo(cachedData.userInfo);
      setAiInsights(cachedData.aiInsights);
      setIsFetching(false);

      toast({
        title: "Analysis Loaded from Cache",
        description: "Showing previously analyzed results",
      });

      return;
    }

    // Reset state
    setIsFetching(true);
    setError(null);
    setTweets([]);
    setUserInfo(null);
    setAiInsights(null);
    setAnalysisProgress(0);

    try {
      // Show loading toast
      toast({
        title: "Fetching Tweets",
        description: `Retrieving and analyzing tweets from ${cleanHandle}...`,
      });

      // Start the timer for performance tracking
      const startTime = Date.now();

      // Update progress
      setAnalysisProgress(10);

      // Start fetching tweets but don't await yet
      const fetchPromise = fetchUserTweets(cleanHandle, {
        include_rts: includeRetweets,
        exclude_replies: excludeReplies,
        count: tweetCount,
      });

      // Show progress updates while waiting
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          // Gradually increase progress up to 80% while waiting
          const newProgress = prev + 5 * Math.random();
          return Math.min(newProgress, 80);
        });
      }, 500);

      // Now await the fetch result
      const fetchedTweets = await fetchPromise;

      // Clear the progress interval
      clearInterval(progressInterval);
      setAnalysisProgress(85);

      // Check if we got any tweets
      if (fetchedTweets.length === 0) {
        throw new Error(
          `No tweets found for ${cleanHandle}. The account may be private, have no tweets, or the API rate limit may have been reached.`
        );
      }

      // Set tweets in state
      setTweets(fetchedTweets);
      setAnalysisProgress(90);

      // Get user info from the first tweet
      const firstTweet = fetchedTweets[0];
      let userInfoData = null;

      if (firstTweet && firstTweet.user_id) {
        try {
          // Fetch user info directly from the API
          const response = await fetch(
            `http://127.0.0.1:5000/api/analyze/twitter/fetch?username=${encodeURIComponent(
              cleanHandle
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.user_info && !data.user_info.error) {
              userInfoData = data.user_info;
              setUserInfo(data.user_info);
            }
          }
        } catch (userInfoError) {
          console.error("Error fetching user info:", userInfoError);
          // Continue with analysis even if user info fails
        }
      }

      setAnalysisProgress(95);

      // Check if tweets are mock data
      const hasMockData = fetchedTweets.some((tweet) =>
        tweet.id.startsWith("mock-")
      );
      if (hasMockData) {
        toast({
          title: "Using Mock Data",
          description:
            "Due to API limitations, we're showing generated tweets. These are not real tweets from this account.",
        });
      } else {
        toast({
          title: "Real Tweets Fetched",
          description: `Successfully analyzed ${fetchedTweets.length} real tweets from ${cleanHandle}`,
        });
      }

      // Generate insights based on the tweets
      const insights = generateTweetInsights(cleanHandle, fetchedTweets);
      setAiInsights(insights);
      setAnalysisProgress(100);

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000;

      // Add to cache
      setAnalysisCache((prev) => ({
        ...prev,
        [cleanHandle]: {
          tweets: fetchedTweets,
          userInfo: userInfoData,
          aiInsights: insights,
        },
      }));

      // Show completion toast with timing
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${
          fetchedTweets.length
        } tweets in ${processingTime.toFixed(1)}s`,
      });
    } catch (err) {
      console.error("Error fetching tweets:", err);
      setAnalysisProgress(0);

      // Determine the error message
      let errorMessage = "Failed to fetch tweets. Please try again later.";

      if (typeof err === "object" && err !== null) {
        if ("message" in err && typeof err.message === "string") {
          errorMessage = err.message;

          // Handle specific error cases
          if (errorMessage.includes("rate limit")) {
            errorMessage = `Twitter API rate limit reached. Please try again in a few minutes.`;
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("404")
          ) {
            errorMessage = `The Twitter account @${cleanHandle} was not found.`;
          } else if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("401")
          ) {
            errorMessage = `Unable to access Twitter API. Authentication failed.`;
          }
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!user || !tweets.length || !aiInsights) {
      toast({
        title: "Error",
        description:
          "You must be logged in and have analyzed tweets to save results",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Show saving toast
    toast({
      title: "Saving Analysis",
      description: "Saving your Twitter analysis to your profile...",
    });

    try {
      // Calculate sentiment percentages for display
      const total = tweets.length;
      const positive =
        tweets.filter((t) => t.sentiment === "positive").length / total;
      const neutral =
        tweets.filter((t) => t.sentiment === "neutral").length / total;
      const negative =
        tweets.filter((t) => t.sentiment === "negative").length / total;

      // Save the analysis to the user's profile with detailed tweet data
      const response = await saveTwitterAnalysis(
        user.id,
        twitterHandle,
        tweets,
        aiInsights
      );

      // Show success toast with more detailed information
      toast({
        title: "Analysis Saved Successfully",
        description: (
          <div className="space-y-2">
            <p>
              Your Twitter analysis for @{twitterHandle.replace(/^@/, "")} has
              been saved to your profile.
            </p>
            <p className="text-xs">
              You can view it anytime in the <strong>Twitter Analysis</strong>{" "}
              section of your profile page.
            </p>
          </div>
        ),
      });

      // Log the saved analysis for debugging
      console.log("Saved analysis:", response);
    } catch (err) {
      console.error("Error saving analysis:", err);

      toast({
        title: "Error Saving Analysis",
        description: (
          <div className="space-y-2">
            <p>
              {typeof err === "string"
                ? err
                : "Failed to save analysis. Please try again later."}
            </p>
            <p className="text-xs">
              If this problem persists, please contact support.
            </p>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add function to handle downloading the report
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadReport = async () => {
    if (!tweets.length) {
      toast({
        title: "Error",
        description: "You must analyze tweets before downloading a report",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    // Show downloading toast
    toast({
      title: "Preparing Report",
      description: "Generating your Twitter analysis report...",
    });

    try {
      // Calculate sentiment percentages
      const total = tweets.length;
      const positive =
        (tweets.filter((t) => t.sentiment === "positive").length / total) * 100;
      const neutral =
        (tweets.filter((t) => t.sentiment === "neutral").length / total) * 100;
      const negative =
        (tweets.filter((t) => t.sentiment === "negative").length / total) * 100;

      // Calculate emotions
      const emotions = {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
      };

      // Count languages
      const languages: Record<string, number> = {};

      // Process all tweets to extract emotions and languages
      tweets.forEach((tweet) => {
        // Add emotions
        if (tweet.emotions) {
          Object.entries(tweet.emotions).forEach(([emotion, value]) => {
            if (emotion in emotions) {
              emotions[emotion as keyof typeof emotions] += value;
            }
          });
        }

        // Count languages
        if (tweet.language) {
          languages[tweet.language] = (languages[tweet.language] || 0) + 1;
        }
      });

      // Normalize emotions
      Object.keys(emotions).forEach((emotion) => {
        emotions[emotion as keyof typeof emotions] =
          (emotions[emotion as keyof typeof emotions] / total) * 100;
      });

      // Prepare data for PDF export with enhanced metadata
      const analysisData = {
        title: `Twitter Analysis for @${twitterHandle.replace(/^@/, "")}`,
        date: new Date().toISOString(),
        comments: tweets.map((tweet) => ({
          id: tweet.id,
          text: tweet.text,
          sentiment: tweet.sentiment,
          language: tweet.language || "en",
          emotions: tweet.emotions,
          keywords: tweet.keywords,
          created_at: tweet.created_at,
          author: tweet.author,
          retweet_count: tweet.retweet_count,
          favorite_count: tweet.favorite_count,
        })),
        summary: {
          positive,
          neutral,
          negative,
          totalComments: total,
          languages,
          toxicCount: 0, // Not applicable for Twitter
          emotions,
          keywords: tweets
            .flatMap((t) => t.keywords || [])
            .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
            .slice(0, 20), // Take top 20 keywords
        },
      };

      // Add user info to the PDF data
      if (userInfo) {
        analysisData.userInfo = userInfo;
      }

      // Add AI insights
      if (aiInsights) {
        analysisData.aiInsights = aiInsights;
      }

      // Export as PDF
      await exportAnalysisAsPDF(analysisData);

      toast({
        title: "Report Downloaded",
        description: (
          <div className="space-y-2">
            <p>
              Your Twitter analysis report has been downloaded successfully.
            </p>
            <p className="text-xs">
              The report includes sentiment analysis, emotional insights, and
              tweet details.
            </p>
          </div>
        ),
      });
    } catch (err) {
      console.error("Error downloading report:", err);

      toast({
        title: "Error Generating Report",
        description: (
          <div className="space-y-2">
            <p>Failed to download report. Please try again later.</p>
            <p className="text-xs">
              If this problem persists, try using a different browser.
            </p>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getSentimentColor = (
    sentiment: "positive" | "neutral" | "negative"
  ) => {
    const colors = {
      positive: "bg-sentiment-positive text-white",
      neutral: "bg-sentiment-neutral text-navy-dark",
      negative: "bg-sentiment-negative text-white",
    };
    return colors[sentiment];
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: "bg-green-500",
      sadness: "bg-blue-500",
      anger: "bg-red-500",
      fear: "bg-purple-500",
      surprise: "bg-orange-500",
    };
    return colors[emotion] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            Real-Time Twitter/X{" "}
            <span className="text-blue">Sentiment Analysis</span>
          </h1>

          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-12">
            Analyze tweets in real-time to understand audience sentiment and
            emotional insights
          </p>

          <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                <Twitter className="h-5 w-5 mr-2 text-blue" />
                Twitter/X Analysis
              </CardTitle>
              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                Enter a Twitter/X username or user ID to analyze recent tweets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <Input
                      placeholder="Enter username or user ID"
                      className="input-field"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Example: elonmusk or 44196397 (user ID)
                    </p>
                  </div>
                  <Button
                    className="btn-primary flex-shrink-0"
                    onClick={handleFetch}
                    disabled={isFetching || !twitterHandle.trim()}
                  >
                    {isFetching ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Analyze Tweets
                      </>
                    )}
                  </Button>
                </div>

                {/* Filter options */}
                <div className="bg-navy-dark dark:bg-navy-dark light:bg-gray-200 p-4 rounded-md">
                  <h4 className="text-white dark:text-white light:text-navy text-sm font-medium mb-3">
                    Analysis Options
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-retweets"
                        checked={includeRetweets}
                        onCheckedChange={(checked) =>
                          setIncludeRetweets(checked === true)
                        }
                        className="border-blue data-[state=checked]:bg-blue"
                      />
                      <Label
                        htmlFor="include-retweets"
                        className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm"
                      >
                        Include retweets
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-replies"
                        checked={excludeReplies}
                        onCheckedChange={(checked) =>
                          setExcludeReplies(checked === true)
                        }
                        className="border-blue data-[state=checked]:bg-blue"
                      />
                      <Label
                        htmlFor="exclude-replies"
                        className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm"
                      >
                        Exclude replies
                      </Label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <Label
                        htmlFor="tweet-count"
                        className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm"
                      >
                        Number of tweets to analyze: {tweetCount}
                      </Label>
                      <span className="text-blue text-sm">{tweetCount}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={tweetCount}
                      onChange={(e) => setTweetCount(parseInt(e.target.value))}
                      className="w-full accent-blue"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!tweets.length && !isFetching && !error && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-blue border-opacity-50">
              <AlertCircle className="h-4 w-4 text-blue" />
              <AlertTitle className="text-white dark:text-white light:text-navy">
                Getting Started
              </AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                Enter a Twitter/X username or user ID above to begin real-time
                analysis. Our AI will analyze the tweets to provide sentiment
                analysis, emotional insights, and keyword extraction.
              </AlertDescription>
            </Alert>
          )}

          {isFetching && (
            <div className="fixed inset-0 flex items-center justify-center bg-navy bg-opacity-90 z-50 backdrop-blur-sm">
              <div className="bg-navy-light p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
                <LoadingIndicator
                  size="large"
                  text={`Analyzing tweets from @${twitterHandle.replace(
                    /^@/,
                    ""
                  )}...`}
                  showProgress={true}
                  progress={analysisProgress}
                  pulseEffect={true}
                  steps={[
                    "Fetching tweets",
                    "Processing sentiment",
                    "Analyzing emotions",
                    "Generating insights",
                  ]}
                  currentStep={
                    analysisProgress < 30
                      ? 0
                      : analysisProgress < 60
                      ? 1
                      : analysisProgress < 90
                      ? 2
                      : 3
                  }
                />

                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm italic">
                    Please wait while we analyze the tweets. This may take a
                    moment depending on the number of tweets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-red-500 border-opacity-50 mb-6">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-white dark:text-white light:text-navy">
                Error
              </AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {tweets.length > 0 && !error && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy">
                Real-Time Tweet Analysis Results
              </h2>

              {/* User Profile Card */}
              {userInfo && (
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white overflow-hidden mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {userInfo.profile_image_url ? (
                        <img
                          src={userInfo.profile_image_url}
                          alt={`${userInfo.name}'s profile`}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white dark:text-white light:text-navy">
                          {userInfo.name}
                        </h3>
                        <p className="text-blue">@{userInfo.screen_name}</p>
                        {userInfo.description && (
                          <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 mt-2">
                            {userInfo.description}
                          </p>
                        )}

                        <div className="flex gap-4 mt-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-white dark:text-white light:text-navy">
                              {userInfo.followers_count.toLocaleString()}
                            </span>
                            <span className="text-gray-400">Followers</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-white dark:text-white light:text-navy">
                              {userInfo.friends_count.toLocaleString()}
                            </span>
                            <span className="text-gray-400">Following</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Twitter className="h-4 w-4 text-gray-400" />
                            <span className="text-white dark:text-white light:text-navy">
                              {userInfo.statuses_count.toLocaleString()}
                            </span>
                            <span className="text-gray-400">Tweets</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://twitter.com/${userInfo.screen_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue hover:text-blue-light flex items-center gap-1"
                      >
                        <span>View on X</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tweets.map((tweet) => (
                <Card
                  key={tweet.id}
                  className="bg-navy-dark dark:bg-navy-dark light:bg-white overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                            <span className="text-white font-bold">
                              {tweet.author
                                .replace("@", "")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white dark:text-white light:text-navy font-medium">
                              {tweet.author}
                            </p>
                            {tweet.user_id && (
                              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                                User ID: {tweet.user_id}
                              </p>
                            )}
                            {tweet.created_at && (
                              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(tweet.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">
                            {tweet.text}
                          </p>

                          {/* Tweet stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            {tweet.retweet_count !== undefined && (
                              <div className="flex items-center">
                                <Repeat className="h-3 w-3 mr-1" />
                                {tweet.retweet_count}
                              </div>
                            )}
                            {tweet.favorite_count !== undefined && (
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {tweet.favorite_count}
                              </div>
                            )}
                            {tweet.is_retweet && (
                              <div className="text-blue">
                                <Repeat className="h-3 w-3 mr-1 inline" />
                                Retweeted
                              </div>
                            )}
                            {/* View on Twitter link */}
                            {!tweet.id.startsWith("mock-") && (
                              <a
                                href={`https://twitter.com/${tweet.author.replace(
                                  "@",
                                  ""
                                )}/status/${tweet.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue hover:text-blue-light flex items-center gap-1 ml-auto"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View on X
                              </a>
                            )}
                          </div>
                        </div>
                        {/* Keywords display */}
                        {tweet.keywords && tweet.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 mb-2">
                            {tweet.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-navy-light dark:bg-navy-light light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 px-2 py-0.5 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Emotions display */}
                        {tweet.emotions && (
                          <div className="grid grid-cols-5 gap-1 mt-2">
                            {Object.entries(tweet.emotions).map(
                              ([emotion, value]) => (
                                <div
                                  key={emotion}
                                  className="flex flex-col items-center"
                                >
                                  <span className="text-xs text-gray-400 capitalize">
                                    {emotion}
                                  </span>
                                  <div className="w-full h-1 bg-navy-dark dark:bg-navy-dark light:bg-gray-300 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getEmotionColor(
                                        emotion
                                      )}`}
                                      style={{ width: `${value}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-medium ml-4 ${getSentimentColor(
                          tweet.sentiment
                        )}`}
                      >
                        {tweet.sentiment.charAt(0).toUpperCase() +
                          tweet.sentiment.slice(1)}
                        {tweet.sentiment_score && (
                          <span className="block text-xs text-center mt-1">
                            {Math.round(
                              tweet.sentiment_score[tweet.sentiment] * 100
                            )}
                            %
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* AI Insights Section */}
              {aiInsights && (
                <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-navy flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-blue" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-200 dark:text-gray-200 light:text-gray-700">
                      {aiInsights}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="card p-6 mt-8">
                <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-4">
                  Sentiment Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">
                        Positive Tweets
                      </span>
                      <span className="text-white dark:text-white light:text-navy">
                        {
                          tweets.filter((t) => t.sentiment === "positive")
                            .length
                        }{" "}
                        / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-sentiment-positive"
                        style={{
                          width: `${
                            (tweets.filter((t) => t.sentiment === "positive")
                              .length /
                              tweets.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">
                        Neutral Tweets
                      </span>
                      <span className="text-white dark:text-white light:text-navy">
                        {tweets.filter((t) => t.sentiment === "neutral").length}{" "}
                        / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-sentiment-neutral"
                        style={{
                          width: `${
                            (tweets.filter((t) => t.sentiment === "neutral")
                              .length /
                              tweets.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white dark:text-white light:text-navy">
                        Negative Tweets
                      </span>
                      <span className="text-white dark:text-white light:text-navy">
                        {
                          tweets.filter((t) => t.sentiment === "negative")
                            .length
                        }{" "}
                        / {tweets.length}
                      </span>
                    </div>
                    <div className="h-4 bg-navy-dark dark:bg-navy-dark light:bg-white rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-sentiment-negative"
                        style={{
                          width: `${
                            (tweets.filter((t) => t.sentiment === "negative")
                              .length /
                              tweets.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

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
                    onClick={handleDownloadReport}
                    disabled={isDownloading || !tweets.length}
                  >
                    {isDownloading ? (
                      <>Downloading...</>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </>
                    )}
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
