import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// ============================================================
// CREATE – Add a new fee record
// ============================================================
export const createFee = async (req, res) => {
  try {
    const { student, course, registrationFee, courseFee, paidAmount, discount } = req.body;

    // Check if student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if fee record already exists for this student + course
    const existing = await Fee.findOne({ student, course });
    if (existing) {
      return res.status(400).json({
        message: 'Fee record already exists for this student and course. Use update instead.',
      });
    }

    const fee = new Fee({
      student,
      course,
      registrationFee: registrationFee || 0,
      courseFee: courseFee || 0,
      paidAmount: paidAmount || 0,
      discount: discount || 0,
    });

    await fee.save();

    // Populate references
    await fee.populate('student', 'name email mobile');
    await fee.populate('course', 'name code totalFees');

    res.status(201).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Server error while creating fee record' });
  }
};

// ============================================================
// READ ALL – Get all fee records (with filters & pagination)
// ============================================================
export const getAllFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, student, course } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (student) filter.student = student;
    if (course) filter.course = course;

    const fees = await Fee.find(filter)
      .populate('student', 'name email mobile createdAt')
      .populate('course', 'name code totalFees')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Fee.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: fees,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all fees error:', error);
    res.status(500).json({ message: 'Server error while fetching fee records' });
  }
};


// ============================================================
// UPDATE – Update fee record (partial update allowed)
// ============================================================
export const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating student/course if they exist – we can allow, but better to restrict
    // since it might break consistency. We'll allow only specific fields.
    const allowedUpdates = [
      'registrationFee',
      'courseFee',
      'paidAmount',
      'discount',
      'status',
    ];
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // If status is being set to 'overdue' or 'refunded', allow manual override.
    // For other statuses, we rely on auto-calculation.
    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Apply updates (Mongoose will trigger pre-save hooks)
    Object.assign(fee, filteredUpdates);
    await fee.save();

    await fee.populate('student', 'name email mobile');
    await fee.populate('course', 'name code totalFees');

    res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Server error while updating fee record' });
  }
};

// ============================================================
// DELETE – Remove fee record
// ============================================================
export const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({ message: 'Server error while deleting fee record' });
  }
};

// ============================================================
// EXTRA: MAKE A PAYMENT (add to paidAmount)
// ============================================================
export const makePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be a positive number' });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    await fee.makePayment(amount);
    await fee.populate('student', 'name email mobile');
    await fee.populate('course', 'name code totalFees');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: error.message || 'Server error while processing payment' });
  }
};

// ============================================================
// EXTRA: APPLY DISCOUNT
// ============================================================
export const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;

    if (discount === undefined || discount < 0) {
      return res.status(400).json({ message: 'Discount must be a non-negative number' });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    await fee.applyDiscount(discount);
    await fee.populate('student', 'name email mobile');
    await fee.populate('course', 'name code totalFees');

    res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Discount error:', error);
    res.status(500).json({ message: error.message || 'Server error while applying discount' });
  }
};

// ============================================================
// EXTRA: GET OUTSTANDING FEES (all with remaining > 0)
// ============================================================
export const getOutstandingFees = async (req, res) => {
  try {
    const fees = await Fee.find({ remainingAmount: { $gt: 0 } })
      .populate('student', 'name email mobile')
      .populate('course', 'name code totalFees')
      .sort({ remainingAmount: -1 });

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    console.error('Outstanding fees error:', error);
    res.status(500).json({ message: 'Server error while fetching outstanding fees' });
  }
};

// ============================================================
// EXTRA: GET TOTAL FEES SUMMARY FOR A STUDENT
// ============================================================
export const getStudentFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    // ✅ Use aggregation – handles empty result gracefully
    const result = await Fee.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: null,
          totalFeeSum: { $sum: '$totalFee' },
          paidSum: { $sum: '$paidAmount' },
          remainingSum: { $sum: '$remainingAmount' },
        },
      },
    ]);

    let summary = {
      totalFee: 0,
      paidAmount: 0,
      remaining: 0,
      status: 'pending',
    };

    if (result.length > 0) {
      summary.totalFee = result[0].totalFeeSum || 0;
      summary.paidAmount = result[0].paidSum || 0;
      summary.remaining = result[0].remainingSum || 0;
      if (summary.remaining === 0 && summary.totalFee > 0) summary.status = 'paid';
      else if (summary.paidAmount > 0 && summary.remaining > 0) summary.status = 'partial';
    }

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Student fee summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};