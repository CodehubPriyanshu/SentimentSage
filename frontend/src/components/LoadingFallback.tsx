import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * LoadingFallback component
 * 
 * Displays a loading spinner with an optional message.
 * Can be configured to take up the full screen or just a container.
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  className = '',
  size = 'md',
  fullScreen = false,
}) => {
  // Determine spinner size based on the size prop
  const spinnerSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  
  // Determine text size based on the size prop
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  
  // Base container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-navy/80 dark:bg-navy/90 light:bg-white/80 z-50'
    : 'flex flex-col items-center justify-center p-8';
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className={`${spinnerSize} text-blue animate-spin`} />
        {message && (
          <p className={`${textSize} text-white dark:text-white light:text-navy font-medium`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingFallback;
