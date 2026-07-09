import mongoose from 'mongoose';

const feeTransactionSchema = new mongoose.Schema(
  {
    fee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fee',
      required: [true, 'Fee reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Card', 'Cheque', 'Online', 'Other'],
      required: [true, 'Payment mode is required'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [500, 'Remark cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Indexes
feeTransactionSchema.index({ fee: 1, paymentDate: -1 });
feeTransactionSchema.index({ student: 1, paymentDate: -1 });
feeTransactionSchema.index({ paymentMode: 1 });

// Post-save hook
feeTransactionSchema.post('save', async function(doc) {
  try {
    const Fee = mongoose.model('Fee');
    const feeRecord = await Fee.findById(doc.fee);
    if (!feeRecord) return;

    const FeeTransaction = mongoose.model('FeeTransaction');
    const result = await FeeTransaction.aggregate([
      { $match: { fee: doc.fee } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
    ]);

    const totalPaid = result.length > 0 ? result[0].totalPaid : 0;
    feeRecord.paidAmount = totalPaid;
    await feeRecord.save();
  } catch (error) {
    console.error('Error updating Fee after transaction save:', error);
  }
});

// Pre-deleteOne hook (runs on document.deleteOne())
feeTransactionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Fee = mongoose.model('Fee');
    const feeRecord = await Fee.findById(this.fee);
    if (!feeRecord) return next();

    const FeeTransaction = mongoose.model('FeeTransaction');
    const result = await FeeTransaction.aggregate([
      { $match: { fee: this.fee, _id: { $ne: this._id } } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
    ]);

    const totalPaid = result.length > 0 ? result[0].totalPaid : 0;
    feeRecord.paidAmount = totalPaid;
    await feeRecord.save();
    next();
  } catch (error) {
    console.error('Error updating Fee after transaction removal:', error);
    next(error);
  }
});

// ✅ STATIC METHOD – add this
feeTransactionSchema.statics.getFeeTransactionSummary = async function(feeId) {
  return this.aggregate([
    { $match: { fee: new mongoose.Types.ObjectId(feeId) } }, // ✅ add 'new'
    {
      $group: {
        _id: '$paymentMode',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        transactions: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        paymentMode: '$_id',
        totalAmount: 1,
        count: 1,
        transactions: { $slice: ['$transactions', 10] },
      },
    },
  ]);
};

const FeeTransaction = mongoose.model('FeeTransaction', feeTransactionSchema);
export default FeeTransaction;