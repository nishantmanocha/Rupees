import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import env from '@/config/environment';
import logger from '@/config/logger';

// Rate limiter configuration
const rateLimiterConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
};

// Create rate limiter instances
const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: rateLimiterConfig.maxRequests,
  duration: rateLimiterConfig.windowMs / 1000, // Convert to seconds
  blockDuration: 60 * 15, // Block for 15 minutes if limit exceeded
});

const authLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 5, // 5 attempts per window
  duration: rateLimiterConfig.windowMs / 1000,
  blockDuration: 60 * 30, // Block for 30 minutes if limit exceeded
});

const strictLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 10, // 10 attempts per window
  duration: 60, // 1 minute window
  blockDuration: 60 * 10, // Block for 10 minutes if limit exceeded
});

/**
 * General rate limiter for all routes
 */
export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await generalLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      message: rateLimiterConfig.message,
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await strictLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    logger.warn('Strict rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please wait before trying again.',
      error: 'STRICT_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * Authentication rate limiter for login/signup attempts
 */
export const authRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait before trying again.',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * OTP rate limiter for password reset attempts
 */
export const otpRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 3, // 3 OTP requests per window
  duration: 60 * 10, // 10 minutes
  blockDuration: 60 * 30, // Block for 30 minutes if limit exceeded
});

export const otpRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await otpRateLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    logger.warn('OTP rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Please wait before requesting another OTP.',
      error: 'OTP_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * Get rate limit info for a specific IP
 */
export const getRateLimitInfo = async (ip: string) => {
  try {
    const [generalInfo, authInfo, strictInfo, otpInfo] = await Promise.all([
      generalLimiter.get(ip),
      authLimiter.get(ip),
      strictLimiter.get(ip),
      otpRateLimiter.get(ip)
    ]);

    return {
      general: {
        remaining: generalInfo.remainingPoints,
        resetTime: new Date(Date.now() + generalInfo.msBeforeNext)
      },
      auth: {
        remaining: authInfo.remainingPoints,
        resetTime: new Date(Date.now() + authInfo.msBeforeNext)
      },
      strict: {
        remaining: strictInfo.remainingPoints,
        resetTime: new Date(Date.now() + strictInfo.msBeforeNext)
      },
      otp: {
        remaining: otpInfo.remainingPoints,
        resetTime: new Date(Date.now() + otpInfo.msBeforeNext)
      }
    };
  } catch (error) {
    logger.error('Error getting rate limit info:', error);
    return null;
  }
};

/**
 * Reset rate limit for a specific IP (admin function)
 */
export const resetRateLimit = async (ip: string): Promise<boolean> => {
  try {
    await Promise.all([
      generalLimiter.delete(ip),
      authLimiter.delete(ip),
      strictLimiter.delete(ip),
      otpRateLimiter.delete(ip)
    ]);

    logger.info(`Rate limit reset for IP: ${ip}`);
    return true;
  } catch (error) {
    logger.error('Error resetting rate limit:', error);
    return false;
  }
};