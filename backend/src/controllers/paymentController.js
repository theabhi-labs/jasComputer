// controllers/paymentController.js
import { razorpayInstance } from '../config/razorpay.js';
import crypto from 'crypto';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Settings from '../models/Settings.js';
import BaseController from './baseController.js';
import { sendAdmissionFeeConfirmation, sendWelcomeEmail } from '../config/email.js';

class PaymentController extends BaseController {

  // Create Razorpay Order for Admission Fee
  createAdmissionFeeOrder = async (req, res) => {
    try {
      const { studentId } = req.body;

      // Get student details
      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Get fee record
      const fee = await Fee.findOne({ studentId });
      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      if (fee.admissionFeePaid) {
        return this.error(res, 'Admission fee already paid', 400);
      }

      // Get admission fee from settings
      const admissionFee = await this.getAdmissionFee();

      const options = {
        amount: admissionFee * 100, // Amount in paise
        currency: 'INR',
        receipt: `admission_${studentId}_${Date.now()}`,
        notes: {
          studentId: studentId,
          studentEmail: student.email,
          paymentType: 'admission_fee',
          studentName: student.name,
          studentPhone: student.phone
        },
        payment_capture: 1 // Auto capture
      };

      const order = await razorpayInstance.orders.create(options);

      // Store order ID in student record for reference
      student.razorpayOrderId = order.id;
      await student.save();

      return this.success(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        studentId: studentId,
        studentName: student.name,
        studentEmail: student.email,
        admissionFee: admissionFee
      }, 'Order created successfully');

    } catch (error) {
      console.error('Create order error:', error);
      return this.error(res, error.message || 'Failed to create order', 500);
    }
  };

  // Verify Payment
  verifyPayment = async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        studentId
      } = req.body;

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return this.error(res, 'Invalid payment signature', 400);
      }

      // Get payment details from Razorpay
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

      if (payment.status !== 'captured') {
        return this.error(res, 'Payment not captured', 400);
      }

      // Get student and fee record
      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const fee = await Fee.findOne({ studentId });
      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      if (fee.admissionFeePaid) {
        return this.error(res, 'Admission fee already paid', 400);
      }

      const admissionFee = await this.getAdmissionFee();

      // Update fee record with payment
      const paymentData = {
        amount: admissionFee,
        paymentMode: 'online',
        transactionId: razorpay_payment_id,
        paymentDate: new Date(),
        paymentType: 'admission_fee',
        gateway: 'razorpay',
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        status: 'success',
        receiptNo: `RCPT/${new Date().getFullYear()}/${Date.now()}`
      };

      fee.payments = fee.payments || [];
      fee.payments.push(paymentData);
      fee.paidAmount += admissionFee;
      fee.pendingAmount = fee.netPayable - fee.paidAmount;
      fee.admissionFeePaid = true;
      fee.admissionFeePaidDate = new Date();
      fee.razorpayOrderId = razorpay_order_id;
      fee.razorpayPaymentId = razorpay_payment_id;
      await fee.save();

      // Generate enrollment ID
      const enrollmentId = await this.generateEnrollmentId();

      // Update student record
      student.enrollmentId = enrollmentId;
      student.registrationComplete = true;
      student.registrationDate = new Date();
      student.status = 'active';
      student.registrationStatus = 'completed';
      student.admissionFeePaid = true;
      student.admissionFeePaidDate = new Date();
      student.razorpayOrderId = razorpay_order_id;
      student.razorpayPaymentId = razorpay_payment_id;
      student.paymentTransactionId = razorpay_payment_id;
      await student.save();

      // Send payment confirmation email
      await sendAdmissionFeeConfirmation(student.email, student.name, {
        receiptNo: paymentData.receiptNo,
        paymentDate: new Date().toLocaleDateString(),
        amount: admissionFee,
        paymentMode: 'Online (Razorpay)',
        transactionId: razorpay_payment_id
      });

      // Send welcome email
      await sendWelcomeEmail(student.email, student.name, enrollmentId, student.courseName, true);

      return this.success(res, {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        enrollmentId: enrollmentId,
        studentId: studentId,
        paymentStatus: 'success',
        receiptNo: paymentData.receiptNo
      }, 'Payment verified and registration completed');

    } catch (error) {
      console.error('Verify payment error:', error);
      return this.error(res, error.message || 'Payment verification failed', 500);
    }
  };

  // Get Admission Fee from Settings
  getAdmissionFee = async () => {
    try {
      const setting = await Settings.findOne({ key: 'admission_fee' });
      return setting ? setting.value : 5000;
    } catch (error) {
      console.error('Get admission fee error:', error);
      return 5000;
    }
  };

  // Generate Enrollment ID
  generateEnrollmentId = async () => {
    const year = new Date().getFullYear();
    const lastStudent = await Student.findOne({
      enrollmentId: { $regex: `ENR/${year}/`, $options: 'i' }
    }).sort({ enrollmentId: -1 });

    let sequence = 1;
    if (lastStudent && lastStudent.enrollmentId) {
      const parts = lastStudent.enrollmentId.split('/');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2]);
        sequence = lastNumber + 1;
      }
    }

    const paddedSequence = sequence.toString().padStart(5, '0');
    return `ENR/${year}/${paddedSequence}`;
  };

  // Webhook for payment events
  razorpayWebhook = async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      const isValid = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex') === signature;

      if (!isValid) {
        return this.error(res, 'Invalid webhook signature', 400);
      }

      const { event, payload } = req.body;

      switch (event) {
        case 'payment.captured':
          const payment = payload.payment.entity;
          console.log(`✅ Payment captured: ${payment.id} for amount ₹${payment.amount / 100}`);
          // You can trigger additional actions here
          break;

        case 'payment.failed':
          const failedPayment = payload.payment.entity;
          console.log(`❌ Payment failed: ${failedPayment.id}`);
          // Update payment status in database
          await this.updateFailedPayment(failedPayment.id);
          break;

        case 'refund.created':
          console.log(`💰 Refund created: ${payload.refund.entity.id}`);
          break;

        default:
          console.log('Unhandled event:', event);
      }

      return this.success(res, { received: true }, 'Webhook received');

    } catch (error) {
      console.error('Webhook error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Update failed payment status
  updateFailedPayment = async (paymentId) => {
    try {
      const fee = await Fee.findOne({ 'payments.transactionId': paymentId });
      if (fee) {
        const payment = fee.payments.find(p => p.transactionId === paymentId);
        if (payment) {
          payment.status = 'failed';
          await fee.save();
        }
      }
    } catch (error) {
      console.error('Update failed payment error:', error);
    }
  };

  // Get Payment Status
  getPaymentStatus = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const fee = await Fee.findOne({ studentId });

      return this.success(res, {
        admissionFeePaid: fee?.admissionFeePaid || false,
        admissionFeeAmount: fee?.admissionFee || 0,
        admissionFeePaidDate: fee?.admissionFeePaidDate,
        totalFees: fee?.totalFees || 0,
        paidAmount: fee?.paidAmount || 0,
        pendingAmount: fee?.pendingAmount || 0,
        enrollmentId: student.enrollmentId,
        registrationComplete: student.registrationComplete,
        razorpayOrderId: student.razorpayOrderId,
        razorpayPaymentId: student.razorpayPaymentId
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get payment by transaction ID
  getPaymentByTransactionId = async (req, res) => {
    try {
      const { transactionId } = req.params;

      const fee = await Fee.findOne({ 'payments.transactionId': transactionId })
        .populate('studentId', 'name email enrollmentId phone')
        .lean();

      if (!fee) {
        return this.error(res, 'Payment not found', 404);
      }

      const payment = fee.payments.find(p => p.transactionId === transactionId);

      return this.success(res, {
        payment,
        student: fee.studentId,
        fee: {
          totalFees: fee.totalFees,
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount
        }
      });

    } catch (error) {
      console.error('Get payment by transaction error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get all payments for a student
  getStudentPayments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 10, paymentType, status } = req.query;

      const fee = await Fee.findOne({ studentId })
        .populate('payments.collectedBy', 'name email')
        .lean();

      if (!fee) {
        return this.error(res, 'No payments found for this student', 404);
      }

      let payments = fee.payments || [];

      // Apply filters
      if (paymentType) {
        payments = payments.filter(p => p.paymentType === paymentType);
      }
      if (status) {
        payments = payments.filter(p => p.status === status);
      }

      // Sort by date descending
      payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      const total = payments.length;
      const start = (page - 1) * limit;
      const paginatedPayments = payments.slice(start, start + limit);

      const summary = {
        totalPaid: fee.paidAmount,
        totalPending: fee.pendingAmount,
        totalAdmissionFee: fee.admissionFee,
        admissionFeePaid: fee.admissionFeePaid,
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.status === 'success').length,
        failedPayments: payments.filter(p => p.status === 'failed').length
      };

      return this.success(res, {
        payments: paginatedPayments,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get student payments error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get receipt by receipt number
  getReceiptByReceiptNo = async (req, res) => {
    try {
      const { receiptNo } = req.params;

      const fee = await Fee.findOne({ 'payments.receiptNo': receiptNo })
        .populate('studentId', 'name email enrollmentId phone address')
        .populate('courseId', 'name duration')
        .populate('payments.collectedBy', 'name')
        .lean();

      if (!fee) {
        return this.error(res, 'Receipt not found', 404);
      }

      const payment = fee.payments.find(p => p.receiptNo === receiptNo);

      return this.success(res, {
        receipt: {
          ...payment,
          student: fee.studentId,
          course: fee.courseId,
          feeSummary: {
            totalFees: fee.totalFees,
            paidAmount: fee.paidAmount,
            pendingAmount: fee.pendingAmount,
            admissionFeePaid: fee.admissionFeePaid
          }
        }
      });

    } catch (error) {
      console.error('Get receipt error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get payment summary for dashboard
  getPaymentSummary = async (req, res) => {
    try {
      const summary = await Fee.getFeeSummary();
      return this.success(res, summary);

    } catch (error) {
      console.error('Get payment summary error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get collection report
  getCollectionReport = async (req, res) => {
    try {
      const { startDate, endDate, paymentType, paymentMode } = req.query;

      const matchQuery = { 'payments.status': 'success' };

      if (startDate || endDate) {
        matchQuery['payments.paymentDate'] = {};
        if (startDate) matchQuery['payments.paymentDate'].$gte = new Date(startDate);
        if (endDate) matchQuery['payments.paymentDate'].$lte = new Date(endDate);
      }

      if (paymentType) {
        matchQuery['payments.paymentType'] = paymentType;
      }

      if (paymentMode) {
        matchQuery['payments.paymentMode'] = paymentMode;
      }

      const report = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: matchQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$payments.paymentDate' } },
              paymentType: '$payments.paymentType',
              paymentMode: '$payments.paymentMode'
            },
            totalAmount: { $sum: '$payments.amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      // Group by date for chart
      const dailyData = {};
      report.forEach(item => {
        if (!dailyData[item._id.date]) {
          dailyData[item._id.date] = {
            date: item._id.date,
            total: 0,
            admissionFee: 0,
            installment: 0,
            online: 0,
            offline: 0
          };
        }
        dailyData[item._id.date].total += item.totalAmount;
        if (item._id.paymentType === 'admission_fee') {
          dailyData[item._id.date].admissionFee += item.totalAmount;
        } else if (item._id.paymentType === 'installment') {
          dailyData[item._id.date].installment += item.totalAmount;
        }
        if (item._id.paymentMode === 'online') {
          dailyData[item._id.date].online += item.totalAmount;
        } else {
          dailyData[item._id.date].offline += item.totalAmount;
        }
      });

      const dailyCollection = Object.values(dailyData);

      const summary = {
        totalCollected: report.reduce((sum, item) => sum + item.totalAmount, 0),
        totalTransactions: report.reduce((sum, item) => sum + item.count, 0),
        admissionFeeCollected: report
          .filter(item => item._id.paymentType === 'admission_fee')
          .reduce((sum, item) => sum + item.totalAmount, 0),
        installmentCollected: report
          .filter(item => item._id.paymentType === 'installment')
          .reduce((sum, item) => sum + item.totalAmount, 0),
        onlineCollected: report
          .filter(item => item._id.paymentMode === 'online')
          .reduce((sum, item) => sum + item.totalAmount, 0),
        offlineCollected: report
          .filter(item => item._id.paymentMode !== 'online')
          .reduce((sum, item) => sum + item.totalAmount, 0)
      };

      return this.success(res, {
        report,
        dailyCollection,
        summary
      });

    } catch (error) {
      console.error('Get collection report error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get all payments (admin only)
  getAllPayments = async (req, res) => {
    try {
      const { page = 1, limit = 20, status, paymentType, studentId } = req.query;

      const matchQuery = {};
      if (status) matchQuery['payments.status'] = status;
      if (paymentType) matchQuery['payments.paymentType'] = paymentType;
      if (studentId) matchQuery.studentId = studentId;

      const fees = await Fee.find(matchQuery)
        .populate('studentId', 'name email enrollmentId phone')
        .populate('payments.collectedBy', 'name')
        .sort({ createdAt: -1 })
        .lean();

      // Extract all payments
      let allPayments = [];
      fees.forEach(fee => {
        fee.payments.forEach(payment => {
          allPayments.push({
            ...payment,
            student: fee.studentId,
            studentId: fee.studentId._id,
            courseId: fee.courseId,
            totalFees: fee.totalFees,
            paidAmount: fee.paidAmount,
            pendingAmount: fee.pendingAmount
          });
        });
      });

      // Sort by payment date
      allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      const total = allPayments.length;
      const start = (page - 1) * limit;
      const paginatedPayments = allPayments.slice(start, start + limit);

      return this.success(res, {
        payments: paginatedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get all payments error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get pending payments
  getPendingPayments = async (req, res) => {
    try {
      const pendingFees = await Fee.find({
        status: { $in: ['pending', 'partially_paid', 'overdue'] },
        pendingAmount: { $gt: 0 }
      })
        .populate('studentId', 'name email enrollmentId phone')
        .populate('courseId', 'name')
        .sort({ dueDate: 1 })
        .lean();

      const summary = {
        total: pendingFees.length,
        totalAmount: pendingFees.reduce((sum, fee) => sum + fee.pendingAmount, 0),
        overdueCount: pendingFees.filter(fee => fee.status === 'overdue').length,
        overdueAmount: pendingFees
          .filter(fee => fee.status === 'overdue')
          .reduce((sum, fee) => sum + fee.pendingAmount, 0)
      };

      return this.success(res, {
        pendingFees,
        summary
      });

    } catch (error) {
      console.error('Get pending payments error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Refund payment
  refundPayment = async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      const fee = await Fee.findOne({ 'payments._id': paymentId });
      if (!fee) {
        return this.error(res, 'Payment not found', 404);
      }

      const payment = fee.payments.id(paymentId);
      if (!payment) {
        return this.error(res, 'Payment not found', 404);
      }

      if (payment.status !== 'success') {
        return this.error(res, 'Only successful payments can be refunded', 400);
      }

      // Process refund via Razorpay
      if (payment.gateway === 'razorpay' && payment.gatewayPaymentId) {
        try {
          const refund = await razorpayInstance.payments.refund(payment.gatewayPaymentId, {
            amount: payment.amount * 100,
            notes: { reason }
          });

          payment.status = 'refunded';
          payment.refundId = refund.id;
          payment.refundReason = reason;
          payment.refundDate = new Date();

          // Update fee totals
          fee.paidAmount -= payment.amount;
          fee.pendingAmount += payment.amount;

          await fee.save();

          return this.success(res, {
            payment,
            refund
          }, 'Payment refunded successfully');

        } catch (razorpayError) {
          console.error('Razorpay refund error:', razorpayError);
          return this.error(res, 'Failed to process refund via Razorpay', 500);
        }
      } else {
        // Offline/cash payment - just mark as refunded
        payment.status = 'refunded';
        payment.refundReason = reason;
        payment.refundDate = new Date();

        fee.paidAmount -= payment.amount;
        fee.pendingAmount += payment.amount;

        await fee.save();

        return this.success(res, {
          payment
        }, 'Payment refunded successfully');
      }

    } catch (error) {
      console.error('Refund payment error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get Razorpay payment details
  getRazorpayPaymentDetails = async (req, res) => {
    try {
      const { paymentId } = req.params;

      const payment = await razorpayInstance.payments.fetch(paymentId);

      return this.success(res, {
        payment: {
          id: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          description: payment.description,
          orderId: payment.order_id,
          createdAt: new Date(payment.created_at * 1000)
        }
      });

    } catch (error) {
      console.error('Get Razorpay payment error:', error);
      return this.error(res, error.message, 500);
    }
  };
}

export default new PaymentController();