import mongoose, { Schema } from 'mongoose';
import { ILearningItem, LearningCategory } from '@/types';

const learningItemSchema = new Schema<ILearningItem>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Content must be at least 1 character'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  expandedContent: {
    type: String,
    required: [true, 'Expanded content is required'],
    trim: true,
    minlength: [1, 'Expanded content must be at least 1 character']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['qa', 'checklist'],
      message: 'Type must be either "qa" or "checklist"'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Basics', 'Government Schemes', 'Investment Strategies', 'Gold Investments',
        'Fixed Income', 'Investment Principles', 'Portfolio Management', 'Mutual Funds',
        'Bank Products', 'Tax Planning'
      ],
      message: 'Invalid category'
    },
    index: true
  },
  isPublished: {
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

// Indexes for better query performance
learningItemSchema.index({ category: 1, isPublished: 1 });
learningItemSchema.index({ type: 1, isPublished: 1 });
learningItemSchema.index({ createdAt: -1 });

// Static method to get published items by category
learningItemSchema.statics.getPublishedByCategory = function(category: LearningCategory) {
  return this.find({ category, isPublished: true }).sort({ createdAt: -1 });
};

// Static method to get published items by type
learningItemSchema.statics.getPublishedByType = function(type: 'qa' | 'checklist') {
  return this.find({ type, isPublished: true }).sort({ createdAt: -1 });
};

// Static method to get all published items
learningItemSchema.statics.getPublished = function() {
  return this.find({ isPublished: true }).sort({ category: 1, createdAt: -1 });
};

// Static method to get items by category and type
learningItemSchema.statics.getByCategoryAndType = function(category: LearningCategory, type: 'qa' | 'checklist') {
  return this.find({ category, type, isPublished: true }).sort({ createdAt: -1 });
};

// Static method to search items
learningItemSchema.statics.search = function(query: string) {
  return this.find({
    $and: [
      { isPublished: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { expandedContent: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

// Instance method to get excerpt
learningItemSchema.methods.getExcerpt = function(maxLength: number = 150) {
  if (this.content.length <= maxLength) {
    return this.content;
  }
  return this.content.substring(0, maxLength) + '...';
};

// Instance method to get word count
learningItemSchema.methods.getWordCount = function() {
  return this.expandedContent.split(/\s+/).length;
};

// Instance method to get reading time estimate
learningItemSchema.methods.getReadingTime = function(wordsPerMinute: number = 200) {
  const wordCount = this.getWordCount();
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

const LearningItem = mongoose.model<ILearningItem>('LearningItem', learningItemSchema);

export default LearningItem;