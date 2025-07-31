/**
 * Utility functions for YouTube analysis
 */

// Import the analysis API
import { analysisApi } from "./api";

export interface Comment {
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
  language?: string;
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  has_emojis?: boolean;
  emojis?: string[];
  translated_text?: string;
}

export interface VideoInfo {
  video_id: string;
  title: string;
  channel: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  thumbnail: string;
}

export interface YouTubeAnalysisResult {
  summary?: string;
  sentiment_summary?: {
    positive: number;
    neutral: number;
    negative: number;
    total_comments: number;
  };
  keywords?: string[];
  aiInsights?: string;
  video_info?: VideoInfo;
  comments?: Comment[];
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
}

// Cache for storing analysis results
const analysisCache: Record<string, { timestamp: number; data: any }> = {};

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

/**
 * Extracts video ID from YouTube URL
 */
export const extractVideoId = (url: string): string | null => {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Analyzes a YouTube video and returns the analysis results with caching
 */
export const analyzeYouTubeVideo = async (videoUrl: string) => {
  try {
    // Extract video ID for caching
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Check if we have a valid cached result
    const cachedResult = analysisCache[videoId];
    const now = Date.now();

    if (cachedResult && now - cachedResult.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached YouTube analysis result");
      return cachedResult.data;
    }

    // If no cache or expired, fetch new data
    console.log("Fetching fresh YouTube analysis");
    const response = await analysisApi.analyzeYouTube(videoUrl);

    // Cache the result
    analysisCache[videoId] = {
      timestamp: now,
      data: response,
    };

    return response;
  } catch (error) {
    console.error("Error in analyzeYouTubeVideo:", error);
    throw error;
  }
};

/**
 * Saves YouTube analysis results to the database
 * Note: This is now handled automatically by the backend when analyzing a video
 */
export const saveYouTubeAnalysis = async (
  userId: number | string,
  videoUrl: string,
  videoTitle: string,
  result: YouTubeAnalysisResult,
  insights: string
) => {
  try {
    // The analysis is already saved when we analyze the video
    // This function is kept for backward compatibility
    return { success: true };
  } catch (error) {
    console.error("Error in saveYouTubeAnalysis:", error);
    throw error;
  }
};
