import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  income: number;
  currency: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  income: number;
  currency: string;
}

// Auth Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Expense Types
export interface IExpense extends Document {
  userId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory = 
  | 'Housing' 
  | 'EMI' 
  | 'Utilities' 
  | 'Groceries' 
  | 'Transport' 
  | 'Subscriptions' 
  | 'Other';

// Goal Types
export interface IGoal extends Document {
  userId: string;
  title: string;
  targetAmount: number;
  targetDate?: Date;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoalWithProjections extends IGoal {
  savingProjection: ISavingProjection;
  investingProjections: IInvestingProjection[];
}

export interface ISavingProjection {
  monthsToGoal: number;
  dailySaving: number;
  weeklySaving: number;
  monthlyData: number[];
}

export interface IInvestingProjection {
  instrumentId: string;
  instrumentName: string;
  monthsToGoal: number;
  finalValue: number;
  monthlyData: number[];
  gainVsSavingOnly: number;
}

// Instrument Types
export interface IInstrument extends Document {
  name: string;
  annualRate: number;
  compoundingPerYear: number;
  description: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInstrumentOverride extends Document {
  userId: string;
  instrumentId: string;
  annualRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// Compare Types
export interface ICompareRequest {
  goalAmount: number;
  monthlyContribution: number;
  horizonMonths: number;
  instrumentIds: string[];
}

export interface ICompareResponse {
  lineChart: ILineChartData[];
  barChart: IBarChartData[];
  best: IBestInstrument;
}

export interface ILineChartData {
  instrument: string;
  data: number[];
}

export interface IBarChartData {
  instrument: string;
  finalValue: number;
}

export interface IBestInstrument {
  instrument: string;
  finalValue: number;
  gainVsSavingOnly: number;
}

// Tips Types
export interface IFinancialTip {
  id: string;
  title: string;
  description: string;
  category: TipCategory;
  priority: 'high' | 'medium' | 'low';
}

export type TipCategory = 
  | 'expense_optimization' 
  | 'income_increase' 
  | 'savings_strategy' 
  | 'investment_advice';

// Learn Types
export interface ILearningItem extends Document {
  title: string;
  content: string;
  expandedContent: string;
  type: 'qa' | 'checklist';
  category: LearningCategory;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LearningCategory = 
  | 'Basics' 
  | 'Government Schemes' 
  | 'Investment Strategies' 
  | 'Gold Investments' 
  | 'Fixed Income' 
  | 'Investment Principles' 
  | 'Portfolio Management' 
  | 'Mutual Funds' 
  | 'Bank Products' 
  | 'Tax Planning';

// Settings Types
export interface IUserSettings extends Document {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  instrumentOverrides: IUserInstrumentOverride[];
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Backup Types
export interface IBackupData {
  user: IUserProfile;
  income: number;
  expenses: IExpense[];
  goals: IGoal[];
  settings: IUserSettings;
  timestamp: Date;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request with User
export interface IRequestWithUser extends Request {
  user?: IUser;
}

// Email Types
export interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IOTP {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// Financial Calculation Types
export interface IFinancialSummary {
  income: number;
  totalExpenses: number;
  surplus: number;
  expenseBreakdown: Record<ExpenseCategory, number>;
}

// Rate Limiting Types
export interface IRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// Logging Types
export interface ILogEntry {
  level: string;
  message: string;
  timestamp: Date;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: Error;
}