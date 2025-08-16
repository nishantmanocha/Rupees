// MongoDB initialization script for Savings Planner
// This script runs when the MongoDB container starts for the first time

// Switch to the savings_planner database
db = db.getSiblingDB('savings_planner');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "password"],
      properties: {
        firstName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50
        },
        lastName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        password: {
          bsonType: "string",
          minLength: 8
        }
      }
    }
  }
});

db.createCollection('expenses', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "name", "amount", "category"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        amount: {
          bsonType: "number",
          minimum: 0.01
        },
        category: {
          enum: ["Housing", "EMI", "Utilities", "Groceries", "Transport", "Subscriptions", "Other"]
        }
      }
    }
  }
});

db.createCollection('goals', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "title", "targetAmount"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        targetAmount: {
          bsonType: "number",
          minimum: 0.01
        }
      }
    }
  }
});

db.createCollection('instruments', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "annualRate", "compoundingPerYear", "description"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        annualRate: {
          bsonType: "number",
          minimum: 0,
          maximum: 1
        },
        compoundingPerYear: {
          bsonType: "int",
          minimum: 1,
          maximum: 365
        },
        description: {
          bsonType: "string",
          minLength: 1,
          maxLength: 500
        }
      }
    }
  }
});

db.createCollection('learning_items', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "expandedContent", "type", "category"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        content: {
          bsonType: "string",
          minLength: 1,
          maxLength: 1000
        },
        expandedContent: {
          bsonType: "string",
          minLength: 1
        },
        type: {
          enum: ["qa", "checklist"]
        },
        category: {
          enum: [
            "Basics", "Government Schemes", "Investment Strategies", "Gold Investments",
            "Fixed Income", "Investment Principles", "Portfolio Management", "Mutual Funds",
            "Bank Products", "Tax Planning"
          ]
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "isAdmin": 1 });

db.expenses.createIndex({ "userId": 1, "category": 1 });
db.expenses.createIndex({ "userId": 1, "createdAt": -1 });

db.goals.createIndex({ "userId": 1, "isPrimary": 1 });
db.goals.createIndex({ "userId": 1, "createdAt": -1 });

db.instruments.createIndex({ "isEnabled": 1 });
db.instruments.createIndex({ "name": 1 });

db.learning_items.createIndex({ "category": 1, "isPublished": 1 });
db.learning_items.createIndex({ "type": 1, "isPublished": 1 });
db.learning_items.createIndex({ "createdAt": -1 });

