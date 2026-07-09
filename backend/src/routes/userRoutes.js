import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createFee,
  getAllFees,
  updateFee,
  deleteFee,
  makePayment,
  applyDiscount,
  getOutstandingFees,
  getStudentFeeSummary,
} from '../controllers/feeController.js';

import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFeeTransactionSummary,
  getStudentTransactions,
} from '../controllers/feeTransactionController.js';

import { validateFeeCreate, validateFeeUpdate , validateTransactionCreate, validateTransactionUpdate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Protected admin-only route
router.get('/admin/dashboard', protect, admin, (req, res) => {
  res.json({ message: 'Welcome admin!', user: req.user });
});


router.post('/fees', validateFeeCreate, createFee);
router.get('/fees', getAllFees);
router.get('/fees/outstanding', getOutstandingFees);
router.get('/fees/student/:studentId/summary', getStudentFeeSummary);
router.put('/fees/:id', validateFeeUpdate, updateFee);
router.delete('/fees/:id', deleteFee);

// Payment and discount operations
router.patch('/fees/:id/payment', makePayment);
router.patch('/fees/:id/discount', applyDiscount);

// Fee transaction management (admin-only)
router.post('/transactions', validateTransactionCreate, createTransaction);
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id', validateTransactionUpdate, updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Extra summary endpoints
router.get('/transactions/fee/:feeId/summary', getFeeTransactionSummary);
router.get('/transactions/student/:studentId', getStudentTransactions);

export default router;