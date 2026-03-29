// src/routes/certificateRoutes.js
import express from 'express';
import { certificateController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
const router = express.Router();
console.log('🔵 Certificate routes initializing...');

// ==================== PUBLIC ROUTES ====================
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Download certificate by ID (public)
router.get('/download/:certificateId', certificateController.downloadCertificate);

console.log('✅ Public routes registered');

// ==================== PROTECT MIDDLEWARE ====================
router.use((req, res, next) => {
  console.log('🔒 Protected route check:', req.method, req.path);
  console.log('📋 Headers:', req.headers.authorization);
  next();
});
router.use(protect);

console.log('✅ Protect middleware added');

// ==================== ADMIN & SUPER ADMIN ROUTES ====================
console.log('📌 Registering admin routes...');

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

// ==================== STUDENT ROUTES ====================
console.log('📌 Registering student routes...');

router.get('/student/:studentId', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  certificateController.getStudentCertificates
);

router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  certificateController.getCertificateById
);

console.log('✅ All certificate routes registered');

export default router;