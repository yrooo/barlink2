import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PostgrestError } from '@supabase/supabase-js';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

// Custom error class for application errors
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error creators
export const createValidationError = (message: string, details?: unknown) =>
  new AppError(message, ErrorType.VALIDATION, 400, true, details);

export const createAuthenticationError = (message = 'Authentication required') =>
  new AppError(message, ErrorType.AUTHENTICATION, 401);

export const createAuthorizationError = (message = 'Insufficient permissions') =>
  new AppError(message, ErrorType.AUTHORIZATION, 403);

export const createNotFoundError = (resource: string) =>
  new AppError(`${resource} not found`, ErrorType.NOT_FOUND, 404);

export const createConflictError = (message: string) =>
  new AppError(message, ErrorType.CONFLICT, 409);

export const createRateLimitError = (message = 'Too many requests') =>
  new AppError(message, ErrorType.RATE_LIMIT, 429);

export const createExternalServiceError = (service: string, details?: unknown) =>
  new AppError(`${service} service unavailable`, ErrorType.EXTERNAL_SERVICE, 503, true, details);

export const createDatabaseError = (message: string, details?: unknown) =>
  new AppError(message, ErrorType.DATABASE, 500, true, details);

export const createInternalError = (message = 'Internal server error') =>
  new AppError(message, ErrorType.INTERNAL, 500, false);

// Error response formatter
export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId?: string;
  };
}

// Main error handler function
export function handleError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  console.error('Error occurred:', {
    error,
    requestId,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  });

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: error.type,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.VALIDATION,
          message: 'Validation failed',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          })),
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: 400 }
    );
  }

  // Handle Supabase/PostgreSQL errors
  if (isPostgrestError(error)) {
    const postgrestError = error as PostgrestError;
    const statusCode = getPostgrestErrorStatus(postgrestError);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.DATABASE,
          message: 'Database operation failed',
          details: {
            code: postgrestError.code,
            hint: postgrestError.hint,
            details: postgrestError.details
          },
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: statusCode }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.INTERNAL,
          message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        type: ErrorType.INTERNAL,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId
      }
    },
    { status: 500 }
  );
}

// Helper function to check if error is a Postgrest error
export function isPostgrestError(error: unknown): error is PostgrestError {
  return error !== null && typeof error === 'object' && 'code' in error && 'message' in error;
}

// Map Postgrest error codes to HTTP status codes
function getPostgrestErrorStatus(error: PostgrestError): number {
  switch (error.code) {
    case 'PGRST116': // Row not found
      return 404;
    case 'PGRST301': // Ambiguous
      return 409;
    case '23505': // Unique violation
      return 409;
    case '23503': // Foreign key violation
      return 400;
    case '23514': // Check violation
      return 400;
    case '42501': // Insufficient privilege
      return 403;
    default:
      return 500;
  }
}

// Success response helper
export function createSuccessResponse<T>(data: T, message?: string, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

// Async error wrapper for API routes
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      const requestId = Math.random().toString(36).substring(2, 15);
      return handleError(error, requestId);
    }
  };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  // Rate limiting window calculation
  const windowStart = Date.now() - windowMs;
  console.log('Rate limit window start:', windowStart);
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Input validation helper
export function validateRequired(data: Record<string, unknown>, requiredFields: string[]): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

// Phone number validation
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}