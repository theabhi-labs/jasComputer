// src/routes/uploadRoutes.js
import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { 
  uploadSingle, 
  uploadMultiple, 
  validateFile,
  handleUploadError,
  attachUploadInfo,
} from '../middleware/uploadMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// ==================== PROFILE UPLOADS ====================

// Upload profile picture
router.post('/profile',
  uploadSingle('profileImage'),
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadController.uploadProfilePicture
);

// ==================== STUDENT DOCUMENTS ====================

// Upload multiple student documents (Step 4 - Recommended)
router.post('/student/:studentId/documents',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  uploadMultiple('documents', 6),
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadController.uploadMultipleDocuments
);

// Upload student document (single)
router.post('/student/:studentId/document',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  uploadSingle('document'),
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadController.uploadStudentDocument
);


// Upload aadhar card
router.post('/student/:studentId/aadhar',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  uploadSingle('aadharCard'),
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadController.uploadStudentDocument
);

// Upload photo (for registration step 4)
router.post('/student/:studentId/photo',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT),
  uploadSingle('photo'),
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadController.uploadStudentDocument
);


// ==================== FILE MANAGEMENT ====================

// Delete file
router.delete('/:objectName',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  uploadController.deleteFile
);

// Get file URL (direct)
// router.get('/:objectName',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
//   uploadController.getFileUrl
// );

// Get file URL with temporary access (expires)
// router.get('/:objectName/temporary',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
//   uploadController.getTemporaryFileUrl
// );

// // Get file metadata
// router.get('/:objectName/metadata',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
//   uploadController.getFileMetadata
// );

// Get file info (combined metadata and owner info)
// router.get('/:objectName/info',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
//   uploadController.getFileInfo
// );

// // Download file
// router.get('/:objectName/download',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
//   uploadController.downloadFile
// );

// // List files in a folder
// router.get('/folder/:folder',
//   authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
//   uploadController.listFiles
// );

export default router;