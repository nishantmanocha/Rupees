import mongoose, { Schema } from 'mongoose';
import { IUserInstrumentOverride } from '@/types';

const userInstrumentOverrideSchema = new Schema<IUserInstrumentOverride>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  instrumentId: {
    type: Schema.Types.ObjectId,
    ref: 'Instrument',
    required: [true, 'Instrument ID is required'],
    index: true
  },
  annualRate: {
    type: Number,
    required: [true, 'Annual rate is required'],
    min: [0, 'Rate cannot be negative'],
    max: [1, 'Rate cannot exceed 100%'],
    validate: {
      validator: function(v: number) {
        return v >= 0 && v <= 1;
      },
      message: 'Rate must be between 0 and 1 (0% to 100%)'
    }
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

// Compound unique index to ensure one override per user per instrument
userInstrumentOverrideSchema.index({ userId: 1, instrumentId: 1 }, { unique: true });

// Static method to get all overrides for a user
userInstrumentOverrideSchema.statics.getByUser = function(userId: string) {
  return this.find({ userId }).populate('instrumentId', 'name description');
};

// Static method to get override for a specific instrument and user
userInstrumentOverrideSchema.statics.getByUserAndInstrument = function(userId: string, instrumentId: string) {
  return this.findOne({ userId, instrumentId });
};

// Static method to get all overrides with instrument details
userInstrumentOverrideSchema.statics.getWithInstrumentDetails = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'instruments',
        localField: 'instrumentId',
        foreignField: '_id',
        as: 'instrument'
      }
    },
    { $unwind: '$instrument' },
    {
      $project: {
        _id: 1,
        annualRate: 1,
        instrument: {
          _id: 1,
          name: 1,
          description: 1,
          defaultAnnualRate: '$instrument.annualRate',
          compoundingPerYear: 1
        },
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);
};

// Instance method to get formatted rate
userInstrumentOverrideSchema.methods.getFormattedRate = function() {
  return `${(this.annualRate * 100).toFixed(2)}%`;
};

// Instance method to get monthly rate
userInstrumentOverrideSchema.methods.getMonthlyRate = function() {
  return this.annualRate / 12;
};

const UserInstrumentOverride = mongoose.model<IUserInstrumentOverride>('UserInstrumentOverride', userInstrumentOverrideSchema);

export default UserInstrumentOverride;