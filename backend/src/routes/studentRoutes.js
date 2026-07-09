import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { validateStudentCreate, validateStudentUpdate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All these routes are protected and require admin role
router.use(protect, admin); // apply to all routes below

// Student CRUD
router.post('/', validateStudentCreate, createStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', validateStudentUpdate, updateStudent);
router.delete('/:id', deleteStudent);

// You can also add other admin-specific endpoints here

export default router;