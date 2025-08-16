import { z } from 'zod';

// Auth Validation Schemas
export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// User Profile Validation Schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50).optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50).optional(),
  income: z.number().positive('Income must be positive').optional(),
  currency: z.string().min(3, 'Currency must be at least 3 characters').max(3).optional()
});

// Income & Expenses Validation Schemas
export const updateIncomeSchema = z.object({
  income: z.number().positive('Income must be positive')
});

export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['Housing', 'EMI', 'Utilities', 'Groceries', 'Transport', 'Subscriptions', 'Other'])
});

export const updateExpenseSchema = createExpenseSchema.partial();

// Goals Validation Schemas
export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetDate: z.string().datetime().optional().or(z.literal('')),
  isPrimary: z.boolean().optional()
});

export const updateGoalSchema = createGoalSchema.partial();

// Compare Validation Schema
export const compareSchema = z.object({
  goalAmount: z.number().positive('Goal amount must be positive'),
  monthlyContribution: z.number().positive('Monthly contribution must be positive'),
  horizonMonths: z.number().int().positive('Horizon must be a positive integer').max(600),
  instrumentIds: z.array(z.string().min(1)).min(1, 'At least one instrument must be selected')
});

// Instrument Override Validation Schema
export const instrumentOverrideSchema = z.object({
  annualRate: z.number().min(0, 'Rate must be non-negative').max(1, 'Rate must be less than 100%')
});

// Settings Validation Schema
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  preferences: z.record(z.any()).optional()
});

// Admin Instrument Validation Schema
export const createInstrumentSchema = z.object({
  name: z.string().min(1, 'Instrument name is required').max(100),
  annualRate: z.number().min(0, 'Rate must be non-negative').max(1, 'Rate must be less than 100%'),
  compoundingPerYear: z.number().int().positive('Compounding frequency must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  isEnabled: z.boolean().optional()
});

export const updateInstrumentSchema = createInstrumentSchema.partial();

// Admin Learning Item Validation Schema
export const createLearningItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(1000),
  expandedContent: z.string().min(1, 'Expanded content is required'),
  type: z.enum(['qa', 'checklist']),
  category: z.enum([
    'Basics', 'Government Schemes', 'Investment Strategies', 'Gold Investments',
    'Fixed Income', 'Investment Principles', 'Portfolio Management', 'Mutual Funds',
    'Bank Products', 'Tax Planning'
  ]),
  isPublished: z.boolean().optional()
});

export const updateLearningItemSchema = createLearningItemSchema.partial();

// Pagination Validation Schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
});

// Query Validation Schemas
export const goalQuerySchema = z.object({
  isPrimary: z.string().optional().transform(val => val === 'true'),
  category: z.string().optional()
});

export const expenseQuerySchema = z.object({
  category: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional()
});

// Export all schemas
export const validationSchemas = {
  auth: {
    signup: signupSchema,
    login: loginSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema
  },
  user: {
    updateProfile: updateProfileSchema
  },
  finance: {
    updateIncome: updateIncomeSchema,
    createExpense: createExpenseSchema,
    updateExpense: updateExpenseSchema
  },
  goals: {
    create: createGoalSchema,
    update: updateGoalSchema,
    query: goalQuerySchema
  },
  compare: compareSchema,
  instruments: {
    override: instrumentOverrideSchema,
    create: createInstrumentSchema,
    update: updateInstrumentSchema
  },
  settings: updateSettingsSchema,
  learning: {
    create: createLearningItemSchema,
    update: updateLearningItemSchema
  },
  pagination: paginationSchema,
  expenses: {
    query: expenseQuerySchema
  }
};