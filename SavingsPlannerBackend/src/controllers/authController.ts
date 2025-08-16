import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IRequestWithUser } from '@/types';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateTokens, refreshAccessToken } from '@/utils/jwt';
import emailService from '@/utils/emailService';
import { asyncHandler, createOperationalError } from '@/middleware/errorHandler';
import logger from '@/config/logger';
import env from '@/config/environment';

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * User signup
 * POST /api/v1/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createOperationalError('User with this email already exists', 409, 'USER_EXISTS');
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    income: 0,
    currency: 'INR',
    isAdmin: false,
    isEmailVerified: false
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokens(user);

  // Send welcome email (optional, don't fail if email fails)
  try {
    await emailService.sendWelcomeEmail(email, firstName);
  } catch (error) {
    logger.warn('Failed to send welcome email:', error);
  }

  logger.info(`New user registered: ${email} (${user._id})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        income: user.income,
        currency: user.currency,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified
      },
      tokens
    }
  });
});

/**
 * User login
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    throw createOperationalError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw createOperationalError('Please verify your email before logging in', 401, 'EMAIL_NOT_VERIFIED');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createOperationalError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Add refresh token to user's refresh tokens array
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  logger.info(`User logged in: ${email} (${user._id})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        income: user.income,
        currency: user.currency,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified
      },
      tokens
    }
  });
});

/**
 * User logout
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createOperationalError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  // Remove refresh token from user's refresh tokens array
  if (req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter(token => token !== refreshToken);
    await req.user.save();
  }

  logger.info(`User logged out: ${req.user?.email || 'unknown'} (${req.user?._id || 'unknown'})`);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createOperationalError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  try {
    // Generate new access token
    const newAccessToken = refreshAccessToken(refreshToken);
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    throw createOperationalError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
});

/**
 * Forgot password - send OTP
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, an OTP has been sent'
    });
    return;
  }

  // Generate OTP
  const otp = generateOTP();
  
  // Save OTP to database
  await OTP.createOTP(email, otp, 10); // 10 minutes expiry

  // Send OTP email
  const emailSent = await emailService.sendOTPEmail(email, otp, user.firstName);
  
  if (!emailSent) {
    throw createOperationalError('Failed to send OTP email', 500, 'EMAIL_SEND_FAILED');
  }

  logger.info(`Password reset OTP sent to: ${email}`);

  res.status(200).json({
    success: true,
    message: 'If an account with this email exists, an OTP has been sent'
  });
});

/**
 * Reset password using OTP
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  // Verify OTP
  const otpVerification = await OTP.verifyOTP(email, otp);
  if (!otpVerification.isValid) {
    throw createOperationalError(otpVerification.message, 400, 'INVALID_OTP');
  }

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw createOperationalError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Invalidate OTP
  await OTP.invalidateOTP(email);

  // Send confirmation email
  try {
    await emailService.sendPasswordResetConfirmation(email, user.firstName);
  } catch (error) {
    logger.warn('Failed to send password reset confirmation email:', error);
  }

  logger.info(`Password reset successful for: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        income: req.user.income,
        currency: req.user.currency,
        isAdmin: req.user.isAdmin,
        isEmailVerified: req.user.isEmailVerified
      }
    }
  });
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export const changePassword = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Verify current password
  const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createOperationalError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Update password
  req.user.password = newPassword;
  await req.user.save();

  // Remove all refresh tokens (force re-login)
  req.user.refreshTokens = [];
  await req.user.save();

  logger.info(`Password changed for user: ${req.user.email} (${req.user._id})`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again.'
  });
});

/**
 * Verify email (for future implementation)
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // This would typically involve sending a verification email with a link
  // For now, we'll just return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Email verification endpoint (to be implemented)'
  });
});