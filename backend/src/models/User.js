import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
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
  
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'teacher'],
    required: true,
    default: 'teacher'
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  profileImage: {
    type: String,
    default: ''
  },
  
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  
  dateOfBirth: {
    type: Date
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  
  // Teacher Specific Fields
  teacherDetails: {
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    specialization: [{ type: String }],
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, default: 0 },
    salaryType: {
      type: String,
      enum: ['fixed', 'hourly', 'monthly'],
      default: 'monthly'
    }
  },
  
  // Admin Specific Fields
  adminDetails: {
    permissions: [{
      type: String,
      enum: [
        'manage_students',
        'manage_teachers',
        'manage_courses',
        'manage_batches',
        'manage_fees',
        'manage_certificates',
        'view_reports',
        'manage_inquiries'
      ]
    }],
    department: { type: String, default: 'administration' }
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
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
  
  isDeleted: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get role display name
userSchema.methods.getRoleDisplay = function() {
  const roleMap = {
    super_admin: 'Super Administrator',
    admin: 'Administrator',
    teacher: 'Teacher'
  };
  return roleMap[this.role] || this.role;
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.pincode,
    this.address.country
  ].filter(part => part);
  return parts.join(', ');
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);
export default User;