import { Expense, Goal, InstrumentConfig, SavingProjection, InvestmentProjection } from '../types';

/**
 * Calculate monthly surplus (income - total expenses)
 */
export const calculateMonthlySurplus = (income: number, expenses: Expense[]): number => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return income - totalExpenses;
};

/**
 * Calculate saving-only projection
 */
export const calculateSavingProjection = (
  goalAmount: number,
  monthlySurplus: number
): SavingProjection => {
  if (monthlySurplus <= 0) {
    return {
      monthsToGoal: Infinity,
      dailySaving: 0,
      weeklySaving: 0,
      monthlyData: []
    };
  }

  const monthsToGoal = Math.ceil(goalAmount / monthlySurplus);
  const dailySaving = monthlySurplus / 30;
  const weeklySaving = monthlySurplus / 4;

  // Generate monthly data for charting (max 600 months = 50 years)
  const maxMonths = Math.min(monthsToGoal, 600);
  const monthlyData: number[] = [];
  
  for (let month = 0; month <= maxMonths; month++) {
    monthlyData.push(monthlySurplus * month);
  }

  return {
    monthsToGoal,
    dailySaving,
    weeklySaving,
    monthlyData
  };
};

/**
 * Calculate investment projection using SIP formula
 * FV = contribution * [((1 + r)^n - 1) / r] * (1 + r)
 * where r = monthly rate, n = number of months
 */
export const calculateInvestmentProjection = (
  goalAmount: number,
  monthlyContribution: number,
  instrument: InstrumentConfig,
  maxMonths: number = 600
): InvestmentProjection => {
  const monthlyRate = instrument.annualRate / 12;
  const monthlyData: number[] = [];
  
  // Handle edge case where rate is 0
  if (monthlyRate === 0) {
    for (let month = 0; month <= maxMonths; month++) {
      monthlyData.push(monthlyContribution * month);
    }
    
    const monthsToGoal = Math.ceil(goalAmount / monthlyContribution);
    const finalValue = monthlyContribution * maxMonths;
    
    return {
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      monthlyData,
      finalValue,
      monthsToGoal: monthsToGoal > maxMonths ? Infinity : monthsToGoal,
      gainVsSavingOnly: 0
    };
  }

  // Calculate monthly balances using SIP formula
  for (let month = 0; month <= maxMonths; month++) {
    if (month === 0) {
      monthlyData.push(0);
    } else {
      const fv = monthlyContribution * 
        ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) * 
        (1 + monthlyRate);
      monthlyData.push(fv);
    }
  }

  // Find months to goal
  let monthsToGoal = Infinity;
  for (let month = 1; month <= maxMonths; month++) {
    if (monthlyData[month] >= goalAmount) {
      monthsToGoal = month;
      break;
    }
  }

  const finalValue = monthlyData[maxMonths];
  const savingOnlyValue = monthlyContribution * maxMonths;
  const gainVsSavingOnly = finalValue - savingOnlyValue;

  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    monthlyData,
    finalValue,
    monthsToGoal,
    gainVsSavingOnly
  };
};

/**
 * Calculate projections for multiple instruments
 */
export const calculateAllProjections = (
  goalAmount: number,
  monthlyContribution: number,
  instruments: InstrumentConfig[],
  maxMonths: number = 600
): InvestmentProjection[] => {
  return instruments
    .filter(instrument => instrument.enabled)
    .map(instrument => 
      calculateInvestmentProjection(goalAmount, monthlyContribution, instrument, maxMonths)
    )
    .sort((a, b) => a.monthsToGoal - b.monthsToGoal);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

/**
 * Get improvement tips based on surplus
 */
export const getImprovementTips = (monthlySurplus: number, expenses: Expense[]): string[] => {
  const tips: string[] = [];
  
  if (monthlySurplus <= 0) {
    tips.push("Your expenses exceed your income. Consider reducing non-essential expenses.");
    tips.push("Review subscription services and cancel unused ones.");
    tips.push("Look for ways to increase your income through side hustles or skill development.");
  } else if (monthlySurplus < 10000) {
    tips.push("Try to save at least 20% of your income for better financial security.");
    tips.push("Consider creating an emergency fund before investing.");
    tips.push("Review your expenses to identify areas for optimization.");
  } else if (monthlySurplus < 25000) {
    tips.push("Great! You're saving well. Consider diversifying your investments.");
    tips.push("Set up automatic transfers to make saving effortless.");
    tips.push("Review your investment portfolio quarterly.");
  } else {
    tips.push("Excellent savings rate! Consider consulting a financial advisor for tax optimization.");
    tips.push("Look into tax-saving investment options like ELSS funds.");
    tips.push("Consider increasing your investment allocation for better returns.");
  }

  // Add expense-specific tips
  const highExpenseCategories = expenses
    .filter(expense => expense.amount > monthlySurplus * 0.3)
    .map(expense => expense.category);

  if (highExpenseCategories.includes('Housing') && highExpenseCategories.includes('EMI')) {
    tips.push("Housing costs are high. Consider refinancing or moving to a more affordable area.");
  }

  return tips;
};