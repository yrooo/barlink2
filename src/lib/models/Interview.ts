import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  _id: string;
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  interviewType: 'online' | 'offline';
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  googleCalendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
  },
  location: {
    type: String,
    required: function(this: IInterview) {
      return this.interviewType === 'offline';
    },
  },
  meetingLink: {
    type: String,
    required: function(this: IInterview) {
      return this.interviewType === 'online';
    },
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  googleCalendarEventId: {
    type: String,
    sparse: true, // Allow multiple documents without this field
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
InterviewSchema.index({ applicationId: 1 });
InterviewSchema.index({ jobId: 1 });
InterviewSchema.index({ employerId: 1 });
InterviewSchema.index({ applicantId: 1 });
InterviewSchema.index({ scheduledDate: 1 });
InterviewSchema.index({ status: 1 });

// Compound index for employer's interviews
InterviewSchema.index({ employerId: 1, scheduledDate: 1 });

// Compound index for applicant's interviews
InterviewSchema.index({ applicantId: 1, scheduledDate: 1 });

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);