// Insert default investment instruments
db.instruments.insertMany([
  {
    name: "PPF (Public Provident Fund)",
    annualRate: 0.071,
    compoundingPerYear: 1,
    description: "Government-backed long-term savings scheme with tax benefits. Offers guaranteed returns and is ideal for retirement planning.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Nifty 50 Index Fund",
    annualRate: 0.12,
    compoundingPerYear: 12,
    description: "Passive mutual fund that tracks the Nifty 50 index. Provides exposure to India's top 50 companies with low expense ratios.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Gold ETF",
    annualRate: 0.08,
    compoundingPerYear: 12,
    description: "Exchange-traded fund that invests in physical gold. Provides easy access to gold investment with high liquidity.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sovereign Gold Bond (SGB)",
    annualRate: 0.10,
    compoundingPerYear: 1,
    description: "Government-issued gold bonds with fixed interest rate. Combines gold investment with regular interest income.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Debt Mutual Fund",
    annualRate: 0.065,
    compoundingPerYear: 12,
    description: "Mutual fund that invests in fixed-income securities. Offers stable returns with lower risk compared to equity funds.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Fixed Deposit (FD)",
    annualRate: 0.07,
    compoundingPerYear: 4,
    description: "Bank fixed deposit with guaranteed returns. Safe investment option with predictable income.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Recurring Deposit (RD)",
    annualRate: 0.068,
    compoundingPerYear: 4,
    description: "Regular savings scheme with compound interest. Ideal for building savings habit with regular contributions.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "ELSS (Equity Linked Savings Scheme)",
    annualRate: 0.14,
    compoundingPerYear: 12,
    description: "Tax-saving mutual fund with equity exposure. Offers tax benefits under Section 80C with potential for higher returns.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sukanya Samriddhi Yojana",
    annualRate: 0.081,
    compoundingPerYear: 1,
    description: "Government scheme for girl child education and marriage. Offers tax benefits and guaranteed returns.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "NPS (National Pension System)",
    annualRate: 0.09,
    compoundingPerYear: 12,
    description: "Pension scheme with tax benefits. Offers choice between equity, corporate bonds, and government securities.",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert default learning content
db.learning_items.insertMany([
  {
    title: "What is Compound Interest?",
    content: "Compound interest is when you earn interest on both your original investment and the accumulated interest.",
    expandedContent: `Compound interest is one of the most powerful concepts in finance. It's often called the "eighth wonder of the world" because of its ability to grow wealth exponentially over time.

When you invest money, you earn interest on your principal amount. With compound interest, you also earn interest on the interest you've already earned. This creates a snowball effect where your money grows faster and faster.

For example, if you invest ₹10,000 at 10% annual interest:
- Year 1: ₹10,000 + ₹1,000 = ₹11,000
- Year 2: ₹11,000 + ₹1,100 = ₹12,100
- Year 3: ₹12,100 + ₹1,210 = ₹13,310

The key is to start early and let time work in your favor. Even small amounts invested regularly can grow into substantial wealth over decades.`,
    type: "qa",
    category: "Basics",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Emergency Fund Checklist",
    content: "Build an emergency fund covering 3-6 months of expenses before investing.",
    expandedContent: `Before you start investing, it's crucial to build an emergency fund. This fund acts as a financial safety net and prevents you from having to sell investments during emergencies.

Emergency Fund Checklist:
□ Calculate your monthly expenses (rent, utilities, groceries, etc.)
□ Aim for 3-6 months of expenses as your emergency fund
□ Keep the fund in a high-yield savings account or liquid fund
□ Only use for genuine emergencies (job loss, medical expenses, car repairs)
□ Replenish the fund after using it
□ Review and adjust the amount annually

Why 3-6 months? This gives you enough time to:
- Find a new job if you're laid off
- Recover from unexpected medical expenses
- Handle major home or car repairs
- Navigate other financial crises

Remember: Your emergency fund should be easily accessible but separate from your regular spending account.`,
    type: "checklist",
    category: "Investment Principles",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Understanding PPF (Public Provident Fund)",
    content: "PPF is a government-backed savings scheme with tax benefits and guaranteed returns.",
    expandedContent: `The Public Provident Fund (PPF) is one of India's most popular long-term savings schemes, backed by the Government of India.

Key Features:
- Minimum investment: ₹500 per year
- Maximum investment: ₹1.5 lakh per year
- Lock-in period: 15 years
- Interest rate: Currently 7.1% (revised quarterly)
- Tax benefits: EEE (Exempt-Exempt-Exempt) under Section 80C

Benefits:
1. Guaranteed returns backed by the government
2. Tax deduction up to ₹1.5 lakh under Section 80C
3. Interest earned is tax-free
4. Maturity amount is tax-free
5. Can be extended in blocks of 5 years

How to invest:
- Open account at any bank or post office
- Invest minimum ₹500 annually
- Can invest in 12 installments per year
- Interest is credited annually on March 31st

Best for: Long-term goals like retirement, children's education, or building a secure financial foundation.`,
    type: "qa",
    category: "Government Schemes",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Diversification Strategy",
    content: "Spread your investments across different asset classes to reduce risk.",
    expandedContent: `Diversification is a risk management strategy that involves spreading your investments across different asset classes, sectors, and geographies.

Why Diversify?
- Reduces overall portfolio risk
- Smooths out returns over time
- Protects against market volatility
- Provides exposure to different growth opportunities

Asset Allocation Guidelines:
1. Equity (60-80% for young investors):
   - Large-cap stocks/funds
   - Mid-cap stocks/funds
   - International funds
   - Sector-specific funds

2. Fixed Income (20-40%):
   - Government bonds
   - Corporate bonds
   - Fixed deposits
   - Debt mutual funds

3. Alternative Investments (5-15%):
   - Gold (ETF, SGB, physical)
   - Real estate
   - Commodities

4. Cash (5-10%):
   - Emergency fund
   - Opportunity fund for market dips

Remember: Diversification doesn't guarantee profits or protect against all losses, but it's a fundamental principle of sound investing.`,
    type: "checklist",
    category: "Portfolio Management",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Tax-Saving Investment Options",
    content: "Various investment options offer tax benefits under different sections of the Income Tax Act.",
    expandedContent: `India offers several tax-saving investment options that can help reduce your taxable income while building wealth.

Section 80C Deductions (Up to ₹1.5 lakh):
1. PPF (Public Provident Fund)
2. ELSS (Equity Linked Savings Scheme)
3. Sukanya Samriddhi Yojana
4. NPS (National Pension System)
5. 5-year bank FDs
6. NSC (National Savings Certificate)
7. Life insurance premiums
8. Home loan principal repayment

Section 80D (Health Insurance):
- Premium paid for self, spouse, children, and parents
- Deduction up to ₹25,000 (₹50,000 for senior citizens)

Section 80G (Charitable Donations):
- Donations to registered charities
- 50% or 100% deduction based on organization

Section 80TTA (Savings Account Interest):
- Deduction up to ₹10,000 on savings account interest

Tax Planning Tips:
- Plan investments early in the financial year
- Don't invest just for tax savings
- Consider lock-in periods and liquidity needs
- Review tax-saving investments annually
- Keep proper documentation for all claims`,
    type: "checklist",
    category: "Tax Planning",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create admin user (you should change this password in production)
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@savingsplanner.com",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5wJmC", // admin123
  income: 0,
  currency: "INR",
  isAdmin: true,
  isEmailVerified: true,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Savings Planner database initialized successfully!");
print("📊 Default instruments and learning content created");
print("👤 Admin user created (email: admin@savingsplanner.com, password: admin123)");
print("🔐 Remember to change default passwords in production!");