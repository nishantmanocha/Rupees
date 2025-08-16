import { Request, Response } from 'express';
import { IRequestWithUser } from '@/types';
import User from '@/models/User';
import Expense from '@/models/Expense';
import { asyncHandler, createOperationalError } from '@/middleware/errorHandler';
import { generateFinancialTips } from '@/utils/tipsEngine';
import logger from '@/config/logger';

/**
 * Get financial overview (income, expenses, surplus)
 * GET /api/v1/finance
 */
export const getFinancialOverview = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const userId = req.user._id.toString();

  // Get total expenses and breakdown
  const [totalExpenses, expenseBreakdown, expenses] = await Promise.all([
    Expense.getTotalByUser(userId),
    Expense.getExpenseBreakdown(userId),
    Expense.find({ userId }).sort({ createdAt: -1 })
  ]);

  const monthlySurplus = req.user.income - totalExpenses;

  // Generate financial tips
  const tips = generateFinancialTips(req.user.income, expenses, monthlySurplus);

  res.status(200).json({
    success: true,
    message: 'Financial overview retrieved successfully',
    data: {
      finance: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        expenseBreakdown,
        currency: req.user.currency
      },
      expenses,
      tips
    }
  });
});

/**
 * Update monthly income
 * PATCH /api/v1/finance/income
 */
export const updateIncome = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { income } = req.body;

  if (income === undefined || income < 0) {
    throw createOperationalError('Valid income amount is required', 400, 'INVALID_INCOME');
  }

  // Update user income
  req.user.income = income;
  await req.user.save();

  logger.info(`Income updated for user: ${req.user.email} (${req.user._id}) - New income: ${income}`);

  res.status(200).json({
    success: true,
    message: 'Income updated successfully',
    data: {
      income: req.user.income,
      currency: req.user.currency
    }
  });
});

/**
 * Get all expenses
 * GET /api/v1/finance/expenses
 */
export const getExpenses = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const userId = req.user._id.toString();
  const { category, minAmount, maxAmount, page = 1, limit = 10 } = req.query;

  // Build filter
  const filter: any = { userId };
  if (category) filter.category = category;
  if (minAmount !== undefined) filter.amount = { $gte: parseFloat(minAmount as string) };
  if (maxAmount !== undefined) {
    if (filter.amount) {
      filter.amount.$lte = parseFloat(maxAmount as string);
    } else {
      filter.amount = { $lte: parseFloat(maxAmount as string) };
    }
  }

  // Calculate pagination
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const total = await Expense.countDocuments(filter);

  // Get expenses with pagination
  const expenses = await Expense.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string));

  // Get total expenses for surplus calculation
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = req.user.income - totalExpenses;

  res.status(200).json({
    success: true,
    message: 'Expenses retrieved successfully',
    data: {
      expenses,
      monthlySurplus,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    }
  });
});

/**
 * Create new expense
 * POST /api/v1/finance/expenses
 */
export const createExpense = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { name, amount, category } = req.body;
  const userId = req.user._id.toString();

  // Create new expense
  const expense = new Expense({
    userId,
    name,
    amount,
    category
  });

  await expense.save();

  // Get updated financial summary
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = req.user.income - totalExpenses;

  logger.info(`Expense created for user: ${req.user.email} (${req.user._id}) - ${name}: ${amount}`);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: {
      expense: {
        id: expense._id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt
      },
      financialSummary: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        currency: req.user.currency
      }
    }
  });
});

/**
 * Update expense
 * PATCH /api/v1/finance/expenses/:id
 */
export const updateExpense = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;
  const { name, amount, category } = req.body;
  const userId = req.user._id.toString();

  // Find and update expense
  const expense = await Expense.findOneAndUpdate(
    { _id: id, userId },
    { name, amount, category },
    { new: true, runValidators: true }
  );

  if (!expense) {
    throw createOperationalError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
  }

  // Get updated financial summary
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = req.user.income - totalExpenses;

  logger.info(`Expense updated for user: ${req.user.email} (${req.user._id}) - ${expense.name}: ${expense.amount}`);

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: {
      expense: {
        id: expense._id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt
      },
      financialSummary: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        currency: req.user.currency
      }
    }
  });
});

/**
 * Delete expense
 * DELETE /api/v1/finance/expenses/:id
 */
export const deleteExpense = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;
  const userId = req.user._id.toString();

  // Find and delete expense
  const expense = await Expense.findOneAndDelete({ _id: id, userId });

  if (!expense) {
    throw createOperationalError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
  }

  // Get updated financial summary
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = req.user.income - totalExpenses;

  logger.info(`Expense deleted for user: ${req.user.email} (${req.user._id}) - ${expense.name}: ${expense.amount}`);

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
    data: {
      financialSummary: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        currency: req.user.currency
      }
    }
  });
});

/**
 * Get expense statistics
 * GET /api/v1/finance/expenses/stats
 */
export const getExpenseStats = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const userId = req.user._id.toString();

  // Get expense statistics
  const [
    totalExpenses,
    expenseCount,
    categoryBreakdown,
    monthlyExpenses
  ] = await Promise.all([
    Expense.getTotalByUser(userId),
    Expense.countDocuments({ userId }),
    Expense.getByCategoryForUser(userId),
    Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 } // Last 12 months
    ])
  ]);

  const monthlySurplus = req.user.income - totalExpenses;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  res.status(200).json({
    success: true,
    message: 'Expense statistics retrieved successfully',
    data: {
      stats: {
        totalExpenses,
        expenseCount,
        averageExpense: Math.round(averageExpense * 100) / 100,
        monthlySurplus,
        categoryBreakdown,
        monthlyExpenses,
        currency: req.user.currency
      }
    }
  });
});

/**
 * Get expense categories
 * GET /api/v1/finance/expenses/categories
 */
export const getExpenseCategories = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const categories = [
    'Housing',
    'EMI',
    'Utilities',
    'Groceries',
    'Transport',
    'Subscriptions',
    'Other'
  ];

  res.status(200).json({
    success: true,
    message: 'Expense categories retrieved successfully',
    data: {
      categories
    }
  });
});

/**
 * Bulk import expenses
 * POST /api/v1/finance/expenses/bulk
 */
export const bulkImportExpenses = asyncHandler(async (req: IRequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    throw createOperationalError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { expenses } = req.body;
  const userId = req.user._id.toString();

  if (!Array.isArray(expenses) || expenses.length === 0) {
    throw createOperationalError('Valid expenses array is required', 400, 'INVALID_EXPENSES');
  }

  // Validate and create expenses
  const createdExpenses = [];
  const errors = [];

  for (let i = 0; i < expenses.length; i++) {
    const expenseData = expenses[i];
    
    try {
      const expense = new Expense({
        userId,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category
      });

      await expense.save();
      createdExpenses.push(expense);
    } catch (error) {
      errors.push({
        index: i,
        data: expenseData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get updated financial summary
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = req.user.income - totalExpenses;

  logger.info(`Bulk expenses imported for user: ${req.user.email} (${req.user._id}) - ${createdExpenses.length} created, ${errors.length} failed`);

  res.status(200).json({
    success: true,
    message: 'Bulk import completed',
    data: {
      created: createdExpenses.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      financialSummary: {
        income: req.user.income,
        totalExpenses,
        monthlySurplus,
        currency: req.user.currency
      }
    }
  });
});