// backend/controllers/feeController.js
import Fee from '../models/Fee.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import BaseController from './baseController.js';
import crypto from "crypto"
import { MESSAGES } from '../constants/messages.js';

class FeeController extends BaseController {
  constructor() {
    super();
    // Bind all methods
    this.getAllFees = this.getAllFees.bind(this);
    this.getFeeById = this.getFeeById.bind(this);
    this.getFeeByStudent = this.getFeeByStudent.bind(this);
    this.createFeeRecord = this.createFeeRecord.bind(this);
    this.createRegistrationFee = this.createRegistrationFee.bind(this);
    this.updateCourseFee = this.updateCourseFee.bind(this);
    this.makePayment = this.makePayment.bind(this);
    this.getPaymentHistory = this.getPaymentHistory.bind(this);
    this.getFeeSummary = this.getFeeSummary.bind(this);
    this.sendFeeReminder = this.sendFeeReminder.bind(this);
    this.getOverdueFees = this.getOverdueFees.bind(this);
    this.getCollectionReport = this.getCollectionReport.bind(this);
    this.getReceipt = this.getReceipt.bind(this);
    this.generateInvoice = this.generateInvoice.bind(this);
    this.updateInstallment = this.updateInstallment.bind(this);
    this.payAdmissionFee = this.payAdmissionFee.bind(this);
    this.payInstallment = this.payInstallment.bind(this);
    this.getPendingAdmissionFees = this.getPendingAdmissionFees.bind(this);
    this.verifyAndCompletePayment = this.verifyAndCompletePayment.bind(this);
  }

  // Get all fees with filters
  async getAllFees(req, res) {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};

      if (req.query.status) filter.status = req.query.status;
      if (req.query.studentId) filter.studentId = req.query.studentId;
      if (req.query.courseId) filter.courseId = req.query.courseId;
      if (req.query.admissionFeePaid !== undefined) filter.admissionFeePaid = req.query.admissionFeePaid === 'true';

