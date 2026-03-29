import express from 'express';
import { dashboardController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Super Admin Dashboard
router.get('/super-admin', 
  authorize(ROLES.SUPER_ADMIN), 
  dashboardController.getSuperAdminDashboard
);

// Admin Dashboard
router.get('/admin', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  dashboardController.getAdminDashboard
);

// Teacher Dashboard
router.get('/teacher', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  dashboardController.getTeacherDashboard
);

// Student Dashboard
router.get('/student', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  dashboardController.getStudentDashboard
);

export default router;