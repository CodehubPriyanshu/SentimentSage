/**
 * Utility functions for CSV file analysis
 */

// API endpoint for CSV analysis
const API_URL = "http://localhost:5000/api";

// Import the analysis API
import { analysisApi } from "./api";

export interface ColumnAnalysis {
  name: string;
  dtype: string;
  type: "numeric" | "categorical" | "datetime";
  missing: number;
  unique_values: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  std?: number;
  distribution?: Array<{
    bin_start: number;
    bin_end: number;
    count: number;
  }>;
  top_values?: Record<string, number>;
}

export interface Correlation {
  column1: string;
  column2: string;
  correlation: number;
}

export interface CSVAnalysisResult {
  summary: {
    rows: number;
    columns: number;
    column_names: string[];
    missing_values: number;
    duplicate_rows: number;
  };
  columns: ColumnAnalysis[];
  correlations: Correlation[] | null;
  insights: string[];
}

/**
 * Upload and analyze a CSV file
 */
export const analyzeCSVFile = async (
  file: File
): Promise<CSVAnalysisResult> => {
  try {
    // Validate file type again as a safety measure
    if (!file.name.toLowerCase().endsWith(".csv")) {
      throw new Error(
        "Please upload a valid CSV file. Only .csv files are supported."
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    // Use the correct API endpoint
    const response = await fetch(`${API_URL}/analyze/csv`, {
      method: "POST",
      body: formData,
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = "Failed to analyze CSV file";
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (jsonError) {
        // If we can't parse the JSON, use the status text
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse the response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error("Invalid response from server");
    }

    // Validate the response structure
    if (!data || !data.result || !data.result.summary) {
      throw new Error("Invalid data format received from server");
    }

    return data.result as CSVAnalysisResult;
  } catch (error) {
    console.error("Error analyzing CSV file:", error);
    throw error;
  }
};

/**
 * Generate AI insights based on the CSV analysis
 */
export const generateAIInsights = (analysis: CSVAnalysisResult): string => {
  // In a real application, this might call an AI service
  // For now, we'll use the insights from the Python backend

  const insights = analysis.insights;

  // Format insights into a cohesive paragraph
  let aiInsight = "## Data Analysis Summary\n\n";

  // Add basic dataset information
  aiInsight += `This dataset contains ${analysis.summary.rows} rows and ${analysis.summary.columns} columns. `;

  // Add data quality information
  if (analysis.summary.missing_values > 0) {
    const missingPercentage =
      (analysis.summary.missing_values /
        (analysis.summary.rows * analysis.summary.columns)) *
      100;
    aiInsight += `There are ${
      analysis.summary.missing_values
    } missing values (${missingPercentage.toFixed(2)}% of all data points). `;
  } else {
    aiInsight += "The dataset has no missing values. ";
  }

  if (analysis.summary.duplicate_rows > 0) {
    const duplicatePercentage =
      (analysis.summary.duplicate_rows / analysis.summary.rows) * 100;
    aiInsight += `There are ${
      analysis.summary.duplicate_rows
    } duplicate rows (${duplicatePercentage.toFixed(2)}% of the dataset). `;
  }

  aiInsight += "\n\n## Key Insights\n\n";

  // Add insights from the analysis
  insights.forEach((insight, index) => {
    if (index > 0) {
      // Skip the first insight as we've already covered it
      aiInsight += `- ${insight}\n`;
    }
  });

  // Add correlation insights
  if (analysis.correlations && analysis.correlations.length > 0) {
    aiInsight += "\n\n## Correlations\n\n";

    // Get top 3 correlations by absolute value
    const topCorrelations = analysis.correlations.slice(0, 3).map((corr) => {
      const strength =
        Math.abs(corr.correlation) > 0.7
          ? "strong"
          : Math.abs(corr.correlation) > 0.5
          ? "moderate"
          : "weak";
      const direction = corr.correlation > 0 ? "positive" : "negative";
      return `- ${strength} ${direction} correlation (${corr.correlation.toFixed(
        2
      )}) between '${corr.column1}' and '${corr.column2}'`;
    });

    aiInsight += topCorrelations.join("\n");
  }

  // Add recommendations
  aiInsight += "\n\n## Recommendations\n\n";

  // Check for missing values
  if (analysis.summary.missing_values > 0) {
    aiInsight +=
      "- Consider handling missing values through imputation or removal\n";
  }

  // Check for duplicate rows
  if (analysis.summary.duplicate_rows > 0) {
    aiInsight += "- Review and potentially remove duplicate rows\n";
  }

  // Check for highly correlated features
  if (
    analysis.correlations &&
    analysis.correlations.some((c) => Math.abs(c.correlation) > 0.9)
  ) {
    aiInsight +=
      "- Consider feature selection to address multicollinearity in highly correlated variables\n";
  }

  // Add general recommendations
  aiInsight += "- Explore outliers in numeric columns\n";
  aiInsight +=
    "- Consider normalizing or scaling numeric features if using for machine learning\n";

  return aiInsight;
};

/**
 * Saves CSV analysis results to the database
 */
export const saveCSVAnalysis = async (
  userId: number | string,
  result: CSVAnalysisResult,
  insights: string,
  filename: string = "uploaded_csv_file.csv"
) => {
  try {
    // Calculate sentiment percentages (if available)
    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    // Create a dataset summary
    const datasetSummary = {
      rows: result.summary.rows,
      columns: result.summary.columns,
      missing_values: result.summary.missing_values,
      duplicate_rows: result.summary.duplicate_rows,
      column_names: result.summary.column_names.slice(0, 10), // Limit to first 10 columns
      insights_preview:
        insights.substring(0, 200) + (insights.length > 200 ? "..." : ""),
    };

    // Save to database using the API
    const response = await analysisApi.saveCSVAnalysis({
      filename: filename,
      row_count: result.summary.rows,
      sentiment_distribution: sentimentDistribution,
      ai_insights: insights,
      summary_stats: {
        rows: result.summary.rows,
        columns: result.summary.columns,
        column_names: result.summary.column_names,
      },
      dataset_summary: datasetSummary,
    });

    return response;
  } catch (error) {
    console.error("Error in saveCSVAnalysis:", error);
    throw error;
  }
};

/**
 * Format a number for display
 */
export const formatNumber = (value: number | undefined): string => {
  if (value === undefined || Number.isNaN(value)) return "N/A";

  // Format with commas for thousands and limit decimal places
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

/**
 * Get a color for correlation values
 */
export const getCorrelationColor = (correlation: number): string => {
  const absCorrelation = Math.abs(correlation);

  if (absCorrelation > 0.7) {
    return correlation > 0 ? "text-green-500" : "text-red-500";
  } else if (absCorrelation > 0.4) {
    return correlation > 0 ? "text-green-400" : "text-red-400";
  } else {
    return "text-gray-400";
  }
};
