import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { Card } from '../../components/Card';

interface LearningItem {
  id: string;
  title: string;
  type: 'qa' | 'checklist';
  content: string;
  expandedContent: string;
  icon: React.ReactNode;
  category: string;
}

const LearnScreen: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const learningItems: LearningItem[] = [
    {
      id: 'pre-investment-checklist',
      title: 'What to check before investing?',
      type: 'checklist',
      content: 'Essential factors to consider before making any investment decision',
      expandedContent: `1. Expense Ratio: Lower is better, especially for mutual funds
2. Track Record: Look for consistent performance over 3-5 years
3. Benchmark Comparison: How does it perform against relevant indices?
4. Risk Profile: Understand your risk tolerance and the instrument's risk level
5. Tax Implications: Consider tax efficiency and applicable rates
6. Lock-in Period: Check if there are any withdrawal restrictions
7. Liquidity: How easily can you access your money when needed?
8. Fund Manager: Research the team's experience and track record`,
      icon: <CheckCircle size={24} color="#16a34a" />,
      category: 'Basics'
    },
    {
      id: 'ppf-basics',
      title: 'PPF Basics',
      type: 'qa',
      content: 'Understanding Public Provident Fund - a government-backed savings scheme',
      expandedContent: `PPF (Public Provident Fund) is a long-term savings scheme backed by the Government of India.

Key Features:
• Minimum investment: ₹500 per year
• Maximum investment: ₹1.5 lakh per year
• Lock-in period: 15 years
• Interest rate: Currently 7.1% (compounded annually)
• Tax benefits: EEE (Exempt-Exempt-Exempt) under Section 80C

Who should invest:
• Conservative investors seeking guaranteed returns
• Long-term savers (15+ years horizon)
• Tax-conscious individuals
• Those looking for government-backed security

Pros: Guaranteed returns, tax benefits, government backing
Cons: Long lock-in period, lower returns compared to equity`,
      icon: <Info size={24} color="#2563eb" />,
      category: 'Government Schemes'
    },
    {
      id: 'what-is-sip',
      title: 'What is SIP?',
      type: 'qa',
      content: 'Systematic Investment Plan - a disciplined approach to investing',
      expandedContent: `SIP (Systematic Investment Plan) is an investment strategy where you invest a fixed amount regularly (monthly/quarterly) in mutual funds or other investment instruments.

How it works:
• Choose an investment amount (e.g., ₹5,000 per month)
• Select a mutual fund or investment option
• Set up automatic deductions from your bank account
• Invest consistently regardless of market conditions

Benefits:
• Rupee Cost Averaging: Buy more units when prices are low
• Disciplined investing: Automatic and consistent
• Lower risk: Spreads investment over time
• Small amounts: Start with as little as ₹500/month
• Compounding: Long-term wealth creation

Best for: Beginners, salaried individuals, those seeking disciplined investing`,
      icon: <Info size={24} color="#2563eb" />,
      category: 'Investment Strategies'
    },
    {
      id: 'gold-etf-vs-sgb',
      title: 'Gold ETF vs SGB',
      type: 'qa',
      content: 'Comparing two popular gold investment options',
      expandedContent: `Gold ETF vs Sovereign Gold Bond (SGB):

Gold ETF:
• Physical gold-backed exchange-traded fund
• Trade on stock exchanges like shares
• No lock-in period
• Annual return: ~8% (historically)
• Lower liquidity than physical gold
• No additional interest income

Sovereign Gold Bond (SGB):
• Government-issued gold bonds
• 8-year maturity with exit options
• Annual return: ~10% (7.5% + 2.5% interest)
• Tax benefits under Section 80C
• Guaranteed by Government of India
• Can be used as collateral

Choose Gold ETF if: You want liquidity and short-term holding
Choose SGB if: You want higher returns, tax benefits, and long-term holding`,
      icon: <Info size={24} color="#f59e0b" />,
      category: 'Gold Investments'
    },
    {
      id: 'fd-vs-debt-mf',
      title: 'FD vs Debt MF',
      type: 'qa',
      content: 'Fixed Deposits vs Debt Mutual Funds - which is better?',
      expandedContent: `Fixed Deposit (FD) vs Debt Mutual Fund:

Fixed Deposit:
• Guaranteed returns (currently ~7%)
• Fixed interest rate for the term
• No market risk
• Premature withdrawal penalties
• Tax on interest earned
• No liquidity during lock-in

Debt Mutual Fund:
• Market-linked returns (typically 6-8%)
• Professional fund management
• Higher liquidity options
• Potential for better returns
• Tax efficiency (LTCG benefits)
• Diversification across instruments

Choose FD if: You want guaranteed returns and capital protection
Choose Debt MF if: You want potentially higher returns and flexibility`,
      icon: <Info size={24} color="#2563eb" />,
      category: 'Fixed Income'
    },
    {
      id: 'risk-vs-return',
      title: 'Risk vs Return',
      type: 'qa',
      content: 'Understanding the fundamental relationship between risk and returns',
      expandedContent: `Risk vs Return is the fundamental principle that higher potential returns come with higher risk.

Risk Levels (Low to High):
1. Government Securities (Low Risk, 6-7% returns)
2. Bank FDs (Low Risk, 6-8% returns)
3. Debt Mutual Funds (Low-Medium Risk, 6-9% returns)
4. Hybrid Funds (Medium Risk, 8-12% returns)
5. Equity Mutual Funds (High Risk, 10-15% returns)
6. Direct Equity (Very High Risk, 15%+ returns)

Key Principles:
• Higher risk doesn't guarantee higher returns
• Diversification reduces overall portfolio risk
• Time horizon affects risk tolerance
• Younger investors can take more risk
• Emergency funds should be in low-risk instruments

Your Strategy: Match risk level with your goals, time horizon, and comfort level.`,
      icon: <AlertCircle size={24} color="#f59e0b" />,
      category: 'Investment Principles'
    },
    {
      id: 'diversification-101',
      title: 'Diversification 101',
      type: 'checklist',
      content: 'The importance of spreading your investments across different asset classes',
      expandedContent: `Diversification reduces risk by spreading investments across different assets.

Asset Classes to Consider:
1. Equity: Stocks, equity mutual funds, ETFs
2. Debt: Bonds, debt mutual funds, FDs
3. Gold: Physical gold, gold ETFs, SGBs
4. Real Estate: Property, REITs
5. International: Global mutual funds, international ETFs

Diversification Rules:
• Don't put all eggs in one basket
• Mix high and low-risk investments
• Consider different sectors and geographies
• Rebalance portfolio periodically
• Match allocation to your age and goals

Example Portfolio (Age 30):
• 60% Equity (domestic + international)
• 25% Debt (PPF, debt funds)
• 10% Gold (ETFs, SGBs)
• 5% Emergency fund (liquid funds)`,
      icon: <CheckCircle size={24} color="#16a34a" />,
      category: 'Portfolio Management'
    },
    {
      id: 'pick-index-fund',
      title: 'How to pick an index fund?',
      type: 'checklist',
      content: 'Choosing the right index fund for your portfolio',
      expandedContent: `Index funds track market indices and offer low-cost, diversified exposure.

Selection Criteria:
1. Tracking Error: Lower is better (should be <0.5%)
2. Expense Ratio: Lower is better (should be <0.5%)
3. Fund Size: Larger funds have better liquidity
4. Index Choice: Nifty 50, Sensex, or sector-specific
5. Fund House: Reputable and established
6. Exit Load: Check for any withdrawal charges
7. Dividend vs Growth: Choose based on your needs

Popular Index Funds:
• HDFC Index Fund - Nifty 50
• ICICI Prudential Nifty Index Fund
• SBI Nifty Index Fund
• UTI Nifty Index Fund

Why Index Funds:
• Lower costs than actively managed funds
• Consistent with market performance
• No fund manager risk
• Ideal for long-term investing`,
      icon: <CheckCircle size={24} color="#16a34a" />,
      category: 'Mutual Funds'
    },
    {
      id: 'rd-explained',
      title: 'What is RD and who should use it?',
      type: 'qa',
      content: 'Recurring Deposit - a systematic savings option',
      expandedContent: `Recurring Deposit (RD) is a systematic savings scheme offered by banks.

How it works:
• Deposit a fixed amount monthly (e.g., ₹5,000)
• Choose the tenure (6 months to 10 years)
• Interest is compounded quarterly
• Current rates: ~6.8% annually
• No penalty for missing a month (with conditions)

Who should use RD:
• Salaried individuals with regular income
• Those who can't afford lump-sum investments
• Conservative investors seeking guaranteed returns
• People building emergency funds
• Short to medium-term goals (1-5 years)

Pros: Guaranteed returns, systematic saving, no market risk
Cons: Lower returns than equity, lock-in period, premature withdrawal penalties

Best for: Emergency funds, short-term goals, conservative investors`,
      icon: <Info size={24} color="#2563eb" />,
      category: 'Bank Products'
    },
    {
      id: 'tax-considerations',
      title: 'Tax considerations overview',
      type: 'checklist',
      content: 'Understanding tax implications of different investment options',
      expandedContent: `Tax efficiency is crucial for maximizing your investment returns.

Tax-Saving Options (Section 80C):
1. PPF: Tax-free interest and withdrawals
2. ELSS: 3-year lock-in, tax deduction up to ₹1.5 lakh
3. NPS: Additional ₹50,000 deduction under 80CCD(1B)
4. Sukanya Samriddhi: Tax-free returns for girl child education
5. 5-year FDs: Tax deduction under 80C

Tax on Returns:
• Equity: 10% LTCG after 1 year, 15% STCG
• Debt: Taxed as per income tax slab
• Gold: 20% LTCG with indexation
• FDs: Taxed as per income tax slab

Tax-Efficient Strategies:
• Use tax-saving instruments for deductions
• Hold equity investments for 1+ years
• Consider tax-free options for high-income earners
• Plan withdrawals to minimize tax impact
• Use indexation benefits for long-term debt investments`,
      icon: <CheckCircle size={24} color="#16a34a" />,
      category: 'Tax Planning'
    }
  ];

  const renderLearningItem = (item: LearningItem) => {
    const isExpanded = expandedItems.has(item.id);

    return (
      <Card key={item.id} className="mb-4">
        <TouchableOpacity
          onPress={() => toggleItem(item.id)}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <View className="mr-3">
              {item.icon}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {item.content}
              </Text>
            </View>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color="#6b7280" />
          ) : (
            <ChevronRight size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-6">
              {item.expandedContent}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const categories = [...new Set(learningItems.map(item => item.category))];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Learn & Grow
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Build your financial knowledge with expert insights
          </Text>
        </View>

        {/* Categories */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Browse by Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <View key={category} className="px-3 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Text className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {category}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Learning Items */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Essential Knowledge
          </Text>
          {learningItems.map(renderLearningItem)}
        </View>

        {/* Tips Section */}
        <View className="px-6 mb-6">
          <Card>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💡 Learning Tips
            </Text>
            <View className="space-y-2">
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                • Start with basics and gradually move to advanced topics
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                • Apply what you learn to your own financial planning
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                • Stay updated with market trends and regulatory changes
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                • Consider consulting a financial advisor for personalized advice
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LearnScreen;