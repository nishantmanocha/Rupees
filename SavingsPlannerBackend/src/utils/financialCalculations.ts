import { IInstrument, IUserInstrumentOverride } from '@/types';

/**
 * Calculate monthly surplus (income - total expenses)
 */
export const calculateMonthlySurplus = (income: number, totalExpenses: number): number => {
  return income - totalExpenses;
};

/**
 * Calculate saving-only projection
 */
export const calculateSavingProjection = (
  goalAmount: number,
  monthlySurplus: number
): {
  monthsToGoal: number;
  dailySaving: number;
  weeklySaving: number;
  monthlyData: number[];
} => {
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
  instrument: IInstrument,
  userOverride?: IUserInstrumentOverride,
  maxMonths: number = 600
): {
  instrumentId: string;
  instrumentName: string;
  monthsToGoal: number;
  finalValue: number;
  monthlyData: number[];
  gainVsSavingOnly: number;
} => {
  // Use user override rate if available, otherwise use default rate
  const annualRate = userOverride ? userOverride.annualRate : instrument.annualRate;
  const monthlyRate = annualRate / 12;
  const monthlyData: number[] = [];
  
  // Handle edge case where rate is 0
  if (monthlyRate === 0) {
    for (let month = 0; month <= maxMonths; month++) {
      monthlyData.push(monthlyContribution * month);
    }
    
    const monthsToGoal = Math.ceil(goalAmount / monthlyContribution);
    const finalValue = monthlyContribution * maxMonths;
    
    return {
      instrumentId: instrument._id.toString(),
      instrumentName: instrument.name,
      monthsToGoal: monthsToGoal > maxMonths ? Infinity : monthsToGoal,
      finalValue,
      monthlyData,
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
    instrumentId: instrument._id.toString(),
    instrumentName: instrument.name,
    monthsToGoal,
    finalValue,
    monthlyData,
    gainVsSavingOnly
  };
};

/**
 * Calculate projections for multiple instruments
 */
export const calculateAllProjections = (
  goalAmount: number,
  monthlyContribution: number,
  instruments: IInstrument[],
  userOverrides: IUserInstrumentOverride[] = [],
  maxMonths: number = 600
): Array<{
  instrumentId: string;
  instrumentName: string;
  monthsToGoal: number;
  finalValue: number;
  monthlyData: number[];
  gainVsSavingOnly: number;
}> => {
  return instruments
    .filter(instrument => instrument.isEnabled)
    .map(instrument => {
      const userOverride = userOverrides.find(override => 
        override.instrumentId.toString() === instrument._id.toString()
      );
      
      return calculateInvestmentProjection(
        goalAmount,
        monthlyContribution,
        instrument,
        userOverride,
        maxMonths
      );
    })
    .sort((a, b) => a.monthsToGoal - b.monthsToGoal);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatters: Record<string, Intl.NumberFormat> = {
    INR: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }),
    EUR: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }),
    GBP: new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  };

  const formatter = formatters[currency] || formatters.INR;
  return formatter.format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (rate: number): string => {
  return `${(rate * 100).toFixed(2)}%`;
};

/**
 * Calculate effective annual rate with compounding
 */
export const calculateEffectiveAnnualRate = (nominalRate: number, compoundingPerYear: number): number => {
  return Math.pow(1 + nominalRate / compoundingPerYear, compoundingPerYear) - 1;
};

/**
 * Calculate future value with regular contributions
 */
export const calculateFutureValue = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return principal + (monthlyContribution * months);
  }
  
  const futureValue = principal * Math.pow(1 + monthlyRate, months) +
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return futureValue;
};

/**
 * Calculate required monthly contribution to reach a goal
 */
export const calculateRequiredMonthlyContribution = (
  goalAmount: number,
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return (goalAmount - principal) / months;
  }
  
  const requiredContribution = (goalAmount - principal * Math.pow(1 + monthlyRate, months)) /
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.max(0, requiredContribution);
};

/**
 * Calculate time to reach goal with given monthly contribution
 */
export const calculateTimeToGoal = (
  goalAmount: number,
  principal: number,
  monthlyContribution: number,
  annualRate: number
): number => {
  const monthlyRate = annualRate / 12;
  
  if (monthlyRate === 0) {
    return (goalAmount - principal) / monthlyContribution;
  }
  
  // Using the formula: n = log((FV * r + PMT) / (PV * r + PMT)) / log(1 + r)
  const numerator = Math.log((goalAmount * monthlyRate + monthlyContribution) / (principal * monthlyRate + monthlyContribution));
  const denominator = Math.log(1 + monthlyRate);
  
  return numerator / denominator;
};