// src/middleware/validationMiddleware.js
import { body, validationResult, param } from 'express-validator';

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

// Validation rules for student registration (Step 1 - Personal Info)
export const validateStudentRegistration = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  
  body('fatherName')
    .notEmpty().withMessage("Father's name is required"),
  
  body('address.street')
    .notEmpty().withMessage('Street address is required'),
  
  body('address.city')
    .notEmpty().withMessage('City is required'),
  
  body('address.state')
    .notEmpty().withMessage('State is required'),
  
  body('address.pincode')
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Please enter a valid date'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
];

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

// Validation for document upload (Step 3)
export const validateDocumentUpload = [
  body('documents')
    .optional()
    .isObject().withMessage('Documents must be an object'),
  
  body('documents.photo')
    .optional()
    .isURL().withMessage('Photo URL must be valid'),
  
  body('documents.aadharCard')
    .optional()
    .isURL().withMessage('Aadhar card URL must be valid'),
  
  body('documents.marksheet10th')
    .optional()
    .isURL().withMessage('10th marksheet URL must be valid'),
  
  body('documents.marksheet12th')
    .optional()
    .isURL().withMessage('12th marksheet URL must be valid'),
  
  body('documents.transferCertificate')
    .optional()
    .isURL().withMessage('Transfer certificate URL must be valid'),
  
  body('documents.casteCertificate')
    .optional()
    .isURL().withMessage('Caste certificate URL must be valid')
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

// Validation for Razorpay webhook
export const validateRazorpayWebhook = [
  body('event')
    .notEmpty().withMessage('Event is required'),
  
  body('payload')
    .notEmpty().withMessage('Payload is required'),
  
  body('payload.payment.entity.id')
    .optional(),
  
  body('payload.payment.entity.order_id')
    .optional()
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

// ==================== FEE VALIDATIONS ====================

// Validation for creating fee record
export const validateCreateFee = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID format'),
  
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID format'),
  
  body('admissionFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Admission fee must be a positive number'),
  
  body('courseFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Course fee must be a positive number'),
  
  body('totalFees')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total fees must be a positive number')
];

// Validation for making payment
export const validateMakePayment = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  
  body('paymentMode')
    .notEmpty().withMessage('Payment mode is required')
    .isIn(['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'online']).withMessage('Invalid payment mode'),
  
  body('transactionId')
    .optional()
    .isString().withMessage('Transaction ID must be a string'),
  
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
];

// Validation for installment payment
export const validateInstallmentPayment = [
  body('installmentNumber')
    .notEmpty().withMessage('Installment number is required')
    .isInt({ min: 1 }).withMessage('Installment number must be a positive integer'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  
  body('paymentMode')
    .notEmpty().withMessage('Payment mode is required')
    .isIn(['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'online']).withMessage('Invalid payment mode')
];

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
  validateStudentRegistration,
  validateCourseSelection,
  validateDocumentUpload,
  validateOTPVerification,
  validatePaymentCompletion,
  validateAdmissionFeePayment,
  validateRazorpayWebhook,
  
  // Parameter validations
  validateStudentIdParam,
  validateIdParam,
  validateEnrollmentIdParam,
  
  // Fee validations
  validateCreateFee,
  validateMakePayment,
  validateInstallmentPayment,
  
  // User validations
  validateUserRegistration,
  validateLogin,
  validateOTP,
  validatePasswordReset,
  validateChangePassword,
  
  // Validation handler
  validate
};