// src/routes/teacherRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import teacherController from '../controllers/teacherController.js';

const router = express.Router();

// All routes require authentication and teacher role
router.use(protect);
router.use(authorize(ROLES.TEACHER));

// Teacher dashboard
router.get('/dashboard', teacherController.getTeacherDashboard);

// Batches
router.get('/batches', teacherController.getAssignedBatches);
router.get('/batches/:batchId', teacherController.getBatchDetails);
router.get('/batches/:batchId/students', teacherController.getBatchStudents);

// Attendance
router.post('/attendance/mark', teacherController.markAttendance);
router.get('/attendance/batch/:batchId/date/:date', teacherController.getBatchAttendance);
router.get('/attendance/batch/:batchId/report', teacherController.getAttendanceReport);

export default router;