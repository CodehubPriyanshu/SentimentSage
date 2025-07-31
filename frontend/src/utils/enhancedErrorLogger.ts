import { LogLevel, ErrorLogEntry } from './errorLogger';

// Constants
const ERROR_LOGS_KEY = 'sage_sentiment_error_logs';
const MAX_LOGS = 100;
const MAX_STACK_TRACE_LENGTH = 2000;

/**
 * Enhanced error logger
 * 
 * This utility provides improved error logging functionality,
 * with better error categorization and formatting.
 */

/**
 * Get all error logs from local storage
 */
export const getErrorLogs = (): ErrorLogEntry[] => {
  try {
    const logs = localStorage.getItem(ERROR_LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to parse error logs from local storage:', error);
    return [];
  }
};

/**
 * Save error logs to local storage
 */
const saveErrorLogs = (logs: ErrorLogEntry[]): void => {
  try {
    // Limit the number of logs to prevent local storage overflow
    const limitedLogs = logs.slice(-MAX_LOGS);
    localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(limitedLogs));
  } catch (error) {
    console.error('Failed to save error logs to local storage:', error);
  }
};

/**
 * Add a new error log entry
 */
const addErrorLog = (entry: ErrorLogEntry): void => {
  const logs = getErrorLogs();
  logs.push(entry);
  saveErrorLogs(logs);
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = (): void => {
  localStorage.removeItem(ERROR_LOGS_KEY);
};

/**
 * Extract error details from an error object
 */
const extractErrorDetails = (error: unknown): {
  message: string;
  stack?: string;
  code?: string;
  status?: number;
  details?: string;
} => {
  let message = 'Unknown error';
  let stack: string | undefined;
  let code: string | undefined;
  let status: number | undefined;
  let details: string | undefined;
  
  if (error instanceof Error) {
    message = error.message;
    
    // Truncate stack trace if it's too long
    if (error.stack) {
      stack = error.stack.length > MAX_STACK_TRACE_LENGTH
        ? error.stack.substring(0, MAX_STACK_TRACE_LENGTH) + '...'
        : error.stack;
    }
    
    // Extract additional properties
    if ('code' in error && typeof (error as any).code === 'string') {
      code = (error as any).code;
    }
    
    if ('status' in error && typeof (error as any).status === 'number') {
      status = (error as any).status;
    }
    
    if ('details' in error && typeof (error as any).details === 'string') {
      details = (error as any).details;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    
    if ('stack' in error && typeof (error as any).stack === 'string') {
      stack = (error as any).stack.length > MAX_STACK_TRACE_LENGTH
        ? (error as any).stack.substring(0, MAX_STACK_TRACE_LENGTH) + '...'
        : (error as any).stack;
    }
    
    if ('code' in error && typeof (error as any).code === 'string') {
      code = (error as any).code;
    }
    
    if ('status' in error && typeof (error as any).status === 'number') {
      status = (error as any).status;
    }
    
    if ('details' in error && typeof (error as any).details === 'string') {
      details = (error as any).details;
    }
  }
  
  return { message, stack, code, status, details };
};

/**
 * Get browser and system information
 */
const getSystemInfo = (): Record<string, string> => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    url: window.location.href,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log an error with the specified level
 */
export const logError = (
  error: unknown,
  level: LogLevel = LogLevel.ERROR,
  context?: Record<string, unknown>
): void => {
  const { message, stack, code, status, details } = extractErrorDetails(error);
  const systemInfo = getSystemInfo();
  
  // Create log entry
  const entry: ErrorLogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    stack,
    code,
    status,
    details,
    context: {
      ...context,
      systemInfo
    }
  };
  
  // Log to console with appropriate level
  console[level === LogLevel.DEBUG ? 'debug' : 
          level === LogLevel.INFO ? 'info' : 
          level === LogLevel.WARN ? 'warn' : 
          'error'](
    `[${level.toUpperCase()}] ${message}`,
    { ...entry, error }
  );
  
  // Add to local storage logs
  addErrorLog(entry);
  
  // Here you could also send the error to a remote logging service
  // Example: sendToRemoteLoggingService(entry);
};

/**
 * Log an API error
 */
export const logApiError = (
  error: any, 
  context?: Record<string, unknown>
): void => {
  const level = error.status && error.status >= 500 ? LogLevel.ERROR : LogLevel.WARN;
  
  logError(error, level, {
    ...context,
    status: error.status,
    code: error.code,
    path: error.path || window.location.pathname,
    type: 'api-error'
  });
};

/**
 * Log a debug message
 */
export const logDebug = (message: string, context?: Record<string, unknown>): void => {
  logError(message, LogLevel.DEBUG, context);
};

/**
 * Log an info message
 */
export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  logError(message, LogLevel.INFO, context);
};

/**
 * Log a warning message
 */
export const logWarning = (message: string, context?: Record<string, unknown>): void => {
  logError(message, LogLevel.WARN, context);
};

/**
 * Log a fatal error
 */
export const logFatal = (error: unknown, context?: Record<string, unknown>): void => {
  logError(error, LogLevel.FATAL, context);
};

/**
 * Enhanced error logger
 */
export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarning,
  error: logError,
  fatal: logFatal,
  api: logApiError,
  getAll: getErrorLogs,
  clear: clearErrorLogs
};
