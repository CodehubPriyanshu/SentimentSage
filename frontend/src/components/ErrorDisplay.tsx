import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/utils/errorHandler';

interface ErrorDisplayProps {
  error: Error | ApiError | string;
  title?: string;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

/**
 * ErrorDisplay component
 * 
 * Displays error messages in a consistent format across the application.
 * Can be configured with different variants and action buttons.
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'Something went wrong',
  onRetry,
  onBack,
  onHome = () => window.location.href = '/',
  showHomeButton = true,
  showBackButton = true,
  showRetryButton = true,
  className = '',
  variant = 'default',
}) => {
  // Extract error message based on error type
  const errorMessage = typeof error === 'string' 
    ? error 
    : 'message' in error 
      ? error.message 
      : 'An unexpected error occurred';
  
  // Extract error details if available
  const errorDetails = typeof error !== 'string' && 'details' in error ? error.details : undefined;
  
  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  // Compact variant (for inline errors)
  if (variant === 'compact') {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 p-3 rounded-md ${className}`}>
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{title}</h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-400">
              <p>{errorMessage}</p>
              {errorDetails && <p className="mt-1 text-xs">{errorDetails}</p>}
            </div>
            {showRetryButton && onRetry && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={onRetry}
                className="mt-1 h-auto p-0 text-red-800 dark:text-red-300"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Inline variant (for form errors)
  if (variant === 'inline') {
    return (
      <div className={`text-red-600 dark:text-red-400 text-sm mt-1 ${className}`}>
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      </div>
    );
  }
  
  // Default variant (full error card)
  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <CardTitle className="text-red-800 dark:text-red-300">{title}</CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-400">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      
      {errorDetails && (
        <CardContent className="pt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">Additional details:</p>
            <p className="text-gray-600 dark:text-gray-400">{errorDetails}</p>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end space-x-2 pt-2">
        {showRetryButton && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {showBackButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
        
        {showHomeButton && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onHome}
            className="bg-blue hover:bg-blue-light"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ErrorDisplay;
