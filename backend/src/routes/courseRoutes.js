import express from 'express';
import { courseController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (NO AUTHENTICATION) ====================
// These routes are accessible to everyone
router.get('/public', courseController.getAllCourses);
router.get('/public/featured', courseController.getFeaturedCourses);
router.get('/public/popular', courseController.getPopularCourses);
router.get('/public/categories', courseController.getCourseCategories);
router.get('/public/slug/:slug', courseController.getCourseBySlug);
router.get('/public/:id', courseController.getCourseByIdOrSlug);

// ==================== PROTECTED ROUTES ====================
// All routes below this middleware require authentication
router.use(protect);

// Get all courses (accessible to all authenticated users)
router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  courseController.getAllCourses
);

// Get featured courses (authenticated)
router.get('/featured', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getFeaturedCourses
);

// Get popular courses (authenticated)
router.get('/popular', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getPopularCourses
);

// Get course categories (authenticated)
router.get('/categories', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getCourseCategories
);

// Get single course by ID or slug (authenticated)
router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getCourseByIdOrSlug
);

// ==================== ADMIN & SUPER ADMIN ROUTES ====================

// Create course
router.post('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.createCourse
);

// Update course
router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.updateCourse
);

// Update course rating
router.patch('/:id/rating', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.updateCourseRating
);

// Toggle course status
router.patch('/:id/toggle-status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.toggleCourseStatus
);

// Delete course
router.delete('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.deleteCourse
);

// Bulk update course status
router.patch('/bulk/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  courseController.bulkUpdateStatus
);

export default router;