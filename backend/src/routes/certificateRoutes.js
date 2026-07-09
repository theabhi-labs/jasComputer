import express from 'express';
import { certificateController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/verify/:certificateId', certificateController.verifyCertificate);
router.get('/download/:certificateId', certificateController.downloadCertificate);

// ==================== PROTECTED ROUTES ====================
router.use(protect);

// Admin & Super Admin
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  certificateController.getAllCertificates
);

router.get('/stats', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  certificateController.getCertificateStats
);

router.post('/generate', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  certificateController.generateCertificate
);

router.patch('/:id/revoke', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  certificateController.revokeCertificate
);

// Teachers & above (view student certificates)
router.get('/student/:studentId', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  certificateController.getStudentCertificates
);

router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  certificateController.getCertificateById
);

export default router;