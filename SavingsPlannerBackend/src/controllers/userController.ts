import { Response } from 'express';
import { IRequestWithUser } from '@/types';
import User from '@/models/User';
import UserSettings from '@/models/UserSettings';
import { asyncHandler, createOperationalError } from '@/middleware/errorHandler';
import logger from '@/config/logger';

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
export const getProfile = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        income: req.user.income,
        currency: req.user.currency,
        isAdmin: req.user.isAdmin,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
});

/**
 * Update user profile
 * PATCH /api/v1/users/me
 */
export const updateProfile = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { firstName, lastName, income, currency } = req.body;

  // Update only provided fields
  if (firstName !== undefined) req.user.firstName = firstName;
  if (lastName !== undefined) req.user.lastName = lastName;
  if (income !== undefined) req.user.income = income;
  if (currency !== undefined) req.user.currency = currency;

  await req.user.save();

  logger.info(`Profile updated for user: ${req.user.email} (${req.user._id})`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        income: req.user.income,
        currency: req.user.currency,
        isAdmin: req.user.isAdmin,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
});

/**
 * Get user settings
 * GET /api/v1/users/settings
 */
export const getSettings = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Get or create user settings
  const settings = await UserSettings.getOrCreate(req.user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Settings retrieved successfully',
    data: {
      settings: {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        instrumentOverrides: settings.instrumentOverrides,
        preferences: settings.preferences,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    }
  });
});

/**
 * Update user settings
 * PATCH /api/v1/users/settings
 */
export const updateSettings = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { theme, preferences } = req.body;

  // Get or create user settings
  const settings = await UserSettings.getOrCreate(req.user._id.toString());

  // Update only provided fields
  if (theme !== undefined) settings.theme = theme;
  if (preferences !== undefined) {
    settings.preferences = { ...settings.preferences, ...preferences };
  }

  await settings.save();

  logger.info(`Settings updated for user: ${req.user.email} (${req.user._id})`);

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      settings: {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        instrumentOverrides: settings.instrumentOverrides,
        preferences: settings.preferences,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    }
  });
});

/**
 * Get user financial summary
 * GET /api/v1/users/financial-summary
 */
export const getFinancialSummary = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Import Expense model dynamically to avoid circular dependency
  const { Expense } = await import('@/models');

  // Get total expenses
  const totalExpenses = await Expense.getTotalByUser(req.user._id.toString());
  const monthlySurplus = req.user.income - totalExpenses;

  // Get expense breakdown by category
  const expenseBreakdown = await Expense.getExpenseBreakdown(req.user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Financial summary retrieved successfully',
    data: {
      financialSummary: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        expenseBreakdown,
        currency: req.user.currency
      }
    }
  });
});

/**
 * Delete user account
 * DELETE /api/v1/users/me
 */
export const deleteAccount = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { password } = req.body;

  if (!password) {
    throw createOperationalError('Password is required to delete account', 400, 'PASSWORD_REQUIRED');
  }

  // Verify password
  const isPasswordValid = await req.user.comparePassword(password);
  if (!isPasswordValid) {
    throw createOperationalError('Invalid password', 400, 'INVALID_PASSWORD');
  }

  const userId = req.user._id.toString();
  const userEmail = req.user.email;

  // Delete user and related data
  // Note: In a production environment, you might want to soft delete or archive data
  await Promise.all([
    User.findByIdAndDelete(userId),
    UserSettings.findOneAndDelete({ userId }),
    // Add other model deletions here as needed
  ]);

  logger.info(`Account deleted for user: ${userEmail} (${userId})`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Get user statistics
 * GET /api/v1/users/stats
 */
export const getUserStats = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Import models dynamically to avoid circular dependency
  const { Expense, Goal, UserInstrumentOverride } = await import('@/models');

  // Get various statistics
  const [
    totalExpenses,
    expenseCount,
    goalCount,
    primaryGoal,
    instrumentOverridesCount
  ] = await Promise.all([
    Expense.getTotalByUser(req.user._id.toString()),
    Expense.countDocuments({ userId: req.user._id }),
    Goal.countDocuments({ userId: req.user._id }),
    Goal.getPrimaryGoal(req.user._id.toString()),
    UserInstrumentOverride.countDocuments({ userId: req.user._id })
  ]);

  const monthlySurplus = req.user.income - totalExpenses;
  const savingsRate = req.user.income > 0 ? (monthlySurplus / req.user.income) * 100 : 0;

  res.status(200).json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      stats: {
        accountAge: Math.floor((Date.now() - req.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // days
        totalExpenses,
        expenseCount,
        goalCount,
        hasPrimaryGoal: !!primaryGoal,
        instrumentOverridesCount,
        monthlySurplus,
        savingsRate: Math.round(savingsRate * 100) / 100, // Round to 2 decimal places
        currency: req.user.currency
      }
    }
  });
});

/**
 * Export user data
 * GET /api/v1/users/export
 */
export const exportUserData = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Import models dynamically to avoid circular dependency
  const { Expense, Goal, UserSettings, UserInstrumentOverride } = await import('@/models');

  const userId = req.user._id.toString();

  // Get all user data
  const [
    expenses,
    goals,
    settings,
    instrumentOverrides
  ] = await Promise.all([
    Expense.find({ userId }),
    Goal.find({ userId }),
    UserSettings.findOne({ userId }),
    UserInstrumentOverride.getByUser(userId)
  ]);

  const exportData = {
    user: {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      income: req.user.income,
      currency: req.user.currency,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    },
    expenses,
    goals,
    settings,
    instrumentOverrides,
    exportDate: new Date(),
    version: '1.0'
  };

  logger.info(`Data exported for user: ${req.user.email} (${req.user._id})`);

  res.status(200).json({
    success: true,
    message: 'Data exported successfully',
    data: exportData
  });
});