import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Fee from '../models/Fee.js';
import FeeTransaction from '../models/FeeTransaction.js';
import Certificate from '../models/Certificate.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class DashboardController extends BaseController {
  // Super Admin Dashboard
  getSuperAdminDashboard = async (req, res) => {
    try {
      const [
        totalStudents,
        totalAdmins,
        totalTeachers,
        totalCourses,
        totalFeesCollected,
        pendingFees,
        recentStudents,
      ] = await Promise.all([
        Student.countDocuments({}),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'teacher' }),
        Course.countDocuments({ isActive: true }),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$remainingAmount' } } }]),
        Student.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('course', 'name')
          .lean()
      ]);
      
      const totalBatches = 0;
      const totalInquiries = 0;
      const recentInquiries = [];

      // Monthly fee collection trend from FeeTransaction
      const monthlyCollection = await FeeTransaction.aggregate([
        { 
          $match: { 
            paymentDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } 
          } 
        },
        { 
          $group: {
            _id: { $month: '$paymentDate' },
            total: { $sum: '$amount' },
            monthName: { $first: { $dateToString: { format: '%b', date: '$paymentDate' } } }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return this.success(res, {
        overview: {
          totalStudents,
          totalTeachers,
          totalAdmins,
          totalCourses,
          totalBatches,
          totalInquiries,
          totalFeesCollected: totalFeesCollected[0]?.total || 0,
          pendingFees: pendingFees[0]?.total || 0
        },
        recentActivities: {
          recentStudents,
          recentInquiries
        },
        charts: {
          monthlyCollection
        }
      });
      
    } catch (error) {
      console.error('Super admin dashboard error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Admin Dashboard
  getAdminDashboard = async (req, res) => {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalFeesCollected,
        pendingFees,
        activeStudents
      ] = await Promise.all([
        Student.countDocuments({}),
        User.countDocuments({ role: 'teacher' }),
        Course.countDocuments({ isActive: true }),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$remainingAmount' } } }]),
        Student.countDocuments({ status: 'active' })
      ]);
      
      const totalBatches = 0;
      const todayAttendance = 0;

      // Gender distribution
      const genderDistribution = await Student.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      
      // Course-wise student distribution
      const courseDistribution = await Student.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $project: { courseName: '$course.name', count: 1 } }
      ]);
      
      return this.success(res, {
        overview: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalBatches,
          todayAttendance,
          totalFeesCollected: totalFeesCollected[0]?.total || 0,
          pendingFees: pendingFees[0]?.total || 0,
          activeStudents
        },
        distribution: {
          gender: genderDistribution,
          courses: courseDistribution
        }
      });
      
    } catch (error) {
      console.error('Admin dashboard error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Teacher Dashboard
  getTeacherDashboard = async (req, res) => {
    try {
      const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
      
      const [students, totalStudents] = await Promise.all([
        Student.find({ status: 'active' })
          .select('name')
          .limit(10)
          .lean(),
        Student.countDocuments({ status: 'active' })
      ]);
      
      return this.success(res, {
        overview: {
          totalBatches: teacherBatches.length,
          totalStudents,
          todayAttendance: 0,
          pendingClasses: 0
        },
        batches: [],
        todayClasses: [],
        recentStudents: students
      });
      
    } catch (error) {
      console.error('Teacher dashboard error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Student Dashboard
  getStudentDashboard = async (req, res) => {
    try {
      const studentId = req.user._id;
      
      const [student, fee, certificates] = await Promise.all([
        Student.findOne({ email: req.user.email })
          .populate('course', 'name duration')
          .lean(),
        Fee.findOne({ student: studentId }).lean(),
        Certificate.find({ studentId, status: 'issued' })
          .sort({ issueDate: -1 })
          .limit(5)
          .lean()
      ]);
      
      // Recent notifications (simulated)
      const notifications = [];
      if (fee && fee.status !== 'paid') {
        notifications.push({
          title: 'Fee Reminder',
          message: `Your fee of ₹${fee?.remainingAmount || 0} is pending`,
          type: 'warning'
        });
      }
      
      return this.success(res, {
        student: {
          name: student?.name || req.user.name,
          enrollmentNo: student?.aadharNo || 'N/A',
          course: student?.course || null,
          batch: null
        },
        fee: {
          totalFees: fee?.totalFee || 0,
          paidAmount: fee?.paidAmount || 0,
          pendingAmount: fee?.remainingAmount || 0,
          status: fee?.status || 'pending'
        },
        attendance: {
          percentage: 100,
          totalDays: 0,
          presentDays: 0
        },
        certificates: certificates || [],
        upcomingPayments: fee && fee.status !== 'paid' ? [{
          dueDate: fee.updatedAt,
          amount: fee.remainingAmount,
          status: fee.status
        }] : [],
        notifications
      });
      
    } catch (error) {
      console.error('Student dashboard error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new DashboardController();