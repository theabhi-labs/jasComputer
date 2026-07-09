import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    registrationFee: {
      type: Number,
      required: [true, 'Registration fee is required'],
      min: [0, 'Registration fee cannot be negative'],
      default: 0,
    },
    courseFee: {
      type: Number,
      required: [true, 'Course fee is required'],
      min: [0, 'Course fee cannot be negative'],
      default: 0,
    },
    totalFee: {
      type: Number,
      min: [0, 'Total fee cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Remaining amount cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function(value) {
          // Discount cannot exceed total fee (registration + course fee)
          const total = this.registrationFee + this.courseFee;
          return value <= total;
        },
        message: 'Discount cannot exceed total fee (registration + course)',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ----- Pre-save: calculate totalFee, remainingAmount, and status -----
feeSchema.pre('save', function(next) {
  // Calculate totalFee after discount
  this.totalFee = this.registrationFee + this.courseFee - this.discount;
  if (this.totalFee < 0) this.totalFee = 0; // safety

  // Calculate remaining amount
  this.remainingAmount = this.totalFee - this.paidAmount;
  if (this.remainingAmount < 0) this.remainingAmount = 0;

  // Auto-set status based on payment
  if (this.paidAmount === 0) {
    this.status = 'pending';
  } else if (this.paidAmount >= this.totalFee) {
    this.status = 'paid';
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalFee) {
    this.status = 'partial';
  }
  // Overdue can be set manually or via cron job later

  next();
});

// ----- Instance methods -----
feeSchema.methods.makePayment = function(amount) {
  if (amount <= 0) throw new Error('Payment amount must be positive');
  this.paidAmount += amount;
  if (this.paidAmount > this.totalFee) {
    // Option: allow overpayment? We can cap it.
    this.paidAmount = this.totalFee;
  }
  // Remaining and status will be recalculated in pre-save, but we need to call save manually.
  return this.save();
};

feeSchema.methods.applyDiscount = function(discountAmount) {
  if (discountAmount < 0) throw new Error('Discount cannot be negative');
  this.discount = discountAmount;
  return this.save();
};

// ----- Static methods -----
feeSchema.statics.getTotalFeesByStudent = async function(studentId) {
  const result = await this.aggregate([
    { $match: { student: mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: null,
        totalFeeSum: { $sum: '$totalFee' },
        paidSum: { $sum: '$paidAmount' },
        remainingSum: { $sum: '$remainingAmount' },
      },
    },
  ]);
  return result.length > 0 ? result[0] : { totalFeeSum: 0, paidSum: 0, remainingSum: 0 };
};

feeSchema.statics.getOutstandingFees = function() {
  return this.find({ remainingAmount: { $gt: 0 } })
    .populate('student', 'name email mobile')
    .populate('course', 'name code');
};

feeSchema.pre('validate', function(next) {

  if (this.isModified('status') && this.status === 'refunded') {
    // Allow manual refunded status
  } else {
    if (this.paidAmount === 0) {
      this.status = 'pending';
    } else if (this.paidAmount >= this.totalFee) {
      this.status = 'paid';
    } else if (this.paidAmount > 0 && this.paidAmount < this.totalFee) {
      this.status = 'partial';
    }
  }

  next();
});

// ----- Indexes for performance -----
feeSchema.index({ student: 1, course: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ remainingAmount: 1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;