import mongoose from 'mongoose';

// Payment Schema
const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentDate: {
    type: Date,
    default: Date.now
  },
  
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'online'],
    required: true
  },
  
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  receiptNo: {
    type: String,
    unique: true,
    sparse: true
  },
  
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'cash', 'bank', 'upi'],
    default: 'cash'
  },
  
  gatewayOrderId: {
    type: String,
    trim: true
  },
  
  gatewayPaymentId: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['success', 'pending', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentType: {
    type: String,
    enum: ['admission_fee', 'installment', 'late_fee', 'full_payment'],
    default: 'installment'
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  installmentNumber: {
    type: Number,
    default: null
  },
  
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Installment Schema
const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partially_paid'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: {
    type: Date
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'online'],
    default: 'cash'
  }
});

// Discount Schema
const discountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  value: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Main Fee Schema
const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Admission Fee (Separate and mandatory)
  admissionFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  admissionFeePaid: {
    type: Boolean,
    default: false
  },
  
  admissionFeePaidDate: {
    type: Date
  },
  
  admissionFeePaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee.payments'
  },
  
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    trim: true,
    sparse: true
  },
  
  razorpayPaymentId: {
    type: String,
    trim: true,
    sparse: true
  },
  
  // Course Fee
  courseFee: {
    type: Number,
    required: true,
    min: 0
  },
  
  totalFees: {
    type: Number,
    required: true,
    min: 0
  },
  
  discountedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discount: {
    type: discountSchema,
    default: () => ({})
  },
  
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lateFeeReason: {
    type: String,
    trim: true
  },
  
  netPayable: {
    type: Number,
    required: true
  },
  
  paidAmount: {
    type: Number,
    default: 0
  },
  
  pendingAmount: {
    type: Number,
    default: 0
  },
  
  dueDate: {
    type: Date
  },
  
  status: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid', 'overdue'],
    default: 'pending'
  },
  
  // Installment Plan
  installmentPlan: {
    isInstallment: { 
      type: Boolean, 
      default: false 
    },
    totalInstallments: { 
      type: Number, 
      default: 1,
      min: 1,
      max: 12
    },
    currentInstallment: { 
      type: Number, 
      default: 1 
    },
    installments: [installmentSchema]
  },
  
  payments: [paymentSchema],
  
  remarks: {
    type: String,
    trim: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Calculate net payable before save
feeSchema.pre('save', function(next) {
  // Calculate total fees (course fee + admission fee)
  this.totalFees = this.courseFee + this.admissionFee;
  
  // Calculate discounted amount
  let discountAmount = 0;
  if (this.discount && this.discount.value > 0) {
    if (this.discount.type === 'percentage') {
      discountAmount = (this.totalFees * this.discount.value) / 100;
    } else {
      discountAmount = this.discount.value;
    }
    this.discountedAmount = discountAmount;
    this.discount.amount = discountAmount;
  }
  
  // Calculate net payable
  this.netPayable = this.totalFees - discountAmount + (this.lateFee || 0);
  
  // Calculate pending amount
  this.pendingAmount = this.netPayable - this.paidAmount;
  
  // Update status
  if (this.paidAmount === 0) {
    this.status = 'pending';
  } else if (this.paidAmount >= this.netPayable) {
    this.status = 'paid';
  } else {
    this.status = 'partially_paid';
  }
  
  // Check for overdue
  if (this.dueDate && new Date() > this.dueDate && this.status !== 'paid') {
    this.status = 'overdue';
  }
  
  // Check if admission fee is paid
  if (this.admissionFee > 0) {
    const admissionPayment = this.payments.find(p => p.paymentType === 'admission_fee' && p.status === 'success');
    if (admissionPayment) {
      this.admissionFeePaid = true;
      this.admissionFeePaidDate = admissionPayment.paymentDate;
      this.admissionFeePaymentId = admissionPayment._id;
    } else {
      this.admissionFeePaid = false;
    }
  } else {
    this.admissionFeePaid = true; // No admission fee to pay
  }
  
  next();
});

// Generate receipt number for payments
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNo) {
    const Fee = mongoose.model('Fee');
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await Fee.countDocuments();
    this.receiptNo = `RCPT/${year}/${month}/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// ==================== METHODS ====================

// Method to pay admission fee with Razorpay
feeSchema.methods.payAdmissionFeeWithRazorpay = async function(paymentData) {
  if (this.admissionFeePaid) {
    throw new Error('Admission fee already paid');
  }
  
  if (this.admissionFee <= 0) {
    throw new Error('No admission fee required');
  }
  
  const payment = {
    amount: this.admissionFee,
    paymentMode: paymentData.paymentMode || 'online',
    transactionId: paymentData.transactionId,
    paymentDate: paymentData.paymentDate || new Date(),
    paymentType: 'admission_fee',
    notes: paymentData.notes,
    collectedBy: paymentData.collectedBy,
    gateway: paymentData.gateway || 'razorpay',
    gatewayOrderId: paymentData.gatewayOrderId,
    gatewayPaymentId: paymentData.gatewayPaymentId,
    status: paymentData.status || 'success'
  };
  
  this.payments.push(payment);
  this.paidAmount += this.admissionFee;
  this.razorpayOrderId = paymentData.gatewayOrderId;
  this.razorpayPaymentId = paymentData.gatewayPaymentId;
  
  await this.save();
  return payment;
};

// Method to make installment payment
feeSchema.methods.payInstallment = async function(installmentNumber, paymentData) {
  const installment = this.installmentPlan.installments.find(
    i => i.installmentNumber === installmentNumber
  );
  
  if (!installment) {
    throw new Error('Installment not found');
  }
  
  if (installment.status === 'paid') {
    throw new Error('Installment already paid');
  }
  
  const payment = {
    amount: paymentData.amount,
    paymentMode: paymentData.paymentMode,
    transactionId: paymentData.transactionId,
    paymentDate: paymentData.paymentDate || new Date(),
    paymentType: 'installment',
    notes: paymentData.notes,
    installmentNumber: installmentNumber,
    collectedBy: paymentData.collectedBy,
    gateway: paymentData.gateway,
    gatewayOrderId: paymentData.gatewayOrderId,
    gatewayPaymentId: paymentData.gatewayPaymentId,
    status: paymentData.status || 'success'
  };
  
  this.payments.push(payment);
  this.paidAmount += paymentData.amount;
  
  // Update installment
  installment.paidAmount += paymentData.amount;
  if (installment.paidAmount >= installment.amount) {
    installment.status = 'paid';
    installment.paidDate = payment.paymentDate;
    installment.transactionId = payment.transactionId;
    installment.paymentMode = payment.paymentMode;
  } else {
    installment.status = 'partially_paid';
  }
  
  await this.save();
  return payment;
};

// Method to make full payment
feeSchema.methods.makeFullPayment = async function(paymentData) {
  const remainingAmount = this.netPayable - this.paidAmount;
  
  if (remainingAmount <= 0) {
    throw new Error('No pending amount to pay');
  }
  
  const payment = {
    amount: remainingAmount,
    paymentMode: paymentData.paymentMode,
    transactionId: paymentData.transactionId,
    paymentDate: paymentData.paymentDate || new Date(),
    paymentType: 'full_payment',
    notes: paymentData.notes,
    collectedBy: paymentData.collectedBy,
    gateway: paymentData.gateway,
    gatewayOrderId: paymentData.gatewayOrderId,
    gatewayPaymentId: paymentData.gatewayPaymentId,
    status: paymentData.status || 'success'
  };
  
  this.payments.push(payment);
  this.paidAmount += remainingAmount;
  
  await this.save();
  return payment;
};

// Method to get admission fee status
feeSchema.methods.getAdmissionFeeStatus = function() {
  const admissionPayment = this.payments.find(p => p.paymentType === 'admission_fee');
  return {
    amount: this.admissionFee,
    isPaid: this.admissionFeePaid,
    paidDate: this.admissionFeePaidDate,
    pendingAmount: this.admissionFeePaid ? 0 : this.admissionFee,
    transactionId: admissionPayment?.transactionId,
    gatewayPaymentId: admissionPayment?.gatewayPaymentId,
    gatewayOrderId: admissionPayment?.gatewayOrderId,
    paymentDate: admissionPayment?.paymentDate,
    receiptNo: admissionPayment?.receiptNo
  };
};

// Method to get payment summary
feeSchema.methods.getPaymentSummary = function() {
  const admissionPayment = this.payments.find(p => p.paymentType === 'admission_fee');
  const installmentPayments = this.payments.filter(p => p.paymentType === 'installment');
  
  return {
    totalFees: this.totalFees,
    courseFee: this.courseFee,
    admissionFee: this.admissionFee,
    discount: this.discountedAmount,
    lateFee: this.lateFee,
    netPayable: this.netPayable,
    paidAmount: this.paidAmount,
    pendingAmount: this.pendingAmount,
    admissionFeePaid: this.admissionFeePaid,
    admissionFeePaidDate: this.admissionFeePaidDate,
    admissionFeeTransactionId: admissionPayment?.transactionId,
    paidPercentage: ((this.paidAmount / this.netPayable) * 100).toFixed(2),
    installmentsPaid: this.installmentPlan.installments.filter(i => i.status === 'paid').length,
    totalInstallments: this.installmentPlan.totalInstallments,
    nextDueDate: this.getNextDueDate(),
    status: this.status
  };
};

// Method to get next due date
feeSchema.methods.getNextDueDate = function() {
  if (this.installmentPlan.isInstallment) {
    const nextInstallment = this.installmentPlan.installments.find(
      i => i.status === 'pending' || i.status === 'overdue'
    );
    return nextInstallment?.dueDate || null;
  }
  return this.dueDate;
};

// ==================== STATIC METHODS ====================

// Create fee record during registration
feeSchema.statics.createRegistrationFee = async function(studentId, courseId, admissionFee, createdBy) {
  const fee = new this({
    studentId,
    courseId,
    admissionFee: admissionFee,
    courseFee: 0,
    totalFees: admissionFee,
    netPayable: admissionFee,
    paidAmount: 0,
    pendingAmount: admissionFee,
    status: 'pending',
    createdBy,
    installmentPlan: {
      isInstallment: false,
      totalInstallments: 1,
      currentInstallment: 1,
      installments: []
    }
  });
  
  await fee.save();
  return fee;
};

feeSchema.pre('save', function(next) {
  if (!this.studentId) {
    return next(new Error('studentId is required!'));
  }
  next();
});

// Update course fee after course selection
feeSchema.statics.updateCourseFee = async function(feeId, courseFee, installmentPlan = null) {
  const fee = await this.findById(feeId);
  if (!fee) throw new Error('Fee record not found');
  
  fee.courseFee = courseFee;
  fee.totalFees = fee.admissionFee + courseFee;
  fee.netPayable = fee.totalFees - fee.discountedAmount;
  fee.pendingAmount = fee.netPayable - fee.paidAmount;
  
  if (installmentPlan) {
    fee.installmentPlan = installmentPlan;
  }
  
  await fee.save();
  return fee;
};

// Get fee summary for dashboard
feeSchema.statics.getFeeSummary = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFees: { $sum: '$totalFees' },
        totalPaid: { $sum: '$paidAmount' },
        totalPending: { $sum: '$pendingAmount' },
        totalAdmissionFee: { $sum: '$admissionFee' },
        totalAdmissionFeePaid: { 
          $sum: { 
            $cond: [{ $eq: ['$admissionFeePaid', true] }, '$admissionFee', 0] 
          } 
        },
        totalCourseFee: { $sum: '$courseFee' },
        totalDiscount: { $sum: '$discountedAmount' },
        totalLateFee: { $sum: '$lateFee' },
        admissionFeePaidCount: {
          $sum: { $cond: [{ $eq: ['$admissionFeePaid', true] }, 1, 0] }
        },
        admissionFeePendingCount: {
          $sum: { $cond: [{ $eq: ['$admissionFeePaid', false] }, 1, 0] }
        },
        overdueCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'overdue'] },
                  { $gt: ['$pendingAmount', 0] }
                ] 
              },
              1,
              0
            ]
          }
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        partialCount: {
          $sum: { $cond: [{ $eq: ['$status', 'partially_paid'] }, 1, 0] }
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);
  
  const summary = result[0] || {
    totalFees: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAdmissionFee: 0,
    totalAdmissionFeePaid: 0,
    totalCourseFee: 0,
    totalDiscount: 0,
    totalLateFee: 0,
    admissionFeePaidCount: 0,
    admissionFeePendingCount: 0,
    overdueCount: 0,
    paidCount: 0,
    partialCount: 0,
    pendingCount: 0
  };
  
  summary.collectionRate = summary.totalFees > 0 
    ? ((summary.totalPaid / summary.totalFees) * 100).toFixed(2) 
    : 0;
  
  summary.admissionFeeCollectionRate = summary.totalAdmissionFee > 0
    ? ((summary.totalAdmissionFeePaid / summary.totalAdmissionFee) * 100).toFixed(2)
    : 0;
  
  return summary;
};

// Get pending admission fees
feeSchema.statics.getPendingAdmissionFees = async function() {
  return await this.find({
    admissionFeePaid: false,
    admissionFee: { $gt: 0 }
  })
  .populate('studentId', 'name email phone')
  .sort({ createdAt: -1 });
};

// Get fee by student
feeSchema.statics.getFeeByStudent = async function(studentId) {
  return await this.findOne({ studentId })
    .populate('courseId', 'name duration')
    .populate('payments.collectedBy', 'name email');
};

// Get overdue fees
feeSchema.statics.getOverdueFees = async function() {
  return await this.find({
    status: 'overdue',
    pendingAmount: { $gt: 0 }
  })
  .populate('studentId', 'name email phone')
  .sort({ dueDate: 1 });
};

// Indexes for better performance
feeSchema.index({ studentId: 1, status: 1 });
feeSchema.index({ courseId: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ 'payments.receiptNo': 1 });
feeSchema.index({ admissionFeePaid: 1 });
feeSchema.index({ createdAt: -1 });
feeSchema.index({ razorpayOrderId: 1 });
feeSchema.index({ razorpayPaymentId: 1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;