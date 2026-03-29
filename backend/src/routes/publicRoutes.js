import express from 'express';
import { publicController } from '../controllers/index.js';

const router = express.Router();

// ==================== PUBLIC API ROUTES (No Auth Required) ====================

// Get all public courses
router.get('/courses', publicController.getPublicCourses);

// Get course details
router.get('/courses/:id', publicController.getPublicCourseById);

// Submit inquiry
router.post('/inquiry', publicController.submitInquiry);

// Verify certificate by ID
router.get('/verify-certificate/:certificateId', publicController.verifyCertificate);

// Check fee status by enrollment number
router.get('/check-fee/:enrollmentNo', publicController.checkFeeStatus);

// Get upcoming events
router.get('/events', publicController.getUpcomingEvents);

// Get notices
router.get('/notices', publicController.getNotices);

// Get contact information
router.get('/contact', publicController.getContactInfo);

export default router;