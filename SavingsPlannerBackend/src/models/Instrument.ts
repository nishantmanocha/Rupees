import mongoose, { Schema } from 'mongoose';
import { IInstrument } from '@/types';

const instrumentSchema = new Schema<IInstrument>({
  name: {
    type: String,
    required: [true, 'Instrument name is required'],
    trim: true,
    unique: true,
    minlength: [1, 'Instrument name must be at least 1 character'],
    maxlength: [100, 'Instrument name cannot exceed 100 characters']
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
  },
  compoundingPerYear: {
    type: Number,
    required: [true, 'Compounding frequency is required'],
    min: [1, 'Compounding frequency must be at least 1'],
    max: [365, 'Compounding frequency cannot exceed 365'],
    validate: {
      validator: function(v: number) {
        return Number.isInteger(v) && v > 0;
      },
      message: 'Compounding frequency must be a positive integer'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [1, 'Description must be at least 1 character'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isEnabled: {
    type: Boolean,
    default: true
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

// Index for better query performance
instrumentSchema.index({ isEnabled: 1 });
instrumentSchema.index({ name: 1 });

// Static method to get enabled instruments
instrumentSchema.statics.getEnabled = function() {
  return this.find({ isEnabled: true }).sort({ name: 1 });
};

// Static method to get instrument by name
instrumentSchema.statics.findByName = function(name: string) {
  return this.findOne({ name: { $regex: new RegExp(name, 'i') } });
};

// Instance method to get formatted rate
instrumentSchema.methods.getFormattedRate = function() {
  return `${(this.annualRate * 100).toFixed(2)}%`;
};

// Instance method to get monthly rate
instrumentSchema.methods.getMonthlyRate = function() {
  return this.annualRate / 12;
};

// Instance method to get effective annual rate
instrumentSchema.methods.getEffectiveAnnualRate = function() {
  return Math.pow(1 + this.annualRate / this.compoundingPerYear, this.compoundingPerYear) - 1;
};

const Instrument = mongoose.model<IInstrument>('Instrument', instrumentSchema);

export default Instrument;