import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  otp: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'login_otp'],
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    default: null
  },
  
  userModel: {
    type: String,
    enum: ['User', 'Student'],
    default: null
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000)
  },
  
  isUsed: {
    type: Boolean,
    default: false
  },
  
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  
  ipAddress: {
    type: String
  },
  
  userAgent: {
    type: String
  }
  
}, {
  timestamps: true
});

// Check if OTP is valid
otpSchema.methods.isValid = function() {
  if (this.isUsed) return false;
  if (new Date() > this.expiresAt) return false;
  if (this.attempts >= 5) return false;
  return true;
};

// Increment attempt count
otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
  return this.attempts;
};

// Mark OTP as used
otpSchema.methods.markUsed = async function() {
  this.isUsed = true;
  await this.save();
};

// Generate random OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Index for auto-expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;