import { toast } from '@/components/ui/use-toast';
import errorLogger from '@/utils/errorLogger';
import { ApiError, ErrorCode } from './errorHandler';

/**
 * Enhanced API error handler
 * 
 * This utility provides improved error handling for API calls,
 * with specific handling for different types of errors.
 */

/**
 * Process API error and show appropriate toast message
 * @param error The error object from the API call
 * @param fallbackMessage Optional fallback message if error doesn't have a message
 * @returns The processed error object
 */
export const processApiError = (error: any, fallbackMessage = 'An unexpected error occurred'): ApiError => {
  // Log the error
  errorLogger.error(error, { source: 'api-error-handler' });
  
  // Extract error details
  let errorMessage = fallbackMessage;
  let errorCode = ErrorCode.UNKNOWN_ERROR;
  let statusCode: number | undefined;
  
  // Handle different error types
  if (error instanceof Error) {
    errorMessage = error.message || fallbackMessage;
  }
  
  if (error && typeof error === 'object') {
    // Extract message from error object
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else if ('error' in error && typeof error.error === 'string') {
      errorMessage = error.error;
    }
    
    // Extract status code
    if ('status' in error && typeof error.status === 'number') {
      statusCode = error.status;
      
      // Map status code to error code
      if (statusCode === 401 || statusCode === 403) {
        errorCode = ErrorCode.AUTH_ERROR;
      } else if (statusCode === 404) {
        errorCode = ErrorCode.NOT_FOUND;
      } else if (statusCode >= 500) {
        errorCode = ErrorCode.SERVER_ERROR;
      } else if (statusCode === 400) {
        errorCode = ErrorCode.VALIDATION_ERROR;
      }
    }
    
    // Extract error code
    if ('code' in error && typeof error.code === 'string') {
      errorCode = error.code;
    }
  }
  
  // Create structured error object
  const apiError: ApiError = {
    message: errorMessage,
    code: errorCode,
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    originalError: error
  };
  
  return apiError;
};

/**
 * Show error toast with appropriate message
 * @param error The error object
 * @param fallbackMessage Optional fallback message
 */
export const showErrorToast = (error: any, fallbackMessage = 'An unexpected error occurred') => {
  const apiError = processApiError(error, fallbackMessage);
  
  // Determine toast title based on error code
  let title = 'Error';
  if (apiError.code === ErrorCode.AUTH_ERROR) {
    title = 'Authentication Error';
  } else if (apiError.code === ErrorCode.VALIDATION_ERROR) {
    title = 'Validation Error';
  } else if (apiError.code === ErrorCode.SERVER_ERROR) {
    title = 'Server Error';
  } else if (apiError.code === ErrorCode.NETWORK_ERROR) {
    title = 'Network Error';
  } else if (apiError.code === ErrorCode.TIMEOUT_ERROR) {
    title = 'Request Timeout';
  }
  
  // Show toast
  toast({
    title,
    description: apiError.message,
    variant: 'destructive',
  });
  
  return apiError;
};

/**
 * Handle API error with appropriate toast and logging
 * @param error The error object
 * @param fallbackMessage Optional fallback message
 * @returns The processed error object
 */
export const handleApiError = (error: any, fallbackMessage = 'An unexpected error occurred'): ApiError => {
  const apiError = showErrorToast(error, fallbackMessage);
  return apiError;
};

export default {
  process: processApiError,
  showToast: showErrorToast,
  handle: handleApiError
};
