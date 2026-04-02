import express from 'express';
import { courseController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import Course from '../models/Course.js';

const router = express.Router();

// ============================================================
// ✅✅✅ FORCE UPDATE - ABSOLUTE TOP (NO AUTH REQUIRED)
// ============================================================
router.put('/force-update/:id', async (req, res) => {
  try {
    console.log("🔧 FORCE UPDATE ENDPOINT HIT");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Direct database update
    const result = await Course.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    console.log("Update result:", result);
    
    // Get updated course
    const updated = await Course.findById(id);
    
    res.json({
      success: true,
      message: "Force update successful",
      result: result,
      updatedCourse: {
        totalFees: updated.totalFees,
        level: updated.level,
        name: updated.name
      }
    });
  } catch (error) {
    console.error("Force update error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PUBLIC ROUTES (NO AUTHENTICATION)
// ============================================================
router.get('/public', courseController.getAllCourses);
router.get('/public/featured', courseController.getFeaturedCourses);
router.get('/public/popular', courseController.getPopularCourses);
router.get('/public/categories', courseController.getCourseCategories);
router.get('/public/slug/:slug', courseController.getCourseBySlug);
router.get('/public/:id', courseController.getCourseByIdOrSlug);

// ============================================================
// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// ============================================================
router.use(protect);

router.get('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER), 
  courseController.getAllCourses
);

router.get('/featured', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getFeaturedCourses
);

router.get('/popular', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getPopularCourses
);

router.get('/categories', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getCourseCategories
);

router.get('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.getCourseByIdOrSlug
);

// ============================================================
// ADMIN ROUTES
// ============================================================
router.post('/', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.createCourse
);

router.put('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  (req, res, next) => {
    console.log("🔵 Route hit: PUT /:id");
    console.log("🔵 Course ID:", req.params.id);
    console.log("🔵 Request body:", req.body);
    console.log("🔵 User:", req.user);
    next();
  },
  courseController.updateCourse
);

router.patch('/:id/rating', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  courseController.updateCourseRating
);

router.patch('/:id/toggle-status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.toggleCourseStatus
);

router.delete('/:id', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), 
  courseController.deleteCourse
);

router.patch('/bulk/status', 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  courseController.bulkUpdateStatus
);

export default router;