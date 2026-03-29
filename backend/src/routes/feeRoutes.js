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

router.use(protect);

// ==================== REGISTRATION FLOW ROUTES ====================
router.post('/registration',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.createRegistrationFee
);

router.post('/verify-payment',
  feeController.verifyAndCompletePayment
);

router.get('/pending-admission',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.getPendingAdmissionFees
);

// ==================== GENERAL FEE ROUTES ====================
router.post('/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.createFeeRecord.bind(feeController)
);

router.get('/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  feeController.getAllFees
);

// ✅ Static named routes BEFORE /:id
router.get('/summary',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.getFeeSummary
);

router.get('/overdue',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.getOverdueFees
);

router.get('/collection-report',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.getCollectionReport
);

// ==================== STUDENT-SPECIFIC ROUTES ====================
router.put('/student/:studentId/course-fee',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.updateCourseFee
);

router.get('/student/:studentId/payments',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  feeController.getPaymentHistory
);

router.get('/student/:studentId/invoice',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  feeController.generateInvoice
);

router.get('/student/:studentId',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  feeController.getFeeByStudent
);

router.post('/student/:studentId/payment',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.makePayment
);

router.post('/student/:studentId/pay-admission',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.payAdmissionFee
);

router.put('/student/:studentId/installment',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.addInstallmentPlan
);

router.post('/student/:studentId/pay-installment',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.payInstallment
);

router.put('/student/:studentId/installment/:installmentNumber',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.updateInstallment
);

// ==================== RECEIPT ====================
// ✅ Also before /:id
router.get('/receipt/:receiptNo',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  feeController.getReceipt
);

// ==================== NOTIFICATIONS ====================
router.post('/student/:studentId/reminder',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  feeController.sendFeeReminder
);

// ✅ /:id LAST — so it doesn't swallow named routes above
router.get('/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  feeController.getFeeById
);

export default router;