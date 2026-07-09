import Course from '../models/Course.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

const enhanceCourse = (course) => {
  const isDiscountValid =
    !!course.discount?.isDiscounted &&
    (!course.discount.validUntil || new Date(course.discount.validUntil) >= new Date());

  const currentPrice =
    isDiscountValid && course.discount.discountedPrice > 0
      ? course.discount.discountedPrice
      : course.totalFees;

  return {
    ...course,
    currentPrice,
    isDiscountValid,
    discountPercentage: course.discount?.discountPercentage || 0,
    durationDisplay: `${course.duration.value} ${course.duration.unit}`,
    totalProjectsCount: course.projects?.length || 0,
    courseUrl: `/courses/${course.slug}`
  };
};

const buildSortOption = (sortBy) => {
  const sortMap = {
    price_asc: { totalFees: 1 },
    price_desc: { totalFees: -1 },
    popularity: { 'popularity.enrollments': -1, 'popularity.views': -1 },
    rating: { 'rating.average': -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    featured: { 'popularity.featured': -1, 'popularity.sortOrder': 1 }
  };
  return sortMap[sortBy] || { createdAt: -1 };
};

class CourseController extends BaseController {
  constructor() {
    super();
    this.getAllCourses = this.getAllCourses.bind(this);
    this.getCourseByIdOrSlug = this.getCourseByIdOrSlug.bind(this);
    this.getCourseBySlug = this.getCourseBySlug.bind(this);
    this.getFeaturedCourses = this.getFeaturedCourses.bind(this);
    this.getPopularCourses = this.getPopularCourses.bind(this);
    this.getCourseCategories = this.getCourseCategories.bind(this);
    this.createCourse = this.createCourse.bind(this);
    this.updateCourse = this.updateCourse.bind(this);
    this.updateCourseRating = this.updateCourseRating.bind(this);
    this.toggleCourseStatus = this.toggleCourseStatus.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.bulkUpdateStatus = this.bulkUpdateStatus.bind(this);
  }

  // ==========================================================
  // Internal helper: fetches a single course (by id or slug),
  // its upcoming batches, and related courses. Shared by both
  // getCourseByIdOrSlug and getCourseBySlug to avoid duplication.
  // ==========================================================
  async _getCourseWithRelations(query, incrementViews = true) {
    const course = await Course.findOne(query)
      .populate('instructors', 'name email profilePicture bio')
      .populate('createdBy', 'name');

    if (!course) return null;

    if (incrementViews) {
      // Fire-and-forget, don't block the response on this
      Course.findByIdAndUpdate(course._id, { $inc: { 'popularity.views': 1 } }).catch((err) =>
        console.error('Error incrementing views:', err)
      );
    }

    const batches = [];
    const relatedCourses = await Course.find({
      _id: { $ne: course._id },
      category: course.category,
      isActive: true
    })
      .select('name slug thumbnail totalFees duration rating shortDescription level')
      .limit(4)
      .lean();

    return { course: enhanceCourse(course.toObject()), batches, relatedCourses };
  }

  // Get all courses with advanced filtering and sorting
  async getAllCourses(req, res) {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};

      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }
      if (req.query.category) filter.category = req.query.category;
      if (req.query.level) filter.level = req.query.level;
      if (req.query.certificateProvided !== undefined) {
        filter.certificateProvided = req.query.certificateProvided === 'true';
      }

      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { code: { $regex: req.query.search, $options: 'i' } },
          { slug: { $regex: req.query.search, $options: 'i' } },
          { shortDescription: { $regex: req.query.search, $options: 'i' } },
          { tags: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      if (req.query.minPrice || req.query.maxPrice) {
        filter.totalFees = {};
        if (req.query.minPrice) filter.totalFees.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.totalFees.$lte = parseFloat(req.query.maxPrice);
      }

      if (req.query.duration) {
        filter['duration.value'] = { $lte: parseInt(req.query.duration, 10) };
      }

      if (req.query.skills) {
        filter.skillsToLearn = { $in: req.query.skills.split(',') };
      }

      const sort = buildSortOption(req.query.sortBy);

      const [courses, total] = await Promise.all([
        Course.find(filter)
          .select('-fullDescription -syllabus -projects -faqs')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('instructors', 'name email profilePicture')
          .populate('createdBy', 'name')
          .lean(),
        Course.countDocuments(filter)
      ]);

      const enhancedCourses = courses.map(enhanceCourse);
      const pagination = this.getPaginationMetadata(total, page, limit);

      return this.success(res, { courses: enhancedCourses, pagination });
    } catch (error) {
      console.error('Get courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get a course by Mongo _id OR slug (used by admin/protected routes)
  async getCourseByIdOrSlug(req, res) {
    try {
      const { id } = req.params;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const query = isObjectId ? { _id: id } : { slug: id, isActive: true };

      const result = await this._getCourseWithRelations(query);
      if (!result) return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);

      return this.success(res, result);
    } catch (error) {
      console.error('Get course error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get course by slug only (public endpoint)
  async getCourseBySlug(req, res) {
    try {
      const { slug } = req.params;
      const result = await this._getCourseWithRelations({ slug, isActive: true });
      if (!result) return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);

      return this.success(res, result);
    } catch (error) {
      console.error('Get course by slug error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get featured courses
  async getFeaturedCourses(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 6;

      const courses = await Course.find({ isActive: true, 'popularity.featured': true })
        .select('name slug thumbnail shortDescription totalFees duration rating level totalProjects discount')
        .sort({ 'popularity.sortOrder': 1, createdAt: -1 })
        .limit(limit)
        .lean();

      return this.success(res, { courses: courses.map(enhanceCourse) });
    } catch (error) {
      console.error('Get featured courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get popular courses
  async getPopularCourses(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;

      const courses = await Course.find({ isActive: true })
        .select('name slug thumbnail shortDescription totalFees duration rating level discount')
        .sort({ 'popularity.enrollments': -1, 'popularity.views': -1 })
        .limit(limit)
        .lean();

      return this.success(res, { courses: courses.map(enhanceCourse) });
    } catch (error) {
      console.error('Get popular courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get course categories with counts
  async getCourseCategories(req, res) {
    try {
      const categories = await Course.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            courses: { $push: { name: '$name', slug: '$slug', thumbnail: '$thumbnail', _id: '$_id' } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return this.success(res, { categories });
    } catch (error) {
      console.error('Get categories error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Create course
  async createCourse(req, res) {
    try {
      const courseData = req.body;

      const existing = await Course.findOne({
        $or: [{ name: courseData.name }, { code: courseData.code }]
      });
      if (existing) {
        return this.error(res, 'Course with this name or code already exists', 400);
      }

      for (const module of courseData.syllabus || []) {
        if (!module.moduleName) {
          return this.error(res, 'Each module must have a name', 400);
        }
        for (const topic of module.topics || []) {
          if (!topic.topicName) {
            return this.error(res, 'Each topic must have a name', 400);
          }
        }
      }

      if (courseData.discount?.isDiscounted) {
        const pct = courseData.discount.discountPercentage;
        if (pct > 100 || pct < 0) {
          return this.error(res, 'Discount percentage must be between 0 and 100', 400);
        }
      }

      courseData.createdBy = req.user._id;

      const course = await Course.create(courseData);
      return this.success(res, { course }, MESSAGES.SUCCESS.DATA_CREATED, 201);
    } catch (error) {
      console.error('Create course error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Update course (partial update — only fields present in req.body are touched)
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) return this.error(res, 'Course not found', 404);

      const directFields = [
        'name', 'code', 'shortDescription', 'fullDescription', 'thumbnail', 'images',
        'category', 'subcategory', 'language', 'level', 'isActive', 'eligibility',
        'totalFees', 'installmentAllowed', 'numberOfInstallments', 'certificateProvided'
      ];

      const arrayFields = [
        'skillsToLearn', 'tags', 'learningOutcomes', 'prerequisites', 'targetAudience',
        'features', 'benefits', 'whatIncludes', 'careerOpportunities', 'eligibilityCriteria'
      ];

      const nestedArrayFields = ['syllabus', 'projects', 'faqs', 'careerPaths', 'batches'];
      const objectFields = ['seoMetadata', 'certificateDetails'];

      let updated = false;

      for (const field of directFields) {
        if (req.body[field] !== undefined) {
          course[field] = req.body[field];
          updated = true;
        }
      }

      if (req.body.duration !== undefined) {
        course.duration = {
          value: req.body.duration.value ?? course.duration.value,
          unit: req.body.duration.unit ?? course.duration.unit
        };
        updated = true;
      }

      if (req.body.discount !== undefined) {
        const newDiscount = req.body.discount;
        course.discount = {
          isDiscounted: newDiscount.isDiscounted ?? course.discount?.isDiscounted ?? false,
          discountPercentage: newDiscount.discountPercentage ?? course.discount?.discountPercentage ?? 0,
          validUntil: newDiscount.validUntil ?? course.discount?.validUntil ?? null
        };

        const currentTotal = req.body.totalFees ?? course.totalFees;
        course.discount.discountedPrice =
          course.discount.isDiscounted && course.discount.discountPercentage > 0
            ? Math.round(currentTotal - currentTotal * (course.discount.discountPercentage / 100))
            : 0;

        updated = true;
      }

      for (const field of arrayFields) {
        if (req.body[field] !== undefined) {
          course[field] = typeof req.body[field] === 'string'
            ? req.body[field].split('\n').filter((item) => item.trim())
            : req.body[field];
          updated = true;
        }
      }

      for (const field of nestedArrayFields) {
        if (req.body[field] !== undefined) {
          course[field] = req.body[field];
          if (field === 'projects') course.totalProjects = course.projects.length;
          updated = true;
        }
      }

      for (const field of objectFields) {
        if (req.body[field] !== undefined) {
          course[field] = req.body[field];
          updated = true;
        }
      }

      if (!updated) {
        return this.success(res, { course }, 'No changes made');
      }

      await course.save();

      const freshCourse = await Course.findById(id)
        .populate('instructors', 'name email profilePicture bio')
        .populate('createdBy', 'name');

      return this.success(res, { course: freshCourse }, 'Course updated successfully');
    } catch (error) {
      console.error('Update course error:', error);
      return this.error(res, error.message || 'Failed to update course', 500);
    }
  }

  // Update course rating (adds one new rating to the running average)
  async updateCourseRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (rating < 0 || rating > 5) {
        return this.error(res, 'Rating must be between 0 and 5', 400);
      }

      const course = await Course.findById(id);
      if (!course) return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);

      const newAverage =
        (course.rating.average * course.rating.count + rating) / (course.rating.count + 1);

      course.rating.average = parseFloat(newAverage.toFixed(1));
      course.rating.count += 1;
      await course.save();

      return this.success(res, { rating: course.rating }, 'Rating updated successfully');
    } catch (error) {
      console.error('Update rating error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Toggle course active/inactive status
  async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);

      course.isActive = !course.isActive;
      await course.save();

      return this.success(res, { course }, `Course ${course.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Toggle status error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Delete course (blocked if batches exist)
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      // Since Batch model doesn't exist, we directly delete the course

      const course = await Course.findByIdAndDelete(id);
      if (!course) return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);

      return this.success(res, null, MESSAGES.SUCCESS.DATA_DELETED);
    } catch (error) {
      console.error('Delete course error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Bulk activate/deactivate courses
  async bulkUpdateStatus(req, res) {
    try {
      const { courseIds, isActive } = req.body;

      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return this.error(res, 'Invalid course IDs provided', 400);
      }

      const result = await Course.updateMany(
        { _id: { $in: courseIds } },
        { isActive }
      );

      return this.success(
        res,
        { modifiedCount: result.modifiedCount, isActive },
        `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} courses`
      );
    } catch (error) {
      console.error('Bulk update error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }
}

const courseController = new CourseController();
export default courseController;