import React, { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import errorLogger from '@/utils/errorLogger';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * GlobalErrorHandler component
 * 
 * This component sets up global error handling for the application.
 * It catches unhandled errors and promise rejections and logs them.
 */
const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      
      const error = event.reason;
      errorLogger.error(error, { 
        type: 'unhandled-promise-rejection',
        source: 'global-error-handler'
      });
      
      // Show a user-friendly toast
      toast({
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    };

    // Handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      
      errorLogger.error(event.error || event.message, { 
        type: 'uncaught-error',
        source: 'global-error-handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Show a user-friendly toast
      toast({
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
};

export default GlobalErrorHandler;
