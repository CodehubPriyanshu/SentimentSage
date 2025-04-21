import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  error?: string | string[] | Record<string, string> | null;
  className?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * FormErrorHandler component for displaying form validation errors
 * 
 * This component can handle different types of error formats:
 * - String: Simple error message
 * - String[]: List of error messages
 * - Record<string, string>: Field-specific error messages
 */
const FormErrorHandler: React.FC<FormErrorProps> = ({ 
  error, 
  className = '',
  fieldErrors
}) => {
  if (!error && !fieldErrors) return null;
  
  // Combine errors from props
  const allFieldErrors: Record<string, string> = {
    ...(fieldErrors || {}),
    ...(error && typeof error === 'object' && !Array.isArray(error) ? error : {})
  };
  
  // Extract general errors (non-field specific)
  let generalErrors: string[] = [];
  
  if (typeof error === 'string') {
    generalErrors.push(error);
  } else if (Array.isArray(error)) {
    generalErrors = [...error];
  }
  
  const hasFieldErrors = Object.keys(allFieldErrors).length > 0;
  const hasGeneralErrors = generalErrors.length > 0;
  
  if (!hasFieldErrors && !hasGeneralErrors) return null;
  
  return (
    <div className={`rounded-md bg-red-50 dark:bg-red-900/20 p-4 my-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          {hasGeneralErrors && (
            <div className="text-sm text-red-700 dark:text-red-400">
              {generalErrors.map((err, index) => (
                <p key={index} className="mb-1 last:mb-0">{err}</p>
              ))}
            </div>
          )}
          
          {hasFieldErrors && (
            <div className="mt-2">
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-400">
                {Object.entries(allFieldErrors).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}:</span> {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormErrorHandler;
