import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';
import { ATTENDANCE_STATUS } from '../constants/status.js';

class AttendanceController extends BaseController {
  // Mark attendance for batch
  markAttendance = async (req, res) => {
    try {
      const { batchId, date, attendances } = req.body;
      
      // Check if batch exists and teacher has access
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return this.error(res, 'Batch not found', 404);
      }
      
      if (req.user.role === 'teacher') {
        const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
        if (!teacherBatches.includes(batchId)) {
          return this.error(res, 'You are not assigned to this batch', 403);
        }
      }
      
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      // Delete existing attendance for this batch and date
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
        date: attendanceDate,
        batch: batch.name
      }, 'Attendance marked successfully');
      
    } catch (error) {
      console.error('Mark attendance error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Get attendance by batch and date
  getAttendanceByBatchAndDate = async (req, res) => {
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
      })
        .populate('studentId', 'name enrollmentNo phone')
        .populate('markedBy', 'name')
        .lean();
      
      // Get all students in batch
      const students = await Student.find({ batch: batchId, status: 'active' })
        .select('name enrollmentNo phone')
        .lean();
      
      // Map attendance status
      const attendanceMap = {};
      attendances.forEach(att => {
        attendanceMap[att.studentId._id.toString()] = att;
      });
      
      const result = students.map(student => ({
        student,
        attendance: attendanceMap[student._id.toString()] || null
      }));
      
      return this.success(res, { 
        date: attendanceDate,
        batchId,
        totalStudents: students.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        attendance: result
      });
      
    } catch (error) {
      console.error('Get attendance error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get student attendance report
  getStudentAttendance = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { startDate, endDate, page, limit, skip } = this.getPaginationOptions(req.query);
      
      const filter = { studentId };
      
      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const [attendances, total] = await Promise.all([
        Attendance.find(filter)
          .populate('batchId', 'name timing')
          .populate('markedBy', 'name')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Attendance.countDocuments(filter)
      ]);
      
      // Calculate statistics
      const stats = {
        total: total,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        percentage: total > 0 ? 
          ((attendances.filter(a => a.status === 'present').length / total) * 100).toFixed(2) : 0
      };
      
      const pagination = this.getPaginationMetadata(total, page, limit);
      
      return this.success(res, { attendances, stats, pagination });
      
    } catch (error) {
      console.error('Get student attendance error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get batch attendance summary
  getBatchAttendanceSummary = async (req, res) => {
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
      
      // Daily summary
      const dailySummary = {};
      attendances.forEach(att => {
        const dateStr = att.date.toISOString().split('T')[0];
        if (!dailySummary[dateStr]) {
          dailySummary[dateStr] = { present: 0, absent: 0, late: 0, total: 0 };
        }
        dailySummary[dateStr][att.status]++;
        dailySummary[dateStr].total++;
      });
      
      return this.success(res, {
        batchId,
        period: { startDate, endDate },
        studentSummary,
        dailySummary: Object.entries(dailySummary).map(([date, stats]) => ({ date, ...stats }))
      });
      
    } catch (error) {
      console.error('Get batch summary error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Update attendance record
  updateAttendance = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, checkInTime, checkOutTime, remarks } = req.body;
      
      const attendance = await Attendance.findById(id);
      if (!attendance) {
        return this.error(res, 'Attendance record not found', 404);
      }
      
      // Check permission
      if (req.user.role === 'teacher') {
        const teacherBatches = req.user.teacherDetails?.assignedBatches || [];
        if (!teacherBatches.includes(attendance.batchId.toString())) {
          return this.error(res, 'You are not authorized to update this record', 403);
        }
      }
      
      attendance.status = status || attendance.status;
      attendance.checkInTime = checkInTime || attendance.checkInTime;
      attendance.checkOutTime = checkOutTime || attendance.checkOutTime;
      attendance.remarks = remarks || attendance.remarks;
      
      await attendance.save();
      
      return this.success(res, { attendance }, 'Attendance updated successfully');
      
    } catch (error) {
      console.error('Update attendance error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new AttendanceController();