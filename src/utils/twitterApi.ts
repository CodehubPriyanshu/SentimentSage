import { analysisApi } from "./api";
import { analyzeSentiment } from "./sentimentAnalysis";
import {
  detectEmotions,
  extractKeywords,
  cleanText,
} from "./languageDetection";

export interface Tweet {
  id: string;
  text: string;
  author: string;
  user_id?: string;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  created_at?: string;
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  keywords?: string[];
  is_retweet?: boolean;
  original_author?: string;
  sentiment_score?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  retweet_count?: number;
  favorite_count?: number;
}

/**
 * Fetches tweets from a user profile and analyzes their sentiment
 *
 * This function now attempts to fetch real tweets from the Twitter/X API via our backend.
 * If that fails (due to API limits or other issues), it falls back to generating mock tweets.
 */
export const fetchUserTweets = async (
  username: string,
  options?: {
    include_rts?: boolean;
    exclude_replies?: boolean;
    count?: number;
  }
): Promise<Tweet[]> => {
  try {
    // Set default options
    const include_rts = options?.include_rts ?? false;
    const exclude_replies = options?.exclude_replies ?? false;
    const count = options?.count ?? 50;

    // Build query parameters
    const params = new URLSearchParams({
      username: encodeURIComponent(username),
      include_rts: include_rts.toString(),
      exclude_replies: exclude_replies.toString(),
      count: count.toString(),
    });

    // First, try to fetch real tweets from our backend API
    const response = await fetch(
      `http://127.0.0.1:5000/api/analyze/twitter/fetch?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the API call was successful
    if (response.ok) {
      const data = await response.json();

      // If we have real tweets, process and return them
      if (data.tweets && Array.isArray(data.tweets) && data.tweets.length > 0) {
        console.log("Successfully fetched real tweets:", data.tweets.length);
        console.log("Tweet data sample:", data.tweets[0]);
        console.log("Using mock data:", data.metadata?.is_mock || false);

        // Process the tweets to match our Tweet interface
        return data.tweets.map((tweet: any) => {
          // Clean the text for better analysis
          const cleanedText = cleanText(tweet.text);

          // Check if the tweet already has sentiment analysis
          let sentiment = tweet.sentiment;
          let score = tweet.score || 0.5;
          let emotions = tweet.emotions;
          let keywords = tweet.keywords;

          // If no sentiment analysis is provided, perform it client-side
          if (!sentiment) {
            // Analyze sentiment for each tweet
            const sentimentResult = analyzeSentiment(cleanedText);
            sentiment = sentimentResult.sentiment;

            // Calculate a score based on sentiment
            if (sentiment === "positive") {
              score = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
            } else if (sentiment === "negative") {
              score = Math.random() * 0.3; // 0.0 to 0.3
            } else {
              score = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
            }
          }

          // If no emotions are provided, detect them client-side
          if (!emotions) {
            emotions = detectEmotions(cleanedText);
          }

          // If no keywords are provided, extract them client-side
          if (!keywords) {
            keywords = extractKeywords(cleanedText);
          }

          return {
            id: tweet.id || `${Math.random().toString(36).substring(2, 11)}`,
            text: tweet.text,
            author: tweet.author || `@${username}`,
            user_id: tweet.user_id || "", // Add user_id field
            sentiment: sentiment,
            score:
              typeof score === "number" ? score : parseFloat(score.toFixed(2)),
            created_at: tweet.created_at || new Date().toISOString(),
            emotions: emotions,
            keywords: keywords,
            is_retweet: tweet.is_retweet || false,
            original_author: tweet.original_author,
            sentiment_score: tweet.sentiment_score,
            retweet_count: tweet.retweet_count,
            favorite_count: tweet.favorite_count,
          };
        });
      }
    }

    // If we reach here, either the API call failed or returned no tweets
    // Fall back to generating mock tweets with a warning
    console.warn("Could not fetch real tweets. Using mock data instead.");
    return generateMockTweets(username);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    // Fall back to mock data if the API call fails
    console.warn("API error. Falling back to mock data.");
    return generateMockTweets(username);
  }
};

/**
 * Generates mock tweets for testing and fallback purposes
 */
const generateMockTweets = (username: string): Tweet[] => {
  // Generate a deterministic set of tweets based on the username
  const tweets: Tweet[] = [];
  const tweetCount = 10; // Number of tweets to generate

  const tweetTemplates = [
    "Just tried the new {product} and it's absolutely amazing! #excited",
    "Can't believe how {adjective} today's {event} was. Definitely worth watching!",
    "Having some issues with {product} today. Anyone else experiencing this?",
    "The weather in {location} is {weather} today. Perfect for {activity}!",
    "Just finished reading {book}. It was {opinion}. Would recommend to {audience}.",
    "Attended {event} yesterday. The {aspect} was {quality}, but overall it was {overall}.",
    "Working on a new {project} today. Making {progress} progress!",
    "Just updated my {software} and now it's {state}. {emotion} about this change.",
    "The customer service at {company} is {quality}. They really {action} their customers.",
    "Can anyone recommend a good {product} for {purpose}? Looking to upgrade soon.",
  ];

  const products = [
    "smartphone",
    "laptop",
    "headphones",
    "coffee maker",
    "fitness tracker",
  ];
  const adjectives = [
    "amazing",
    "disappointing",
    "surprising",
    "ordinary",
    "fantastic",
  ];
  const events = ["conference", "concert", "webinar", "meeting", "workshop"];
  const locations = ["New York", "London", "Tokyo", "Paris", "Sydney"];
  const weather = ["sunny", "rainy", "cloudy", "windy", "perfect"];
  const activities = ["hiking", "reading", "shopping", "working", "relaxing"];
  const books = [
    "new novel",
    "biography",
    "self-help book",
    "technical guide",
    "classic",
  ];
  const opinions = [
    "insightful",
    "boring",
    "life-changing",
    "mediocre",
    "thought-provoking",
  ];
  const audiences = [
    "everyone",
    "tech enthusiasts",
    "casual readers",
    "professionals",
    "students",
  ];
  const aspects = ["venue", "content", "organization", "speakers", "food"];
  const qualities = [
    "excellent",
    "terrible",
    "decent",
    "outstanding",
    "disappointing",
  ];
  const overalls = [
    "worth it",
    "a waste of time",
    "memorable",
    "just okay",
    "fantastic",
  ];
  const projects = ["website", "app", "presentation", "report", "design"];
  const progress = ["great", "slow", "steady", "incredible", "minimal"];
  const software = ["phone", "computer", "app", "operating system", "browser"];
  const states = [
    "faster",
    "slower",
    "better",
    "worse",
    "completely different",
  ];
  const emotionWords = [
    "Happy",
    "Frustrated",
    "Excited",
    "Confused",
    "Impressed",
  ];
  const companies = ["Amazon", "Apple", "Google", "Microsoft", "Netflix"];
  const actions = ["value", "ignore", "appreciate", "understand", "support"];
  const purposes = ["work", "gaming", "streaming", "productivity", "travel"];

  // Generate tweets with varying sentiment
  for (let i = 0; i < tweetCount; i++) {
    // Select a template based on the username and index
    const templateIndex = (username.length + i) % tweetTemplates.length;
    let tweetText = tweetTemplates[templateIndex];

    // Replace placeholders with random values
    tweetText = tweetText
      .replace("{product}", products[(username.length + i) % products.length])
      .replace(
        "{adjective}",
        adjectives[(username.length + i) % adjectives.length]
      )
      .replace("{event}", events[(username.length + i) % events.length])
      .replace(
        "{location}",
        locations[(username.length + i) % locations.length]
      )
      .replace("{weather}", weather[(username.length + i) % weather.length])
      .replace(
        "{activity}",
        activities[(username.length + i) % activities.length]
      )
      .replace("{book}", books[(username.length + i) % books.length])
      .replace("{opinion}", opinions[(username.length + i) % opinions.length])
      .replace(
        "{audience}",
        audiences[(username.length + i) % audiences.length]
      )
      .replace("{aspect}", aspects[(username.length + i) % aspects.length])
      .replace("{quality}", qualities[(username.length + i) % qualities.length])
      .replace("{overall}", overalls[(username.length + i) % overalls.length])
      .replace("{project}", projects[(username.length + i) % projects.length])
      .replace("{progress}", progress[(username.length + i) % progress.length])
      .replace("{software}", software[(username.length + i) % software.length])
      .replace("{state}", states[(username.length + i) % states.length])
      .replace(
        "{emotion}",
        emotionWords[(username.length + i) % emotionWords.length]
      )
      .replace("{company}", companies[(username.length + i) % companies.length])
      .replace("{action}", actions[(username.length + i) % actions.length])
      .replace("{purpose}", purposes[(username.length + i) % purposes.length]);

    // Clean the text for better analysis
    const cleanedText = cleanText(tweetText);

    // Analyze sentiment
    const sentimentResult = analyzeSentiment(cleanedText);

    // Generate a score based on sentiment
    let score = 0.5; // Default neutral score
    if (sentimentResult.sentiment === "positive") {
      score = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
    } else if (sentimentResult.sentiment === "negative") {
      score = Math.random() * 0.3; // 0.0 to 0.3
    } else {
      score = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    }

    // Detect emotions in the tweet
    const emotions = detectEmotions(cleanedText);

    // Extract keywords from the tweet
    const keywords = extractKeywords(cleanedText);

    // Create a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    tweets.push({
      id: `mock-${i + 1}`,
      text: tweetText,
      author: `@${username}`,
      user_id: `${username}${Math.floor(Math.random() * 1000000)}`, // Add mock user_id
      sentiment: sentimentResult.sentiment,
      score: parseFloat(score.toFixed(2)),
      created_at: date.toISOString(),
      emotions: emotions,
      keywords: keywords,
    });
  }

  return tweets;
};

/**
 * Generates AI insights based on analyzed tweets
 */
export const generateTweetInsights = (
  username: string,
  tweets: Tweet[]
): string => {
  // Count sentiment distribution
  const sentimentCounts = {
    positive: tweets.filter((t) => t.sentiment === "positive").length,
    neutral: tweets.filter((t) => t.sentiment === "neutral").length,
    negative: tweets.filter((t) => t.sentiment === "negative").length,
  };

  // Calculate percentages
  const total = tweets.length;
  const positivePercent = Math.round((sentimentCounts.positive / total) * 100);
  const neutralPercent = Math.round((sentimentCounts.neutral / total) * 100);
  const negativePercent = Math.round((sentimentCounts.negative / total) * 100);

  // Generate insights based on the sentiment distribution
  let insights = `Based on the analysis of @${username}'s recent tweets, `;

  if (positivePercent > neutralPercent && positivePercent > negativePercent) {
    insights += `there's a predominantly positive tone (${positivePercent}%) in their communication. `;
    insights += `The account frequently shares enthusiastic content about products, experiences, and interactions. `;
  } else if (
    negativePercent > positivePercent &&
    negativePercent > neutralPercent
  ) {
    insights += `there's a notably critical tone (${negativePercent}%) in their communication. `;
    insights += `The account frequently expresses concerns or disappointment about products, services, or experiences. `;
  } else {
    insights += `there's a balanced or neutral tone in their communication with ${positivePercent}% positive, ${neutralPercent}% neutral, and ${negativePercent}% negative content. `;
    insights += `The account shares a mix of experiences and opinions without strong sentiment leanings. `;
  }

  // Add more specific insights based on tweet content
  insights += `Common topics include technology, personal experiences, and social interactions. `;

  if (sentimentCounts.neutral > 0) {
    insights += `There are some neutral discussions that present balanced viewpoints or factual information. `;
  }

  // Add recommendations
  insights += `Based on this analysis, the account appears to be ${
    positivePercent > 50
      ? "generally optimistic and engaging"
      : positivePercent < 30
      ? "somewhat critical or concerned"
      : "balanced in their expressions"
  }. `;

  // Add engagement suggestion
  insights += `Engagement with this account would likely benefit from ${
    positivePercent > 50
      ? "matching their enthusiastic tone"
      : negativePercent > 50
      ? "addressing concerns directly and providing solutions"
      : "a balanced approach that acknowledges both positive and negative points"
  }.`;

  return insights;
};

/**
 * Saves analysis results to the database and user profile
 */
export const saveTwitterAnalysis = async (
  userId: number,
  username: string,
  tweets: Tweet[],
  insights: string
) => {
  try {
    // Calculate sentiment percentages
    const total = tweets.length;
    const positive =
      tweets.filter((t) => t.sentiment === "positive").length / total;
    const neutral =
      tweets.filter((t) => t.sentiment === "neutral").length / total;
    const negative =
      tweets.filter((t) => t.sentiment === "negative").length / total;

    // Prepare tweet data with sentiment scores for storage
    const tweetData = tweets.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author,
      user_id: tweet.user_id || "",
      sentiment: tweet.sentiment,
      sentiment_score: tweet.sentiment_score || {
        positive: tweet.sentiment === "positive" ? 0.8 : 0.1,
        neutral: tweet.sentiment === "neutral" ? 0.8 : 0.1,
        negative: tweet.sentiment === "negative" ? 0.8 : 0.1,
      },
      created_at: tweet.created_at,
      keywords: tweet.keywords || [],
      emotions: tweet.emotions || {},
      retweet_count: tweet.retweet_count,
      favorite_count: tweet.favorite_count,
    }));

    // Add metadata for better organization in profile
    const metadata = {
      analysis_date: new Date().toISOString(),
      tweet_count: tweets.length,
      sentiment_distribution: {
        positive,
        neutral,
        negative,
      },
      username,
    };

    console.log("Saving Twitter analysis with data:", {
      username,
      tweet_count: tweets.length,
      sentiment_scores: {
        positive,
        neutral,
        negative,
      },
    });

    // Save to database using the API
    const response = await analysisApi.analyzeTwitter(username, {
      username,
      tweets_data: JSON.stringify(tweetData),
      tweet_count: tweets.length,
      positive_sentiment: positive,
      neutral_sentiment: neutral,
      negative_sentiment: negative,
      ai_insights: insights,
      metadata: JSON.stringify(metadata),
    });

    console.log("Twitter analysis saved successfully:", response);
    return response;
  } catch (error) {
    console.error("Error in saveTwitterAnalysis:", error);
    throw error;
  }
};
