import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import BaseController from './baseController.js';
import { format } from 'date-fns';

class TeacherController extends BaseController {
  // Get teacher dashboard
  getTeacherDashboard = async (req, res) => {
    try {
      const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
      
      const batches = await Batch.find({ 
        _id: { $in: teacherBatches }, 
        status: 'ongoing' 
      }).populate('course', 'name');
      
      const students = await Student.find({ 
        batch: { $in: teacherBatches }, 
        status: 'active' 
      }).select('name enrollmentNo');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAttendance = await Attendance.countDocuments({
        batchId: { $in: teacherBatches },
        date: { $gte: new Date(today) },
        status: 'present'
      });
      
      // Today's classes
      const todayClasses = batches.filter(batch => 
        batch.days?.includes(format(new Date(), 'EEEE'))
      ).map(batch => ({
        batchName: batch.name,
        subject: batch.course?.name,
        timing: `${batch.timing?.startTime} - ${batch.timing?.endTime}`,
        room: batch.room,
        students: batch.currentStrength || 0
      }));
      
      return this.success(res, {
        overview: {
          totalStudents: students.length,
          totalBatches: batches.length,
          todayClasses: todayClasses.length,
          todayAttendance,
          averageAttendance: 85
        },
        todayClasses,
        batches: batches.map(batch => ({
          batchName: batch.name,
          total: batch.currentStrength || 0,
          present: 0
        })),
        recentActivities: []
      });
      
    } catch (error) {
      console.error('Teacher dashboard error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get assigned batches
  getAssignedBatches = async (req, res) => {
    try {
      const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
      
      const batches = await Batch.find({ _id: { $in: teacherBatches } })
        .populate('course', 'name')
        .sort({ createdAt: -1 });
      
      return this.success(res, { batches });
      
    } catch (error) {
      console.error('Get batches error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get batch details
  getBatchDetails = async (req, res) => {
    try {
      const { batchId } = req.params;
      
      const batch = await Batch.findById(batchId)
        .populate('course', 'name')
        .populate('teachers', 'name email');
      
      if (!batch) {
        return this.error(res, 'Batch not found', 404);
      }
      
      // Check if teacher is assigned to this batch
      const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
      if (!teacherBatches.includes(batchId)) {
        return this.error(res, 'You are not assigned to this batch', 403);
      }
      
      return this.success(res, { batch });
      
    } catch (error) {
      console.error('Get batch error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get batch students
  getBatchStudents = async (req, res) => {
    try {
      const { batchId } = req.params;
      const { search } = req.query;
      
      const filter = { batch: batchId, status: 'active' };
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { enrollmentNo: { $regex: search, $options: 'i' } }
        ];
      }
      
      const students = await Student.find(filter)
        .select('name enrollmentNo email phone fatherName admissionDate')
        .lean();
      
      return this.success(res, { students, batchName: 'Batch Name' });
      
    } catch (error) {
      console.error('Get students error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Mark attendance
  markAttendance = async (req, res) => {
    try {
      const { batchId, date, attendances } = req.body;
      
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      // Delete existing attendance
      await Attendance.deleteMany({ 
        batchId, 
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      // Create new attendance records
      const attendanceRecords = [];
      for (const att of attendances) {
        const record = await Attendance.create({
          studentId: att.studentId,
          batchId,
          date: attendanceDate,
          status: att.status,
          checkInTime: att.checkInTime,
          checkOutTime: att.checkOutTime,
          remarks: att.remarks,
          markedBy: req.user._id
        });
        attendanceRecords.push(record);
      }
      
      return this.success(res, { 
        count: attendanceRecords.length,
        date: attendanceDate
      }, 'Attendance marked successfully');
      
    } catch (error) {
      console.error('Mark attendance error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get batch attendance
  getBatchAttendance = async (req, res) => {
    try {
      const { batchId, date } = req.params;
      
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      const attendances = await Attendance.find({
        batchId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('studentId', 'name enrollmentNo');
      
      return this.success(res, { attendance: attendances });
      
    } catch (error) {
      console.error('Get attendance error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get attendance report
  getAttendanceReport = async (req, res) => {
    try {
      const { batchId } = req.params;
      const { startDate, endDate } = req.query;
      
      const filter = { batchId };
      
      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const attendances = await Attendance.find(filter)
        .populate('studentId', 'name enrollmentNo')
        .lean();
      
      // Group by student
      const studentMap = {};
      attendances.forEach(att => {
        const studentId = att.studentId._id.toString();
        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            student: att.studentId,
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }
        studentMap[studentId][att.status]++;
        studentMap[studentId].total++;
      });
      
      const studentSummary = Object.values(studentMap).map(s => ({
        ...s,
        percentage: ((s.present / s.total) * 100).toFixed(2)
      }));
      
      return this.success(res, {
        totalDays: attendances.length,
        averageAttendance: studentSummary.reduce((acc, s) => acc + parseFloat(s.percentage), 0) / studentSummary.length || 0,
        totalStudents: studentSummary.length,
        studentSummary
      });
      
    } catch (error) {
      console.error('Get report error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };
}

export default new TeacherController();