import express from 'express';
import { inquiryController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ==================== PUBLIC ROUTE ====================
// Create inquiry (public)
router.post('/', inquiryController.createInquiry);

// ==================== PRIVATE ROUTES ====================
router.use(protect);

// Get all inquiries
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.getAllInquiries
);

// Get inquiry statistics
router.get('/stats', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.getInquiryStats
);

// Get single inquiry
router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.getInquiryById
);

// Update inquiry status
router.patch('/:id/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.updateInquiryStatus
);

// Add remark to inquiry
router.post('/:id/remark', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.addRemark
);

// Convert inquiry to student
router.post('/:id/convert', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  inquiryController.convertToStudent
);

export default router;