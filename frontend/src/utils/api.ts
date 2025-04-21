import { toast } from "@/components/ui/use-toast";
import {
  handleError,
  handleNetworkError,
  handleAuthError,
  handleValidationError,
  handleTimeoutError,
  ErrorCode,
  ApiError,
} from "./errorHandler";

// Use the correct port for the backend server
const API_URL = "http://127.0.0.1:5000/api";

// Default timeout for fetch requests (in milliseconds)
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Adds a timeout to a fetch request
 * @param promise The fetch promise
 * @param timeout Timeout in milliseconds
 * @returns A promise that rejects if the timeout is reached
 */
const timeoutPromise = <T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);

    // Execute the original promise
    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Helper function to handle API errors
 * @param error The error object
 * @returns A rejected promise with the error
 */
const handleApiError = (error: unknown): Promise<never> => {
  // Check if it's a timeout error
  if (error instanceof Error && error.message.includes("timed out")) {
    return handleTimeoutError();
  }

  // Check for specific error types
  if (error instanceof Response) {
    // Handle HTTP response errors based on status code
    if (error.status === 401 || error.status === 403) {
      return handleAuthError();
    }

    if (error.status === 0 || error.status === 504 || error.status === 408) {
      return handleNetworkError();
    }

    if (error.status === 400 || error.status === 422) {
      // Try to parse validation errors
      return error
        .json()
        .then((data) => {
          if (data.errors && typeof data.errors === "object") {
            return handleValidationError(data.errors);
          } else {
            const message = data.error || data.message || "Validation failed";
            return handleValidationError(message);
          }
        })
        .catch(() => {
          // If we can't parse the JSON, use a generic validation error
          return handleValidationError("Please check your input and try again");
        });
    }

    // For other fetch API errors
    return error
      .json()
      .then((data) => {
        const message = data.error || data.message || "An error occurred";
        return handleError(
          {
            ...error,
            message,
            status: error.status,
            statusText: error.statusText,
            data,
          },
          message
        );
      })
      .catch(() => {
        // If we can't parse the JSON, just use the status text
        return handleError(
          {
            ...error,
            message: error.statusText || "An error occurred",
            status: error.status,
          },
          error.statusText || "An error occurred"
        );
      });
  }

  // For all other errors, use the generic handler
  return handleError(error);
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Authentication API calls
export const authApi = {
  signup: async (email: string, password: string, fullName: string) => {
    try {
      // Add timeout to the fetch request
      const fetchPromise = fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const response = await timeoutPromise(fetchPromise, DEFAULT_TIMEOUT);

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      // Add timeout to the fetch request
      const fetchPromise = fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const response = await timeoutPromise(fetchPromise, DEFAULT_TIMEOUT);

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        // Also store refresh token if available
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
      }

      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      // Remove token from localStorage
      localStorage.removeItem("token");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log out");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return Promise.reject({ message: "No authentication token found" });
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // If unauthorized, clear token and reject
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          return Promise.reject({
            message: "Session expired. Please log in again.",
          });
        }
        return handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyResetOTP: async (resetToken: string, otp: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reset_token: resetToken, otp }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  resetPassword: async (
    resetToken: string,
    otp: string,
    newPassword: string
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reset_token: resetToken,
          otp,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Profile API calls
export const profileApi = {
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get profile");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data: Record<string, unknown>) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  uploadProfilePhoto: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`${API_URL}/profile/photo`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload profile photo");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAnalyses: async () => {
    try {
      const response = await fetch(`${API_URL}/profile/analyses`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get analyses");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_URL}/profile/change-password`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Analysis API calls
export const analysisApi = {
  analyzeText: async (text: string) => {
    try {
      const response = await fetch(`${API_URL}/analyze/text`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze text");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  analyzeCSV: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/analyze/csv`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze CSV");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  saveCSVAnalysis: async (data: Record<string, unknown>) => {
    try {
      const response = await fetch(`${API_URL}/analyze/csv/save`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save CSV analysis");
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  analyzeTwitter: async (username: string, data?: Record<string, unknown>) => {
    try {
      const response = await fetch(`${API_URL}/analyze/twitter`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data || { username }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  analyzeYouTube: async (videoUrl: string, data?: Record<string, unknown>) => {
    try {
      // Use a longer timeout for YouTube analysis since it can take longer
      const longerTimeout = DEFAULT_TIMEOUT * 2; // 60 seconds

      // Show a toast notification that analysis is starting
      toast({
        title: "YouTube Analysis",
        description:
          "Starting analysis of YouTube video. This may take a moment...",
      });

      // Add timeout to the fetch request
      const fetchPromise = fetch(`${API_URL}/analyze/youtube`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data || { video_url: videoUrl }),
      });

      const response = await timeoutPromise(fetchPromise, longerTimeout);

      if (!response.ok) {
        return handleApiError(response);
      }

      const result = await response.json();

      // Show success toast
      toast({
        title: "Analysis Complete",
        description: "YouTube video analysis completed successfully.",
        variant: "default",
      });

      return result;
    } catch (error) {
      // Use a specific error message for YouTube analysis
      return handleApiError(
        error,
        "Failed to analyze YouTube video. Please check the URL and try again."
      );
    }
  },

  saveCommentAnalysis: async (data: Record<string, unknown>) => {
    try {
      // Add timeout to the fetch request
      const fetchPromise = fetch(`${API_URL}/analyze/text/save`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await timeoutPromise(fetchPromise, DEFAULT_TIMEOUT);

      if (!response.ok) {
        // Try to get detailed error information
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              errorData.message ||
              "Failed to save comment analysis"
          );
        } catch (jsonError) {
          // If we can't parse the JSON, use the status text
          throw new Error(
            `Failed to save comment analysis: ${response.statusText}`
          );
        }
      }

      return await response.json();
    } catch (error) {
      console.error("API Error in saveCommentAnalysis:", error);
      return handleApiError(error);
    }
  },
};
