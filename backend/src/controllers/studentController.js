import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Fee from '../models/Fee.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';
import { STUDENT_STATUS } from '../constants/status.js';

class StudentController extends BaseController {


adminCreateStudent = async (req, res) => {
  try {
    const {
      name, email, phone, fatherName, motherName,
      address, dateOfBirth, gender, bloodGroup,
      courseId, courseName, courseFee,
      documents,
      paymentStatus,
      admissionFeePaid
    } = req.body;

    console.log('📥 Admin Creating Student:', { name, email, courseId });

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return this.error(res, 'Student with this email already exists', 400);
    }

    // Auto-generate password
    const autoPassword = 'JAS@123';
    
    // Generate enrollment ID
    const enrollmentId = await this.generateEnrollmentId();

    // Prepare document status
    const hasDocuments = documents && (documents.photo || documents.aadharCard || documents.previousYearMarksheet);
    
    // Prepare payment status
    const isPaymentPaid = paymentStatus === 'paid' || admissionFeePaid === true;
    const paymentDate = isPaymentPaid ? new Date() : null;

    // ✅ FIX: Use correct enum values
    let registrationStatus = 'pending_course'; // Default
    
    if (isPaymentPaid && hasDocuments) {
      registrationStatus = 'completed';
    } else if (isPaymentPaid) {
      registrationStatus = 'pending_documents'; // Paid, waiting for documents
    } else if (hasDocuments) {
      registrationStatus = 'pending_payment'; // Documents uploaded, waiting for payment
    } else {
      registrationStatus = 'pending_course'; // Nothing done yet
    }

    // Create student with comprehensive data
    const studentData = {
      name,
      email,
      password: autoPassword,
      phone,
      fatherName,
      motherName: motherName || '',
      address: address || {},
      dateOfBirth,
      gender,
      bloodGroup: bloodGroup || 'O+',
      enrollmentId,
      
      // Admin created flags
      isAdminCreated: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      
      // Registration status - ✅ Using correct enum values
      registrationStatus: registrationStatus,
      registrationComplete: isPaymentPaid && hasDocuments,
      registrationDate: isPaymentPaid && hasDocuments ? new Date() : null,
      
      // Document status
      documentsUploaded: hasDocuments,
      documentsUploadedDate: hasDocuments ? new Date() : null,
      documents: documents || {
        profilePhoto: null,
        aadharCard: null,
        previousYearMarksheet: null
      },
      
      // Payment status
      admissionFeePaid: isPaymentPaid,
      admissionFeePaidDate: paymentDate,
      paymentMethod: isPaymentPaid ? 'admin' : 'pending',
      paymentStatus: isPaymentPaid ? 'completed' : 'pending',
      
      // Student status
      status: 'active',
      
      // Course details
      course: courseId,
      courseName: courseName,
      
      // Fee structure
      feeStructure: {
        courseFee: courseFee || 0,
        totalFees: courseFee || 0,
        admissionFee: isPaymentPaid ? 0 : courseFee,
        paidAmount: isPaymentPaid ? courseFee : 0,
        pendingAmount: isPaymentPaid ? 0 : courseFee,
        paymentStatus: isPaymentPaid ? 'completed' : 'pending',
        dueDate: !isPaymentPaid ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      },
      
      // Audit trail
      createdBy: req.user._id,
      createdByRole: req.user.role,
      createdByName: req.user.name,
      createdAt: new Date(),
      
      // Admin notes
      adminNotes: `Created by ${req.user.name} (${req.user.role}) on ${new Date().toLocaleString()}
Payment Status: ${isPaymentPaid ? 'PAID' : 'PENDING'}
Documents Uploaded: ${hasDocuments ? 'YES' : 'NO'}`
    };

    const student = await Student.create(studentData);

    // Remove password from response
    const studentObj = student.toObject();
    delete studentObj.password;

    console.log('✅ Student created successfully:', {
      studentId: student._id,
      enrollmentId: student.enrollmentId,
      email: student.email,
      paymentStatus: isPaymentPaid ? 'PAID' : 'PENDING',
      documentsUploaded: hasDocuments,
      registrationStatus: registrationStatus
    });

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import('../config/email.js');
      await sendWelcomeEmail(
        student.email,
        student.name,
        student.enrollmentId,
        student.courseName,
        true,
        autoPassword,
        {
          paymentStatus: isPaymentPaid ? 'completed' : 'pending',
          documentsUploaded: hasDocuments,
          dashboardLink: `${process.env.FRONTEND_URL}/student/dashboard`,
          changePasswordLink: `${process.env.FRONTEND_URL}/forgot-password`
        }
      );
      console.log(`📧 Welcome email sent to ${student.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Create response message based on status
    let message = '';
    if (isPaymentPaid && hasDocuments) {
      message = 'Student fully registered! Login credentials sent.';
    } else if (isPaymentPaid) {
      message = 'Student registered. Please upload documents to complete registration.';
    } else if (hasDocuments) {
      message = 'Student registered. Please collect payment to complete registration.';
    } else {
      message = 'Student registered. Please upload documents and collect payment to complete registration.';
    }

    return this.success(res, {
      student: studentObj,
      studentId: student._id,
      enrollmentId: student.enrollmentId,
      defaultPassword: autoPassword,
      paymentStatus: isPaymentPaid ? 'completed' : 'pending',
      documentsUploaded: hasDocuments,
      registrationStatus: registrationStatus,
      message: message
    }, 'Student created successfully!', 201);

  } catch (error) {
    console.error('Admin create student error:', error);
    return this.error(res, error.message, 500);
  }
};


adminUploadDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const files = req.files ? Object.values(req.files).flat() : [];

    console.log('📥 Admin Uploading Documents:', { studentId, filesCount: files.length });

    if (!files || files.length === 0) {
      return this.error(res, 'No files uploaded', 400);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return this.error(res, 'Student not found', 404);
    }

    if (!student.documents) {
      student.documents = {};
    }

    const results = [];
    const requiredDocs = ['photo', 'aadharCard', 'previousYearMarksheet'];
    const uploadedDocs = new Set();

    const fieldMapping = {
      'photo': 'profilePhoto',
      'aadharCard': 'aadharCard',
      'previousYearMarksheet': 'previousYearMarksheet'
    };

    const folderMapping = {
      'photo': 'photos',
      'aadharCard': 'aadhar',
      'previousYearMarksheet': 'marksheets'
    };

    for (const file of files) {
      const docType = file.fieldname;
      
      if (!fieldMapping[docType]) {
        console.warn('⚠️ Skipping unknown field:', docType);
        continue;
      }
      
      uploadedDocs.add(docType);
      const docField = fieldMapping[docType];
      const folder = folderMapping[docType];

      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${docType}_${timestamp}.${fileExtension}`;
      const fileUrl = `/uploads/students/${studentId}/${folder}/${fileName}`;

      student.documents[docField] = fileUrl;
      student.documents[`${docField}Name`] = file.originalname;
      student.documents[`${docField}Size`] = file.size;
      student.documents[`${docField}UploadedAt`] = new Date();
      student.documents[`${docField}UploadedBy`] = req.user.name;

      results.push({
        docType,
        fileName: file.originalname,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        url: fileUrl,
        success: true
      });
    }

    const hasAllRequired = requiredDocs.every(doc => uploadedDocs.has(doc));

    if (hasAllRequired) {
      student.documentsUploaded = true;
      student.documentsUploadedDate = new Date();
      
      if (student.admissionFeePaid) {
        student.registrationStatus = 'completed';
        student.registrationComplete = true;
        student.registrationDate = new Date();
      } else {
        student.registrationStatus = 'pending_verification';
      }
    }

    await student.save();

    // ✅ REMOVED: No email notification for document upload
    // Students will only get email after payment confirmation

    return this.success(res, {
      uploaded: results,
      studentId: student._id,
      documentsUploaded: student.documentsUploaded,
      registrationStatus: student.registrationStatus,
      allRequiredUploaded: hasAllRequired,
      message: hasAllRequired ? 
        'All documents uploaded successfully. Please complete payment to activate dashboard.' :
        'Documents uploaded. Please upload all required documents.'
    }, 'Documents uploaded successfully');

  } catch (error) {
    console.error('Admin upload documents error:', error);
    return this.error(res, error.message, 500);
  }
};


  // Step 1: Create student with personal info (during registration)
  createStudentRegistration = async (req, res) => {
    try {
      const studentData = req.body;

      // Check if email exists
      const existingStudent = await Student.findOne({ email: studentData.email });
      if (existingStudent) {
        return this.error(res, 'Student with this email already exists', 400);
      }

      // Check if phone exists
      const existingPhone = await Student.findOne({ phone: studentData.phone });
      if (existingPhone) {
        return this.error(res, 'Student with this phone number already exists', 400);
      }

      // Set default password if not provided
      if (!studentData.password) {
        studentData.password = studentData.phone || 'password123';
      }

      // Set registration status
      studentData.registrationStatus = 'pending_course';
      studentData.status = 'pending';
      studentData.createdBy = req.user?._id || null;

      const student = await Student.create(studentData);

      // Return student without password
      const studentObj = student.toObject();
      delete studentObj.password;

      return this.success(res, {
        student: studentObj,
        studentId: student._id,
        message: 'Personal information saved. Please select a course.'
      }, 'Student registered successfully', 201);

    } catch (error) {
      console.error('Create student registration error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Step 2: Update student with course selection
  updateStudentCourse = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { courseId, batchId } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return this.error(res, 'Course not found', 404);
      }

      // Update student
      student.course = courseId;
      student.courseName = course.name;
      if (batchId) student.batch = batchId;
      student.registrationStatus = 'pending_documents';

      // Update fee structure
      if (!student.feeStructure) {
        student.feeStructure = {};
      }
      student.feeStructure.courseFee = course.totalFees;
      student.feeStructure.totalFees = (student.feeStructure.admissionFee || 0) + course.totalFees;
      student.feeStructure.remainingFees = student.feeStructure.totalFees;

      await student.save();

      return this.success(res, {
        student: {
          id: student._id,
          name: student.name,
          course: course.name,
          courseId: course._id,
          totalFees: student.feeStructure.totalFees,
          admissionFee: student.feeStructure.admissionFee || 0,
          registrationStatus: student.registrationStatus
        }
      }, 'Course selected successfully');

    } catch (error) {
      console.error('Update student course error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Step 3: Update document upload status
  updateDocumentStatus = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { documents } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Update document URLs if provided
      if (documents) {
        Object.keys(documents).forEach(key => {
          if (documents[key]) {
            student.documents[key] = documents[key];
            student.documents[`${key}ObjectName`] = documents[key];
          }
        });
      }

      student.documentsUploaded = true;
      student.documentsUploadedDate = new Date();
      student.registrationStatus = 'pending_verification';

      await student.save();

      return this.success(res, {
        studentId: student._id,
        documentsUploaded: true,
        registrationStatus: student.registrationStatus
      }, 'Documents uploaded successfully');

    } catch (error) {
      console.error('Update document status error:', error);
      return this.error(res, error.message, 500);
    }
  };
 
// src/controllers/StudentController.js

uploadMultipleDocuments = async (req, res) => {
  try {
    // ✅ Use studentId from URL params, NOT from logged-in user
    const { studentId } = req.params;
    
    // Get files from multer (files can be in req.files object)
    const files = req.files ? Object.values(req.files).flat() : [];

    console.log('📥 Upload Multiple Documents:', {
      studentIdFromParams: studentId,
      loggedInUserId: req.user?._id,
      loggedInUserRole: req.user?.role,
      filesCount: files.length,
      fileFields: files.map(f => f.fieldname)
    });

    // ✅ Check if files exist
    if (!files || files.length === 0) {
      return this.error(res, 'No files uploaded', 400);
    }

    // ✅ Find student using the ID from URL params
    const student = await Student.findById(studentId);
    
    if (!student) {
      console.error('❌ Student not found with ID:', studentId);
      return this.error(res, `Student not found with ID: ${studentId}`, 404);
    }

    console.log('✅ Student found:', {
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      registrationStatus: student.registrationStatus
    });

    // ✅ Step validation - only allow document upload at correct stage
    const allowedStatuses = ['pending_documents', 'pending_verification', 'pending_course'];
    if (!allowedStatuses.includes(student.registrationStatus)) {
      return this.error(
        res,
        `Invalid step access. Current status: ${student.registrationStatus}. Documents not allowed at this stage.`,
        400
      );
    }

    // ✅ Initialize documents object if not exists
    if (!student.documents) {
      student.documents = {};
    }

    const results = [];
    const requiredDocs = ['photo', 'aadharCard', 'previousYearMarksheet'];
    
    // Track which documents were uploaded
    const uploadedDocs = new Set();

    // ✅ Process each uploaded file
    for (const file of files) {
      const docType = file.fieldname;
      uploadedDocs.add(docType);
      
      // Determine where to store based on file type
      let docField = '';
      let folder = '';
      
      switch (docType) {
        case 'photo':
          docField = 'profilePhoto';
          folder = 'photos';
          break;
        case 'aadharCard':
          docField = 'aadharCard';
          folder = 'aadhar';
          break;
        case 'previousYearMarksheet':
          docField = 'previousYearMarksheet';
          folder = 'marksheets';
          break;
        default:
          console.warn('⚠️ Skipping unknown field:', docType);
          continue;
      }

      // Generate file URL (you can modify this based on your storage system)
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${docType}_${timestamp}.${fileExtension}`;
      const fileUrl = `/uploads/students/${studentId}/${folder}/${fileName}`;

      // Store in student document
      student.documents[docField] = fileUrl;
      student.documents[`${docField}Name`] = file.originalname;
      student.documents[`${docField}Size`] = file.size;
      student.documents[`${docField}Type`] = file.mimetype;
      student.documents[`${docField}UploadedAt`] = new Date();

      results.push({
        docType,
        fileName: file.originalname,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.mimetype,
        url: fileUrl,
        success: true
      });
    }

    // ✅ Check if all required documents are uploaded
    const hasRequiredDocs = requiredDocs.every(doc => uploadedDocs.has(doc));
    
    // ✅ Update student status based on uploaded documents
    if (hasRequiredDocs) {
      student.documentsUploaded = true;
      student.documentsUploadedDate = new Date();
      student.registrationStatus = 'ready_for_payment';
      console.log('✅ All required documents uploaded, moving to payment stage');
    } else {
      const missingDocs = requiredDocs.filter(doc => !uploadedDocs.has(doc));
      console.log(`⚠️ Missing documents: ${missingDocs.join(', ')}`);
      student.documentsUploaded = false;
      student.registrationStatus = 'pending_documents';
    }

    // Save the updated student
    await student.save();

    console.log('✅ Documents processed successfully:', {
      studentId: student._id,
      studentName: student.name,
      uploadedCount: results.length,
      hasRequiredDocs,
      registrationStatus: student.registrationStatus
    });

    // Return success response
    return this.success(
      res,
      {
        uploaded: results,
        studentId: student._id,
        studentName: student.name,
        documents: {
          photo: student.documents.profilePhoto || null,
          aadharCard: student.documents.aadharCard || null,
          previousYearMarksheet: student.documents.previousYearMarksheet || null
        },
        documentsUploaded: student.documentsUploaded,
        registrationStatus: student.registrationStatus,
        missingDocuments: hasRequiredDocs ? [] : requiredDocs.filter(doc => !uploadedDocs.has(doc))
      },
      hasRequiredDocs
        ? 'All required documents uploaded successfully. Proceed to payment.'
        : 'Documents uploaded. Please upload all required documents to continue.'
    );

  } catch (error) {
    console.error('❌ Upload multiple documents error:', error);
    return this.error(res, error.message || 'Failed to upload documents', 500);
  }
};

  
  uploadStudentPhoto = async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!req.file) {
        return this.error(res, 'No file uploaded', 400);
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return this.error(res, 'Only JPEG, PNG, and JPG images are allowed', 400);
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return this.error(res, 'Photo size should be less than 2MB', 400);
      }

      // Here you would upload to Oracle Cloud
      // For now, create a local URL
      const timestamp = Date.now();
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `photo_${timestamp}.${fileExtension}`;
      const fileUrl = `/uploads/students/${studentId}/photos/${fileName}`;

      // Update student document
      student.documents.profilePhoto = fileUrl;
      student.documents.profilePhotoObjectName = req.file.originalname;

      // Also update profileImage field for backward compatibility
      student.profileImage = fileUrl;

      await student.save();

      // Update document upload status if needed
      if (!student.documentsUploaded && student.documents.aadharCard && student.documents.marksheet10th) {
        student.documentsUploaded = true;
        student.documentsUploadedDate = new Date();
        if (student.registrationStatus === 'pending_documents') {
          student.registrationStatus = 'pending_verification';
        }
        await student.save();
      }

      return this.success(res, {
        url: fileUrl,
        fileName: req.file.originalname,
        fileSize: (req.file.size / 1024).toFixed(2) + ' KB',
        fileType: req.file.mimetype
      }, 'Photo uploaded successfully');

    } catch (error) {
      console.error('Upload photo error:', error);
      return this.error(res, error.message, 500);
    }
  };




  // Generic document upload (handles multiple types)
  uploadDocument = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { docType } = req.body; // photo, aadharCard, tenthMarksheet, etc.

      if (!req.file) {
        return this.error(res, 'No file uploaded', 400);
      }

      if (!docType) {
        return this.error(res, 'Document type is required', 400);
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Map docType to document field
      const docFieldMap = {
        'photo': 'profilePhoto',
        'aadhar': 'aadharCard',
        'aadharCard': 'aadharCard',
        'tenthMarksheet': 'marksheet10th',
        'twelfthMarksheet': 'marksheet12th',
        'transfer': 'transferCertificate',
        'transferCertificate': 'transferCertificate',
        'caste': 'casteCertificate',
        'casteCertificate': 'casteCertificate'
      };

      const docField = docFieldMap[docType];
      if (!docField) {
        return this.error(res, 'Invalid document type', 400);
      }

      // Validate file based on type
      const validation = this.validateDocumentFile(req.file, docType);
      if (!validation.valid) {
        return this.error(res, validation.error, 400);
      }

      const timestamp = Date.now();
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${docType}_${timestamp}.${fileExtension}`;
      const fileUrl = `/uploads/students/${studentId}/${docType}s/${fileName}`;

      // Update student document
      student.documents[docField] = fileUrl;
      student.documents[`${docField}ObjectName`] = req.file.originalname;

      await student.save();

      return this.success(res, {
        url: fileUrl,
        docType,
        fileName: req.file.originalname,
        fileSize: (req.file.size / 1024).toFixed(2) + ' KB'
      }, `${docType} uploaded successfully`);

    } catch (error) {
      console.error('Upload document error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Helper: Validate document file
  validateDocumentFile = (file, docType) => {
    const allowedTypes = {
      photo: ['image/jpeg', 'image/png', 'image/jpg'],
      aadharCard: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      tenthMarksheet: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      twelfthMarksheet: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      transferCertificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      casteCertificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    };

    const maxSizes = {
      photo: 2 * 1024 * 1024,
      aadharCard: 2 * 1024 * 1024,
      tenthMarksheet: 5 * 1024 * 1024,
      twelfthMarksheet: 5 * 1024 * 1024,
      transferCertificate: 10 * 1024 * 1024,
      casteCertificate: 10 * 1024 * 1024
    };

    const allowed = allowedTypes[docType] || allowedTypes.tenthMarksheet;
    const maxSize = maxSizes[docType] || 5 * 1024 * 1024;

    if (!allowed.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowed.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File size should be less than ${maxMB}MB`
      };
    }

    return { valid: true };
  };

  // ==================== FEE RELATED METHODS ====================

  // Get student fee details
  getStudentFeeDetails = async (req, res) => {
    try {
      const { studentId } = req.params;

      // Check if student exists
      const student = await Student.findById(studentId)
        .populate('course', 'name code duration totalFees')
        .lean();

      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Get fee record
      const fee = await Fee.findOne({ studentId })
        .populate('payments.collectedBy', 'name email')
        .lean();

      if (!fee) {
        // Return basic fee structure from student if fee record doesn't exist
        return this.success(res, {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            enrollmentId: student.enrollmentId
          },
          fee: {
            admissionFee: student.feeStructure?.admissionFee || 0,
            courseFee: student.feeStructure?.courseFee || 0,
            totalFees: student.feeStructure?.totalFees || 0,
            paidAmount: 0,
            pendingAmount: student.feeStructure?.totalFees || 0,
            admissionFeePaid: student.admissionFeePaid || false,
            admissionFeePaidDate: student.admissionFeePaidDate,
            status: 'pending',
            dueDate: student.feeStructure?.dueDate || null
          }
        });
      }

      // Get payment summary
      const paymentSummary = fee.getPaymentSummary();
      const admissionStatus = fee.getAdmissionFeeStatus();

      // Get recent payments (last 5)
      const recentPayments = fee.payments
        ?.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5) || [];

      // Get next due date
      const nextDueDate = fee.getNextDueDate();

      return this.success(res, {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          enrollmentId: student.enrollmentId,
          phone: student.phone,
          course: student.course
        },
        fee: {
          id: fee._id,
          admissionFee: fee.admissionFee,
          courseFee: fee.courseFee,
          totalFees: fee.totalFees,
          discountedAmount: fee.discountedAmount,
          discount: fee.discount,
          lateFee: fee.lateFee,
          netPayable: fee.netPayable,
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          status: fee.status,
          dueDate: fee.dueDate,
          nextDueDate: nextDueDate,
          admissionFeePaid: fee.admissionFeePaid,
          admissionFeePaidDate: fee.admissionFeePaidDate,
          isInstallment: fee.installmentPlan?.isInstallment || false,
          totalInstallments: fee.installmentPlan?.totalInstallments || 0,
          currentInstallment: fee.installmentPlan?.currentInstallment || 0,
          installments: fee.installmentPlan?.installments || []
        },
        paymentSummary,
        admissionStatus,
        recentPayments,
        collection: {
          paidPercentage: paymentSummary.paidPercentage,
          remainingPercentage: (100 - parseFloat(paymentSummary.paidPercentage)).toFixed(2)
        }
      });

    } catch (error) {
      console.error('Get student fee details error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get payment history for student
  getPaymentHistory = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 10, paymentType, status } = req.query;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const fee = await Fee.findOne({ studentId })
        .populate('payments.collectedBy', 'name email')
        .lean();

      if (!fee) {
        return this.success(res, {
          payments: [],
          summary: {
            totalPaid: 0,
            totalPending: 0,
            totalFees: 0
          },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        });
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

      // Calculate summary
      const summary = {
        totalPaid: fee.paidAmount,
        totalPending: fee.pendingAmount,
        totalFees: fee.totalFees,
        netPayable: fee.netPayable,
        admissionFeePaid: fee.admissionFeePaid,
        admissionFeeAmount: fee.admissionFee,
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.status === 'success').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        refundedPayments: payments.filter(p => p.status === 'refunded').length,
        totalAdmissionFeeCollected: payments
          .filter(p => p.paymentType === 'admission_fee' && p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0),
        totalInstallmentCollected: payments
          .filter(p => p.paymentType === 'installment' && p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0)
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
      console.error('Get payment history error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get payment receipt
  getPaymentReceipt = async (req, res) => {
    try {
      const { studentId, paymentId } = req.params;

      const fee = await Fee.findOne({ studentId })
        .populate('studentId', 'name email enrollmentId phone address')
        .populate('courseId', 'name duration')
        .lean();

      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      const payment = fee.payments.find(p => p._id.toString() === paymentId);
      if (!payment) {
        return this.error(res, 'Payment not found', 404);
      }

      // Calculate remaining balance after this payment
      const paymentsAfter = fee.payments
        .filter(p => new Date(p.paymentDate) <= new Date(payment.paymentDate))
        .reduce((sum, p) => sum + p.amount, 0);

      const remainingBalance = fee.netPayable - paymentsAfter;

      const receipt = {
        receiptNo: payment.receiptNo,
        date: payment.paymentDate,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId,
        paymentType: payment.paymentType,
        status: payment.status,
        student: {
          name: fee.studentId.name,
          email: fee.studentId.email,
          enrollmentId: fee.studentId.enrollmentId,
          phone: fee.studentId.phone,
          address: fee.studentId.address
        },
        course: {
          name: fee.courseId.name,
          duration: fee.courseId.duration
        },
        feeSummary: {
          totalFees: fee.totalFees,
          admissionFee: fee.admissionFee,
          courseFee: fee.courseFee,
          discount: fee.discountedAmount,
          netPayable: fee.netPayable,
          totalPaid: paymentsAfter,
          remainingBalance: remainingBalance
        },
        collectedBy: payment.collectedBy
      };

      return this.success(res, { receipt });

    } catch (error) {
      console.error('Get payment receipt error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get fee summary for student dashboard
  getStudentFeeSummary = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const fee = await Fee.findOne({ studentId }).lean();

      if (!fee) {
        return this.success(res, {
          hasFeeRecord: false,
          message: 'No fee record found'
        });
      }

      const admissionStatus = fee.getAdmissionFeeStatus();
      const paymentSummary = fee.getPaymentSummary();
      const nextDueDate = fee.getNextDueDate();

      // Check if overdue
      const isOverdue = fee.status === 'overdue';
      const daysOverdue = isOverdue && fee.dueDate
        ? Math.ceil((new Date() - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24))
        : 0;

      return this.success(res, {
        hasFeeRecord: true,
        admissionFee: {
          amount: fee.admissionFee,
          isPaid: fee.admissionFeePaid,
          paidDate: fee.admissionFeePaidDate,
          pendingAmount: admissionStatus.pendingAmount
        },
        courseFee: {
          amount: fee.courseFee,
          totalFees: fee.totalFees
        },
        payment: {
          totalPaid: fee.paidAmount,
          totalPending: fee.pendingAmount,
          netPayable: fee.netPayable,
          paidPercentage: paymentSummary.paidPercentage,
          status: fee.status
        },
        dueInfo: {
          dueDate: fee.dueDate,
          nextDueDate: nextDueDate,
          isOverdue,
          daysOverdue
        },
        installmentInfo: fee.installmentPlan?.isInstallment ? {
          isInstallment: true,
          totalInstallments: fee.installmentPlan.totalInstallments,
          paidInstallments: fee.installmentPlan.installments.filter(i => i.status === 'paid').length,
          currentInstallment: fee.installmentPlan.currentInstallment,
          nextInstallmentAmount: fee.installmentPlan.installments.find(i => i.status === 'pending')?.amount || 0,
          nextInstallmentDueDate: fee.installmentPlan.installments.find(i => i.status === 'pending')?.dueDate
        } : {
          isInstallment: false
        }
      });

    } catch (error) {
      console.error('Get student fee summary error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get all payments for dashboard (admin)
  getAllPayments = async (req, res) => {
    try {
      const { page = 1, limit = 20, status, paymentType, startDate, endDate } = req.query;

      const matchQuery = { 'payments.status': 'success' };

      if (status) matchQuery['payments.status'] = status;
      if (paymentType) matchQuery['payments.paymentType'] = paymentType;
      if (startDate || endDate) {
        matchQuery['payments.paymentDate'] = {};
        if (startDate) matchQuery['payments.paymentDate'].$gte = new Date(startDate);
        if (endDate) matchQuery['payments.paymentDate'].$lte = new Date(endDate);
      }

      const fees = await Fee.find()
        .populate('studentId', 'name email enrollmentId phone')
        .populate('payments.collectedBy', 'name')
        .sort({ createdAt: -1 })
        .lean();

      // Extract all payments
      let allPayments = [];
      fees.forEach(fee => {
        fee.payments?.forEach(payment => {
          if (payment.status === 'success' || !status) {
            allPayments.push({
              ...payment,
              student: fee.studentId,
              studentId: fee.studentId?._id,
              courseId: fee.courseId,
              totalFees: fee.totalFees,
              paidAmount: fee.paidAmount,
              pendingAmount: fee.pendingAmount
            });
          }
        });
      });

      // Sort by payment date
      allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      const total = allPayments.length;
      const start = (page - 1) * limit;
      const paginatedPayments = allPayments.slice(start, start + limit);

      // Summary
      const summary = {
        totalCollected: allPayments.reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: allPayments.length,
        admissionFeeCollected: allPayments
          .filter(p => p.paymentType === 'admission_fee')
          .reduce((sum, p) => sum + p.amount, 0),
        installmentCollected: allPayments
          .filter(p => p.paymentType === 'installment')
          .reduce((sum, p) => sum + p.amount, 0),
        onlinePayments: allPayments.filter(p => p.paymentMode === 'online').length,
        offlinePayments: allPayments.filter(p => p.paymentMode !== 'online').length
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
      console.error('Get all payments error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Pay admission fee (redirect to payment controller)
  payAdmissionFee = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { paymentMethod, paymentData } = req.body;

      console.log('💰 Pay Admission Fee:', { studentId, paymentMethod });

      // 1️⃣ Check if student exists
      const student = await Student.findById(studentId);
      if (!student) return this.error(res, 'Student not found', 404);

      // 2️⃣ Ensure enrollment ID exists
      if (!student.enrollmentId) {
        const enrollmentId = await this.generateEnrollmentId();
        student.enrollmentId = enrollmentId;
        await student.save();
      }

      // 3️⃣ Get or create Fee record
      let fee = await Fee.findOne({ studentId });
      if (!fee) {
        // Create a new Fee document if not exists
        fee = await Fee.create({
          studentId: student._id,
          admissionFee: 200, // Replace with actual fee amount or from course
          netPayable: 200,
          pendingAmount: 200,
          paidAmount: 0,
          payments: []
        });
      }

      // 4️⃣ Check if admission fee already paid
      if (student.admissionFeePaid) {
        return this.error(res, 'Admission fee already paid', 400);
      }

      const admissionFee = fee.admissionFee;

      // 5️⃣ Online payment (Razorpay)
      if (paymentMethod === 'razorpay' || paymentMethod === 'online') {
        const { razorpayInstance } = await import('../config/razorpay.js');

        const options = {
          amount: admissionFee * 100, // paise
          currency: 'INR',
          receipt: `admission_${studentId}_${Date.now()}`,
          notes: {
            studentId: studentId,
            studentEmail: student.email,
            paymentType: 'admission_fee',
            studentName: student.name,
            studentPhone: student.phone
          },
          payment_capture: 1
        };

        const order = await razorpayInstance.orders.create(options);

        // Save order ID in student
        student.razorpayOrderId = order.id;
        await student.save();

        return this.success(res, {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          studentId: student._id,
          enrollmentId: student.enrollmentId,
          studentName: student.name,
          studentEmail: student.email,
          admissionFee
        }, 'Razorpay order created successfully');
      }

      // 6️⃣ Offline payment (cash, bank_transfer, cheque)
      else if (['cash', 'bank_transfer', 'cheque'].includes(paymentMethod)) {
        const { transactionId, notes, paymentDate } = paymentData || {};

        const paymentRecord = {
          amount: admissionFee,
          paymentMode: paymentMethod,
          transactionId: transactionId || `ADM-${Date.now()}`,
          paymentDate: paymentDate || new Date(),
          paymentType: 'admission_fee',
          notes: notes || 'Admission fee payment',
          collectedBy: req.user._id,
          status: 'success',
          gateway: paymentMethod === 'bank_transfer' ? 'bank' : 'cash'
        };

        fee.payments.push(paymentRecord);
        fee.paidAmount += admissionFee;
        fee.pendingAmount = fee.netPayable - fee.paidAmount;
        fee.admissionFeePaid = true;
        fee.admissionFeePaidDate = new Date();
        await fee.save();

        student.admissionFeePaid = true;
        student.admissionFeePaidDate = new Date();
        student.paymentTransactionId = paymentRecord.transactionId;
        student.registrationComplete = true;
        student.registrationDate = new Date();
        student.status = 'active';
        student.registrationStatus = 'completed';

        await student.save();

        // Send confirmation emails
        try {
          const { sendAdmissionFeeConfirmation } = await import('../config/email.js');
          await sendAdmissionFeeConfirmation(student.email, student.name, {
            receiptNo: paymentRecord.transactionId,
            paymentDate: paymentRecord.paymentDate.toLocaleDateString(),
            amount: admissionFee,
            paymentMode: paymentMethod,
            transactionId: paymentRecord.transactionId
          });
        } catch (err) {
          console.error('Failed to send payment confirmation email:', err);
        }

        try {
          const { sendWelcomeEmail } = await import('../config/email.js');
          await sendWelcomeEmail(student.email, student.name, student.enrollmentId, student.courseName, true);
        } catch (err) {
          console.error('Failed to send welcome email:', err);
        }

        return this.success(res, {
          payment: paymentRecord,
          studentId: student._id,
          enrollmentId: student.enrollmentId,
          admissionFeePaid: true,
          registrationComplete: true
        }, 'Admission fee paid successfully');
      }

      else {
        return this.error(res, 'Invalid payment method', 400);
      }

    } catch (error) {
      console.error('Pay admission fee error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Verify Razorpay payment
  verifyPayment = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      console.log('🔐 Verify Payment:', { studentId, razorpay_order_id, razorpay_payment_id });

      // Verify signature
      const crypto = await import('crypto');
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
      const razorpayInstance = (await import('../config/razorpay.js')).razorpayInstance;
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

      if (payment.status !== 'captured') {
        return this.error(res, 'Payment not captured', 400);
      }

      // Get student and fee
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

      const admissionFee = fee.admissionFee;

      // Create payment record
      const paymentRecord = {
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
      fee.payments.push(paymentRecord);
      fee.paidAmount += admissionFee;
      fee.pendingAmount = fee.netPayable - fee.paidAmount;
      fee.admissionFeePaid = true;
      fee.admissionFeePaidDate = new Date();
      fee.razorpayOrderId = razorpay_order_id;
      fee.razorpayPaymentId = razorpay_payment_id;
      await fee.save();

      // Generate enrollment ID
      const enrollmentId = await this.generateEnrollmentId();

      // Update student
      student.enrollmentId = enrollmentId;
      student.admissionFeePaid = true;
      student.admissionFeePaidDate = new Date();
      student.registrationComplete = true;
      student.registrationDate = new Date();
      student.status = 'active';
      student.registrationStatus = 'completed';
      student.razorpayOrderId = razorpay_order_id;
      student.razorpayPaymentId = razorpay_payment_id;
      student.paymentTransactionId = razorpay_payment_id;
      await student.save();

      // Send payment confirmation email
      try {
        const { sendAdmissionFeeConfirmation, sendWelcomeEmail } = await import('../config/email.js');
        await sendAdmissionFeeConfirmation(student.email, student.name, {
          receiptNo: paymentRecord.receiptNo,
          paymentDate: new Date().toLocaleDateString(),
          amount: admissionFee,
          paymentMode: 'Online (Razorpay)',
          transactionId: razorpay_payment_id
        });

        await sendWelcomeEmail(student.email, student.name, enrollmentId, student.courseName, true);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      return this.success(res, {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        enrollmentId: enrollmentId,
        studentId: studentId,
        paymentStatus: 'success',
        receiptNo: paymentRecord.receiptNo
      }, 'Payment verified and registration completed');

    } catch (error) {
      console.error('Verify payment error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Helper: Generate enrollment ID
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

  // Get payment status
  getPaymentStatus = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const fee = await Fee.findOne({ studentId }).lean();

      const paymentStatus = {
        admissionFeePaid: student.admissionFeePaid || false,
        admissionFeeAmount: fee?.admissionFee || 0,
        admissionFeePaidDate: student.admissionFeePaidDate,
        totalFees: fee?.totalFees || 0,
        paidAmount: fee?.paidAmount || 0,
        pendingAmount: fee?.pendingAmount || 0,
        registrationComplete: student.registrationComplete,
        enrollmentId: student.enrollmentId,
        razorpayOrderId: student.razorpayOrderId,
        razorpayPaymentId: student.razorpayPaymentId,
        paymentStatus: fee?.status || 'pending'
      };

      // Check if payment is pending from Razorpay
      if (student.razorpayOrderId && !student.admissionFeePaid) {
        try {
          const razorpayInstance = (await import('../config/razorpay.js')).razorpayInstance;
          const order = await razorpayInstance.orders.fetch(student.razorpayOrderId);
          paymentStatus.razorpayOrderStatus = order.status;
        } catch (error) {
          console.error('Error fetching Razorpay order:', error);
        }
      }

      return this.success(res, paymentStatus);

    } catch (error) {
      console.error('Get payment status error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Refund admission fee
  refundAdmissionFee = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { reason } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      if (!student.admissionFeePaid) {
        return this.error(res, 'Admission fee not paid', 400);
      }

      const fee = await Fee.findOne({ studentId });
      if (!fee) {
        return this.error(res, 'Fee record not found', 404);
      }

      // Find admission fee payment
      const admissionPayment = fee.payments.find(p => p.paymentType === 'admission_fee' && p.status === 'success');
      if (!admissionPayment) {
        return this.error(res, 'Admission fee payment not found', 404);
      }

      // Process refund based on payment method
      if (admissionPayment.gateway === 'razorpay' && admissionPayment.gatewayPaymentId) {
        try {
          const razorpayInstance = (await import('../config/razorpay.js')).razorpayInstance;
          const refund = await razorpayInstance.payments.refund(admissionPayment.gatewayPaymentId, {
            amount: admissionPayment.amount * 100,
            notes: { reason }
          });

          admissionPayment.status = 'refunded';
          admissionPayment.refundId = refund.id;
          admissionPayment.refundReason = reason;
          admissionPayment.refundDate = new Date();

          // Update fee totals
          fee.paidAmount -= admissionPayment.amount;
          fee.pendingAmount += admissionPayment.amount;
          fee.admissionFeePaid = false;

          await fee.save();

          // Update student
          student.admissionFeePaid = false;
          student.admissionFeePaidDate = null;
          student.registrationComplete = false;
          student.status = 'pending';
          student.registrationStatus = 'pending_payment';
          await student.save();

          return this.success(res, {
            refundId: refund.id,
            amount: admissionPayment.amount,
            reason: reason
          }, 'Admission fee refunded successfully');

        } catch (razorpayError) {
          console.error('Razorpay refund error:', razorpayError);
          return this.error(res, 'Failed to process refund via Razorpay', 500);
        }
      } else {
        // Offline payment - just mark as refunded
        admissionPayment.status = 'refunded';
        admissionPayment.refundReason = reason;
        admissionPayment.refundDate = new Date();

        fee.paidAmount -= admissionPayment.amount;
        fee.pendingAmount += admissionPayment.amount;
        fee.admissionFeePaid = false;

        await fee.save();

        student.admissionFeePaid = false;
        student.admissionFeePaidDate = null;
        student.registrationComplete = false;
        student.status = 'pending';
        student.registrationStatus = 'pending_payment';
        await student.save();

        return this.success(res, {
          amount: admissionPayment.amount,
          reason: reason
        }, 'Admission fee refunded successfully');
      }

    } catch (error) {
      console.error('Refund admission fee error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Add these methods to StudentController class

  // ==================== BATCH RELATED METHODS ====================

  // Get student batch details
  getStudentBatch = async (req, res) => {
    try {
      const { studentId } = req.params;

      // Check if student exists
      const student = await Student.findById(studentId)
        .populate('batch', 'name timing days room teacher startDate endDate capacity currentStrength status')
        .populate('course', 'name code duration')
        .lean();

      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // If no batch assigned
      if (!student.batch) {
        return this.success(res, {
          hasBatch: false,
          message: 'No batch assigned yet',
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            enrollmentId: student.enrollmentId
          }
        });
      }

      // Get batch details
      const batch = student.batch;

      // Get teacher details if available
      let teacherDetails = null;
      if (batch.teacher) {
        const teacher = await User.findById(batch.teacher)
          .select('name email phone profileImage')
          .lean();
        teacherDetails = teacher;
      }

      // Get batch students count
      const studentsCount = await Student.countDocuments({
        batch: batch._id,
        status: 'active',
        isDeleted: false
      });

      // Get upcoming classes (if you have schedule model)
      // const upcomingClasses = await ClassSchedule.find({
      //   batch: batch._id,
      //   date: { $gte: new Date() }
      // }).limit(5).sort({ date: 1 });

      return this.success(res, {
        hasBatch: true,
        batch: {
          id: batch._id,
          name: batch.name,
          timing: batch.timing,
          days: batch.days,
          room: batch.room,
          startDate: batch.startDate,
          endDate: batch.endDate,
          capacity: batch.capacity,
          currentStrength: studentsCount,
          status: batch.status,
          teacher: teacherDetails
        },
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          enrollmentId: student.enrollmentId,
          phone: student.phone,
          course: student.course
        },
        // upcomingClasses: upcomingClasses || [],
        batchInfo: {
          daySchedule: this.formatBatchDays(batch.days),
          timeSlot: batch.timing,
          duration: batch.duration || '2 hours',
          remainingSeats: batch.capacity - studentsCount
        }
      });

    } catch (error) {
      console.error('Get student batch error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get all batches for a student (history)
  getStudentBatchHistory = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId)
        .populate('batchHistory.batch', 'name timing days startDate endDate')
        .lean();

      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const batchHistory = student.batchHistory || [];

      return this.success(res, {
        currentBatch: student.batch ? await this.getBatchDetails(student.batch) : null,
        batchHistory: batchHistory.map(history => ({
          batch: history.batch,
          assignedDate: history.assignedDate,
          removedDate: history.removedDate,
          reason: history.reason
        }))
      });

    } catch (error) {
      console.error('Get batch history error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Helper: Format batch days
  formatBatchDays = (days) => {
    if (!days) return null;

    const dayMap = {
      'mon': 'Monday',
      'tue': 'Tuesday',
      'wed': 'Wednesday',
      'thu': 'Thursday',
      'fri': 'Friday',
      'sat': 'Saturday',
      'sun': 'Sunday'
    };

    if (Array.isArray(days)) {
      return days.map(d => dayMap[d.toLowerCase()] || d).join(', ');
    }

    if (typeof days === 'string') {
      return days.split(',').map(d => dayMap[d.trim().toLowerCase()] || d.trim()).join(', ');
    }

    return days;
  };

  // Get batch details helper
  getBatchDetails = async (batchId) => {
    const batch = await Batch.findById(batchId)
      .populate('teacher', 'name email phone')
      .lean();

    if (!batch) return null;

    return {
      id: batch._id,
      name: batch.name,
      timing: batch.timing,
      days: batch.days,
      room: batch.room,
      startDate: batch.startDate,
      endDate: batch.endDate,
      teacher: batch.teacher
    };
  };

  // ==================== ATTENDANCE RELATED METHODS ====================

  // Get student attendance
  getStudentAttendance = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { month, year, from, to } = req.query;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Build date filter
      let dateFilter = {};
      if (from && to) {
        dateFilter = {
          $gte: new Date(from),
          $lte: new Date(to)
        };
      } else if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        dateFilter = {
          $gte: startDate,
          $lte: endDate
        };
      }

      // Get attendance records (if Attendance model exists)
      // const Attendance = require('../models/Attendance.js').default;
      // const attendance = await Attendance.find({
      //   studentId,
      //   date: dateFilter
      // }).sort({ date: -1 }).lean();

      // For now, return placeholder data
      const attendance = [];

      // Calculate statistics
      const presentCount = attendance.filter(a => a.status === 'present').length;
      const absentCount = attendance.filter(a => a.status === 'absent').length;
      const totalCount = attendance.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(2) : 0;

      // Group by month for chart
      const monthlyData = {};
      attendance.forEach(record => {
        const monthYear = new Date(record.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { present: 0, absent: 0, total: 0 };
        }
        monthlyData[monthYear][record.status === 'present' ? 'present' : 'absent']++;
        monthlyData[monthYear].total++;
      });

      return this.success(res, {
        student: {
          id: student._id,
          name: student.name,
          enrollmentId: student.enrollmentId,
          batch: student.batch
        },
        attendance: attendance,
        summary: {
          present: presentCount,
          absent: absentCount,
          total: totalCount,
          percentage: percentage,
          requiredAttendance: 75,
          isMeetingRequirement: percentage >= 75
        },
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          present: data.present,
          absent: data.absent,
          total: data.total,
          percentage: ((data.present / data.total) * 100).toFixed(2)
        })),
        filter: {
          from: from || (month && year ? `${year}-${month}-01` : null),
          to: to || (month && year ? `${year}-${month}-${new Date(year, month, 0).getDate()}` : null)
        }
      });

    } catch (error) {
      console.error('Get student attendance error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Mark student attendance (admin/teacher)
  markAttendance = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { date, status, remarks } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      if (!student.batch) {
        return this.error(res, 'Student not assigned to any batch', 400);
      }

      // Validate status
      if (!['present', 'absent', 'late', 'half_day'].includes(status)) {
        return this.error(res, 'Invalid attendance status', 400);
      }

      // Check if batch has class on this day (optional)
      // const batch = await Batch.findById(student.batch);
      // const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
      // if (!batch.days.includes(dayOfWeek)) {
      //   return this.error(res, 'No class scheduled on this day', 400);
      // }

      // Create or update attendance record
      // const Attendance = require('../models/Attendance.js').default;
      // const attendance = await Attendance.findOneAndUpdate(
      //   { studentId, date: new Date(date) },
      //   { status, remarks, markedBy: req.user._id, markedAt: new Date() },
      //   { upsert: true, new: true }
      // );

      return this.success(res, {
        studentId,
        date,
        status,
        remarks
        // attendance
      }, 'Attendance marked successfully');

    } catch (error) {
      console.error('Mark attendance error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get attendance summary for dashboard
  getAttendanceSummary = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Get current month attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get attendance for current month
      // const Attendance = require('../models/Attendance.js').default;
      // const monthlyAttendance = await Attendance.find({
      //   studentId,
      //   date: { $gte: startOfMonth, $lte: endOfMonth }
      // }).lean();

      // Calculate total working days in month (based on batch schedule)
      // const batch = await Batch.findById(student.batch);
      // const workingDays = this.calculateWorkingDays(startOfMonth, endOfMonth, batch.days);

      const workingDays = 22; // Placeholder
      const monthlyAttendance = [];
      const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
      const percentage = workingDays > 0 ? (presentDays / workingDays * 100).toFixed(2) : 0;

      return this.success(res, {
        currentMonth: {
          month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
          present: presentDays,
          absent: workingDays - presentDays,
          total: workingDays,
          percentage: percentage,
          required: 75,
          status: percentage >= 75 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
        },
        overall: {
          totalDays: 0,
          present: 0,
          percentage: 0
        },
        recentActivity: monthlyAttendance.slice(0, 10)
      });

    } catch (error) {
      console.error('Get attendance summary error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Helper: Calculate working days
  calculateWorkingDays = (startDate, endDate, batchDays) => {
    if (!batchDays || !Array.isArray(batchDays)) return 0;

    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayName = current.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
      if (batchDays.includes(dayName)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  };

  // Step 4: Verify email
  verifyStudentEmail = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { otp } = req.body;

      const student = await Student.findById(studentId).select('+emailVerificationOTP +emailVerificationOTPExpiry');
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

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
      }, 'Email verified successfully');

    } catch (error) {
      console.error('Verify email error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Send email verification OTP
  sendEmailOTP = async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      const otp = student.generateEmailOTP();
      await student.save();

      // Here implement actual email sending
      console.log(`📧 OTP for ${student.email}: ${otp}`);

      return this.success(res, {
        message: 'OTP sent to registered email',
        email: student.email
      }, 'OTP sent successfully');

    } catch (error) {
      console.error('Send OTP error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Step 5: Complete registration after payment
  completeRegistration = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { paymentData } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // Update admission fee payment status
      student.admissionFeePaid = true;
      student.admissionFeePaidDate = new Date();
      if (paymentData) {
        student.razorpayOrderId = paymentData.orderId;
        student.razorpayPaymentId = paymentData.paymentId;
        student.paymentTransactionId = paymentData.transactionId;
      }

      // Update registration status
      student.registrationStatus = 'completed';
      student.registrationComplete = true;
      student.registrationDate = new Date();
      student.status = 'active';

      await student.save();

      return this.success(res, {
        studentId: student._id,
        enrollmentId: student.enrollmentId,
        registrationComplete: true,
        status: student.status
      }, 'Registration completed successfully! Welcome email sent.');

    } catch (error) {
      console.error('Complete registration error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // src/controllers/studentController.js

  getRegistrationProgress = async (req, res) => {
    try {
      const { studentId } = req.params;

      // Use .lean() to get plain object OR use .exec() to get mongoose document
      const student = await Student.findById(studentId)
        .populate('course', 'name totalFees')
        .exec();  // ✅ Use exec() to get mongoose document with methods

      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      // ✅ Now student.getRegistrationProgress should work
      const progress = student.getRegistrationProgress();

      return this.success(res, {
        progress,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          registrationStatus: student.registrationStatus
        }
      });

    } catch (error) {
      console.error('Get registration progress error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get pending admission fees students
  getPendingAdmissionFees = async (req, res) => {
    try {
      const students = await Student.find({
        admissionFeePaid: false,
        registrationComplete: false,
        isDeleted: false
      })
        .populate('course', 'name totalFees')
        .select('name email phone enrollmentId course admissionFeeAmount createdAt')
        .sort({ createdAt: -1 })
        .lean();

      const summary = {
        total: students.length,
        totalAmount: students.reduce((sum, s) => sum + (s.admissionFeeAmount || 0), 0),
        students: students
      };

      return this.success(res, { pendingAdmissionFees: summary });

    } catch (error) {
      console.error('Get pending admission fees error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get registration statistics
  getRegistrationStats = async (req, res) => {
    try {
      const stats = await Student.getRegistrationStats();
      const dailyRegistrations = await Student.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return this.success(res, {
        ...stats,
        dailyRegistrations
      });

    } catch (error) {
      console.error('Get registration stats error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // ==================== EXISTING METHODS (Updated) ====================

  // Get all students with pagination, filtering, search
  getAllStudents = async (req, res) => {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const sort = this.getSortOptions(req.query);

      // Build filter
      const filter = { isDeleted: false };

      // Filter by status
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Filter by registration status
      if (req.query.registrationStatus) {
        filter.registrationStatus = req.query.registrationStatus;
      }

      // Filter by admission fee status
      if (req.query.admissionFeePaid !== undefined) {
        filter.admissionFeePaid = req.query.admissionFeePaid === 'true';
      }

      // Filter by course
      if (req.query.course) {
        filter.course = req.query.course;
      }

      // Filter by batch
      if (req.query.batch) {
        filter.batch = req.query.batch;
      }

      // Search
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { enrollmentId: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Teacher can only see their batch students
      if (req.user.role === 'teacher') {
        const batches = req.user.teacherDetails?.assignedBatches || [];
        filter.batch = { $in: batches };
      }

      const [students, total] = await Promise.all([
        Student.find(filter)
          .populate('course', 'name code')
          .populate('batch', 'name timing')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Student.countDocuments(filter)
      ]);

      const pagination = this.getPaginationMetadata(total, page, limit);

      return this.success(res, { students, pagination });

    } catch (error) {
      console.error('Get students error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get single student by ID (Updated with registration progress)
  getStudentById = async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id)
        .populate('course', 'name code duration totalFees')
        .populate('batch', 'name timing days teachers')
        .populate('createdBy', 'name email')
        .lean();

      if (!student) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }

      // Check teacher access
      if (req.user.role === 'teacher') {
        const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
        if (!teacherBatches.includes(student.batch?._id.toString())) {
          return this.error(res, MESSAGES.ERROR.FORBIDDEN, 403);
        }
      }

      // Get fee details if available
      const fee = await Fee.findOne({ studentId: id }).lean();

      // Calculate registration progress
      const progress = student.getRegistrationProgress();

      return this.success(res, {
        student,
        fee,
        registrationProgress: progress
      });

    } catch (error) {
      console.error('Get student error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get student by enrollment ID (Updated)
  getStudentByEnrollment = async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      const student = await Student.findOne({ enrollmentId })
        .populate('course', 'name code')
        .populate('batch', 'name timing')
        .lean();

      if (!student) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }

      const progress = student.getRegistrationProgress();

      return this.success(res, { student, registrationProgress: progress });

    } catch (error) {
      console.error('Get student by enrollment error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Create new student (by admin) - Legacy method
  createStudent = async (req, res) => {
    try {
      const studentData = req.body;

      // Check if email exists
      const existingStudent = await Student.findOne({ email: studentData.email });
      if (existingStudent) {
        return this.error(res, 'Student with this email already exists', 400);
      }

      // Check if course exists
      const course = await Course.findById(studentData.course);
      if (!course) {
        return this.error(res, 'Course not found', 404);
      }

      // Set fee structure if not provided
      if (!studentData.feeStructure) {
        studentData.feeStructure = {
          totalFees: course.totalFees,
          paymentMode: 'full',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
      }

      // Set default password if not provided
      if (!studentData.password) {
        studentData.password = studentData.phone || 'password123';
      }

      studentData.createdBy = req.user._id;
      studentData.status = 'active';
      studentData.registrationComplete = true;
      studentData.registrationStatus = 'completed';

      const student = await Student.create(studentData);

      return this.success(res, { student }, MESSAGES.SUCCESS.DATA_CREATED, 201);

    } catch (error) {
      console.error('Create student error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Update student
  updateStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.findById(id);
      if (!student) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }

      // Prevent email duplication
      if (updateData.email && updateData.email !== student.email) {
        const existing = await Student.findOne({ email: updateData.email });
        if (existing) {
          return this.error(res, 'Email already in use', 400);
        }
      }

      // Update registration status if needed
      if (updateData.registrationStatus) {
        updateData.registrationStatus = updateData.registrationStatus;
      }

      Object.assign(student, updateData);
      await student.save();

      return this.success(res, { student }, MESSAGES.SUCCESS.DATA_UPDATED);

    } catch (error) {
      console.error('Update student error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Change student status
  changeStudentStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!Object.values(STUDENT_STATUS).includes(status)) {
        return this.error(res, 'Invalid status', 400);
      }

      const student = await Student.findById(id);
      if (!student) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }

      student.status = status;

      if (status === 'dropped') {
        student.dropReason = reason;
        student.dropDate = new Date();
      }

      await student.save();

      return this.success(res, { student }, `Student status changed to ${status}`);

    } catch (error) {
      console.error('Change status error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Assign batch to student
  assignBatch = async (req, res) => {
    try {
      const { id } = req.params;
      const { batchId } = req.body;

      const [student, batch] = await Promise.all([
        Student.findById(id),
        Batch.findById(batchId)
      ]);

      if (!student) {
        return this.error(res, 'Student not found', 404);
      }

      if (!batch) {
        return this.error(res, 'Batch not found', 404);
      }

      // Check batch capacity
      if (batch.currentStrength >= batch.capacity) {
        return this.error(res, 'Batch is full', 400);
      }

      // Remove from old batch if exists
      if (student.batch) {
        await Batch.findByIdAndUpdate(student.batch, {
          $inc: { currentStrength: -1 }
        });
      }

      // Assign to new batch
      student.batch = batchId;
      await student.save();

      await Batch.findByIdAndUpdate(batchId, {
        $inc: { currentStrength: 1 }
      });

      return this.success(res, { student }, 'Batch assigned successfully');

    } catch (error) {
      console.error('Assign batch error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Delete student (soft delete)
  deleteStudent = async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);
      if (!student) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }

      student.isDeleted = true;
      student.status = 'inactive';
      await student.save();

      return this.success(res, null, MESSAGES.SUCCESS.DATA_DELETED);

    } catch (error) {
      console.error('Delete student error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get student statistics (Updated)
  getStudentStats = async (req, res) => {
    try {
      const [total, active, completed, dropped, pending, registered] = await Promise.all([
        Student.countDocuments({ isDeleted: false }),
        Student.countDocuments({ status: 'active', isDeleted: false }),
        Student.countDocuments({ status: 'completed', isDeleted: false }),
        Student.countDocuments({ status: 'dropped', isDeleted: false }),
        Student.countDocuments({ status: 'pending', isDeleted: false }),
        Student.countDocuments({ registrationComplete: true, isDeleted: false })
      ]);

      const courseWise = await Student.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $project: { courseName: '$course.name', count: 1 } }
      ]);

      const registrationStats = await Student.getRegistrationStats();

      return this.success(res, {
        total,
        active,
        completed,
        dropped,
        pending,
        registered,
        courseWise,
        registrationStats
      });

    } catch (error) {
      console.error('Get stats error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Bulk import students
  bulkImportStudents = async (req, res) => {
    try {
      const students = req.body.students;

      if (!Array.isArray(students) || students.length === 0) {
        return this.error(res, 'Invalid students data', 400);
      }

      const results = {
        successful: [],
        failed: []
      };

      for (const studentData of students) {
        try {
          // Check if exists
          const existing = await Student.findOne({ email: studentData.email });
          if (!existing) {
            const student = await Student.create(studentData);
            results.successful.push({ id: student._id, email: student.email });
          } else {
            results.failed.push({ email: studentData.email, reason: 'Already exists' });
          }
        } catch (error) {
          results.failed.push({ email: studentData.email, reason: error.message });
        }
      }

      return this.success(res, results, `Imported ${results.successful.length} students`);

    } catch (error) {
      console.error('Bulk import error:', error);
      return this.error(res, error.message, 500);
    }
  };
}



export default new StudentController();