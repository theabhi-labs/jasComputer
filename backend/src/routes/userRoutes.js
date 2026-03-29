// src/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.use(protect);
// Get all users (Admin only)
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.getAllUsers
);

// Get teacher statistics
router.get('/teachers/stats', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.getTeacherStats
);

// Get user by ID
router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.getUserById
);

// Update user
router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.updateUser
);

// Change user status
router.patch('/:id/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.changeUserStatus
);

// Delete user
router.delete('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  userController.deleteUser
);

export default router;