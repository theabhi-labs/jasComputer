import express from 'express';
import { studentController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, checkTeacherOwnership } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { upload } from '../config/multer.js';
import { uploadSingle, uploadMultiple } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==================== REGISTRATION FLOW ROUTES ====================

// Create student registration (Step 1 - Personal info)
router.post('/registration', 
  studentController.createStudentRegistration
);

// Update student course (Step 2 - Course selection)
router.put('/:studentId/course', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.updateStudentCourse
);

// Update document upload status (Step 3 - Document upload)
router.put('/:studentId/documents', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.updateDocumentStatus
);

// Send email verification OTP (Step 4a)
router.post('/:studentId/send-otp', 
  studentController.sendEmailOTP
);

// Verify email OTP (Step 4b)
router.post('/:studentId/verify-email', 
  studentController.verifyStudentEmail
);

// Complete registration after payment (Step 5)
router.post('/:studentId/complete-registration', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.completeRegistration
);

// ==================== PROGRESS & TRACKING ROUTES ====================

// Get registration progress for a student
router.get('/:studentId/progress', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  checkTeacherOwnership('Student', 'studentId'),
  studentController.getRegistrationProgress
);

// Get students with pending admission fees
router.get('/pending-admission', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.getPendingAdmissionFees
);

// Get registration statistics
router.get('/stats/registration', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.getRegistrationStats
);

// ==================== ADMIN & SUPER ADMIN ROUTES ====================
router.post(
  '/:studentId/pay-admission',
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.payAdmissionFee
);

router.post(
  '/admin/students/register',
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.adminCreateStudent
);

router.post(
  '/admin/students/:studentId/upload-documents',
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'previousYearMarksheet', maxCount: 1 }
  ]),
  studentController.adminUploadDocuments
);


// Get all students (with pagination, filtering)
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  studentController.getAllStudents
);

// Get student statistics (overall stats)
router.get('/stats', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  studentController.getStudentStats
);

// Create new student (Admin direct creation)
router.post('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  uploadSingle('profilePhoto'),
  studentController.createStudent
);

// Bulk import students
router.post('/bulk-import', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.bulkImportStudents
);

// ==================== STUDENT BY ID ROUTES ====================

// Get single student
router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  checkTeacherOwnership('Student', 'id'),
  studentController.getStudentById
);

// Update student
router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  uploadSingle('profilePhoto'),
  studentController.updateStudent
);

// Change student status
router.patch('/:id/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.changeStudentStatus
);

// Assign batch to student
router.patch('/:id/assign-batch', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.assignBatch
);

// Delete student (soft delete)
router.delete('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.deleteStudent
);

// ==================== STUDENT BY ENROLLMENT ====================

// Get student by enrollment ID
router.get('/enrollment/:enrollmentId', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  studentController.getStudentByEnrollment
);

// ==================== DOCUMENT UPLOAD ROUTES ====================

// Upload multiple documents at once (Step 3)
router.post(
  '/:studentId/upload-documents',
  protect, // 🔥 missing tha, add this
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'previousYearMarksheet', maxCount: 1 }
]),
  studentController.uploadMultipleDocuments
);

// Upload student documents (Individual file uploads)
router.post('/:studentId/upload-photo', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  uploadSingle('photo'),
  studentController.uploadStudentPhoto
);


// ==================== FEE RELATED ROUTES ====================

// Get fee details for student
router.get('/:studentId/fee', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  studentController.getStudentFeeDetails
);

// Pay admission fee (Razorpay integration)
router.post('/:studentId/pay-admission', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  studentController.payAdmissionFee
);

// Verify Razorpay payment
router.post('/:studentId/verify-payment', 
  studentController.verifyPayment
);

// Get payment status
router.get('/:studentId/payment-status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  studentController.getPaymentStatus
);

// Refund admission fee (admin only)
router.post('/:studentId/refund-admission', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.refundAdmissionFee
);

// Verify payment
router.post('/:studentId/verify-payment', 
  studentController.verifyPayment
);

// Get payment history
router.get('/:studentId/payments', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  studentController.getPaymentHistory
);

// ==================== BATCH RELATED ROUTES ====================

// Get student's batch details
router.get('/:studentId/batch', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  studentController.getStudentBatch
);


// ==================== BATCH RELATED ROUTES ====================

// Get student's batch details
router.get('/:studentId/batch', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  studentController.getStudentBatch
);

// Get student's batch history
router.get('/:studentId/batch-history', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  studentController.getStudentBatchHistory
);

// ==================== ATTENDANCE RELATED ROUTES ====================

// Get student's attendance
router.get('/:studentId/attendance', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  studentController.getStudentAttendance
);

// Get attendance summary
router.get('/:studentId/attendance-summary', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  studentController.getAttendanceSummary
);

// Mark attendance (teacher/admin)
router.post('/:studentId/attendance', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  studentController.markAttendance
);

// ==================== ATTENDANCE RELATED ROUTES ====================

// Get student's attendance
router.get('/:studentId/attendance', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  studentController.getStudentAttendance
);

// ==================== EXPORT ====================

export default router;