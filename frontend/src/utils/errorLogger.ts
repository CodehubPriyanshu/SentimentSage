import { ApiError } from './errorHandler';

/**
 * Error logging levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Error log entry structure
 */
interface ErrorLogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  path?: string;
  stack?: string;
  code?: string;
  details?: string;
  context?: Record<string, unknown>;
}

/**
 * Maximum number of logs to keep in local storage
 */
const MAX_LOGS = 100;

/**
 * Local storage key for error logs
 */
const ERROR_LOGS_KEY = 'sentimentsage_error_logs';

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
 * Log an error with the specified level
 */
export const logError = (
  error: unknown,
  level: LogLevel = LogLevel.ERROR,
  context?: Record<string, unknown>
): void => {
  let message = 'Unknown error';
  let stack: string | undefined;
  let code: string | undefined;
  let details: string | undefined;
  let path: string | undefined = window.location.pathname;
  
  // Extract error details based on error type
  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
    
    // Handle ApiError
    if ('code' in error && typeof error.code === 'string') {
      code = error.code;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    // Handle ApiError or error-like objects
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
    
    if ('stack' in error && typeof error.stack === 'string') {
      stack = error.stack;
    }
    
    if ('code' in error && typeof error.code === 'string') {
      code = error.code;
    }
    
    if ('details' in error && typeof error.details === 'string') {
      details = error.details;
    }
    
    if ('path' in error && typeof error.path === 'string') {
      path = error.path;
    }
  }
  
  // Create log entry
  const entry: ErrorLogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    path,
    stack,
    code,
    details,
    context
  };
  
  // Log to console
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
export const logApiError = (error: ApiError, context?: Record<string, unknown>): void => {
  const level = error.status && error.status >= 500 ? LogLevel.ERROR : LogLevel.WARN;
  
  logError(error, level, {
    ...context,
    status: error.status,
    code: error.code,
    path: error.path || window.location.pathname
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
 * Default error logger
 */
export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarning,
  error: logError,
  fatal: (error: unknown, context?: Record<string, unknown>) => logError(error, LogLevel.FATAL, context),
  api: logApiError,
  getAll: getErrorLogs,
  clear: clearErrorLogs
};
