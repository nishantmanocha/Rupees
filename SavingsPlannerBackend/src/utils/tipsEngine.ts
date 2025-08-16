import { ExpenseCategory, IFinancialTip, TipCategory } from '@/types';

/**
 * Generate financial improvement tips based on user's financial data
 */
export const generateFinancialTips = (
  monthlyIncome: number,
  expenses: Array<{ category: ExpenseCategory; amount: number }>,
  monthlySurplus: number
): IFinancialTip[] => {
  const tips: IFinancialTip[] = [];
  
  // Calculate expense breakdown
  const expenseBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  
  const totalExpenses = Object.values(expenseBreakdown).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate percentages
  const expensePercentages = Object.entries(expenseBreakdown).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    amount,
    percentage: (amount / monthlyIncome) * 100
  }));
  
  // Sort by percentage (highest first)
  expensePercentages.sort((a, b) => b.percentage - a.percentage);
  
  // Tip 1: High housing costs (>30% of income)
  const housingExpense = expenseBreakdown.Housing || 0;
  const housingPercentage = (housingExpense / monthlyIncome) * 100;
  if (housingPercentage > 30) {
    tips.push({
      id: 'housing_high',
      title: 'Consider Housing Cost Optimization',
      description: `Your housing costs (${housingPercentage.toFixed(1)}% of income) are above the recommended 30%. Consider negotiating rent, finding roommates, or exploring more affordable areas.`,
      category: 'expense_optimization',
      priority: 'high'
    });
  }
  
  // Tip 2: High EMI costs (>40% of income)
  const emiExpense = expenseBreakdown.EMI || 0;
  const emiPercentage = (emiExpense / monthlyIncome) * 100;
  if (emiPercentage > 40) {
    tips.push({
      id: 'emi_high',
      title: 'EMI Burden Too High',
      description: `Your EMI payments (${emiPercentage.toFixed(1)}% of income) exceed the recommended 40%. Consider refinancing, extending loan terms, or consolidating debts.`,
      category: 'expense_optimization',
      priority: 'high'
    });
  }
  
  // Tip 3: High subscription costs (>10% of income)
  const subscriptionExpense = expenseBreakdown.Subscriptions || 0;
  const subscriptionPercentage = (subscriptionExpense / monthlyIncome) * 100;
  if (subscriptionPercentage > 10) {
    tips.push({
      id: 'subscriptions_high',
      title: 'Review Subscriptions',
      description: `Your subscriptions (${subscriptionPercentage.toFixed(1)}% of income) are above the recommended 10%. Review and cancel unused services to save money.`,
      category: 'expense_optimization',
      priority: 'medium'
    });
  }
  
  // Tip 4: High grocery costs (>25% of income)
  const groceryExpense = expenseBreakdown.Groceries || 0;
  const groceryPercentage = (groceryExpense / monthlyIncome) * 100;
  if (groceryPercentage > 25) {
    tips.push({
      id: 'groceries_high',
      title: 'Optimize Grocery Spending',
      description: `Your grocery costs (${groceryPercentage.toFixed(1)}% of income) are above the recommended 25%. Plan meals, use coupons, and buy in bulk to reduce costs.`,
      category: 'expense_optimization',
      priority: 'medium'
    });
  }
  
  // Tip 5: Low surplus (<10% of income)
  const surplusPercentage = (monthlySurplus / monthlyIncome) * 100;
  if (surplusPercentage < 10) {
    tips.push({
      id: 'surplus_low',
      title: 'Increase Monthly Savings',
      description: `Your monthly surplus (${surplusPercentage.toFixed(1)}% of income) is below the recommended 10%. Focus on reducing expenses or increasing income.`,
      category: 'savings_strategy',
      priority: 'high'
    });
  }
  
  // Tip 6: High transport costs (>15% of income)
  const transportExpense = expenseBreakdown.Transport || 0;
  const transportPercentage = (transportExpense / monthlyIncome) * 100;
  if (transportPercentage > 15) {
    tips.push({
      id: 'transport_high',
      title: 'Optimize Transportation',
      description: `Your transport costs (${transportPercentage.toFixed(1)}% of income) are above the recommended 15%. Consider carpooling, public transport, or fuel-efficient vehicles.`,
      category: 'expense_optimization',
      priority: 'medium'
    });
  }
  
  // Tip 7: High utility costs (>12% of income)
  const utilityExpense = expenseBreakdown.Utilities || 0;
  const utilityPercentage = (utilityExpense / monthlyIncome) * 100;
  if (utilityPercentage > 12) {
    tips.push({
      id: 'utilities_high',
      title: 'Reduce Utility Bills',
      description: `Your utility costs (${utilityPercentage.toFixed(1)}% of income) are above the recommended 12%. Implement energy-saving measures and compare providers.`,
      category: 'expense_optimization',
      priority: 'medium'
    });
  }
  
  // Tip 8: Good surplus (>20% of income) - positive reinforcement
  if (surplusPercentage > 20) {
    tips.push({
      id: 'surplus_excellent',
      title: 'Excellent Savings Rate!',
      description: `Your monthly surplus (${surplusPercentage.toFixed(1)}% of income) is excellent! Consider investing your surplus for better returns.`,
      category: 'investment_advice',
      priority: 'low'
    });
  }
  
  // Tip 9: Balanced expenses - positive reinforcement
  const hasBalancedExpenses = expensePercentages.every(exp => exp.percentage <= 30);
  if (hasBalancedExpenses && tips.length < 3) {
    tips.push({
      id: 'expenses_balanced',
      title: 'Well-Balanced Expenses',
      description: 'Your expenses are well-distributed across categories. Focus on maintaining this balance while increasing your savings.',
      category: 'savings_strategy',
      priority: 'low'
    });
  }
  
  // Tip 10: Emergency fund recommendation
  if (monthlySurplus > 0 && tips.length < 5) {
    tips.push({
      id: 'emergency_fund',
      title: 'Build Emergency Fund',
      description: `With a monthly surplus of ${formatCurrency(monthlySurplus)}, aim to build an emergency fund of 3-6 months of expenses.`,
      category: 'savings_strategy',
      priority: 'medium'
    });
  }
  
  // Sort tips by priority (high, medium, low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  tips.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  // Return top 5 tips
  return tips.slice(0, 5);
};

