import mongoose, { Schema } from 'mongoose';
import { IUserSettings } from '@/types';

const userSettingsSchema = new Schema<IUserSettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  theme: {
    type: String,
    enum: {
      values: ['light', 'dark', 'system'],
      message: 'Theme must be light, dark, or system'
    },
    default: 'system'
  },
  instrumentOverrides: [{
    type: Schema.Types.ObjectId,
    ref: 'UserInstrumentOverride'
  }],
  preferences: {
    type: Schema.Types.Mixed,
    default: {}
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
userSettingsSchema.index({ userId: 1 });

// Static method to get or create settings for a user
userSettingsSchema.statics.getOrCreate = async function(userId: string) {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = new this({
      userId,
      theme: 'system',
      instrumentOverrides: [],
      preferences: {}
    });
    await settings.save();
  }
  
  return settings;
};

// Static method to update theme
userSettingsSchema.statics.updateTheme = async function(userId: string, theme: 'light' | 'dark' | 'system') {
  return await this.findOneAndUpdate(
    { userId },
    { theme },
    { new: true, upsert: true }
  );
};

// Static method to add instrument override
userSettingsSchema.statics.addInstrumentOverride = async function(userId: string, overrideId: string) {
  return await this.findOneAndUpdate(
    { userId },
    { $addToSet: { instrumentOverrides: overrideId } },
    { new: true, upsert: true }
  );
};

// Static method to remove instrument override
userSettingsSchema.statics.removeInstrumentOverride = async function(userId: string, overrideId: string) {
  return await this.findOneAndUpdate(
    { userId },
    { $pull: { instrumentOverrides: overrideId } },
    { new: true }
  );
};

// Static method to update preferences
userSettingsSchema.statics.updatePreferences = async function(userId: string, preferences: Record<string, any>) {
  return await this.findOneAndUpdate(
    { userId },
    { $set: { preferences } },
    { new: true, upsert: true }
  );
};

// Static method to get settings with populated instrument overrides
userSettingsSchema.statics.getWithOverrides = async function(userId: string) {
  return await this.findOne({ userId })
    .populate({
      path: 'instrumentOverrides',
      populate: {
        path: 'instrumentId',
        select: 'name description annualRate compoundingPerYear'
      }
    });
};

// Instance method to get theme
userSettingsSchema.methods.getTheme = function() {
  return this.theme;
};

// Instance method to set theme
userSettingsSchema.methods.setTheme = function(theme: 'light' | 'dark' | 'system') {
  this.theme = theme;
  return this.save();
};

// Instance method to add preference
userSettingsSchema.methods.addPreference = function(key: string, value: any) {
  this.preferences[key] = value;
  return this.save();
};

// Instance method to remove preference
userSettingsSchema.methods.removePreference = function(key: string) {
  delete this.preferences[key];
  return this.save();
};

// Instance method to get preference
userSettingsSchema.methods.getPreference = function(key: string, defaultValue?: any) {
  return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
};

const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);

export default UserSettings;