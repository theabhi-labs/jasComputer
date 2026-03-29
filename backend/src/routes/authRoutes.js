import express from 'express';

// ✅ DIRECT import (BEST FIX)
import authController from '../controllers/authController.js';
import studentController from '../controllers/studentController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

console.log(authController);

import { 
  validateLogin, 
  validateStudentRegistration, 
  validateUserRegistration,
  validateOTP,
  validatePasswordReset,
  validateChangePassword,
  validate 
} from '../middleware/validationMiddleware.js';

import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ==================== 5-STEP REGISTRATION FLOW ====================



// Step 1: Personal info registration
router.post('/register/step1', 
  validateStudentRegistration, 
  validate, 
  authController.registerStudentStep1
);

// Step 2: Update course selection
router.put('/register/:studentId/course', 
  authController.updateStudentCourse
);

// Step 3: Update document upload
router.put('/register/:studentId/documents', 
  authController.updateStudentDocuments
);

// Step 4: Email verification
router.post('/register/:studentId/send-otp', 
  authController.sendEmailOTP
);

router.post('/register/:studentId/verify-email', 
  validateOTP,
  validate,
  authController.verifyEmailStep4
);

// Step 5: Complete registration after payment
router.post('/register/:studentId/complete', 
  authController.completeRegistrationStep5
);

// Get registration progress
router.get('/register/:studentId/progress', 
  studentController.getRegistrationProgress
);

// ==================== PUBLIC ROUTES ====================

// User (Admin/Teacher) login
router.post('/login', validateLogin, validate, authController.loginUser);

// Student auth (legacy)
// router.post('/student/register', validateStudentRegistration, validate, authController.registerStudent);
router.post('/student/login', validateLogin, validate, authController.loginStudent);

// Email verification (legacy)
router.post('/verify-email', validateOTP, validate, authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationOTP);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validatePasswordReset, validate, authController.resetPassword);

// ==================== PRIVATE ROUTES ====================

// Change password
router.post('/change-password', protect, validateChangePassword, validate, authController.changePassword);

// Logout
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getMe);

// Super Admin only
router.post('/register', 
  protect, 
  authorize(ROLES.SUPER_ADMIN), 
  validateUserRegistration, 
  validate, 
  authController.registerUser
);

export default router;