import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  // Enrollment Information
  enrollmentId: {  // Changed from enrollmentNo to enrollmentId for consistency
    type: String,
    unique: true,
    sparse: true
  },
  
  // Personal Information
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  alternatePhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Parent Information
  fatherName: {
    type: String,
    required: [true, "Father's name is required"],
    trim: true
  },
  
  motherName: {
    type: String,
    trim: true
  },
  
  parentEmail: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  parentPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Address Details
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Personal Details
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    default: 'O+',
    required: false
  },
  
  // Education Details
  education: {
    lastQualification: {
      type: String,
      enum: ['10th', '12th', 'Graduate', 'Post Graduate', 'Other']
    },
    schoolName: String,
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    passingYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    }
  },
  
  // Course & Batch Information
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    // required: true
  },
  
  courseName: {  // Added for quick access
    type: String,
    trim: true
  },
  
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  
  admissionDate: {
    type: Date,
    default: Date.now
  },
  
  admissionType: {
    type: String,
    enum: ['new', 'renewal', 'transfer'],
    default: 'new'
  },
  
  // ==================== REGISTRATION FLOW FIELDS ====================
  
  registrationStatus: {
    type: String,
    enum: [
  'pending_personal',
  'pending_course',
  'pending_documents',
  'pending_verification',
  'ready_for_payment',
  'payment_done',  
  'completed'
],
    default: 'pending_personal'
  },
  
  // Admission Fee Status
  admissionFeePaid: {
    type: Boolean,
    default: false
  },
  
  admissionFeePaidDate: {
    type: Date
  },
  
  admissionFeeAmount: {
    type: Number,
    default: 0
  },
  
  // Payment Tracking
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  
  paymentTransactionId: {
    type: String,
    sparse: true
  },
  
  // Document Upload Status
  documentsUploaded: {
    type: Boolean,
    default: false
  },
  
  documentsUploadedDate: {
    type: Date
  },
  
  documentsVerified: {
    type: Boolean,
    default: false
  },
  
  documentsVerifiedDate: {
    type: Date
  },
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerifiedDate: {
    type: Date
  },
  
  emailVerificationOTP: {
    type: String,
    select: false
  },
  
  emailVerificationOTPExpiry: {
    type: Date,
    select: false
  },
  
  // Registration Completion
  registrationComplete: {
    type: Boolean,
    default: false
  },
  
  registrationDate: {
    type: Date
  },
  
  // ==================== FEE RELATED FIELDS ====================
  
  feeStructure: {
    totalFees: {
      type: Number,
      // required: true,
      default: 0,
      min: 0
    },
    admissionFee: {  // Added separate admission fee
      type: Number,
      default: 0
    },
    courseFee: {  // Added separate course fee
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountReason: {
      type: String
    },
    discountType: {  // Added discount type
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    paymentMode: {
      type: String,
      enum: ['full', 'installment', 'scholarship'],
      default: 'full'
    },
    dueDate: {
      type: Date
    },
    remainingFees: {  // Track remaining fees
      type: Number,
      default: 0
    }
  },
  
  // ==================== ACADEMIC STATUS ====================
  
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'completed', 'dropped', 'suspended'],
    default: 'pending'  // Changed from 'active' to 'pending'
  },
  
  dropReason: {
    type: String
  },
  
  dropDate: {
    type: Date
  },
  
  // ==================== DOCUMENTS ====================
  documents: {
  profilePhoto: { type: String, default: '' },
  profilePhotoObjectName: { type: String, default: '' },

  aadharCard: { type: String, default: '' },
  aadharCardObjectName: { type: String, default: '' },

  previousYearMarksheet: { type: String, default: '' }, // 🔥 ADD
  previousYearMarksheetObjectName: { type: String, default: '' } // 🔥 ADD
},

  // ==================== AUDIT FIELDS ====================
  
  lastLogin: {
    type: Date
  },
  
  lastLoginIP: {
    type: String
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  remarks: [{
    comment: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  isDeleted: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// ==================== PRE-SAVE HOOKS ====================

studentSchema.pre('save', async function(next) {
  if (!this.enrollmentId && this.registrationComplete) {
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      const Student = mongoose.model('Student');
      const count = await Student.countDocuments({
        enrollmentId: { $regex: `^JAS/${month}/${year}/`, $options: 'i' },
        isDeleted: false
      });
      
      const sequence = String(count + 1).padStart(5, '0');
      this.enrollmentId = `JAS/${month}/${year}/${sequence}`;
      console.log(`✅ Auto-generated enrollmentId: ${this.enrollmentId}`);
      
    } catch (error) {
      console.error('Error generating enrollmentId:', error);
      return next(error);
    }
  }
  next();
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update course name from course reference before save
studentSchema.pre('save', async function(next) {
  if (this.isModified('course') && this.course) {
    try {
      const Course = mongoose.model('Course');
      const course = await Course.findById(this.course);
      if (course) {
        this.courseName = course.name;
      }
    } catch (error) {
      console.error('Error fetching course name:', error);
    }
  }
  next();
});

// ==================== INSTANCE METHODS ====================



// Compare password method
studentSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate age
studentSchema.methods.getAge = function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get display name
studentSchema.methods.getDisplayName = function() {
  return `${this.name} (${this.enrollmentId})`;
};

// Check if registration is complete
studentSchema.methods.isRegistrationComplete = function() {
  return this.registrationComplete === true;
};

// Get registration progress
studentSchema.methods.getRegistrationProgress = function() {
  const steps = {
    personalInfo: !!this.name && !!this.email && !!this.phone,
    courseSelected: !!this.course,
    documentsUploaded: this.documentsUploaded,
    emailVerified: this.emailVerified,
    admissionFeePaid: this.admissionFeePaid
  };
  
  const completedSteps = Object.values(steps).filter(Boolean).length;
  const totalSteps = 5;
  const percentage = (completedSteps / totalSteps) * 100;
  
  return {
    steps,
    completedSteps,
    totalSteps,
    percentage,
    status: this.registrationStatus
  };
};

// Update registration status based on progress
studentSchema.methods.updateRegistrationStatus = function() {
  if (!this.name || !this.email || !this.phone) {
    this.registrationStatus = 'pending_personal';
  } else if (!this.course) {
    this.registrationStatus = 'pending_course';
  } else if (!this.documentsUploaded) {
    this.registrationStatus = 'pending_documents';
  } else if (!this.emailVerified) {
    this.registrationStatus = 'pending_verification';
  } else if (!this.admissionFeePaid) {
    this.registrationStatus = 'ready_for_payment'; // ✅ FIXED
  } else {
    this.registrationStatus = 'completed';
    this.registrationComplete = true;
    this.status = 'active';
    this.registrationDate = new Date();
  }

  return this.registrationStatus;
};



// Generate OTP for email verification
studentSchema.methods.generateEmailOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = otp;
  this.emailVerificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return otp;
};

// Verify OTP
studentSchema.methods.verifyOTP = function(otp) {
  if (!this.emailVerificationOTP || !this.emailVerificationOTPExpiry) {
    return false;
  }
  
  if (new Date() > this.emailVerificationOTPExpiry) {
    return false;
  }
  
  if (this.emailVerificationOTP !== otp) {
    return false;
  }
  
  this.emailVerified = true;
  this.emailVerifiedDate = new Date();
  this.emailVerificationOTP = undefined;
  this.emailVerificationOTPExpiry = undefined;
  
  return true;
};

// ==================== VIRTUAL PROPERTIES ====================

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.pincode,
    this.address.country
  ].filter(part => part);
  return parts.join(', ');
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  return this.getAge();
});

// Virtual for payment status
studentSchema.virtual('paymentStatus').get(function() {
  return {
    admissionFeePaid: this.admissionFeePaid,
    admissionFeeAmount: this.admissionFeeAmount,
    admissionFeePaidDate: this.admissionFeePaidDate,
    totalFeesPaid: this.feeStructure?.totalFees - this.feeStructure?.remainingFees,
    remainingFees: this.feeStructure?.remainingFees
  };
});

// ==================== STATIC METHODS ====================

// Find students with pending admission fees
studentSchema.statics.findPendingAdmissionFees = function() {
  return this.find({
    admissionFeePaid: false,
    registrationComplete: false,
    isDeleted: false
  }).populate('course', 'name');
};

// Get registration statistics
studentSchema.statics.getRegistrationStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$registrationStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const total = await this.countDocuments({ isDeleted: false });
  const completed = await this.countDocuments({ registrationComplete: true });
  
  return {
    total,
    completed,
    completionRate: total > 0 ? (completed / total * 100).toFixed(2) : 0,
    byStatus: stats
  };
};


// ==================== INDEXES ====================

studentSchema.index({ enrollmentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ registrationStatus: 1 });
studentSchema.index({ admissionFeePaid: 1 });
studentSchema.index({ emailVerified: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;