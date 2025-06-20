import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ExternalServiceError extends APIError {
  constructor(message: string, public service?: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

export function handleAPIError(error: unknown): NextResponse {
  logger.error('API Error occurred', error as Error, {
    errorType: 'api_error',
    handlerFunction: 'handleAPIError',
  });

  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details })
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        code: 'VALIDATION_ERROR',
        details: error.errors 
      },
      { status: 400 }
    );
  }

  // Log unexpected errors for monitoring
  logger.error('Unhandled API error', error as Error, {
    errorType: 'unhandled_api_error',
    handlerFunction: 'handleAPIError',
  });
  
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return NextResponse.json(
    { 
      error: isProduction ? 'Internal server error' : String(error),
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}

export function createErrorHandler(operation: string) {
  return (error: unknown) => {
    logger.error(`${operation} error occurred`, error as Error, {
      operation,
      errorType: 'operation_error',
      handlerFunction: 'createErrorHandler',
    });
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid input data', { errors: error.errors });
    }
    
    throw new APIError(`${operation} failed`);
  };
}

// Error logging utility
export function logError(error: unknown, context: Record<string, unknown> = {}) {
  // Use our structured logger instead of console.error
  logger.error('Error logged via logError utility', error as Error, {
    ...context,
    handlerFunction: 'logError',
    errorType: 'logged_error',
  });
  
  // Note: Sentry integration is now handled automatically by the logger
  // when in production environment
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleAPIError(error);
    }
  };
}

// Retry utility for external service calls
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new ExternalServiceError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`
  );
}
