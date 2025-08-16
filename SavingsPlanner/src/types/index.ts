export type Expense = {
  id: string;
  name: string; // Rent, EMI, etc.
  amount: number; // per month
  category?: 'Housing'|'EMI'|'Utilities'|'Groceries'|'Transport'|'Subscriptions'|'Other';
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  targetDate?: string; // ISO
  createdAt: string;
};

export type InstrumentConfig = {
  id: string;
  name: string;           // "PPF", "Nifty Index", etc.
  annualRate: number;     // 0.071 for 7.1%
  compoundingPerYear: number; // default 12
  enabled: boolean;
  description?: string;
};

export type AppState = {
  income: number;
  expenses: Expense[];
  goals: Goal[];
  instruments: InstrumentConfig[];
  theme: 'light' | 'dark' | 'system';
  primaryGoalId?: string;
  hasCompletedOnboarding: boolean;
};

export type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
};

export type InvestmentProjection = {
  instrumentId: string;
  instrumentName: string;
  monthlyData: number[];
  finalValue: number;
  monthsToGoal: number;
  gainVsSavingOnly: number;
};

export type SavingProjection = {
  monthsToGoal: number;
  dailySaving: number;
  weeklySaving: number;
  monthlyData: number[];
};

export type OnboardingStep = 'intro' | 'income' | 'expenses' | 'complete';