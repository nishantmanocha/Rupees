import mongoose, { Schema } from 'mongoose';
import { IExpense, ExpenseCategory } from '@/types';

const expenseSchema = new Schema<IExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Expense name is required'],
    trim: true,
    minlength: [1, 'Expense name must be at least 1 character'],
    maxlength: [100, 'Expense name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Amount must be positive'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Housing', 'EMI', 'Utilities', 'Groceries', 'Transport', 'Subscriptions', 'Other'],
      message: 'Invalid expense category'
    },
    index: true
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
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

// Static method to get total expenses by user
expenseSchema.statics.getTotalByUser = async function(userId: string) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
};

// Static method to get expenses by category for a user
expenseSchema.statics.getByCategoryForUser = async function(userId: string) {
  return await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

// Static method to get expense breakdown for a user
expenseSchema.statics.getExpenseBreakdown = async function(userId: string) {
  const breakdown = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ]);
  
  // Convert to object format
  const result: Record<ExpenseCategory, number> = {
    Housing: 0,
    EMI: 0,
    Utilities: 0,
    Groceries: 0,
    Transport: 0,
    Subscriptions: 0,
    Other: 0
  };
  
  breakdown.forEach(item => {
    result[item._id as ExpenseCategory] = item.total;
  });
  
  return result;
};

// Instance method to get formatted amount
expenseSchema.methods.getFormattedAmount = function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(this.amount);
};

const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;