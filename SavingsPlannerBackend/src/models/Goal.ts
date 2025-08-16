import mongoose, { Schema } from 'mongoose';
import { IGoal } from '@/types';

const goalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    minlength: [1, 'Goal title must be at least 1 character'],
    maxlength: [200, 'Goal title cannot exceed 200 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Target amount must be positive'
    }
  },
  targetDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        if (!v) return true; // Optional field
        return v > new Date();
      },
      message: 'Target date must be in the future'
    }
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for better query performance
goalSchema.index({ userId: 1, isPrimary: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to ensure only one primary goal per user
goalSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    // Remove primary status from other goals
    await mongoose.model('Goal').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Pre-update middleware to handle primary goal changes
goalSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.isPrimary) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      // Remove primary status from other goals
      await mongoose.model('Goal').updateMany(
        { userId: doc.userId, _id: { $ne: doc._id } },
        { isPrimary: false }
      );
    }
  }
  next();
});

// Static method to get primary goal for a user
goalSchema.statics.getPrimaryGoal = function(userId: string) {
  return this.findOne({ userId, isPrimary: true });
};

// Static method to get all goals for a user with projections
goalSchema.statics.getGoalsWithProjections = async function(userId: string) {
  const goals = await this.find({ userId }).sort({ createdAt: -1 });
  
  // Get user's income and expenses for calculations
  const User = mongoose.model('User');
  const Expense = mongoose.model('Expense');
  
  const user = await User.findById(userId);
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = (user?.income || 0) - totalExpenses;
  
  // Calculate projections for each goal
  const goalsWithProjections = goals.map(goal => {
    const savingProjection = calculateSavingProjection(goal.targetAmount, monthlySurplus);
    return {
      ...goal.toObject(),
      savingProjection
    };
  });
  
  return goalsWithProjections;
};

// Static method to get a single goal with projections
goalSchema.statics.getGoalWithProjections = async function(goalId: string, userId: string) {
  const goal = await this.findOne({ _id: goalId, userId });
  if (!goal) return null;
  
  // Get user's income and expenses for calculations
  const User = mongoose.model('User');
  const Expense = mongoose.model('Expense');
  
  const user = await User.findById(userId);
  const totalExpenses = await Expense.getTotalByUser(userId);
  const monthlySurplus = (user?.income || 0) - totalExpenses;
  
  // Calculate saving projection
  const savingProjection = calculateSavingProjection(goal.targetAmount, monthlySurplus);
  
  // Get instruments for investing projections
  const Instrument = mongoose.model('Instrument');
  const instruments = await Instrument.find({ isEnabled: true });
  
  // Calculate investing projections
  const investingProjections = instruments.map(instrument => {
    return calculateInvestingProjection(goal.targetAmount, monthlySurplus, instrument);
  });
  
  return {
    ...goal.toObject(),
    savingProjection,
    investingProjections
  };
};

// Helper function to calculate saving projection
function calculateSavingProjection(targetAmount: number, monthlySurplus: number) {
  if (monthlySurplus <= 0) {
    return {
      monthsToGoal: Infinity,
      dailySaving: 0,
      weeklySaving: 0,
      monthlyData: []
    };
  }
  
  const monthsToGoal = Math.ceil(targetAmount / monthlySurplus);
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
}

// Helper function to calculate investing projection
function calculateInvestingProjection(targetAmount: number, monthlySurplus: number, instrument: any) {
  const monthlyRate = instrument.annualRate / 12;
  const maxMonths = 600;
  const monthlyData: number[] = [];
  
  // Handle edge case where rate is 0
  if (monthlyRate === 0) {
    for (let month = 0; month <= maxMonths; month++) {
      monthlyData.push(monthlySurplus * month);
    }
    
    const monthsToGoal = Math.ceil(targetAmount / monthlySurplus);
    const finalValue = monthlySurplus * maxMonths;
    
    return {
      instrumentId: instrument._id,
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
      const fv = monthlySurplus * 
        ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) * 
        (1 + monthlyRate);
      monthlyData.push(fv);
    }
  }
  
  // Find months to goal
  let monthsToGoal = Infinity;
  for (let month = 1; month <= maxMonths; month++) {
    if (monthlyData[month] >= targetAmount) {
      monthsToGoal = month;
      break;
    }
  }
  
  const finalValue = monthlyData[maxMonths];
  const savingOnlyValue = monthlySurplus * maxMonths;
  const gainVsSavingOnly = finalValue - savingOnlyValue;
  
  return {
    instrumentId: instrument._id,
    instrumentName: instrument.name,
    monthsToGoal,
    finalValue,
    monthlyData,
    gainVsSavingOnly
  };
}

const Goal = mongoose.model<IGoal>('Goal', goalSchema);

export default Goal;