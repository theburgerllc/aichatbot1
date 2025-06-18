/**
 * Structured Logger for Production Next.js Application
 * 
 * Features:
 * - Environment-based log level filtering
 * - Request correlation IDs
 * - Structured JSON output for production
 * - Integration with Sentry for error tracking
 * - Performance optimized for serverless environments
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  [key: string]: unknown;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  userAgent?: string | null;
  ip?: string;
  duration?: number;
}

export interface LogEntry {
  timestamp: string;
  level: keyof typeof LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  service: string;
  environment: string;
}

class Logger {
  private readonly service = 'aichatbot-api';
  private readonly environment = process.env.NODE_ENV || 'development';
  private readonly logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default:
        // Default log levels by environment
        return this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private createLogEntry(
    level: keyof typeof LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
    };

    if (context) {
      entry.context = { ...context };
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };

      // Send errors to Sentry in production
      if (this.environment === 'production' && typeof window === 'undefined') {
        this.sendToSentry(error, context);
      }
    }

    return entry;
  }

  private async sendToSentry(error: Error, context?: LogContext) {
    try {
      const { captureException, setContext } = await import('@sentry/nextjs');
      
      if (context) {
        setContext('logger', context);
      }
      
      captureException(error);
    } catch (sentryError) {
      // Fallback if Sentry is not available
      console.error('Failed to send to Sentry:', sentryError);
    }
  }

  private formatOutput(entry: LogEntry): string {
    if (this.environment === 'production') {
      // JSON format for production logging systems
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const { timestamp, level, message, context, error } = entry;
      const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
      const errorStr = error ? ` ERROR: ${error.message}\n${error.stack}` : '';
      
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`;
    }
  }

  private output(entry: LogEntry): void {
    const formatted = this.formatOutput(entry);

    // Use appropriate console method based on log level
    switch (entry.level) {
      case 'ERROR':
        console.error(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'DEBUG':
        console.log(formatted);
        break;
    }
  }

  /**
   * Log error messages and exceptions
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry('ERROR', message, context, error);
    this.output(entry);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry('WARN', message, context);
    this.output(entry);
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry('INFO', message, context);
    this.output(entry);
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry('DEBUG', message, context);
    this.output(entry);
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: LogContext): Logger {
    const childLogger = new Logger();
    
    // Override methods to include child context
    const originalMethods = {
      error: childLogger.error.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      debug: childLogger.debug.bind(childLogger),
    };

    childLogger.error = (message, error, context) =>
      originalMethods.error(message, error, { ...childContext, ...context });
    
    childLogger.warn = (message, context) =>
      originalMethods.warn(message, { ...childContext, ...context });
    
    childLogger.info = (message, context) =>
      originalMethods.info(message, { ...childContext, ...context });
    
    childLogger.debug = (message, context) =>
      originalMethods.debug(message, { ...childContext, ...context });

    return childLogger;
  }

  /**
   * Create request-scoped logger with correlation ID
   */
  forRequest(requestId: string, additionalContext?: LogContext): Logger {
    return this.child({
      correlationId: requestId,
      requestId,
      ...additionalContext,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Utility functions for common logging patterns
export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: LogContext
) => {
  logger.info(`${method} ${url} ${statusCode}`, {
    method,
    url,
    statusCode,
    duration,
    ...context,
  });
};

export const logApiError = (
  method: string,
  url: string,
  error: Error,
  context?: LogContext
) => {
  logger.error(`API Error: ${method} ${url}`, error, {
    method,
    url,
    ...context,
  });
};

export const logBusinessEvent = (
  event: string,
  context?: LogContext
) => {
  logger.info(`Business Event: ${event}`, {
    event,
    eventType: 'business',
    ...context,
  });
};

export const generateCorrelationId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export default logger;