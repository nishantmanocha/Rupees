import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';
  let details: any = null;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = error.errorCode || 'APP_ERROR';
  }
  // Handle Mongoose validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    details = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }
  // Handle Mongoose duplicate key errors
  else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    errorCode = 'DUPLICATE_ERROR';
    const field = Object.keys((error as any).keyPattern)[0];
    details = { field, message: `${field} already exists` };
  }
  // Handle Mongoose cast errors (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorCode = 'INVALID_ID';
    details = { field: (error as any).path, value: (error as any).value };
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  // Handle Zod validation errors
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    details = (error as any).errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    logger.warn('Client Error:', {
      error: error.message,
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found:', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    error: 'ROUTE_NOT_FOUND'
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create operational error
 */
export const createOperationalError = (message: string, statusCode: number, errorCode?: string): AppError => {
  return new AppError(message, statusCode, errorCode, true);
};

/**
 * Create programming error
 */
export const createProgrammingError = (message: string, errorCode?: string): AppError => {
  return new AppError(message, 500, errorCode, false);
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });

  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });

  // Exit the process for uncaught exceptions
  process.exit(1);
};

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};