      // Search by student name or enrollment
      if (req.query.search) {
        const students = await User.find({
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { enrollmentId: { $regex: req.query.search, $options: 'i' } }
          ],
          role: 'student'
        }).select('_id');
        filter.studentId = { $in: students.map(s => s._id) };
      }

      const [fees, total] = await Promise.all([
        Fee.find(filter)
          .populate('studentId', 'name enrollmentId phone email profileImage')
          .populate('courseId', 'name duration totalFees')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Fee.countDocuments(filter)
      ]);

      const pagination = this.getPaginationMetadata(total, page, limit);

      return this.success(res, { fees, pagination });

    } catch (error) {
      console.error('Get fees error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get fee by ID
  async getFeeById(req, res) {
    try {
      const { id } = req.params;
      const fee = await Fee.findById(id)
        .populate('studentId', 'name enrollmentId phone email profileImage')
        .populate('courseId', 'name duration totalFees')
        .lean();

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      return this.success(res, { fee });

    } catch (error) {
      console.error('Get fee by ID error:', error);
      return this.error(res, error.message, 500);
    }
  }

  async getFeeByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const fee = await Fee.findOne({ studentId })
        .populate('studentId', 'name enrollmentId phone email profileImage');

      if (!fee) {
        return this.error(res, 'Fee record not found for this student', 404);
      }

      const admissionStatus = fee.getAdmissionFeeStatus();
      const paymentSummary = fee.getPaymentSummary();

      return this.success(res, {
        fee,
        admissionStatus,
        paymentSummary
      });

    } catch (error) {
      console.error('Get fee by student error:', error);
      return this.error(res, error.message, 500);
    }
  }

  createFeeRecord = async (req, res) => {
    try {
      const {
        studentId,
        courseId,
        admissionFee,
        courseFee,
        totalFees,
        finalAmount,
        dueDate,
        remarks
      } = req.body;

      console.log("Incoming studentId:", studentId);

      // 1️⃣ Validate IDs
      if (!studentId || !courseId) {
        return this.error(res, 'studentId and courseId are required', 400);
      }

      if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
        return this.error(res, 'Invalid studentId or courseId', 400);
      }

      // 2️⃣ Check existing fee record
      const existingFee = await Fee.exists({ studentId });
      if (existingFee) return this.error(res, 'Fee record already exists for this student', 400);

      // 3️⃣ Fetch student and course
      const student = await User.findById(studentId);
      const course = await Course.findById(courseId);

      if (!student) return this.error(res, 'Student not found', 404);
      if (!course) return this.error(res, 'Course not found', 404);

      // 4️⃣ Calculate amounts
      const baseFees = totalFees || course.totalFees;
      const netPayable = finalAmount ?? baseFees;

      const admissionFeePaid = student.admissionFeePaid || false;
      const admissionFeeAmount = admissionFee ?? student.admissionFeeAmount ?? 0;
      const paidAmount = admissionFeePaid ? admissionFeeAmount : 0;
      const pendingAmount = netPayable - paidAmount;

      let status = 'pending';
      if (paidAmount === netPayable) status = 'paid';
      else if (paidAmount > 0) status = 'partially_paid';

      const feeDueDate = dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 5️⃣ Create Fee record
      const fee = await Fee.create({
        studentId,
        courseId,
        admissionFee: admissionFeeAmount,
        courseFee: courseFee ?? course.totalFees,
        totalFees: baseFees,
        netPayable,
        paidAmount,
        pendingAmount,
        dueDate: feeDueDate,
        status,
        createdBy: req.user._id,
        remarks,
        admissionFeePaid,
        admissionFeePaidDate: student.admissionFeePaidDate,
        admissionFeePaymentId: student.paymentTransactionId
      });

      // 6️⃣ Update student document
      await User.findByIdAndUpdate(studentId, {
        feeStatus: status,
        courseEnrolled: courseId,
        feeId: fee._id,
        admissionDate: new Date()
      });

      // 7️⃣ Return success
      return this.success(res, { fee }, 'Fee record created successfully', 201);

    } catch (error) {
      console.error('Create fee error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Create registration fee (Step 1 - After personal info)
  async createRegistrationFee(req, res) {
    try {
      const { studentId, courseId, admissionFee } = req.body;

      // 1️⃣ Validate required fields
      if (!studentId || !courseId) {
        return this.error(res, 'studentId and courseId are required', 400);
      }

      if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
        return this.error(res, 'Invalid studentId or courseId', 400);
      }

      // 2️⃣ Check if fee record already exists
      const existingFee = await Fee.findOne({ studentId });
      if (existingFee) {
        return this.success(res, { fee: existingFee }, 'Fee record already exists');
      }

      // 3️⃣ Fetch student and course
      const student = await User.findById(studentId);
      const course = await Course.findById(courseId);

      if (!student) return this.error(res, 'Student not found', 404);
      if (!course) return this.error(res, 'Course not found', 404);

      // 4️⃣ Create fee record for registration (admission fee only initially)
      const fee = await Fee.createRegistrationFee(
        studentId,
        courseId,
        admissionFee ?? 0,
        req.user._id
      );

      // 5️⃣ Return success response
      return this.success(res, {
        fee,
        admissionFee: fee.admissionFee,
        message: 'Registration fee record created'
      }, 'Fee record created successfully', 201);

    } catch (error) {
      console.error('Create registration fee error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Update course fee (Step 2 - After course selection)
  async updateCourseFee(req, res) {
    try {
      const { studentId } = req.params;
      const { courseId, courseFee, installmentPlan } = req.body;

      const fee = await Fee.findOne({ studentId });
      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return this.error(res, 'Course not found', 404);
      }

      const updatedFee = await Fee.updateCourseFee(
        fee._id,
        courseFee || course.totalFees,
        installmentPlan
      );

      return this.success(res, {
        fee: updatedFee,
        courseFee: updatedFee.courseFee,
        totalFees: updatedFee.totalFees,
        netPayable: updatedFee.netPayable
      }, 'Course fee updated successfully');

    } catch (error) {
      console.error('Update course fee error:', error);
      return this.error(res, error.message, 500);
    }
  }

  payAdmissionFee = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { paymentMode, transactionId, gatewayOrderId, gatewayPaymentId, notes, paymentDate } = req.body;

      console.log('💰 Pay Admission Fee:', { studentId, paymentMode });

      // 1️⃣ Fetch student
      const student = await Student.findById(studentId);
      if (!student) return this.error(res, 'Student not found', 404);

      // 2️⃣ Fetch or create Fee record
      let fee = await Fee.findOne({ studentId });
      if (!fee) {
        const course = await Course.findById(student.course);
        if (!course) return this.error(res, 'Course not found', 404);

        const admissionFeeSetting = await Settings.findOne({ key: 'admission_fee' });
        const admissionFee = admissionFeeSetting ? admissionFeeSetting.value : 5000;

        fee = await Fee.create({
          studentId: student._id,
          courseId: student.course,
          admissionFee,
          courseFee: course.totalFees,
          totalFees: admissionFee + course.totalFees,
          netPayable: admissionFee + course.totalFees,
          paidAmount: 0,
          pendingAmount: admissionFee + course.totalFees,
          status: 'pending',
          createdBy: req.user._id
        });
        console.log('⚠️ Fee record created:', fee._id);
      }

      // Ensure studentId is linked
      if (!fee.studentId) {
        fee.studentId = student._id;
        await fee.save();
      }

      // 3️⃣ Check if already paid
      if (fee.admissionFeePaid) return this.error(res, 'Admission fee already paid', 400);
      if (fee.admissionFee <= 0) return this.error(res, 'No admission fee required', 400);

      // 4️⃣ Generate receipt
      const receiptNo = `RCPT/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      const mode = paymentMode || 'cash';
      const isOnline = mode === 'online' || mode === 'razorpay';

      // 5️⃣ Build payment object
      const paymentData = {
        amount: fee.admissionFee,
        paymentMode: mode,
        transactionId: transactionId || (isOnline ? `ONLINE-${Date.now()}` : `CASH-${Date.now()}`),
        gateway: isOnline ? 'razorpay' : 'cash',
        gatewayOrderId: gatewayOrderId || null,
        gatewayPaymentId: gatewayPaymentId || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || `Admission fee payment via ${mode}`,
        collectedBy: req.user._id,
        paymentType: 'admission_fee',
        status: 'success',
        receiptNo
      };

      // 6️⃣ Save payment to fee
      fee.payments = fee.payments || [];
      fee.payments.push(paymentData);
      fee.paidAmount += fee.admissionFee;
      fee.pendingAmount = fee.netPayable - fee.paidAmount;
      fee.admissionFeePaid = true;
      fee.admissionFeePaidDate = paymentData.paymentDate;

      if (fee.paidAmount >= fee.netPayable) fee.status = 'paid';
      else fee.status = 'partially_paid';

      await fee.save();

      // 7️⃣ Generate enrollment ID if missing
      if (!student.enrollmentId) {
        student.enrollmentId = await this.generateEnrollmentId();
      }

      // 8️⃣ Update student
      student.admissionFeePaid = true;
      student.admissionFeePaidDate = paymentData.paymentDate;
      student.status = 'active';
      if (student.documentsUploaded) {
        student.registrationComplete = true;
        student.registrationDate = new Date();
        student.registrationStatus = 'completed';
      } else {
        student.registrationStatus = 'pending_documents';
      }
      await student.save();

      // 9️⃣ Send emails
      try {
        const { sendAdmissionFeeConfirmation, sendWelcomeEmail } = await import('../config/email.js');
        await sendAdmissionFeeConfirmation(student.email, student.name, {
          receiptNo,
          paymentDate: paymentData.paymentDate.toLocaleDateString(),
          amount: fee.admissionFee,
          paymentMode: mode,
          transactionId: paymentData.transactionId
        });

        await sendWelcomeEmail(
          student.email,
          student.name,
          student.enrollmentId,
          student.courseName,
          true
        );
        console.log(`📧 Emails sent to ${student.email}`);
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
      }

      // 10️⃣ Return success response
      return this.success(res, {
        payment: paymentData,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          enrollmentId: student.enrollmentId
        },
        fee: {
          admissionFeePaid: fee.admissionFeePaid,
          admissionFeePaidDate: fee.admissionFeePaidDate,
          totalPaid: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          status: fee.status
        },
        receiptNo,
        transactionId: paymentData.transactionId
      }, 'Admission fee paid successfully');

    } catch (error) {
      console.error('Pay admission fee error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Verify and complete registration after payment
  async verifyAndCompletePayment(req, res) {
    try {
      const { studentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const fee = await Fee.findOne({ studentId });
      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      // Verify signature (implement actual verification)
      const isValid = this.verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return this.error(res, 'Invalid payment signature', 400);
      }

      // Complete payment
      const paymentData = {
        transactionId: razorpayPaymentId,
        gatewayOrderId: razorpayOrderId,
        gatewayPaymentId: razorpayPaymentId,
        notes: 'Registration admission fee payment'
      };

      await fee.payAdmissionFeeWithRazorpay(paymentData);

      // Generate enrollment ID and update student
      const enrollmentId = await this.generateEnrollmentId();
      await User.findByIdAndUpdate(studentId, {
        enrollmentId: enrollmentId,
        registrationComplete: true,
        registrationDate: new Date(),
        status: 'active',
        admissionFeePaid: true,
        admissionFeePaidDate: new Date()
      });

      return this.success(res, {
        enrollmentId,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        message: 'Registration completed successfully'
      }, 'Payment verified and registration completed');

    } catch (error) {
      console.error('Verify payment error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Helper: Verify Razorpay signature
  verifyRazorpaySignature(orderId, paymentId, signature) {
    // Implement actual signature verification
    const crypto = require('crypto');
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }

  // Helper: Generate enrollment ID
  async generateEnrollmentId() {
    const year = new Date().getFullYear();
    const lastStudent = await User.findOne({
      enrollmentId: { $regex: `ENR/${year}/`, $options: 'i' },
      role: 'student'
    }).sort({ enrollmentId: -1 });

    let sequence = 1;
    if (lastStudent && lastStudent.enrollmentId) {
      const lastNumber = parseInt(lastStudent.enrollmentId.split('/')[2]);
      sequence = lastNumber + 1;
    }

    const paddedSequence = sequence.toString().padStart(5, '0');
    return `ENR/${year}/${paddedSequence}`;
  }

  // Get pending admission fees
  async getPendingAdmissionFees(req, res) {
    try {
      const pendingFees = await Fee.getPendingAdmissionFees();

      const summary = {
        count: pendingFees.length,
        totalAmount: pendingFees.reduce((sum, fee) => sum + fee.admissionFee, 0),
        students: pendingFees.map(fee => ({
          id: fee.studentId._id,
          name: fee.studentId.name,
          email: fee.studentId.email,
          phone: fee.studentId.phone,
          amount: fee.admissionFee,
          registeredAt: fee.createdAt
        }))
      };

      return this.success(res, { pendingFees: summary });

    } catch (error) {
      console.error('Get pending admission fees error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Make payment (Legacy - kept for compatibility)
  async makePayment(req, res) {
    try {
      const { studentId } = req.params;
      const { amount, paymentMode, transactionId, notes, paymentDate } = req.body;

      const fee = await Fee.findOne({ studentId }).populate('studentId', 'name email');

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      if (fee.status === 'paid') {
        return this.error(res, 'Fee already fully paid', 400);
      }

      if (amount > fee.pendingAmount) {
        return this.error(res, `Amount cannot exceed pending amount: ₹${fee.pendingAmount}`, 400);
      }

      const receiptNo = `RCPT/${new Date().getFullYear()}/${String((fee.payments?.length || 0) + 1).padStart(6, '0')}`;

      const payment = {
        amount,
        paymentDate: paymentDate || new Date(),
        paymentMode,
        transactionId: transactionId || `TXN${Date.now()}`,
        receiptNo,
        status: 'success',
        notes,
        collectedBy: req.user._id
      };

      fee.payments = fee.payments || [];
      fee.payments.push(payment);
      fee.paidAmount += amount;
      fee.pendingAmount = fee.netPayable - fee.paidAmount;

      if (fee.paidAmount >= fee.netPayable) {
        fee.status = 'paid';
      } else if (fee.paidAmount > 0) {
        fee.status = 'partially_paid';
      }

      await fee.save();

      return this.success(res, {
        payment,
        fee: {
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          status: fee.status,
          receiptNo
        }
      }, 'Payment successful');

    } catch (error) {
      console.error('Make payment error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const { studentId } = req.params;
      const { page, limit, skip } = this.getPaginationOptions(req.query);

      const fee = await Fee.findOne({ studentId })
        .populate('payments.collectedBy', 'name')
        .lean();

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      const payments = fee.payments?.sort((a, b) => b.paymentDate - a.paymentDate) || [];
      const total = payments.length;
      const paginatedPayments = payments.slice(skip, skip + limit);
      const pagination = this.getPaginationMetadata(total, page, limit);

      const admissionStatus = fee.getAdmissionFeeStatus();

      return this.success(res, {
        payments: paginatedPayments,
        pagination,
        summary: {
          totalPaid: fee.paidAmount,
          totalPending: fee.pendingAmount,
          totalFees: fee.totalFees,
          admissionFeePaid: fee.admissionFeePaid,
          admissionFeeAmount: fee.admissionFee,
          status: fee.status
        },
        admissionStatus
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get fee summary/dashboard stats
  async getFeeSummary(req, res) {
    try {
      const summary = await Fee.getFeeSummary();
      return this.success(res, summary);

    } catch (error) {
      console.error('Get fee summary error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get overdue fees
  async getOverdueFees(req, res) {
    try {
      const overdueFees = await Fee.getOverdueFees();

      const overdueSummary = {
        count: overdueFees.length,
        totalAmount: overdueFees.reduce((sum, fee) => sum + fee.pendingAmount, 0),
        averageOverdueDays: overdueFees.length > 0
          ? overdueFees.reduce((sum, fee) => {
            const daysOverdue = Math.ceil((new Date() - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24));
            return sum + daysOverdue;
          }, 0) / overdueFees.length
          : 0
      };

      return this.success(res, { overdueFees, summary: overdueSummary });

    } catch (error) {
      console.error('Get overdue fees error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get collection report
  async getCollectionReport(req, res) {
    try {
      const { startDate, endDate, paymentType } = req.query;

      const query = { 'payments.status': 'success' };

      if (startDate || endDate) {
        query['payments.paymentDate'] = {};
        if (startDate) query['payments.paymentDate'].$gte = new Date(startDate);
        if (endDate) query['payments.paymentDate'].$lte = new Date(endDate);
      }

      if (paymentType) {
        query['payments.paymentType'] = paymentType;
      }

      const collectionData = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: query },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$payments.paymentDate' } },
              paymentType: '$payments.paymentType'
            },
            total: { $sum: '$payments.amount' },
            count: { $sum: 1 },
            transactions: { $push: '$payments' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      const admissionFeeTotal = collectionData
        .filter(item => item._id.paymentType === 'admission_fee')
        .reduce((sum, item) => sum + item.total, 0);

      const installmentTotal = collectionData
        .filter(item => item._id.paymentType === 'installment')
        .reduce((sum, item) => sum + item.total, 0);

      return this.success(res, {
        collection: collectionData,
        summary: {
          totalCollected: collectionData.reduce((sum, item) => sum + item.total, 0),
          totalTransactions: collectionData.reduce((sum, item) => sum + item.count, 0),
          admissionFeeCollected: admissionFeeTotal,
          installmentCollected: installmentTotal
        }
      });

    } catch (error) {
      console.error('Get collection report error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Get receipt
  async getReceipt(req, res) {
    try {
      const { receiptNo } = req.params;

      const fee = await Fee.findOne({ 'payments.receiptNo': receiptNo })
        .populate('studentId', 'name enrollmentId phone email address')
        .populate('courseId', 'name duration')
        .populate('payments.collectedBy', 'name')
        .lean();

      if (!fee) {
        return this.error(res, 'Receipt not found', 404);
      }

      const payment = fee.payments.find(p => p.receiptNo === receiptNo);
      if (!payment) {
        return this.error(res, 'Payment not found for this receipt', 404);
      }

      const receipt = {
        receiptNo: payment.receiptNo,
        date: payment.paymentDate,
        student: fee.studentId,
        course: fee.courseId,
        paymentType: payment.paymentType,
        installmentNumber: payment.installmentNumber || null,
        amountPaid: payment.amount,
        totalFees: fee.totalFees,
        netPayable: fee.netPayable,
        paidAmount: fee.paidAmount,
        pendingAmount: fee.pendingAmount,
        admissionFeePaid: fee.admissionFeePaid,
        collectedBy: payment.collectedBy?.name || 'N/A',
        notes: payment.notes || ''
      };

      return this.success(res, { receipt });

    } catch (error) {
      console.error('Get receipt error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Generate invoice
  async generateInvoice(req, res) {
    try {
      const { studentId } = req.params;

      const fee = await Fee.findOne({ studentId })
        .populate('studentId', 'name enrollmentId phone email address')
        .populate('courseId', 'name duration')
        .lean();

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      // Calculate all successful payments including installments
      const successfulPayments = fee.payments?.filter(p => p.status === 'success') || [];

      // Generate invoice number
      const invoiceNo = `INV/${new Date().getFullYear()}/${fee._id.toString().slice(-6)}`;

      const invoice = {
        invoiceNo,
        date: new Date(),
        student: fee.studentId,
        course: fee.courseId,
        admissionFee: fee.admissionFee,
        courseFee: fee.courseFee,
        totalFees: fee.totalFees,
        discount: fee.discountedAmount,
        netPayable: fee.netPayable,
        paid: fee.paidAmount,
        balance: fee.pendingAmount,
        dueDate: fee.dueDate,
        status: fee.status,
        admissionFeePaid: fee.admissionFeePaid,
        admissionFeePaidDate: fee.admissionFeePaidDate,
        payments: successfulPayments,
        installments: fee.installmentPlan?.installments || []
      };

      return this.success(res, { invoice }, 'Invoice generated successfully');

    } catch (error) {
      console.error('Generate invoice error:', error);
      return this.error(res, error.message, 500);
    }
  }

  addInstallmentPlan = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { totalInstallments } = req.body;

      const fee = await Fee.findOne({ studentId });

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      if (fee.installmentPlan?.isInstallment) {
        return this.error(res, 'Installment plan already exists', 400);
      }

      if (!totalInstallments || totalInstallments <= 0) {
        return this.error(res, 'Valid totalInstallments required', 400);
      }

      // 🔥 Admission fee already paid
      const admissionPaid = fee.paidAmount || 0;

      if (admissionPaid <= 0) {
        return this.error(res, 'Admission fee must be paid first', 400);
      }

      const remainingAmount = fee.pendingAmount;

      // 🔥 remaining installments (excluding first)
      const remainingInstallments = totalInstallments - 1;

      const installmentAmount = Math.floor(remainingAmount / remainingInstallments);

      let installmentList = [];

      // ✅ 1st installment = Admission Fee (already paid)
      installmentList.push({
        installmentNumber: 1,
        amount: admissionPaid,
        dueDate: fee.createdAt,
        status: 'paid',
        paidAmount: admissionPaid,
        paymentMode: null, // ❌ no default
      });

      // ✅ Remaining installments
      for (let i = 0; i < remainingInstallments; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i + 1);

        const usedAmount = installmentAmount * (remainingInstallments - 1);
        const lastAmount = Number((remainingAmount - usedAmount).toFixed(2));

        installmentList.push({
          installmentNumber: i + 2,
          amount: i === remainingInstallments - 1 ? lastAmount : installmentAmount,
          dueDate: date,
          status: 'pending',
          paidAmount: 0,
          paymentMode: null // ❌ fixed
        });
      }

      // ✅ Attach plan
      fee.installmentPlan = {
        isInstallment: true,
        totalInstallments,
        currentInstallment: 2, // next due
        installments: installmentList
      };

      await fee.save();

      return this.success(res, {
        installmentPlan: fee.installmentPlan,
        admissionPaid,
        remainingAmount
      }, 'Installment plan created with admission fee as first installment');

    } catch (error) {
      console.error('Add installment plan error:', error);
      return this.error(res, error.message, 500);
    }
  };

  async updateInstallment(req, res) {
    try {
      const { studentId, installmentNumber } = req.params;
      const { dueDate, amount } = req.body;

      const fee = await Fee.findOne({ studentId });

      if (!fee || !fee.installmentPlan?.isInstallment) {
        return this.error(res, 'No installment plan found', 404);
      }

      const instNo = Number(installmentNumber);

      const installment = fee.installmentPlan.installments.find(
        i => i.installmentNumber === instNo
      );

      if (!installment) {
        return this.error(res, 'Installment not found', 404);
      }

      // ❌ Prevent editing paid installment
      if (installment.status === 'paid') {
        return this.error(res, 'Cannot update a paid installment', 400);
      }

      // ✅ Validate & update amount
      if (amount !== undefined) {
        if (amount <= 0) {
          return this.error(res, 'Amount must be greater than 0', 400);
        }
        installment.amount = amount;
      }

      // ✅ Validate & update due date
      if (dueDate) {
        const newDate = new Date(dueDate);

        if (newDate < new Date()) {
          return this.error(res, 'Due date cannot be in the past', 400);
        }

        installment.dueDate = newDate;
      }

      // 🔥 Recalculate totals
      const totalInstallmentAmount = fee.installmentPlan.installments.reduce(
        (sum, i) => sum + i.amount,
        0
      );

      fee.totalFees = totalInstallmentAmount;
      fee.netPayable = totalInstallmentAmount;
      fee.pendingAmount = totalInstallmentAmount - fee.paidAmount;

      await fee.save();

      return this.success(res, { installment }, 'Installment updated successfully');

    } catch (error) {
      console.error('Update installment error:', error);
      return this.error(res, error.message, 500);
    }
  }


  async payInstallment(req, res) {
    try {
      const { studentId } = req.params;
      const { installmentNumber, amount, paymentMode = 'cash', transactionId, notes } = req.body;

      const fee = await Fee.findOne({ studentId }).populate('studentId', 'name email');
      if (!fee) return this.error(res, 'Fee record not found', 404);
      if (!fee.installmentPlan?.isInstallment) return this.error(res, 'No installment plan found', 400);

      if (!amount || amount <= 0) return this.error(res, 'Valid amount is required', 400);

      const installment = fee.installmentPlan.installments.find(i => i.installmentNumber === installmentNumber);
      if (!installment) return this.error(res, 'Invalid installment number', 400);
      if (installment.status === 'paid') return this.error(res, 'Installment already paid', 400);
      if (amount > (installment.amount - (installment.paidAmount || 0))) {
        return this.error(res, 'Amount exceeds remaining installment amount', 400);
      }

      // Generate unique receipt no
      const generateReceiptNo = () => {
        const date = new Date();
        return `RCPT/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${Date.now()}`;
      };

      const paymentData = {
        amount,
        paymentMode,
        transactionId: transactionId || `INST-${crypto.randomUUID()}`,
        notes,
        collectedBy: req.user._id,
        gateway: paymentMode === 'online' ? 'razorpay' : null,
        receiptNo: generateReceiptNo(),
        paymentDate: new Date(),
        paymentType: 'installment',
        installmentNumber
      };

      // Update installment
      installment.paidAmount = (installment.paidAmount || 0) + amount;
      if (installment.paidAmount >= installment.amount) {
        installment.status = 'paid';
        installment.paidDate = new Date();
        installment.transactionId = paymentData.transactionId;
      } else {
        installment.status = 'partial';
      }

      // Update fee totals
      fee.paidAmount += amount;
      fee.pendingAmount = fee.netPayable - fee.paidAmount;

      // Update current installment pointer
      const nextPending = fee.installmentPlan.installments.find(i => i.status !== 'paid');
      fee.installmentPlan.currentInstallment = nextPending ? nextPending.installmentNumber : null;

      await fee.save();

      return this.success(res, {
        payment: paymentData,
        remainingBalance: fee.pendingAmount,
        installmentStatus: installment
      }, 'Installment payment successful');

    } catch (error) {
      console.error('Pay installment error:', error);
      return this.error(res, error.message, 500);
    }
  }

  async sendFeeReminder(req, res) {
    try {
      const { studentId } = req.params;

      const fee = await Fee.findOne({ studentId })
        .populate('studentId', 'name email phone address')
        .populate('courseId', 'name duration')
        .populate('payments.collectedBy', 'name'); // Keep as Mongoose doc, no .lean()

      if (!fee) return this.error(res, 'Fee record not found', 404);
      if (!fee.studentId) return this.error(res, 'Student info not found', 404);
      if (!fee.courseId) return this.error(res, 'Course info not found', 404);
      if (fee.status === 'paid') return this.error(res, 'Fee already paid', 400);

      const pendingAmount = fee.pendingAmount;
      const admissionStatus = fee.getAdmissionFeeStatus(); // Works now

      const lastPayment = fee.payments
        .filter(p => p.status === 'success')
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0] || null;

      const invoice = {
        invoiceNo: `INV/${new Date().getFullYear()}/${fee._id.toString().slice(-6)}`,
        date: new Date(),
        student: fee.studentId,
        course: fee.courseId,
        admissionFee: fee.admissionFee,
        courseFee: fee.courseFee,
        total: fee.totalFees,
        discount: fee.discountedAmount,
        netPayable: fee.netPayable,
        paid: fee.paidAmount,
        balance: pendingAmount,
        dueDate: fee.dueDate,
        status: fee.status,
        admissionFeePaid: fee.admissionFeePaid
      };

      console.log(`📧 Reminder sent to ${fee.studentId.email}`);
      console.log(`   Pending Amount: ₹${pendingAmount}`);
      console.log(`   Admission Fee Status: ${admissionStatus.isPaid ? 'Paid' : 'Pending'}`);
      console.log(`   Last Payment: ${lastPayment?.amount || 0} on ${lastPayment?.paymentDate || 'N/A'}`);
      console.log(`   Invoice No: ${invoice.invoiceNo}`);

      return this.success(res, {
        student: fee.studentId.name,
        email: fee.studentId.email,
        phone: fee.studentId.phone,
        pendingAmount,
        admissionFeePending: !admissionStatus.isPaid,
        dueDate: fee.dueDate,
        status: fee.status,
        lastPayment,
        invoice
      }, 'Reminder sent successfully');

    } catch (error) {
      console.error('Send reminder error:', error);
      return this.error(res, error.message, 500);
    }
  }
}

console.log('✅ FeeController loaded');

export default new FeeController();