/**
 * Generate specific tips based on expense category
 */
export const generateCategorySpecificTips = (
  category: ExpenseCategory,
  amount: number,
  monthlyIncome: number
): IFinancialTip[] => {
  const tips: IFinancialTip[] = [];
  const percentage = (amount / monthlyIncome) * 100;
  
  switch (category) {
    case 'Housing':
      if (percentage > 30) {
        tips.push({
          id: 'housing_negotiate',
          title: 'Negotiate Rent',
          description: 'Research market rates and negotiate with your landlord for better terms.',
          category: 'expense_optimization',
          priority: 'high'
        });
        tips.push({
          id: 'housing_roommate',
          title: 'Consider Roommates',
          description: 'Sharing housing costs can significantly reduce your monthly expenses.',
          category: 'expense_optimization',
          priority: 'medium'
        });
      }
      break;
      
    case 'EMI':
      if (percentage > 40) {
        tips.push({
          id: 'emi_refinance',
          title: 'Refinance Loans',
          description: 'Explore refinancing options to get better interest rates and lower monthly payments.',
          category: 'expense_optimization',
          priority: 'high'
        });
        tips.push({
          id: 'emi_consolidate',
          title: 'Debt Consolidation',
          description: 'Consider consolidating multiple loans into one with a lower interest rate.',
          category: 'expense_optimization',
          priority: 'medium'
        });
      }
      break;
      
    case 'Subscriptions':
      if (percentage > 10) {
        tips.push({
          id: 'subscriptions_review',
          title: 'Audit Subscriptions',
          description: 'List all subscriptions and cancel those you rarely use.',
          category: 'expense_optimization',
          priority: 'medium'
        });
        tips.push({
          id: 'subscriptions_annual',
          title: 'Annual Plans',
          description: 'Switch to annual plans where possible to save 10-20% on subscription costs.',
          category: 'expense_optimization',
          priority: 'low'
        });
      }
      break;
      
    case 'Groceries':
      if (percentage > 25) {
        tips.push({
          id: 'groceries_plan',
          title: 'Meal Planning',
          description: 'Plan meals weekly to avoid impulse purchases and reduce food waste.',
          category: 'expense_optimization',
          priority: 'medium'
        });
        tips.push({
          id: 'groceries_bulk',
          title: 'Buy in Bulk',
          description: 'Purchase non-perishable items in bulk to save money in the long run.',
          category: 'expense_optimization',
          priority: 'low'
        });
      }
      break;
      
    case 'Transport':
      if (percentage > 15) {
        tips.push({
          id: 'transport_carpool',
          title: 'Carpooling',
          description: 'Share rides with colleagues or neighbors to split fuel costs.',
          category: 'expense_optimization',
          priority: 'medium'
        });
        tips.push({
          id: 'transport_public',
          title: 'Public Transport',
          description: 'Use public transportation where available to reduce fuel and parking costs.',
          category: 'expense_optimization',
          priority: 'low'
        });
      }
      break;
      
    case 'Utilities':
      if (percentage > 12) {
        tips.push({
          id: 'utilities_energy',
          title: 'Energy Efficiency',
          description: 'Switch to LED bulbs and energy-efficient appliances to reduce electricity bills.',
          category: 'expense_optimization',
          priority: 'medium'
        });
        tips.push({
          id: 'utilities_providers',
          title: 'Compare Providers',
          description: 'Regularly compare utility providers to ensure you\'re getting the best rates.',
          category: 'expense_optimization',
          priority: 'low'
        });
      }
      break;
  }
  
  return tips;
};

