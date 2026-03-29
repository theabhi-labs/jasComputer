import Inquiry from '../models/Inquiry.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';
import { INQUIRY_STATUS } from '../constants/status.js';

class InquiryController extends BaseController {
  // Get all inquiries
  getAllInquiries = async (req, res) => {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};
      
      if (req.query.status) filter.status = req.query.status;
      if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
      if (req.query.source) filter.source = req.query.source;
      
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      const [inquiries, total] = await Promise.all([
        Inquiry.find(filter)
          .populate('course', 'name')
          .populate('assignedTo', 'name email')
          .populate('remarks.createdBy', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Inquiry.countDocuments(filter)
      ]);
      
      const pagination = this.getPaginationMetadata(total, page, limit);
      
      return this.success(res, { inquiries, pagination });
      
    } catch (error) {
      console.error('Get inquiries error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get single inquiry
  getInquiryById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const inquiry = await Inquiry.findById(id)
        .populate('course', 'name')
        .populate('assignedTo', 'name email')
        .populate('remarks.createdBy', 'name')
        .lean();
      
      if (!inquiry) {
        return this.error(res, 'Inquiry not found', 404);
      }
      
      return this.success(res, { inquiry });
      
    } catch (error) {
      console.error('Get inquiry error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Create inquiry (Public)
  createInquiry = async (req, res) => {
    try {
      const { name, email, phone, course, courseName, message, source, preferredBatch } = req.body;
      
      // Check if already exists
      const existing = await Inquiry.findOne({ email, status: { $ne: 'converted' } });
      if (existing) {
        return this.success(res, null, 'We have received your inquiry. Our team will contact you soon.', 200);
      }
      
      const inquiry = await Inquiry.create({
        name,
        email,
        phone,
        course,
        courseName: courseName || (course ? null : 'General Inquiry'),
        message,
        source: source || 'website',
        preferredBatch,
        status: 'new'
      });
      
      // TODO: Send notification to admin
      // await sendInquiryNotification(inquiry);
      
      return this.success(res, { 
        inquiryId: inquiry._id 
      }, 'Inquiry submitted successfully. Our team will contact you soon.', 201);
      
    } catch (error) {
      console.error('Create inquiry error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Update inquiry status
  updateInquiryStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, followUpDate } = req.body;
      
      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return this.error(res, 'Inquiry not found', 404);
      }
      
      if (status) inquiry.status = status;
      if (assignedTo) inquiry.assignedTo = assignedTo;
      if (followUpDate) inquiry.followUpDate = followUpDate;
      
      await inquiry.save();
      
      return this.success(res, { inquiry }, `Inquiry status updated to ${status}`);
      
    } catch (error) {
      console.error('Update inquiry error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Add remark to inquiry
  addRemark = async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      
      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return this.error(res, 'Inquiry not found', 404);
      }
      
      inquiry.remarks.push({
        comment,
        createdBy: req.user._id
      });
      
      await inquiry.save();
      
      return this.success(res, { remarks: inquiry.remarks }, 'Remark added successfully');
      
    } catch (error) {
      console.error('Add remark error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Convert inquiry to student
  convertToStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      
      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return this.error(res, 'Inquiry not found', 404);
      }
      
      // Create student from inquiry
      const student = await Student.create({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        password: studentData.password || inquiry.phone,
        fatherName: studentData.fatherName,
        address: studentData.address,
        course: inquiry.course || studentData.course,
        admissionDate: new Date(),
        createdBy: req.user._id
      });
      
      // Update inquiry
      inquiry.status = 'converted';
      inquiry.convertedToStudent = student._id;
      inquiry.convertedAt = new Date();
      await inquiry.save();
      
      return this.success(res, { 
        student,
        inquiry 
      }, 'Inquiry converted to student successfully');
      
    } catch (error) {
      console.error('Convert to student error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get inquiry statistics
  getInquiryStats = async (req, res) => {
    try {
      const [total, new_, contacted, converted, lost] = await Promise.all([
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: 'new' }),
        Inquiry.countDocuments({ status: 'contacted' }),
        Inquiry.countDocuments({ status: 'converted' }),
        Inquiry.countDocuments({ status: 'lost' })
      ]);
      
      const sourceWise = await Inquiry.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const monthlyInquiries = await Inquiry.aggregate([
        { $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return this.success(res, {
        summary: { total, new: new_, contacted, converted, lost },
        sourceWise,
        monthlyInquiries,
        conversionRate: ((converted / total) * 100).toFixed(2)
      });
      
    } catch (error) {
      console.error('Get stats error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new InquiryController();