import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '@/config/logger';

/**
 * Middleware to validate request body, query, and params using Zod schemas
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request data
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Validation failed:', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      } else {
        logger.error('Validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  };
};

/**
 * Middleware to validate only request body
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = await schema.parseAsync(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Body validation failed:', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        res.status(400).json({
          success: false,
          message: 'Request body validation failed',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      } else {
        logger.error('Body validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  };
};

/**
 * Middleware to validate only request query parameters
 */
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = await schema.parseAsync(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Query validation failed:', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        res.status(400).json({
          success: false,
          message: 'Query parameters validation failed',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      } else {
        logger.error('Query validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  };
};

/**
 * Middleware to validate only request parameters
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedParams = await schema.parseAsync(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Params validation failed:', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });

        res.status(400).json({
          success: false,
          message: 'URL parameters validation failed',
          error: 'VALIDATION_ERROR',
          details: validationErrors
        });
      } else {
        logger.error('Params validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  };
};

/**
 * Middleware to validate file uploads
 */
export const validateFileUpload = (options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], required = false } = options;

    // Check if file exists
    if (!req.file && required) {
      res.status(400).json({
        success: false,
        message: 'File is required',
        error: 'FILE_REQUIRED'
      });
      return;
    }

    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`,
          error: 'FILE_TOO_LARGE'
        });
        return;
      }

      // Check file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          success: false,
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          error: 'INVALID_FILE_TYPE'
        });
        return;
      }
    }

    next();
  };
};

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0',
      error: 'INVALID_PAGE'
    });
    return;
  }

  if (limit < 1 || limit > 100) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      error: 'INVALID_LIMIT'
    });
    return;
  }

  // Add validated pagination to request
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};