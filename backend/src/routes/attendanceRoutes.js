import express from 'express';
import { attendanceController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==================== MARK ATTENDANCE ====================

// Mark attendance for batch
router.post('/mark', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  attendanceController.markAttendance
);

// ==================== GET ATTENDANCE ====================

// Get attendance by batch and date
router.get('/batch/:batchId/date/:date', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  attendanceController.getAttendanceByBatchAndDate
);

// Get batch attendance summary
router.get('/batch/:batchId/summary', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  attendanceController.getBatchAttendanceSummary
);

// Get student attendance report
router.get('/student/:studentId', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  attendanceController.getStudentAttendance
);

// ==================== UPDATE ATTENDANCE ====================

// Update attendance record
router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  attendanceController.updateAttendance
);

export default router;