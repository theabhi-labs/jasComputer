import express from 'express';
import { batchController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, checkTeacherOwnership } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==================== ALL AUTHENTICATED USERS ====================

// Get all batches
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  batchController.getAllBatches
);

// Get single batch
router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  checkTeacherOwnership('Batch', 'id'),
  batchController.getBatchById
);

// ==================== ADMIN & SUPER ADMIN ROUTES ====================

// Create batch
router.post('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  batchController.createBatch
);

// Update batch
router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  batchController.updateBatch
);

// Change batch status
router.patch('/:id/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  batchController.changeBatchStatus
);

// Delete batch
router.delete('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  batchController.deleteBatch
);

export default router;