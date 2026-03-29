import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class CourseController extends BaseController {
  constructor() {
    super();
    // Bind all methods to ensure 'this' context
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

  // Get all courses with advanced filtering and sorting
  async getAllCourses(req, res) {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};
      
      // Basic filters
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }
      
      if (req.query.category) {
        filter.category = req.query.category;
      }
      
      if (req.query.level) {
        filter.level = req.query.level;
      }
      
      if (req.query.certificateProvided !== undefined) {
        filter.certificateProvided = req.query.certificateProvided === 'true';
      }
      
      // Search functionality
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { code: { $regex: req.query.search, $options: 'i' } },
          { slug: { $regex: req.query.search, $options: 'i' } },
          { shortDescription: { $regex: req.query.search, $options: 'i' } },
          { tags: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filter.totalFees = {};
        if (req.query.minPrice) filter.totalFees.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.totalFees.$lte = parseFloat(req.query.maxPrice);
      }
      
      // Duration filter
      if (req.query.duration) {
        filter['duration.value'] = { $lte: parseInt(req.query.duration) };
      }
      
      // Skills filter
      if (req.query.skills) {
        const skills = req.query.skills.split(',');
        filter.skillsToLearn = { $in: skills };
      }
      
      // Sorting
      let sort = { createdAt: -1 };
      if (req.query.sortBy) {
        switch (req.query.sortBy) {
          case 'price_asc':
            sort = { totalFees: 1 };
            break;
          case 'price_desc':
            sort = { totalFees: -1 };
            break;
          case 'popularity':
            sort = { 'popularity.enrollments': -1, 'popularity.views': -1 };
            break;
          case 'rating':
            sort = { 'rating.average': -1 };
            break;
          case 'newest':
            sort = { createdAt: -1 };
            break;
          case 'oldest':
            sort = { createdAt: 1 };
            break;
          case 'featured':
            sort = { 'popularity.featured': -1, 'popularity.sortOrder': 1 };
            break;
          default:
            sort = { createdAt: -1 };
        }
      }
      
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
      
      // Enhance courses with computed fields
      const enhancedCourses = courses.map(course => ({
        ...course,
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        isDiscountValid: course.isDiscountValid ? course.isDiscountValid() : false,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        courseUrl: `/courses/${course.slug}`
      }));
      
      const pagination = this.getPaginationMetadata(total, page, limit);
      
      return this.success(res, { courses: enhancedCourses, pagination });
      
    } catch (error) {
      console.error('Get courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get single course by ID or slug
  async getCourseByIdOrSlug(req, res) {
    try {
      const { id } = req.params;
      let course;
      
      // Check if it's a slug or ObjectId
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        course = await Course.findById(id)
          .populate('instructors', 'name email profilePicture bio')
          .populate('createdBy', 'name');
      } else {
        // Find by slug
        course = await Course.findOne({ slug: id, isActive: true })
          .populate('instructors', 'name email profilePicture bio')
          .populate('createdBy', 'name');
      }
      
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Increment views
      await Course.findByIdAndUpdate(course._id, { $inc: { 'popularity.views': 1 } });
      
      // Get batches for this course
      const batches = await Batch.find({ 
        course: course._id, 
        isActive: true,
        startDate: { $gte: new Date() }
      })
        .populate('instructors', 'name email')
        .sort({ startDate: 1 })
        .lean();
      
      // Get related courses
      const relatedCourses = await Course.find({
        _id: { $ne: course._id },
        category: course.category,
        isActive: true
      })
        .select('name slug thumbnail totalFees duration rating shortDescription level')
        .limit(4)
        .lean();
      
      // Enhance course with computed fields
      const enhancedCourse = {
        ...course.toObject(),
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        isDiscountValid: course.isDiscountValid ? course.isDiscountValid() : false,
        discountPercentage: course.getDiscountPercentage ? course.getDiscountPercentage() : 0,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        totalSyllabusDuration: course.getTotalSyllabusDuration ? course.getTotalSyllabusDuration() : 0,
        totalProjectsCount: course.getTotalProjectsCount ? course.getTotalProjectsCount() : course.projects?.length || 0
      };
      
      return this.success(res, { 
        course: enhancedCourse, 
        batches, 
        relatedCourses 
      });
      
    } catch (error) {
      console.error('Get course error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get course by slug (public endpoint)
  async getCourseBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const course = await Course.findOne({ slug, isActive: true })
        .populate('instructors', 'name email profilePicture bio')
        .populate('createdBy', 'name');
      
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Increment views
      await Course.findByIdAndUpdate(course._id, { $inc: { 'popularity.views': 1 } });
      
      // Get batches for this course
      const batches = await Batch.find({ 
        course: course._id, 
        isActive: true,
        startDate: { $gte: new Date() }
      })
        .populate('instructors', 'name email')
        .sort({ startDate: 1 })
        .lean();
      
      // Get related courses
      const relatedCourses = await Course.find({
        _id: { $ne: course._id },
        category: course.category,
        isActive: true
      })
        .select('name slug thumbnail totalFees duration rating shortDescription level')
        .limit(4)
        .lean();
      
      // Enhance course with computed fields
      const enhancedCourse = {
        ...course.toObject(),
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        isDiscountValid: course.isDiscountValid ? course.isDiscountValid() : false,
        discountPercentage: course.getDiscountPercentage ? course.getDiscountPercentage() : 0,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        totalSyllabusDuration: course.getTotalSyllabusDuration ? course.getTotalSyllabusDuration() : 0,
        totalProjectsCount: course.getTotalProjectsCount ? course.getTotalProjectsCount() : course.projects?.length || 0
      };
      
      return this.success(res, { 
        course: enhancedCourse, 
        batches, 
        relatedCourses 
      });
      
    } catch (error) {
      console.error('Get course by slug error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get featured courses
  async getFeaturedCourses(req, res) {
    try {
      const { limit = 6 } = req.query;
      
      const courses = await Course.find({ 
        isActive: true,
        'popularity.featured': true 
      })
        .select('name slug thumbnail shortDescription totalFees duration rating level totalProjects')
        .sort({ 'popularity.sortOrder': 1, createdAt: -1 })
        .limit(parseInt(limit))
        .lean();
      
      const enhancedCourses = courses.map(course => ({
        ...course,
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        courseUrl: `/courses/${course.slug}`
      }));
      
      return this.success(res, { courses: enhancedCourses });
      
    } catch (error) {
      console.error('Get featured courses error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Get popular courses
  async getPopularCourses(req, res) {
    try {
      const { limit = 8 } = req.query;
      
      const courses = await Course.find({ isActive: true })
        .select('name slug thumbnail shortDescription totalFees duration rating level')
        .sort({ 'popularity.enrollments': -1, 'popularity.views': -1 })
        .limit(parseInt(limit))
        .lean();
      
      const enhancedCourses = courses.map(course => ({
        ...course,
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        courseUrl: `/courses/${course.slug}`
      }));
      
      return this.success(res, { courses: enhancedCourses });
      
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
        { $group: {
            _id: '$category',
            count: { $sum: 1 },
            courses: { $push: { 
              name: '$name', 
              slug: '$slug',
              thumbnail: '$thumbnail',
              _id: '$_id' 
            }}
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
      
      // Check if course exists
      const existing = await Course.findOne({ 
        $or: [
          { name: courseData.name },
          { code: courseData.code }
        ]
      });
      
      if (existing) {
        return this.error(res, 'Course with this name or code already exists', 400);
      }
      
      // Validate syllabus structure if provided
      if (courseData.syllabus && courseData.syllabus.length > 0) {
        for (const module of courseData.syllabus) {
          if (!module.moduleName) {
            return this.error(res, 'Each module must have a name', 400);
          }
          if (module.topics && module.topics.length > 0) {
            for (const topic of module.topics) {
              if (!topic.topicName) {
                return this.error(res, 'Each topic must have a name', 400);
              }
            }
          }
        }
      }
      
      // Validate discount if provided
      if (courseData.discount && courseData.discount.isDiscounted) {
        if (courseData.discount.discountPercentage > 100 || courseData.discount.discountPercentage < 0) {
          return this.error(res, 'Discount percentage must be between 0 and 100', 400);
        }
      }
      
      courseData.createdBy = req.user._id;
      
      // Add instructor if provided in request
      if (req.body.instructors && req.body.instructors.length > 0) {
        courseData.instructors = req.body.instructors;
      }
      
      const course = await Course.create(courseData);
      
      return this.success(res, { course }, MESSAGES.SUCCESS.DATA_CREATED, 201);
      
    } catch (error) {
      console.error('Create course error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Update course
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      
      const course = await Course.findById(id);
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Check name duplication
      if (req.body.name && req.body.name !== course.name) {
        const existing = await Course.findOne({ name: req.body.name });
        if (existing) {
          return this.error(res, 'Course name already exists', 400);
        }
      }
      
      // Check code duplication
      if (req.body.code && req.body.code !== course.code) {
        const existing = await Course.findOne({ code: req.body.code });
        if (existing) {
          return this.error(res, 'Course code already exists', 400);
        }
      }
      
      // Validate discount if being updated
      if (req.body.discount && req.body.discount.isDiscounted) {
        if (req.body.discount.discountPercentage > 100 || req.body.discount.discountPercentage < 0) {
          return this.error(res, 'Discount percentage must be between 0 and 100', 400);
        }
      }
      
      Object.assign(course, req.body);
      await course.save();
      
      return this.success(res, { course }, MESSAGES.SUCCESS.DATA_UPDATED);
      
    } catch (error) {
      console.error('Update course error:', error);
      return this.error(res, error.message, 500);
    }
  }

  // Update course rating
  async updateCourseRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      
      if (rating < 0 || rating > 5) {
        return this.error(res, 'Rating must be between 0 and 5', 400);
      }
      
      const course = await Course.findById(id);
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Calculate new average rating
      const newAverage = (course.rating.average * course.rating.count + rating) / (course.rating.count + 1);
      
      course.rating.average = parseFloat(newAverage.toFixed(1));
      course.rating.count += 1;
      await course.save();
      
      return this.success(res, { rating: course.rating }, 'Rating updated successfully');
      
    } catch (error) {
      console.error('Update rating error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Toggle course status
  async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      
      const course = await Course.findById(id);
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      course.isActive = !course.isActive;
      await course.save();
      
      return this.success(res, { course }, `Course ${course.isActive ? 'activated' : 'deactivated'}`);
      
    } catch (error) {
      console.error('Toggle status error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Delete course
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      
      // Check if batches exist
      const batches = await Batch.findOne({ course: id });
      if (batches) {
        return this.error(res, 'Cannot delete course with existing batches', 400);
      }
      
      const course = await Course.findByIdAndDelete(id);
      
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      return this.success(res, null, MESSAGES.SUCCESS.DATA_DELETED);
      
    } catch (error) {
      console.error('Delete course error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }

  // Bulk update course status
  async bulkUpdateStatus(req, res) {
    try {
      const { courseIds, isActive } = req.body;
      
      if (!courseIds || !Array.isArray(courseIds)) {
        return this.error(res, 'Invalid course IDs provided', 400);
      }
      
      const result = await Course.updateMany(
        { _id: { $in: courseIds } },
        { isActive: isActive }
      );
      
      return this.success(res, { 
        modifiedCount: result.modifiedCount,
        isActive 
      }, `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} courses`);
      
    } catch (error) {
      console.error('Bulk update error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  }
}

// Create and export a single instance
const courseController = new CourseController();
export default courseController;