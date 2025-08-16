import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { IRequestWithUser } from '@/types';
import User from '@/models/User';
import logger from '@/config/logger';

/**
 * Middleware to authenticate user using JWT access token
 */
export const authenticate = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format',
        error: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Check if user is still active
    if (!user.isEmailVerified) {
      res.status(401).json({
        success: false,
        message: 'Email not verified',
        error: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    
    logger.info(`User authenticated: ${user.email} (${user._id})`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof Error && error.message === 'Invalid access token') {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        error: 'INVALID_TOKEN'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: 'AUTH_ERROR'
      });
    }
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'AUTH_REQUIRED'
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
      error: 'ADMIN_REQUIRED'
    });
    return;
  }

  logger.info(`Admin access granted: ${req.user.email} (${req.user._id})`);
  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }

    // Try to verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isEmailVerified) {
      req.user = user;
      logger.info(`Optional auth successful: ${user.email} (${user._id})`);
    }
    
    next();
  } catch (error) {
    // Token verification failed, but continue without authentication
    logger.debug('Optional auth failed, continuing without user:', error);
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceField: string = 'userId') => {
  return (
    req: IRequestWithUser,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTH_REQUIRED'
      });
      return;
    }

    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        message: 'Resource user ID not found',
        error: 'MISSING_RESOURCE_ID'
      });
      return;
    }

    if (resourceUserId !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this resource',
        error: 'ACCESS_DENIED'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user can access resource (owner or admin)
 */
export const requireAccess = (resourceField: string = 'userId') => {
  return (
    req: IRequestWithUser,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTH_REQUIRED'
      });
      return;
    }

    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        message: 'Resource user ID not found',
        error: 'MISSING_RESOURCE_ID'
      });
      return;
    }

    // Allow access if user is admin or owns the resource
    if (req.user.isAdmin || resourceUserId === req.user._id.toString()) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Access denied to this resource',
      error: 'ACCESS_DENIED'
    });
  };
};