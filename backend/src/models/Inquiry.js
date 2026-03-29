import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  courseName: {
    type: String
  },
  
  message: {
    type: String,
    required: true
  },
  
  preferredBatch: {
    type: String
  },
  
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'walk_in', 'phone_call', 'other'],
    default: 'website'
  },
  
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'lost', 'follow_up'],
    default: 'new'
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  followUpDate: {
    type: Date
  },
  
  remarks: [{
    comment: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  convertedToStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  
  convertedAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Indexes
inquirySchema.index({ email: 1 });
inquirySchema.index({ phone: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;