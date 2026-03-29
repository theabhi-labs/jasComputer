import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';
import Inquiry from '../models/Inquiry.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class DashboardController extends BaseController {
  // Super Admin Dashboard
  getSuperAdminDashboard = async (req, res) => {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalCourses,
        totalBatches,
        totalInquiries,
        totalFeesCollected,
        pendingFees,
        recentStudents,
        recentInquiries
      ] = await Promise.all([
        Student.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: 'teacher', isDeleted: false }),
        User.countDocuments({ role: 'admin', isDeleted: false }),
        Course.countDocuments({ isActive: true }),
        Batch.countDocuments({ status: 'ongoing' }),
        Inquiry.countDocuments({ status: 'new' }),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$pendingAmount' } } }]),
        Student.find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('course', 'name')
          .lean(),
        Inquiry.find({ status: 'new' })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);
      
      // Monthly fee collection trend
      const monthlyCollection = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.paymentDate': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
        { $group: {
            _id: { $month: '$payments.paymentDate' },
            total: { $sum: '$payments.amount' },
            monthName: { $first: { $dateToString: { format: '%b', date: '$payments.paymentDate' } } }
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
        totalBatches,
        todayAttendance,
        totalFeesCollected,
        pendingFees,
        activeStudents
      ] = await Promise.all([
        Student.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: 'teacher', status: 'active' }),
        Course.countDocuments({ isActive: true }),
        Batch.countDocuments({ status: 'ongoing' }),
        Attendance.countDocuments({ 
          date: { $gte: new Date().setHours(0, 0, 0, 0) }
        }),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
        Fee.aggregate([{ $group: { _id: null, total: { $sum: '$pendingAmount' } } }]),
        Student.countDocuments({ status: 'active' })
      ]);
      
      // Gender distribution
      const genderDistribution = await Student.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      
      // Course-wise student distribution
      const courseDistribution = await Student.aggregate([
        { $match: { isDeleted: false } },
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
      
      const [batches, students, todayAttendance, totalStudents] = await Promise.all([
        Batch.find({ _id: { $in: teacherBatches }, status: 'ongoing' })
          .populate('course', 'name')
          .lean(),
        Student.find({ batch: { $in: teacherBatches }, status: 'active' })
          .select('name enrollmentNo')
          .lean(),
        Attendance.countDocuments({
          batchId: { $in: teacherBatches },
          date: { $gte: new Date().setHours(0, 0, 0, 0) },
          status: 'present'
        }),
        Student.countDocuments({ batch: { $in: teacherBatches }, status: 'active' })
      ]);
      
      // Today's classes
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayClasses = batches.filter(batch => 
        batch.days?.includes(today)
      );
      
      // Attendance percentage for each batch
      const batchAttendance = await Promise.all(
        batches.map(async (batch) => {
          const total = await Attendance.countDocuments({ batchId: batch._id });
          const present = await Attendance.countDocuments({ 
            batchId: batch._id, 
            status: 'present' 
          });
          return {
            batchName: batch.name,
            total,
            present,
            percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0
          };
        })
      );
      
      return this.success(res, {
        overview: {
          totalBatches: batches.length,
          totalStudents,
          todayAttendance,
          pendingClasses: todayClasses.length
        },
        batches: batchAttendance,
        todayClasses,
        recentStudents: students.slice(0, 10)
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
      
      const [student, fee, attendance, certificates] = await Promise.all([
        Student.findById(studentId)
          .populate('course', 'name duration')
          .populate('batch', 'name timing days')
          .lean(),
        Fee.findOne({ studentId }).lean(),
        Attendance.find({ studentId })
          .sort({ date: -1 })
          .limit(30)
          .lean(),
        Certificate.find({ studentId, status: 'issued' })
          .sort({ issueDate: -1 })
          .limit(5)
          .lean()
      ]);
      
      // Calculate attendance percentage
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
      
      // Upcoming payments
      let upcomingPayments = [];
      if (fee && fee.status !== 'paid') {
        upcomingPayments.push({
          dueDate: fee.dueDate,
          amount: fee.pendingAmount,
          status: fee.status
        });
      }
      
      // Recent notifications (simulated)
      const notifications = [
        {
          title: 'Fee Reminder',
          message: `Your fee of ₹${fee?.pendingAmount || 0} is due on ${new Date(fee?.dueDate).toLocaleDateString()}`,
          type: 'warning'
        }
      ];
      
      return this.success(res, {
        student: {
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          course: student.course,
          batch: student.batch
        },
        fee: {
          totalFees: fee?.totalFees || 0,
          paidAmount: fee?.paidAmount || 0,
          pendingAmount: fee?.pendingAmount || 0,
          status: fee?.status || 'pending'
        },
        attendance: {
          percentage: attendancePercentage,
          totalDays,
          presentDays
        },
        certificates,
        upcomingPayments,
        notifications
      });
      
    } catch (error) {
      console.error('Student dashboard error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new DashboardController();