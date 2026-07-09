import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentDocuments,
  uploadStudentDocumentByUrl,
  deleteStudentDocument,
} from '../controllers/studentController.js';
import { validateStudentCreate, validateStudentUpdate } from '../middleware/validationMiddleware.js';
import { uploadMultiple } from '../config/multer.js';

const router = express.Router();

// All these routes are protected and require admin role
router.use(protect, admin); // apply to all routes below

// Student CRUD
router.post('/', validateStudentCreate, createStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', validateStudentUpdate, updateStudent);
router.delete('/:id', deleteStudent);

// Document Management
router.post('/:studentId/documents', uploadMultiple('documents', 6), uploadStudentDocuments);
router.post('/:studentId/documents/url', uploadStudentDocumentByUrl);
router.delete('/:id/documents/:docId', deleteStudentDocument);

export default router;