import mongoose, { Schema } from 'mongoose';
import { IOTP } from '@/types';

const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be exactly 6 characters']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0,
    min: [0, 'Attempts cannot be negative'],
    max: [5, 'Maximum attempts exceeded']
  }
}, {
  timestamps: true
});

// Index for better query performance
otpSchema.index({ email: 1, createdAt: -1 });

// Static method to create OTP
otpSchema.statics.createOTP = async function(email: string, otp: string, expiryMinutes: number = 10) {
  // Remove any existing OTPs for this email
  await this.deleteMany({ email });
  
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return await this.create({
    email,
    otp,
    expiresAt,
    attempts: 0
  });
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email: string, otp: string) {
  const otpDoc = await this.findOne({ 
    email, 
    otp, 
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
  
  if (!otpDoc) {
    return { isValid: false, message: 'Invalid or expired OTP' };
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();
  
  if (otpDoc.attempts >= 5) {
    // Delete OTP after max attempts
    await this.deleteOne({ _id: otpDoc._id });
    return { isValid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
  }
  
  return { isValid: true, message: 'OTP verified successfully' };
};

// Static method to check if OTP exists and is valid
otpSchema.statics.isValidOTP = async function(email: string, otp: string) {
  const otpDoc = await this.findOne({ 
    email, 
    otp, 
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
  
  return !!otpDoc;
};

// Static method to invalidate OTP
otpSchema.statics.invalidateOTP = async function(email: string) {
  return await this.deleteMany({ email });
};

// Static method to get OTP info
otpSchema.statics.getOTPInfo = async function(email: string) {
  const otpDoc = await this.findOne({ email });
  
  if (!otpDoc) {
    return null;
  }
  
  return {
    email: otpDoc.email,
    attempts: otpDoc.attempts,
    expiresAt: otpDoc.expiresAt,
    isExpired: otpDoc.expiresAt < new Date(),
    isMaxAttempts: otpDoc.attempts >= 5
  };
};

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to check if max attempts reached
otpSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= 5;
};

// Instance method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Pre-save middleware to ensure OTP is exactly 6 characters
otpSchema.pre('save', function(next) {
  if (this.otp.length !== 6) {
    next(new Error('OTP must be exactly 6 characters'));
  } else {
    next();
  }
});

// Pre-save middleware to ensure expiration time is in the future
otpSchema.pre('save', function(next) {
  if (this.expiresAt <= new Date()) {
    next(new Error('Expiration time must be in the future'));
  } else {
    next();
  }
});

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;