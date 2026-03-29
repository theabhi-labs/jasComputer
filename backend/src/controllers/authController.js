
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Settings from '../models/Settings.js';
import OTP from '../models/OTP.js';
import BaseController from './baseController.js';
import { ROLES } from '../constants/roles.js';
import { MESSAGES } from '../constants/messages.js';
import {
  sendVerificationOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendWelcomeEmail  // Add this
} from '../config/email.js';

class AuthController extends BaseController {
  // Generate JWT Token
  generateToken(id, role) {
    return jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Send token response
  sendTokenResponse(user, res, message = MESSAGES.SUCCESS.LOGIN_SUCCESS) {
    const role = user.role || (user.enrollmentId ? 'student' : 'user');
    const token = this.generateToken(user._id, role);

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    return this.success(res, {
      token,
      user: userObj,
      role
    }, message);
  }
 registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      dateOfBirth,
      gender,
      teacherDetails,
      adminDetails
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'teacher',
      phone,
      address,
      dateOfBirth,
      gender,
      teacherDetails: role === 'teacher' ? teacherDetails : undefined,
      adminDetails: role === 'admin' || role === 'super_admin' ? adminDetails : undefined
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register user'
    });
  }
};
  
  // ==================== 5-STEP REGISTRATION FLOW ====================

  // STEP 1: Create student with personal info only
  registerStudentStep1 = async (req, res) => {
    try {
      const {
        name, email, password, phone, fatherName, motherName,
        address, dateOfBirth, gender, bloodGroup
      } = req.body;

      console.log('📥 Step 1 - Personal Info:', { name, email, phone });

      // Validation
      if (!name || !email || !password || !phone || !fatherName) {
        return this.error(res, 'Missing required fields: name, email, password, phone, fatherName', 400);
      }

      // Check if student exists
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return this.error(res, 'Student with this email already exists', 400);
      }

      // Create student with pending status
      const studentData = {
        name,
        email,
        password,
        phone,
        fatherName,
        motherName: motherName || '',
        address: address || {},
        dateOfBirth,
        gender,
        bloodGroup: bloodGroup || 'O+',
        registrationStatus: 'pending_course', // Move to next step
        status: 'pending'
      };

      const student = await Student.create(studentData);

      // Get admission fee from settings
      const admissionFeeSetting = await Settings.findOne({ key: 'admission_fee' });
      const admissionFee = admissionFeeSetting ? admissionFeeSetting.value : 5000;

      // Send OTP for email verification
      const otpCode = OTP.generateOTP();
      await OTP.create({
        email,
        otp: otpCode,
        type: 'email_verification',
        userId: student._id,
        userModel: 'Student',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      try {
        await sendVerificationOTP(email, name, otpCode);
        console.log(`📧 Verification OTP sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      // Return response without sensitive data
      const studentObj = student.toObject();
      delete studentObj.password;

      return this.success(res, {
        studentId: student._id,
        email: student.email,
        name: student.name,
        registrationStatus: student.registrationStatus,
        admissionFee: admissionFee,
        ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
      }, 'Step 1 completed. Please proceed to course selection.', 201);

    } catch (error) {
      console.error('Step 1 registration error:', error);

      if (error.code === 11000) {
        return this.error(res, 'Email already registered', 400);
      }

      return this.error(res, error.message || 'Registration failed', 500);
    }
  };

  // STEP 2: Update course selection
  updateStudentCourse = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { studentId } = req.params;
      const { courseId, batchId } = req.body;

      console.log('📥 Step 2 - Course Selection:', { studentId, courseId });

      // ✅ Validation
      if (!courseId) {
        await session.abortTransaction();
        session.endSession();
        return this.error(res, 'courseId is required', 400);
      }

      // ✅ Find student
      const student = await Student.findById(studentId).session(session);
      if (!student) {
        await session.abortTransaction();
        session.endSession();
        return this.error(res, 'Student not found', 404);
      }

      // ✅ Prevent duplicate course update
      if (student.course?.toString() === courseId) {
        await session.abortTransaction();
        session.endSession();
        return this.success(res, null, 'Course already selected');
      }

      // ✅ Find course
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        await session.abortTransaction();
        session.endSession();
        return this.error(res, 'Course not found', 404);
      }

      // ✅ Update student
      student.course = courseId;
      student.courseName = course.name;
      if (batchId) student.batch = batchId;
      student.registrationStatus = 'pending_documents';

      await student.save({ session });

      // ✅ Get admission fee from settings
      const admissionFeeSetting = await Settings.findOne({ key: 'admission_fee' }).session(session);
      const admissionFee = admissionFeeSetting ? admissionFeeSetting.value : 5000;

      const courseFee = course.totalFees || 0;

      // ✅ Find or create fee
      let fee = await Fee.findOne({ studentId }).session(session);

      if (!fee) {
        const createdFee = await Fee.create([{
          studentId,
          courseId,
          admissionFee,
          courseFee,
          totalFees: admissionFee + courseFee,
          netPayable: admissionFee + courseFee,
          paidAmount: 0,
          pendingAmount: admissionFee + courseFee,
          status: 'pending'
        }], { session });

        fee = createdFee[0];
      } else {
        fee.courseId = courseId;
        fee.courseFee = courseFee;
        fee.totalFees = fee.admissionFee + courseFee;
        fee.netPayable = fee.totalFees - (fee.discountedAmount || 0);
        fee.pendingAmount = fee.netPayable - fee.paidAmount;

        await fee.save({ session });
      }

      // ✅ Commit transaction
      await session.commitTransaction();
      session.endSession();

      return this.success(res, {
        studentId: student._id,
        course: course.name,
        courseId: course._id,
        totalFees: fee.totalFees,
        admissionFee: fee.admissionFee,
        registrationStatus: student.registrationStatus
      }, 'Step 2 completed. Please upload documents.');

    } catch (error) {
      console.error('Step 2 error:', error);

      await session.abortTransaction();
      session.endSession();

      return this.error(res, error.message, 500);
    }
  };

  updateStudentDocuments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { documents } = req.body;

      console.log('📥 Step 3 - Document Upload:', { studentId });

      // ✅ Find student
      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // ✅ Step validation (IMPORTANT)
      if (student.registrationStatus !== 'pending_documents') {
        return this.error(res, 'Invalid step access', 400);
      }

      // ✅ Initialize documents object (safety)
      if (!student.documents) {
        student.documents = {};
      }

      // ✅ Required documents check
      const requiredDocs = ['photo', 'aadhar'];
      for (let doc of requiredDocs) {
        if (!documents?.[doc]) {
          return this.error(res, `${doc} is required`, 400);
        }
      }

      // ✅ Prevent re-upload (optional but recommended)
      if (student.documentsUploaded) {
        return this.error(res, 'Documents already uploaded', 400);
      }

      // ✅ Update documents safely
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          student.documents[key] = documents[key];
        }
      });

      // ✅ Status update
      student.documentsUploaded = true;
      student.documentsUploadedDate = new Date();
      student.registrationStatus = 'pending_verification';

      await student.save();

      return this.success(res, {
        studentId: student._id,
        documents: student.documents,
        documentsUploaded: true,
        registrationStatus: student.registrationStatus
      }, 'Step 3 completed. Please verify your email.');

    } catch (error) {
      console.error('Step 3 error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // STEP 4: Verify email with OTP
  verifyEmailStep4 = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { otp } = req.body;

      console.log('📥 Step 4 - Email Verification:', { studentId });

      const student = await Student.findById(studentId).select('+emailVerificationOTP +emailVerificationOTPExpiry');
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Verify OTP
      const isValid = student.verifyOTP(otp);
      if (!isValid) {
        return this.error(res, 'Invalid or expired OTP', 400);
      }

      await student.save();

      // Update registration status
      if (student.documentsUploaded) {
        student.registrationStatus = 'pending_payment';
      } else {
        student.registrationStatus = 'pending_documents';
      }
      await student.save();

      return this.success(res, {
        studentId: student._id,
        emailVerified: true,
        registrationStatus: student.registrationStatus
      }, 'Step 4 completed. Email verified successfully.');

    } catch (error) {
      console.error('Step 4 error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Send OTP for email verification
  sendEmailOTP = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const otp = student.generateEmailOTP();
      await student.save();

      try {
        await sendVerificationOTP(student.email, student.name, otp);
        console.log(`📧 OTP sent to ${student.email}: ${otp}`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }

      return this.success(res, {
        email: student.email,
        ...(process.env.NODE_ENV === 'development' && { otp })
      }, 'OTP sent successfully');

    } catch (error) {
      console.error('Send OTP error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // src/controllers/authController.js

  // STEP 5: Complete registration after payment
  completeRegistrationStep5 = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { paymentData } = req.body;

      console.log('📥 Step 5 - Complete Registration:', { studentId });

      // 1️⃣ Fetch student
      const student = await Student.findById(studentId);
      if (!student) return this.error(res, 'Student not found', 404);

      // 2️⃣ Verify admission fee is paid
      const fee = await Fee.findOne({ studentId });
      if (!fee || !fee.admissionFeePaid) {
        return this.error(res, 'Please pay admission fee first', 400);
      }

      // 3️⃣ Ensure enrollment ID exists
      if (!student.enrollmentId) {
        student.enrollmentId = await this.generateEnrollmentId();
      }

      // 4️⃣ Update student registration status
      student.admissionFeePaid = true;
      student.admissionFeePaidDate = new Date();
      student.registrationComplete = true;
      student.registrationDate = new Date();
      student.status = 'active';
      student.registrationStatus = 'completed';

      // 5️⃣ Save payment data if available
      if (paymentData) {
        student.razorpayOrderId = paymentData.orderId;
        student.razorpayPaymentId = paymentData.paymentId;
        student.paymentTransactionId = paymentData.transactionId;
      }

      // 6️⃣ Save updated student
      await student.save();

      console.log('✅ Updated Student:', {
        id: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        registrationComplete: student.registrationComplete,
        status: student.status
      });

      // 7️⃣ Send welcome email
      try {
        const { sendWelcomeEmail } = await import('../config/email.js');
        await sendWelcomeEmail(
          student.email,
          student.name,
          student.enrollmentId,
          student.courseName,
          true
        );
        console.log(`📧 Welcome email sent to ${student.email} with Enrollment ID: ${student.enrollmentId}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return this.success(res, {
        studentId: student._id,
        enrollmentId: student.enrollmentId,
        registrationComplete: true,
        status: student.status
      }, 'Registration completed successfully! Welcome email sent.');

    } catch (error) {
      console.error('Step 5 error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get registration progress
  getRegistrationProgress = async (req, res) => {
    try {
      const { studentId } = req.params;

      // 1️⃣ Fetch student and populate course info
      const student = await Student.findById(studentId)
        .populate('course', 'name totalFees') // ensures course details
        .lean();

      if (!student) return this.error(res, 'Student not found', 404);

      // 2️⃣ Calculate registration progress (custom method on Student model)
      let progress = 0;
      if (typeof student.getRegistrationProgress === 'function') {
        progress = student.getRegistrationProgress();
      }

      // 3️⃣ Fetch associated fee document
      const fee = await Fee.findOne({ studentId }).lean();

      // 4️⃣ Prepare a structured response
      const response = {
        progress,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          enrollmentId: student.enrollmentId || null,
          course: student.course || null,
          registrationStatus: student.registrationStatus || 'pending',
          admissionFeePaid: fee?.admissionFeePaid || false
        },
        fee: {
          admissionFee: fee?.admissionFee || 0,
          totalFees: fee?.totalFees || 0,
          paidAmount: fee?.paidAmount || 0,
          pendingAmount: fee?.pendingAmount || 0
        }
      };

      return this.success(res, response);

    } catch (error) {
      console.error('Get registration progress error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Helper: Generate enrollment ID
  generateEnrollmentId = async () => {
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');  // 01-12
      const year = now.getFullYear();  // 2026

      console.log('📅 Generating Enrollment ID for:', { month, year });

      // Find last student with enrollment ID for current month/year
      const lastStudent = await Student.findOne({
        enrollmentId: { $regex: `^JAS/${month}/${year}/`, $options: 'i' }
      }).sort({ enrollmentId: -1 });

      let sequence = 1;
      if (lastStudent && lastStudent.enrollmentId) {
        const parts = lastStudent.enrollmentId.split('/');
        if (parts.length === 4) {
          const lastNumber = parseInt(parts[3]);
          sequence = lastNumber + 1;
        }
      }

      const paddedSequence = sequence.toString().padStart(5, '0');
      const enrollmentId = `JAS/${month}/${year}/${paddedSequence}`;

      console.log(`✅ Generated Enrollment ID: ${enrollmentId}`);
      return enrollmentId;

    } catch (error) {
      console.error('Generate enrollmentId error:', error);
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `JAS/${month}/${year}/00001`;
    }
  };

  // ==================== EXISTING AUTH METHODS ====================

  // Register admin/teacher (Super Admin only)
  registerUser = async (req, res) => {
    try {
      const { name, email, password, role, phone, teacherDetails, adminDetails } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return this.error(res, MESSAGES.ERROR.USER_EXISTS, 400);
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'teacher',
        phone,
        teacherDetails: role === 'teacher' ? teacherDetails : {},
        adminDetails: role === 'admin' ? adminDetails : {},
        createdBy: req.user?._id
      });

      return this.success(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }, MESSAGES.SUCCESS.REGISTER_SUCCESS, 201);

    } catch (error) {
      console.error('Register error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Login admin/teacher
  loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.error(res, 'Please provide email and password', 400);
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
      }

      if (user.status !== 'active') {
        return this.error(res, 'Your account is inactive. Contact administrator.', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
      }

      user.lastLogin = new Date();
      user.lastLoginIP = req.ip;
      await user.save();

      return this.sendTokenResponse(user, res);

    } catch (error) {
      console.error('Login error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };


  // loginStudent = async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return this.error(res, 'Please provide email and password', 400);
  //     }

  //     const student = await Student.findOne({ email })
  //       .select('+password')
  //       .populate('course', 'name duration fees')
  //       .populate('batch', 'name timing days');

  //     if (!student) {
  //       return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
  //     }

  //     if (!student.emailVerified) {
  //       return this.error(res, 'Please verify your email before logging in.', 401);
  //     }

  //     if (student.status !== 'active') {
  //       return this.error(res, `Your account is ${student.status}. Contact administration.`, 401);
  //     }

  //     const isMatch = await student.comparePassword(password);
  //     if (!isMatch) {
  //       return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
  //     }

  //     student.lastLogin = new Date();
  //     student.lastLoginIP = req.ip;
  //     await student.save();

  //     const token = this.generateToken(student._id, 'student');

  //     return this.success(res, {
  //       token,
  //       user: {
  //         _id: student._id,
  //         name: student.name,
  //         email: student.email,
  //         role: 'student',
  //         enrollmentId: student.enrollmentId,
  //         phone: student.phone,
  //         course: student.course,
  //         batch: student.batch,
  //         status: student.status,
  //         registrationComplete: student.registrationComplete
  //       }
  //     }, 'Login successful');

  //   } catch (error) {
  //     console.error('Student login error:', error);
  //     return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
  //   }
  // };


  loginStudent = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.error(res, 'Please provide email and password', 400);
      }

      const student = await Student.findOne({ email })
        .select('+password')
        .populate('course', 'name duration fees')
        .populate('batch', 'name timing days');

      if (!student) {
        return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
      }

      // ✅ FIX: Allow pending students to login for testing
      // Remove or modify this check
      if (student.status === 'suspended') {
        return this.error(res, `Your account is suspended. Contact administration.`, 401);
      }

      // ✅ Allow login for pending, active, and completed students
      // Only block suspended accounts
      if (student.status !== 'suspended') {
        // Allow login
      }

      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        return this.error(res, MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
      }

      student.lastLogin = new Date();
      student.lastLoginIP = req.ip;
      await student.save();

      const token = this.generateToken(student._id, 'student');

      return this.success(res, {
        token,
        user: {
          _id: student._id,
          name: student.name,
          email: student.email,
          role: 'student',
          enrollmentId: student.enrollmentId,
          phone: student.phone,
          course: student.course,
          batch: student.batch,
          status: student.status,
          registrationComplete: student.registrationComplete,
          registrationStatus: student.registrationStatus
        }
      }, 'Login successful');

    } catch (error) {
      console.error('Student login error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Verify email with OTP (legacy)
  verifyEmail = async (req, res) => {
    try {
      const { email, otp, userType } = req.body;

      const Model = userType === 'student' ? Student : User;

      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: 'email_verification',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord) {
        return this.error(res, MESSAGES.ERROR.INVALID_OTP, 400);
      }

      const user = await Model.findById(otpRecord.userId);
      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      user.emailVerified = true;
      await user.save();

      otpRecord.isUsed = true;
      await otpRecord.save();

      return this.success(res, null, MESSAGES.SUCCESS.EMAIL_VERIFIED);

    } catch (error) {
      console.error('Email verification error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Resend verification OTP
  resendVerificationOTP = async (req, res) => {
    try {
      const { email, userType } = req.body;

      const Model = userType === 'student' ? Student : User;
      const user = await Model.findOne({ email });

      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      if (user.emailVerified) {
        return this.error(res, 'Email is already verified', 400);
      }

      const otpCode = OTP.generateOTP();
      await OTP.create({
        email,
        otp: otpCode,
        type: 'email_verification',
        userId: user._id,
        userModel: userType === 'student' ? 'Student' : 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      try {
        await sendVerificationOTP(email, user.name, otpCode);
        console.log(`📧 New verification OTP sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }

      if (process.env.NODE_ENV === 'development') {
        return this.success(res, { otp: otpCode }, MESSAGES.SUCCESS.OTP_SENT);
      }

      return this.success(res, null, MESSAGES.SUCCESS.OTP_SENT);

    } catch (error) {
      console.error('Resend OTP error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Forgot password - Send OTP
  forgotPassword = async (req, res) => {
    try {
      const { email, userType } = req.body;

      const Model = userType === 'student' ? Student : User;
      const user = await Model.findOne({ email });

      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      const otpCode = OTP.generateOTP();
      await OTP.create({
        email,
        otp: otpCode,
        type: 'password_reset',
        userId: user._id,
        userModel: userType === 'student' ? 'Student' : 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      try {
        await sendPasswordResetOTP(email, user.name, otpCode);
        console.log(`📧 Password reset OTP sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }

      if (process.env.NODE_ENV === 'development') {
        return this.success(res, { email, otp: otpCode }, MESSAGES.SUCCESS.OTP_SENT);
      }

      return this.success(res, { email }, MESSAGES.SUCCESS.OTP_SENT);

    } catch (error) {
      console.error('Forgot password error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Reset password with OTP
  resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword, userType } = req.body;

      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: 'password_reset',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord) {
        return this.error(res, MESSAGES.ERROR.INVALID_OTP, 400);
      }

      const Model = userType === 'student' ? Student : User;
      const user = await Model.findById(otpRecord.userId);

      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      user.password = newPassword;
      await user.save();

      otpRecord.isUsed = true;
      await otpRecord.save();

      return this.success(res, null, MESSAGES.SUCCESS.PASSWORD_RESET);

    } catch (error) {
      console.error('Reset password error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Change password (logged in user)
  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { userType } = req.query;

      let user;
      if (userType === 'student') {
        user = await Student.findById(req.user._id).select('+password');
      } else {
        user = await User.findById(req.user._id).select('+password');
      }

      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return this.error(res, MESSAGES.ERROR.PASSWORD_MISMATCH, 401);
      }

      user.password = newPassword;
      await user.save();

      try {
        await sendPasswordChangedEmail(user.email, user.name);
        console.log(`📧 Password changed confirmation sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password changed email:', emailError);
      }

      return this.success(res, null, MESSAGES.SUCCESS.PASSWORD_CHANGED);

    } catch (error) {
      console.error('Change password error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Logout
  logout = async (req, res) => {
    return this.success(res, null, MESSAGES.SUCCESS.LOGOUT_SUCCESS);
  };

  // Get current user
  getMe = async (req, res) => {
    try {
      const { userType } = req.query;

      let user;
      if (userType === 'student') {
        user = await Student.findById(req.user._id)
          .populate('course', 'name duration fees')
          .populate('batch', 'name timing days status');
      } else {
        user = await User.findById(req.user._id).select('-password');
      }

      if (!user) {
        return this.error(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
      }

      return this.success(res, { user });

    } catch (error) {
      console.error('Get me error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new AuthController();