import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Inquiry from '../models/Inquiry.js';
import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class PublicController extends BaseController {
  // Get all public courses
  getPublicCourses = async (req, res) => {
    try {
      const courses = await Course.find({ isActive: true })
        .select('name code description duration totalFees image')
        .sort({ createdAt: -1 })
        .lean();
      
      return this.success(res, { courses });
      
    } catch (error) {
      console.error('Get public courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get course details
  getPublicCourseById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await Course.findById(id)
        .select('name code description duration totalFees eligibility syllabus image')
        .lean();
      
      if (!course) {
        return this.error(res, 'Course not found', 404);
      }
      
      const batches = await Batch.find({ 
        course: id, 
        status: 'upcoming',
        startDate: { $gt: new Date() }
      })
        .select('name timing days startDate')
        .limit(5)
        .lean();
      
      return this.success(res, { course, batches });
      
    } catch (error) {
      console.error('Get course details error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Submit inquiry (Public)
  submitInquiry = async (req, res) => {
    try {
      const { name, email, phone, course, courseName, message, preferredBatch } = req.body;
      
      const existing = await Inquiry.findOne({ 
        email, 
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      if (existing) {
        return this.success(res, null, 'We have received your inquiry. Our team will contact you soon.', 200);
      }
      
      const inquiry = await Inquiry.create({
        name,
        email,
        phone,
        course: course || null,
        courseName: courseName || (course ? null : 'General Inquiry'),
        message,
        source: 'website',
        preferredBatch,
        status: 'new'
      });
      
      return this.success(res, { 
        inquiryId: inquiry._id 
      }, 'Thank you for your interest! Our team will contact you within 24 hours.', 201);
      
    } catch (error) {
      console.error('Submit inquiry error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Verify certificate (Public)
 verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    console.log('🔍 PUBLIC VERIFY CALLED with ID:', certificateId);
    
    const certificate = await Certificate.findOne({ certificateId })
      .populate('studentId', 'name fatherName motherName enrollmentNo')
      .populate('courseId', 'name duration')
      .populate('issuedBy', 'name')
      .lean();
    
    console.log('📦 Found certificate:', certificate ? 'YES' : 'NO');
    
    if (!certificate) {
      return this.success(res, { 
        isValid: false, 
        message: 'Certificate not found or invalid certificate ID.' 
      });
    }
    
    // ... rest of code
  } catch (error) {
    console.error('Verify certificate error:', error);
    return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
  }
};
  // Check fee status (Public - by enrollment)
  checkFeeStatus = async (req, res) => {
    try {
      const { enrollmentNo } = req.params;
      
      const student = await Student.findOne({ enrollmentNo })
        .select('name enrollmentNo email phone')
        .lean();
      
      if (!student) {
        return this.error(res, 'Student not found', 404);
      }
      
      const fee = await Fee.findOne({ studentId: student._id })
        .select('totalFees paidAmount pendingAmount dueDate status')
        .lean();
      
      if (!fee) {
        return this.success(res, {
          student,
          fee: null,
          message: 'No fee record found'
        });
      }
      
      return this.success(res, {
        student: {
          name: student.name,
          enrollmentNo: student.enrollmentNo
        },
        fee: {
          totalFees: fee.totalFees,
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          dueDate: fee.dueDate,
          status: fee.status
        }
      });
      
    } catch (error) {
      console.error('Check fee status error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get upcoming events (Public)
  getUpcomingEvents = async (req, res) => {
    try {
      const events = [
        {
          title: 'New Batch Starting',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          description: 'New batches for JEE and NEET starting soon'
        },
        {
          title: 'Parent-Teacher Meeting',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description: 'Annual parent-teacher meeting'
        }
      ];
      
      return this.success(res, { events });
      
    } catch (error) {
      console.error('Get events error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get notices (Public)
  getNotices = async (req, res) => {
    try {
      const notices = [
        {
          title: 'Admission Open',
          content: 'Admissions for 2024-25 batch are now open',
          date: new Date()
        },
        {
          title: 'Holiday Notice',
          content: 'Center will remain closed on Republic Day',
          date: new Date()
        }
      ];
      
      return this.success(res, { notices });
      
    } catch (error) {
      console.error('Get notices error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get contact info
  getContactInfo = async (req, res) => {
    return this.success(res, {
      address: {
        street: '123 Education Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      phone: '+91 9876543210',
      email: 'info@coachingcenter.com',
      timings: 'Monday - Saturday: 9:00 AM - 7:00 PM',
      socialMedia: {
        facebook: 'https://facebook.com/coachingcenter',
        instagram: 'https://instagram.com/coachingcenter',
        twitter: 'https://twitter.com/coachingcenter',
        youtube: 'https://youtube.com/coachingcenter'
      }
    });
  };
}

export default new PublicController();