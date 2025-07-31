import { toast } from "@/components/ui/use-toast";

/**
 * Error types for better type safety
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: string;
  timestamp?: string;
  path?: string;
  stack?: string;
  originalError?: unknown;
}

/**
 * Error codes for categorizing errors
 */
export enum ErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Maps HTTP status codes to error codes
 */
const statusToErrorCode = (status?: number): ErrorCode => {
  if (!status) return ErrorCode.UNKNOWN_ERROR;

  switch (true) {
    case status === 0 || status === 504 || status === 408:
      return ErrorCode.NETWORK_ERROR;
    case status === 401 || status === 403:
      return ErrorCode.AUTH_ERROR;
    case status === 400 || status === 422:
      return ErrorCode.VALIDATION_ERROR;
    case status === 404:
      return ErrorCode.NOT_FOUND;
    case status === 429:
      return ErrorCode.RATE_LIMIT_ERROR;
    case status >= 500:
      return ErrorCode.SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
};

/**
 * Get user-friendly error message based on error code
 */
const getDefaultMessageForCode = (code: ErrorCode): string => {
  switch (code) {
    case ErrorCode.NETWORK_ERROR:
      return "Network error. Please check your internet connection and try again.";
    case ErrorCode.AUTH_ERROR:
      return "Your session has expired. Please log in again.";
    case ErrorCode.VALIDATION_ERROR:
      return "Please check your input and try again.";
    case ErrorCode.NOT_FOUND:
      return "The requested resource was not found.";
    case ErrorCode.TIMEOUT_ERROR:
      return "The request timed out. Please try again.";
    case ErrorCode.RATE_LIMIT_ERROR:
      return "Too many requests. Please try again later.";
    case ErrorCode.SERVER_ERROR:
      return "Server error. Our team has been notified and is working on it.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Extract error details from various error types
 */
const extractErrorDetails = (
  error: unknown
): {
  message: string;
  details: string;
  status?: number;
  code?: string;
  stack?: string;
} => {
  // Default values
  let message = "An unexpected error occurred";
  let details = "";
  let status: number | undefined;
  let code: string | undefined;
  let stack: string | undefined;

  // Handle different error types
  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;

    // Handle specific error types
    if ("status" in error && typeof error.status === "number") {
      status = error.status;
    }
    if ("code" in error && typeof error.code === "string") {
      code = error.code;
    }
  } else if (error && typeof error === "object") {
    // Handle error-like objects
    if ("message" in error && typeof error.message === "string") {
      message = error.message;
    }

    // Extract status code
    if ("status" in error && typeof error.status === "number") {
      status = error.status;
    } else if ("statusCode" in error && typeof error.statusCode === "number") {
      status = error.statusCode;
    }

    // Extract error code
    if ("code" in error && typeof error.code === "string") {
      code = error.code;
    } else if ("errorCode" in error && typeof error.errorCode === "string") {
      code = error.errorCode;
    }

    // Extract additional details from response
    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object"
    ) {
      const response = error.response as {
        data?: {
          error?: string;
          message?: string;
          details?: string;
          code?: string;
          status?: number;
        };
        status?: number;
      };

      // Extract status from response
      if (response.status && typeof response.status === "number") {
        status = response.status;
      }

      // Extract data from response
      if (response.data) {
        message = response.data.error || response.data.message || message;
        details = response.data.details || details;
        code = response.data.code || code;
        status = response.data.status || status;
      }
    }
  } else if (typeof error === "string") {
    message = error;
  }

  // If we have a status but no code, derive code from status
  if (status && !code) {
    code = statusToErrorCode(status);
  }

  return { message, details, status, code, stack };
};

/**
 * Global error handler for API requests
 * @param error The error object
 * @param customMessage Optional custom message to display
 * @param showToast Whether to show a toast notification
 * @returns A rejected promise with the error
 */
export const handleError = (
  error: unknown,
  customMessage?: string,
  showToast = true
): Promise<never> => {
  console.error("Error:", error);

  // Extract error details
  const { message, details, status, code, stack } = extractErrorDetails(error);

  // Use custom message if provided
  const displayMessage = customMessage || message;

  // Determine error code
  const errorCode = code || statusToErrorCode(status);

  // Create structured error object
  const apiError: ApiError = {
    message: displayMessage,
    details,
    status,
    code: errorCode,
    stack,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    originalError: error,
  };

  // Show toast notification if enabled
  if (showToast) {
    toast({
      title: getToastTitleForErrorCode(errorCode),
      description: displayMessage,
      variant: "destructive",
    });
  }

  // Return rejected promise
  return Promise.reject(apiError);
};

/**
 * Get appropriate toast title based on error code
 */
const getToastTitleForErrorCode = (code: string): string => {
  switch (code) {
    case ErrorCode.NETWORK_ERROR:
      return "Connection Error";
    case ErrorCode.AUTH_ERROR:
      return "Authentication Error";
    case ErrorCode.VALIDATION_ERROR:
      return "Validation Error";
    case ErrorCode.NOT_FOUND:
      return "Not Found";
    case ErrorCode.TIMEOUT_ERROR:
      return "Timeout Error";
    case ErrorCode.RATE_LIMIT_ERROR:
      return "Rate Limit Exceeded";
    case ErrorCode.SERVER_ERROR:
      return "Server Error";
    default:
      return "Error";
  }
};

/**
 * Network error handler
 * @param customMessage Optional custom message to display
 * @returns A rejected promise with a network error
 */
export const handleNetworkError = (customMessage?: string): Promise<never> => {
  const errorMessage =
    customMessage || getDefaultMessageForCode(ErrorCode.NETWORK_ERROR);

  toast({
    title: "Connection Error",
    description: errorMessage,
    variant: "destructive",
  });

  return Promise.reject({
    message: errorMessage,
    code: ErrorCode.NETWORK_ERROR,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  } as ApiError);
};

/**
 * Authentication error handler
 * @param customMessage Optional custom message to display
 * @param redirectToLogin Whether to redirect to login page
 * @returns A rejected promise with an authentication error
 */
export const handleAuthError = (
  customMessage?: string,
  redirectToLogin = true
): Promise<never> => {
  const errorMessage =
    customMessage || getDefaultMessageForCode(ErrorCode.AUTH_ERROR);

  toast({
    title: "Authentication Error",
    description: errorMessage,
    variant: "destructive",
  });

  // Clear authentication tokens
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");

  // Redirect to login page if enabled
  if (redirectToLogin) {
    // Use a small delay to allow the toast to be seen
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  return Promise.reject({
    message: errorMessage,
    code: ErrorCode.AUTH_ERROR,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  } as ApiError);
};

/**
 * Validation error handler
 * @param errors Validation errors object or message
 * @returns A rejected promise with validation errors
 */
export const handleValidationError = (
  errors: Record<string, string> | string
): Promise<never> => {
  let errorMessage: string;
  let errorDetails: string = "";

  if (typeof errors === "string") {
    errorMessage = errors;
  } else {
    // Create a formatted message from the errors object
    errorMessage = "Please correct the following errors:";
    errorDetails = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join("\n");
  }

  toast({
    title: "Validation Error",
    description: errorMessage,
    variant: "destructive",
  });

  return Promise.reject({
    message: errorMessage,
    details: errorDetails,
    code: ErrorCode.VALIDATION_ERROR,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  } as ApiError);
};

/**
 * Timeout error handler
 * @param customMessage Optional custom message to display
 * @returns A rejected promise with a timeout error
 */
export const handleTimeoutError = (customMessage?: string): Promise<never> => {
  const errorMessage =
    customMessage || getDefaultMessageForCode(ErrorCode.TIMEOUT_ERROR);

  toast({
    title: "Request Timeout",
    description: errorMessage,
    variant: "destructive",
  });

  return Promise.reject({
    message: errorMessage,
    code: ErrorCode.TIMEOUT_ERROR,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  } as ApiError);
};
