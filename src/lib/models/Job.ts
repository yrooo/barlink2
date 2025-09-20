import mongoose from 'mongoose';

const CustomQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'select', 'radio', 'checkbox'],
    default: 'text',
  },
  options: [{
    type: String,
  }],
  required: {
    type: Boolean,
    default: false,
  },
});

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  salary: {
    type: String,
    trim: true,
  },
  syarat: [{
    type: String,
    trim: true,
  }],
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customQuestions: [CustomQuestionSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active',
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
JobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);

