import express from 'express';
import { courseController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================
router.get('/public', courseController.getAllCourses);
router.get('/public/featured', courseController.getFeaturedCourses);
router.get('/public/popular', courseController.getPopularCourses);
router.get('/public/categories', courseController.getCourseCategories);
router.get('/public/slug/:slug', courseController.getCourseBySlug);
router.get('/public/:id', courseController.getCourseByIdOrSlug);

// ============================================================
// EVERYTHING BELOW REQUIRES AUTHENTICATION
// ============================================================
router.use(protect);

const staffRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
const adminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

router.get('/', authorize(...staffRoles), courseController.getAllCourses);
router.get('/featured', authorize(...staffRoles), courseController.getFeaturedCourses);
router.get('/popular', authorize(...staffRoles), courseController.getPopularCourses);
router.get('/categories', authorize(...staffRoles), courseController.getCourseCategories);
router.get('/:id', authorize(...staffRoles), courseController.getCourseByIdOrSlug);

// ============================================================
// ADMIN-ONLY ROUTES
// ============================================================
router.post('/', authorize(...adminRoles), courseController.createCourse);
router.put('/:id', authorize(...adminRoles), courseController.updateCourse);
router.delete('/:id', authorize(...adminRoles), courseController.deleteCourse);
router.patch('/:id/toggle-status', authorize(...adminRoles), courseController.toggleCourseStatus);
router.patch('/bulk/status', authorize(...adminRoles), courseController.bulkUpdateStatus);

router.patch('/:id/rating', authorize(...staffRoles), courseController.updateCourseRating);

export default router;