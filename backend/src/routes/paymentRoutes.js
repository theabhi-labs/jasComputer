// routes/paymentRoutes.js
import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Webhook endpoint (no auth required - Razorpay callback)
router.post('/webhook', paymentController.razorpayWebhook);

// ==================== PROTECTED ROUTES ====================

// Create Razorpay order for admission fee
router.post('/create-order', protect, paymentController.createAdmissionFeeOrder);

// Verify payment after successful transaction
router.post('/verify', protect, paymentController.verifyPayment);

// Get payment status for a student
router.get('/status/:studentId', protect, paymentController.getPaymentStatus);

// Get payment details by transaction ID
router.get('/transaction/:transactionId', protect, paymentController.getPaymentByTransactionId);

// Get all payments for a student
router.get('/student/:studentId', protect, paymentController.getStudentPayments);

// Get payment receipt by receipt number
router.get('/receipt/:receiptNo', protect, paymentController.getReceiptByReceiptNo);

// Get payment summary for dashboard
router.get('/summary', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.getPaymentSummary);

// Get payment collection report
router.get('/collection-report', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.getCollectionReport);

// Refund payment
router.post('/refund/:paymentId', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.refundPayment);

// Get Razorpay payment details
router.get('/razorpay/:paymentId', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.getRazorpayPaymentDetails);

// ==================== ADMIN ONLY ROUTES ====================

// Get all payments (admin only)
router.get('/all', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.getAllPayments);

// Get pending payments
router.get('/pending', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.getPendingPayments);

// Mark payment as failed
router.post('/:paymentId/fail', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), paymentController.markPaymentAsFailed);

export default router;