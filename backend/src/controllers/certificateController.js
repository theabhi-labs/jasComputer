import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';
import { CERTIFICATE_STATUS } from '../constants/status.js';

class CertificateController extends BaseController {

async generateCertificateId() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 01-12
  const year = String(now.getFullYear()).slice(-2); // last 2 digits, e.g., 2026 → 26

  // Count certificates issued in the current month
  const certCount = await Certificate.countDocuments({
    issueDate: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
  });

  // Determine series (A, B, C...) and serial number
  const seriesIndex = Math.floor(certCount / 100); // 0 → A, 1 → B
  const serial = (certCount % 100) + 1; // 1-100

  const seriesChar = String.fromCharCode(65 + seriesIndex); // 65 = 'A'
  const serialStr = String(serial).padStart(3, '0'); // 001-100

  // Final certificate ID
  return `JAS${seriesChar}${month}${year}${serialStr}`;
}

  // Get all certificates
  getAllCertificates = async (req, res) => {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};
      
      if (req.query.studentId) filter.studentId = req.query.studentId;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.status) filter.status = req.query.status;
      
      const [certificates, total] = await Promise.all([
        Certificate.find(filter)
          .populate('studentId', 'name enrollmentNo email')
          .populate('courseId', 'name code')
          .populate('issuedBy', 'name')
          .sort({ issueDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Certificate.countDocuments(filter)
      ]);
      
      const pagination = this.getPaginationMetadata(total, page, limit);
      
      return this.success(res, { certificates, pagination });
      
    } catch (error) {
      console.error('Get certificates error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get certificate by ID
  getCertificateById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const certificate = await Certificate.findById(id)
        .populate('studentId', 'name enrollmentNo email fatherName motherName')
        .populate('courseId', 'name duration description')
        .populate('issuedBy', 'name')
        .lean();
      
      if (!certificate) {
        return this.error(res, 'Certificate not found', 404);
      }
      
      return this.success(res, { certificate });
      
    } catch (error) {
      console.error('Get certificate error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Generate certificate for student
  generateCertificate = async (req, res) => {
    try {
      const { studentId, type, grade, percentage } = req.body;
      
      const student = await Student.findById(studentId)
        .populate('course', 'name duration')
        .populate('batch', 'name');
      
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }
      
      // Check if certificate already exists
      const existingCert = await Certificate.findOne({ 
        studentId, 
        type: type || 'course_completion' 
      });
      
      if (existingCert) {
        return this.error(res, 'Certificate already exists for this student', 400);
      }
      
      const certificate = await Certificate.create({
        studentId,
        certificateId: await this.generateCertificateId(),
        type: type || 'course_completion',
        courseId: student.course._id,
        issueDate: new Date(),
        grade,
        percentage,
        status: 'issued',
        issuedBy: req.user._id
      });
      
      // Generate QR code URL (simulated)
      const qrData = {
        certificateId: certificate.certificateId,
        studentName: student.name,
        course: student.course.name,
        issueDate: certificate.issueDate
      };
      
      // TODO: Generate actual QR code
      certificate.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
      await certificate.save();
      
      return this.success(res, { 
        certificate,
        verificationUrl: `${process.env.FRONTEND_URL}/certificates/verify/${certificate.certificateId}`
      }, 'Certificate generated successfully', 201);
      
    } catch (error) {
      console.error('Generate certificate error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Public certificate preview/download by certificateId
downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log('🔍 Downloading certificate:', certificateId);

    // Find certificate by certificateId
    const certificate = await Certificate.findOne({ certificateId })
      .populate('studentId', 'name email enrollmentId fatherName motherName')
      .populate('courseId', 'name duration description')
      .populate('issuedBy', 'name email')
      .lean();

    if (!certificate) {
      return this.error(res, 'Certificate not found', 404);
    }

    // Prepare data for frontend PDF
    const certificateData = {
      certificateId: certificate.certificateId,
      type: certificate.type,
      grade: certificate.grade,
      percentage: certificate.percentage,
      status: certificate.status,
      issueDate: certificate.issueDate,
      qrCode: certificate.qrCode,
      student: {
        name: certificate.studentId?.name || 'N/A',
        email: certificate.studentId?.email || 'N/A',
        enrollmentId: certificate.studentId?.enrollmentId || 'N/A',
        fatherName: certificate.studentId?.fatherName || '',
        motherName: certificate.studentId?.motherName || ''
      },
      course: certificate.courseId ? {
        name: certificate.courseId.name,
        duration: certificate.courseId.duration,
        description: certificate.courseId.description || ''
      } : null,
      issuedBy: certificate.issuedBy?.name || 'System'
    };

    return this.success(res, { certificate: certificateData }, 'Certificate data fetched successfully');

  } catch (error) {
    console.error('Download certificate error:', error);
    return this.error(res, error.message, 500);
  }
};
// src/controllers/certificateController.js
verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log('🔍 Verifying certificate:', certificateId);

    // Find certificate
    const certificate = await Certificate.findOne({ certificateId })
      .populate('studentId', 'name email enrollmentId fatherName motherName profileImage') // added profileImage
      .populate('courseId', 'name code duration description')
      .populate('issuedBy', 'name email')
      .lean();

    if (!certificate) {
      return this.error(res, 'Certificate not found', 404);
    }

    // Check if revoked
    if (certificate.status === 'revoked') {
      return this.success(res, {
        valid: false,
        status: 'revoked',
        certificateId: certificate.certificateId,
        revokedReason: certificate.revokedReason,
        revokedAt: certificate.revokedAt,
        message: 'This certificate has been revoked'
      }, 'Certificate has been revoked');
    }

    // Update verification count
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificate._id,
      { $inc: { verifiedCount: 1 } },
      { new: true }
    );

    // Prepare response
    const verificationData = {
      valid: true,
      status: certificate.status,
      certificateId: certificate.certificateId,
      student: {
        name: certificate.studentId?.name || 'N/A',
        email: certificate.studentId?.email || 'N/A',
        enrollmentId: certificate.studentId?.enrollmentId || 'N/A',
        fatherName: certificate.studentId?.fatherName || '',
        motherName: certificate.studentId?.motherName || '',
        profileImage: certificate.studentId?.profileImage || '' // added profile photo
      },
      course: certificate.courseId ? {
        name: certificate.courseId.name,
        code: certificate.courseId.code,
        duration: certificate.courseId.duration,
        description: certificate.courseId.description || ''
      } : null,
      type: certificate.type,
      grade: certificate.grade,
      percentage: certificate.percentage,
      issueDate: certificate.issueDate,
      issuedBy: certificate.issuedBy?.name || 'System',
      verifiedCount: updatedCertificate.verifiedCount,
      qrCode: certificate.qrCode,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-certificate/${certificate.certificateId}`
    };

    return this.success(res, { verificationData }, 'Certificate verified successfully');

  } catch (error) {
    console.error('Verify certificate error:', error);
    return this.error(res, error.message, 500);
  }
};

  // Get student certificates
getStudentCertificates = async (req, res) => {
    try {
      const { studentId } = req.params;
      
      const certificates = await Certificate.find({ studentId, status: 'issued' })
        .populate('courseId', 'name')
        .sort({ issueDate: -1 })
        .lean();
      
      return this.success(res, { certificates });
      
    } catch (error) {
      console.error('Get student certificates error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };


  // Revoke certificate
  revokeCertificate = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const certificate = await Certificate.findById(id);
      if (!certificate) {
        return this.error(res, 'Certificate not found', 404);
      }
      
      certificate.status = 'revoked';
      certificate.revokedReason = reason;
      certificate.revokedAt = new Date();
      await certificate.save();
      
      return this.success(res, { certificate }, 'Certificate revoked successfully');
      
    } catch (error) {
      console.error('Revoke certificate error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get certificate statistics
  getCertificateStats = async (req, res) => {
    try {
      const [total, issued, revoked] = await Promise.all([
        Certificate.countDocuments(),
        Certificate.countDocuments({ status: 'issued' }),
        Certificate.countDocuments({ status: 'revoked' })
      ]);
      
      const monthlyIssued = await Certificate.aggregate([
        { $match: { status: 'issued' } },
        { $group: {
            _id: { $month: '$issueDate' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return this.success(res, {
        total,
        issued,
        revoked,
        monthlyIssued
      });
      
    } catch (error) {
      console.error('Get stats error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new CertificateController();