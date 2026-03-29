import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  
  type: {
    type: String,
    enum: ['course_completion', 'achievement', 'participation', 'bonafide'],
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  issueDate: {
    type: Date,
    default: Date.now
  },
  
  expiryDate: {
    type: Date
  },
  
  grade: {
    type: String
  },
  
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  qrCode: {
    type: String
  },
  
  pdfUrl: {
    type: String
  },
  
  status: {
    type: String,
    enum: ['draft', 'issued', 'revoked'],
    default: 'draft'
  },
  
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  verifiedCount: {
    type: Number,
    default: 0
  },
  
  revokedReason: {
    type: String
  },
  
  revokedAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Generate certificate ID before save
certificateSchema.pre('save', async function(next) {
  if (this.isNew && !this.certificateId) {
    const Certificate = mongoose.model('Certificate');
    const year = new Date().getFullYear();
    const count = await Certificate.countDocuments();
    this.certificateId = `CERT/${year}/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Get verification URL
certificateSchema.methods.getVerificationUrl = function() {
  return `${process.env.FRONTEND_URL}/verify-certificate/${this.certificateId}`;
};

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;