/**
 * Format currency for display
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get tips by category
 */
export const getTipsByCategory = (category: TipCategory): IFinancialTip[] => {
  const categoryTips: Record<TipCategory, IFinancialTip[]> = {
    expense_optimization: [
      {
        id: 'general_expense_tracking',
        title: 'Track All Expenses',
        description: 'Use a budgeting app to track every expense and identify spending patterns.',
        category: 'expense_optimization',
        priority: 'medium'
      },
      {
        id: '50_30_20_rule',
        title: 'Follow 50/30/20 Rule',
        description: 'Allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.',
        category: 'expense_optimization',
        priority: 'medium'
      }
    ],
    income_increase: [
      {
        id: 'side_hustle',
        title: 'Explore Side Hustles',
        description: 'Consider freelance work, online tutoring, or gig economy opportunities.',
        category: 'income_increase',
        priority: 'medium'
      },
      {
        id: 'skill_development',
        title: 'Develop Skills',
        description: 'Invest in learning new skills that can lead to promotions or better job opportunities.',
        category: 'income_increase',
        priority: 'low'
      }
    ],
    savings_strategy: [
      {
        id: 'pay_yourself_first',
        title: 'Pay Yourself First',
        description: 'Set aside savings immediately when you receive income, before paying other expenses.',
        category: 'savings_strategy',
        priority: 'high'
      },
      {
        id: 'automated_savings',
        title: 'Automate Savings',
        description: 'Set up automatic transfers to savings accounts to ensure consistent saving.',
        category: 'savings_strategy',
        priority: 'medium'
      }
    ],
    investment_advice: [
      {
        id: 'start_early',
        title: 'Start Investing Early',
        description: 'The earlier you start investing, the more time your money has to grow through compound interest.',
        category: 'investment_advice',
        priority: 'high'
      },
      {
        id: 'diversify',
        title: 'Diversify Investments',
        description: 'Spread your investments across different asset classes to reduce risk.',
        category: 'investment_advice',
        priority: 'medium'
      }
    ]
  };
  
  return categoryTips[category] || [];
};