import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  role: {
    type: String,
    enum: ['pelamar_kerja', 'pencari_kandidat'],
    required: true,
  },
  company: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  profile: {
    bio: String,
    phone: String,
    whatsappNumber: String,
    address: String,
    website: String,
    description: String,
    location: String,
    cvUrl: String,
    cvPath: String,
    cvFileName: String,
    cvUploadedAt: Date,
  },
  phone: {
    type: String,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    trim: true,
  },
  whatsappVerified: {
    type: Boolean,
    default: false,
  },
  whatsappVerifiedAt: {
    type: Date,
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
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

