import FeeTransaction from '../models/FeeTransaction.js';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

// ============================================================
// CREATE – Add a new transaction (payment)
// ============================================================
export const createTransaction = async (req, res) => {
  try {
    const { fee, student, amount, paymentMode, paymentDate, remark } = req.body;

    // Check if fee record exists
    const feeRecord = await Fee.findById(fee);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Check if student exists
    const studentRecord = await Student.findById(student);
    if (!studentRecord) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure the student matches the fee's student
    if (feeRecord.student.toString() !== student) {
      return res.status(400).json({
        message: 'Student does not match the fee record',
      });
    }

    // Create transaction – WITHOUT receivedBy
    const transaction = new FeeTransaction({
      fee,
      student,
      amount,
      paymentMode,
      paymentDate: paymentDate || Date.now(),
      remark: remark || '',
    });

    await transaction.save();
    await transaction.populate('fee', 'totalFee paidAmount remainingAmount status');
    await transaction.populate('student', 'name email mobile');

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error while creating transaction' });
  }
};

// ============================================================
// READ ALL – Get all transactions (with filters & pagination)
// ============================================================
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, student, fee, paymentMode, startDate, endDate } = req.query;

    const filter = {};
    if (student) filter.student = student;
    if (fee) filter.fee = fee;
    if (paymentMode) filter.paymentMode = paymentMode;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const transactions = await FeeTransaction.find(filter)
      .populate('fee', 'totalFee paidAmount remainingAmount status')
      .populate('student', 'name email mobile')
      // ❌ REMOVE this line:
      // .populate('receivedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });

    const total = await FeeTransaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

// ============================================================
// READ ONE – Get transaction by ID
// ============================================================
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await FeeTransaction.findById(id)
      .populate('fee', 'totalFee paidAmount remainingAmount status')
      .populate('student', 'name email mobile address')
      // ❌ REMOVE this line:
      // .populate('receivedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error while fetching transaction' });
  }
};

// ============================================================
// UPDATE – Update transaction (allowed fields only)
// ============================================================
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields
    const allowedUpdates = [
      'amount',
      'paymentMode',
      'paymentDate',
      'remark'
    ];

    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Find transaction
    const transaction = await FeeTransaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update allowed fields
    Object.assign(transaction, filteredUpdates);

    await transaction.save();

    // Populate only existing relations
    await transaction.populate([
      {
        path: 'fee',
        select: 'totalFee paidAmount remainingAmount status'
      },
      {
        path: 'student',
        select: 'name email mobile'
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
};

// ============================================================
// DELETE – Remove transaction (triggers fee recalculation via pre-remove hook)
// ============================================================
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await FeeTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne(); // pre-deleteOne hook will update fee

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error while deleting transaction' });
  }
};

// ============================================================
// EXTRA: Get summary of transactions for a fee
// ============================================================
export const getFeeTransactionSummary = async (req, res) => {
  try {
    const { feeId } = req.params;

    const summary = await FeeTransaction.getFeeTransactionSummary(feeId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Transaction summary error:', error);
    res.status(500).json({ message: 'Server error while fetching transaction summary' });
  }
};

// ============================================================
// EXTRA: Get all transactions for a student (with pagination)
// ============================================================

export const getStudentTransactions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // ✅ Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // ✅ Optional: check if student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const filter = { student: studentId };

    const transactions = await FeeTransaction.find(filter)
      .populate('fee', 'totalFee paidAmount remainingAmount status')
      // ❌ REMOVE this line:
      // .populate('receivedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });

    const total = await FeeTransaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Student transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching student transactions' });
  }
};