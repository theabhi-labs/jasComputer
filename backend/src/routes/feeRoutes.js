// backend/routes/feeRoutes.js
import express from 'express';
import feeController from '../controllers/feeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ✅ Test route
router.post('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ success: true, message: 'Test route working' });
});

// ==================== PUBLIC ROUTES (No auth required) ====================
// None for fees - all fee routes require authentication

// ==================== PROTECTED ROUTES ====================
router.use(protect);

// ==================== REGISTRATION FLOW ROUTES ====================

// Create registration fee (Step 1 - After personal info)
router.post('/registration', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.createRegistrationFee
);

// Update course fee (Step 2 - After course selection)
router.put('/student/:studentId/course-fee', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.updateCourseFee
);


// Verify and complete payment (After Razorpay callback)
router.post('/verify-payment', 
  feeController.verifyAndCompletePayment
);

// Get pending admission fees (For admin dashboard)
router.get('/pending-admission', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.getPendingAdmissionFees
);


router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.createFeeRecord.bind(feeController)
);

router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  feeController.getAllFees
);

router.get('/summary', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.getFeeSummary
);

router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  feeController.getFeeById
);

router.get('/student/:studentId', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), 
  feeController.getFeeByStudent
);

// Get payment history
router.get('/student/:studentId/payments', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), 
  feeController.getPaymentHistory
);

// Get receipt by receipt number
router.get('/receipt/:receiptNo', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT), 
  feeController.getReceipt
);

// Generate invoice for student
router.get('/student/:studentId/invoice', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT), 
  feeController.generateInvoice
);

// ==================== PAYMENT ROUTES ====================

// Make payment (General payment - cash/offline)
router.post('/student/:studentId/payment', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.makePayment
);

// Pay admission fee (Offline/Cash)
router.post('/student/:studentId/pay-admission', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.payAdmissionFee
);

router.put('/student/:studentId/installment', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.addInstallmentPlan
);

// Pay installment
router.post('/student/:studentId/pay-installment', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.payInstallment
);

// Update installment details
router.put('/student/:studentId/installment/:installmentNumber', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.updateInstallment
);

// ==================== REPORTING ROUTES ====================

// Get overdue fees
router.get('/overdue', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.getOverdueFees
);

// Get collection report (Date range filter)
router.get('/collection-report', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.getCollectionReport
);

// ==================== NOTIFICATION ROUTES ====================

// Send fee reminder (Email/SMS)
router.post('/student/:studentId/reminder', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  feeController.sendFeeReminder
);

export default router;