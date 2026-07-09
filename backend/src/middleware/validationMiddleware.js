// src/middleware/validationMiddleware.js
import { body, validationResult, param } from 'express-validator';
import Joi from 'joi';

// ==================== EXISTING VALIDATIONS ====================

// Validation rules for user registration
export const validateUserRegistration = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'teacher']).withMessage('Role must be either admin or teacher')
];


// Student creation schema
const studentCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  fatherName: Joi.string().min(2).max(100).required(),
  motherName: Joi.string().min(2).max(100).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  alternateMobile: Joi.string().pattern(/^[0-9]{10}$/).allow(''),
  email: Joi.string().email().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dob: Joi.date().iso().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
  photo: Joi.string().uri().allow(''),
  aadharNo: Joi.string().pattern(/^[0-9]{12}$/).required(),
  admissionDate: Joi.date().iso(),
  course: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(), // MongoDB ObjectId
  status: Joi.string().valid('active', 'inactive', 'suspended', 'graduated', 'dropped'),
  documents: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
    })
  ),
});

// Student update schema (all fields optional)
const studentUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  fatherName: Joi.string().min(2).max(100),
  motherName: Joi.string().min(2).max(100),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  alternateMobile: Joi.string().pattern(/^[0-9]{10}$/).allow(''),
  email: Joi.string().email(),
  gender: Joi.string().valid('Male', 'Female', 'Other'),
  dob: Joi.date().iso(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/),
  photo: Joi.string().uri().allow(''),
  aadharNo: Joi.string().pattern(/^[0-9]{12}$/),
  admissionDate: Joi.date().iso(),
  course: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'graduated', 'dropped'),
  documents: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
    })
  ),
}).min(1); // at least one field to update

// Middleware wrappers
export const validateStudentCreate = (req, res, next) => {
  const { error } = studentCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateStudentUpdate = (req, res, next) => {
  const { error } = studentUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
// ==================== NEW VALIDATIONS FOR REGISTRATION FLOW ====================

// Validation for course selection (Step 2)
export const validateCourseSelection = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID format'),
  
  body('batchId')
    .optional()
    .isMongoId().withMessage('Invalid batch ID format')
];


// Validation for OTP verification (Step 4)
export const validateOTPVerification = [
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits')
];

// Validation for payment completion (Step 5)
export const validatePaymentCompletion = [
  body('paymentData')
    .optional()
    .isObject().withMessage('Payment data must be an object'),
  
  body('paymentData.orderId')
    .optional()
    .notEmpty().withMessage('Order ID cannot be empty'),
  
  body('paymentData.paymentId')
    .optional()
    .notEmpty().withMessage('Payment ID cannot be empty'),
  
  body('paymentData.transactionId')
    .optional()
    .notEmpty().withMessage('Transaction ID cannot be empty')
];

// Validation for admission fee payment with Razorpay
export const validateAdmissionFeePayment = [
  body('transactionId')
    .notEmpty().withMessage('Transaction ID is required'),
  
  body('gatewayOrderId')
    .notEmpty().withMessage('Gateway order ID is required'),
  
  body('gatewayPaymentId')
    .notEmpty().withMessage('Gateway payment ID is required'),
  
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
];


// ==================== PARAMETER VALIDATIONS ====================

// Validation for student ID parameter
export const validateStudentIdParam = [
  param('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID format')
];

// Validation for ID parameter
export const validateIdParam = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

// Validation for enrollment ID parameter
export const validateEnrollmentIdParam = [
  param('enrollmentId')
    .notEmpty().withMessage('Enrollment ID is required')
    .matches(/^ENR\/\d{4}\/\d{5}$/).withMessage('Invalid enrollment ID format')
];



// Add to existing validation file

export const transactionCreateSchema = Joi.object({
  fee: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  student: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  amount: Joi.number().positive().required(),
  paymentMode: Joi.string().valid('Cash', 'Bank Transfer', 'UPI', 'Card', 'Cheque', 'Online', 'Other').required(),
  paymentDate: Joi.date().iso(),
  remark: Joi.string().max(500).allow(''),
});

export const transactionUpdateSchema = Joi.object({
  amount: Joi.number().positive(),
  paymentMode: Joi.string().valid('Cash', 'Bank Transfer', 'UPI', 'Card', 'Cheque', 'Online', 'Other'),
  paymentDate: Joi.date().iso(),
  remark: Joi.string().max(500).allow(''),
}).min(1);

// Middleware wrappers
export const validateTransactionCreate = (req, res, next) => {
  const { error } = transactionCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export const validateTransactionUpdate = (req, res, next) => {
  const { error } = transactionUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// ==================== FEE VALIDATIONS ====================



export const feeCreateSchema = Joi.object({
  student: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  course: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  registrationFee: Joi.number().min(0).default(0),
  courseFee: Joi.number().min(0).required(),
  paidAmount: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
});

export const feeUpdateSchema = Joi.object({
  registrationFee: Joi.number().min(0),
  courseFee: Joi.number().min(0),
  paidAmount: Joi.number().min(0),
  discount: Joi.number().min(0),
  status: Joi.string().valid('pending', 'partial', 'paid', 'overdue', 'refunded'),
}).min(1);


// Middleware wrappers (already in validation file)
export const validateFeeCreate = (req, res, next) => {
  const { error } = feeCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export const validateFeeUpdate = (req, res, next) => {
  const { error } = feeUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// ==================== EXISTING VALIDATIONS ====================

// Validation rules for login
export const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation rules for OTP (general)
export const validateOTP = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits'),
  
  body('userType')
    .optional()
    .isIn(['user', 'student']).withMessage('userType must be user or student')
];

// Validation rules for password reset
export const validatePasswordReset = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('userType')
    .optional()
    .isIn(['user', 'student']).withMessage('userType must be user or student')
];

// Validation rules for change password
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('New password must contain at least one letter and one number')
];

// ==================== VALIDATION RESULT HANDLER ====================

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// ==================== EXPORT ALL VALIDATIONS ====================

// Default export for convenience
export default {
  // Registration flow validations
  validateCourseSelection,
  validateOTPVerification,
  validatePaymentCompletion,
  validateAdmissionFeePayment,
  
  // Parameter validations
  validateStudentIdParam,
  validateIdParam,
  validateEnrollmentIdParam,
  
  // User validations
  validateUserRegistration,
  validateLogin,
  validateOTP,
  validatePasswordReset,
  validateChangePassword,
  
  // Validation handler
  validate
};