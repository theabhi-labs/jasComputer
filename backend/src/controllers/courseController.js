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

  async getCourseByIdOrSlug(req, res) {
    try {
      const { id } = req.params;
      let course;
      
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        course = await Course.findById(id)
          .populate('instructors', 'name email profilePicture bio')
          .populate('createdBy', 'name');
      } else {
        course = await Course.findOne({ slug: id, isActive: true })
          .populate('instructors', 'name email profilePicture bio')
          .populate('createdBy', 'name');
      }
      
      if (!course) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      const courseObject = course.toObject();
      
      courseObject.syllabus = courseObject.syllabus || [];
      courseObject.projects = courseObject.projects || [];
      courseObject.faqs = courseObject.faqs || [];
      courseObject.images = courseObject.images || [];
      courseObject.careerPaths = courseObject.careerPaths || [];
      courseObject.skillsToLearn = courseObject.skillsToLearn || [];
      courseObject.learningOutcomes = courseObject.learningOutcomes || [];
      courseObject.prerequisites = courseObject.prerequisites || [];
      
      console.log("📦 SENDING COURSE WITH:");
      console.log("- Name:", courseObject.name);
      console.log("- Syllabus:", courseObject.syllabus.length);
      console.log("- Projects:", courseObject.projects.length);
      console.log("- FAQs:", courseObject.faqs.length);
      console.log("- Images:", courseObject.images.length);
      
      Course.findByIdAndUpdate(course._id, { $inc: { 'popularity.views': 1 } })
        .catch(err => console.error('Error incrementing views:', err));
      
      const batches = await Batch.find({ 
        course: course._id, 
        isActive: true,
        startDate: { $gte: new Date() }
      })
        .populate('instructors', 'name email')
        .sort({ startDate: 1 })
        .lean();
      
      const relatedCourses = await Course.find({
        _id: { $ne: course._id },
        category: course.category,
        isActive: true
      })
        .select('name slug thumbnail totalFees duration rating shortDescription level')
        .limit(4)
        .lean();
      
      const enhancedCourse = {
        ...courseObject,
        currentPrice: course.getCurrentPrice ? course.getCurrentPrice() : course.totalFees,
        isDiscountValid: course.isDiscountValid ? course.isDiscountValid() : false,
        discountPercentage: course.getDiscountPercentage ? course.getDiscountPercentage() : 0,
        durationDisplay: course.getDurationDisplay ? course.getDurationDisplay() : `${course.duration.value} ${course.duration.unit}`,
        totalSyllabusDuration: course.getTotalSyllabusDuration ? course.getTotalSyllabusDuration() : 0,
        totalProjectsCount: course.projects?.length || 0,
        courseUrl: `/courses/${course.slug}`
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
      
      await Course.findByIdAndUpdate(course._id, { $inc: { 'popularity.views': 1 } });
      
      const batches = await Batch.find({ 
        course: course._id, 
        isActive: true,
        startDate: { $gte: new Date() }
      })
        .populate('instructors', 'name email')
        .sort({ startDate: 1 })
        .lean();
      
      const relatedCourses = await Course.find({
        _id: { $ne: course._id },
        category: course.category,
        isActive: true
      })
        .select('name slug thumbnail totalFees duration rating shortDescription level')
        .limit(4)
        .lean();
      
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
      
      const existing = await Course.findOne({ 
        $or: [
          { name: courseData.name },
          { code: courseData.code }
        ]
      });
      
      if (existing) {
        return this.error(res, 'Course with this name or code already exists', 400);
      }
      
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
      
      if (courseData.discount && courseData.discount.isDiscounted) {
        if (courseData.discount.discountPercentage > 100 || courseData.discount.discountPercentage < 0) {
          return this.error(res, 'Discount percentage must be between 0 and 100', 400);
        }
      }
      
      courseData.createdBy = req.user._id;
      
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
async updateCourse(req, res) {
  try {
    console.log("=".repeat(50));
    console.log("🔵 UPDATE COURSE CALLED");
    console.log("=".repeat(50));
    
    const { id } = req.params;
    console.log("ID:", id);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    
    const course = await Course.findById(id);
    if (!course) {
      return this.error(res, 'Course not found', 404);
    }
    
    console.log("💰 Current totalFees:", course.totalFees);
    
    let updated = false;
    const updatedFields = [];
    
    // ==================== BASIC FIELDS ====================
    if (req.body.name !== undefined) {
      course.name = req.body.name;
      updated = true;
      updatedFields.push('name');
      console.log("📝 Updated name to:", course.name);
    }
    
    if (req.body.category !== undefined) {
      course.category = req.body.category;
      updated = true;
      updatedFields.push('category');
      console.log("📁 Updated category to:", course.category);
    }
    
    if (req.body.subcategory !== undefined) {
      course.subcategory = req.body.subcategory;
      updated = true;
      updatedFields.push('subcategory');
      console.log("📂 Updated subcategory to:", course.subcategory);
    }
    
    if (req.body.language !== undefined) {
      course.language = req.body.language;
      updated = true;
      updatedFields.push('language');
      console.log("🌐 Updated language to:", course.language);
    }
    
    if (req.body.code !== undefined) {
      course.code = req.body.code;
      updated = true;
      updatedFields.push('code');
      console.log("🔢 Updated code to:", course.code);
    }
    
    if (req.body.thumbnail !== undefined) {
      course.thumbnail = req.body.thumbnail;
      updated = true;
      updatedFields.push('thumbnail');
      console.log("🖼️ Updated thumbnail");
    }
    
    if (req.body.images !== undefined) {
      course.images = req.body.images;
      updated = true;
      updatedFields.push('images');
      console.log("📸 Updated images");
    }
    
    // ==================== DURATION ====================
    if (req.body.duration !== undefined) {
      course.duration = {
        value: req.body.duration.value || course.duration.value,
        unit: req.body.duration.unit || course.duration.unit
      };
      updated = true;
      updatedFields.push('duration');
      console.log("⏰ Updated duration to:", course.duration.value, course.duration.unit);
    }
    
    // ==================== PRICING ====================
    if (req.body.totalFees !== undefined) {
      course.totalFees = Number(req.body.totalFees);
      updated = true;
      updatedFields.push('totalFees');
      console.log("💰 Updated totalFees to:", course.totalFees);
    }
    
    if (req.body.installmentAllowed !== undefined) {
      course.installmentAllowed = req.body.installmentAllowed;
      updated = true;
      updatedFields.push('installmentAllowed');
      console.log("💳 Updated installmentAllowed to:", course.installmentAllowed);
    }
    
    if (req.body.numberOfInstallments !== undefined) {
      course.numberOfInstallments = req.body.numberOfInstallments;
      updated = true;
      updatedFields.push('numberOfInstallments');
      console.log("📆 Updated numberOfInstallments to:", course.numberOfInstallments);
    }
    
    // ==================== DISCOUNT ====================
    if (req.body.discount !== undefined) {
      course.discount = {
        isDiscounted: req.body.discount.isDiscounted || false,
        discountPercentage: req.body.discount.discountPercentage || 0,
        validUntil: req.body.discount.validUntil || null
      };
      // Recalculate discounted price
      if (course.discount.isDiscounted && course.discount.discountPercentage > 0) {
        const discountedAmount = course.totalFees * (course.discount.discountPercentage / 100);
        course.discount.discountedPrice = Math.round(course.totalFees - discountedAmount);
      } else {
        course.discount.discountedPrice = 0;
      }
      updated = true;
      updatedFields.push('discount');
      console.log("💰 Updated discount to:", course.discount.discountPercentage, "%");
    }
    
    // ==================== LEVEL & DESCRIPTIONS ====================
    if (req.body.level !== undefined) {
      course.level = req.body.level;
      updated = true;
      updatedFields.push('level');
      console.log("📊 Updated level to:", course.level);
    }
    
    if (req.body.shortDescription !== undefined) {
      course.shortDescription = req.body.shortDescription;
      updated = true;
      updatedFields.push('shortDescription');
      console.log("📝 Updated shortDescription");
    }
    
    if (req.body.fullDescription !== undefined) {
      course.fullDescription = req.body.fullDescription;
      updated = true;
      updatedFields.push('fullDescription');
      console.log("📝 Updated fullDescription");
    }
    
    // ==================== ARRAY FIELDS ====================
    if (req.body.skillsToLearn !== undefined) {
      course.skillsToLearn = Array.isArray(req.body.skillsToLearn) ? req.body.skillsToLearn : 
        req.body.skillsToLearn.split(',').map(s => s.trim());
      updated = true;
      updatedFields.push('skillsToLearn');
      console.log("🎯 Updated skillsToLearn:", course.skillsToLearn.length);
    }
    
    if (req.body.tags !== undefined) {
      course.tags = Array.isArray(req.body.tags) ? req.body.tags : 
        req.body.tags.split(',').map(t => t.trim());
      updated = true;
      updatedFields.push('tags');
      console.log("🏷️ Updated tags:", course.tags.length);
    }
    
    if (req.body.learningOutcomes !== undefined) {
      course.learningOutcomes = Array.isArray(req.body.learningOutcomes) ? req.body.learningOutcomes : 
        req.body.learningOutcomes.split('\n').filter(l => l.trim());
      updated = true;
      updatedFields.push('learningOutcomes');
      console.log("📚 Updated learningOutcomes:", course.learningOutcomes.length);
    }
    
    if (req.body.prerequisites !== undefined) {
      course.prerequisites = Array.isArray(req.body.prerequisites) ? req.body.prerequisites : 
        req.body.prerequisites.split('\n').filter(p => p.trim());
      updated = true;
      updatedFields.push('prerequisites');
      console.log("📋 Updated prerequisites:", course.prerequisites.length);
    }
    
    if (req.body.targetAudience !== undefined) {
      course.targetAudience = Array.isArray(req.body.targetAudience) ? req.body.targetAudience : 
        req.body.targetAudience.split('\n').filter(t => t.trim());
      updated = true;
      updatedFields.push('targetAudience');
      console.log("👥 Updated targetAudience:", course.targetAudience.length);
    }
    
    if (req.body.features !== undefined) {
      course.features = Array.isArray(req.body.features) ? req.body.features : 
        req.body.features.split('\n').filter(f => f.trim());
      updated = true;
      updatedFields.push('features');
      console.log("✨ Updated features:", course.features.length);
    }
    
    if (req.body.benefits !== undefined) {
      course.benefits = Array.isArray(req.body.benefits) ? req.body.benefits : 
        req.body.benefits.split('\n').filter(b => b.trim());
      updated = true;
      updatedFields.push('benefits');
      console.log("🎁 Updated benefits:", course.benefits.length);
    }
    
    if (req.body.whatIncludes !== undefined) {
      course.whatIncludes = Array.isArray(req.body.whatIncludes) ? req.body.whatIncludes : 
        req.body.whatIncludes.split('\n').filter(w => w.trim());
      updated = true;
      updatedFields.push('whatIncludes');
      console.log("📦 Updated whatIncludes:", course.whatIncludes.length);
    }
    
    if (req.body.careerOpportunities !== undefined) {
      course.careerOpportunities = Array.isArray(req.body.careerOpportunities) ? req.body.careerOpportunities : 
        req.body.careerOpportunities.split('\n').filter(c => c.trim());
      updated = true;
      updatedFields.push('careerOpportunities');
      console.log("💼 Updated careerOpportunities:", course.careerOpportunities.length);
    }
    
    if (req.body.eligibilityCriteria !== undefined) {
      course.eligibilityCriteria = Array.isArray(req.body.eligibilityCriteria) ? req.body.eligibilityCriteria : 
        req.body.eligibilityCriteria.split('\n').filter(e => e.trim());
      updated = true;
      updatedFields.push('eligibilityCriteria');
      console.log("📜 Updated eligibilityCriteria:", course.eligibilityCriteria.length);
    }
    
    // ==================== NESTED ARRAYS (SYLLABUS, PROJECTS, FAQS) ====================
    if (req.body.syllabus !== undefined) {
      course.syllabus = req.body.syllabus;
      updated = true;
      updatedFields.push('syllabus');
      console.log("📚 Updated syllabus with", course.syllabus.length, "modules");
    }
    
    if (req.body.projects !== undefined) {
      course.projects = req.body.projects;
      course.totalProjects = course.projects.length;
      updated = true;
      updatedFields.push('projects');
      console.log("🚀 Updated projects with", course.projects.length, "projects");
    }
    
    if (req.body.faqs !== undefined) {
      course.faqs = req.body.faqs;
      updated = true;
      updatedFields.push('faqs');
      console.log("❓ Updated FAQs with", course.faqs.length, "questions");
    }
    
    if (req.body.careerPaths !== undefined) {
      course.careerPaths = req.body.careerPaths;
      updated = true;
      updatedFields.push('careerPaths');
      console.log("💼 Updated careerPaths with", course.careerPaths.length, "paths");
    }
    
    if (req.body.batches !== undefined) {
      course.batches = req.body.batches;
      updated = true;
      updatedFields.push('batches');
      console.log("📅 Updated batches with", course.batches.length, "batches");
    }
    
    if (req.body.instructors !== undefined) {
      course.instructors = req.body.instructors;
      updated = true;
      updatedFields.push('instructors');
      console.log("👨‍🏫 Updated instructors");
    }
    
    // ==================== OBJECT FIELDS ====================
    if (req.body.seoMetadata !== undefined) {
      course.seoMetadata = req.body.seoMetadata;
      updated = true;
      updatedFields.push('seoMetadata');
      console.log("🔍 Updated seoMetadata");
    }
    
    if (req.body.certificateDetails !== undefined) {
      course.certificateDetails = req.body.certificateDetails;
      updated = true;
      updatedFields.push('certificateDetails');
      console.log("🎓 Updated certificateDetails");
    }
    
    if (req.body.certificateProvided !== undefined) {
      course.certificateProvided = req.body.certificateProvided;
      updated = true;
      updatedFields.push('certificateProvided');
      console.log("✅ Updated certificateProvided to:", course.certificateProvided);
    }
    
    if (req.body.eligibility !== undefined) {
      course.eligibility = req.body.eligibility;
      updated = true;
      updatedFields.push('eligibility');
      console.log("📋 Updated eligibility to:", course.eligibility);
    }
    
    if (req.body.isActive !== undefined) {
      course.isActive = req.body.isActive;
      updated = true;
      updatedFields.push('isActive');
      console.log("🔘 Updated isActive to:", course.isActive);
    }
    
    // ==================== POPULARITY (Partial Update) ====================
    if (req.body.popularity !== undefined) {
      if (req.body.popularity.featured !== undefined) {
        course.popularity.featured = req.body.popularity.featured;
        updated = true;
        updatedFields.push('popularity.featured');
      }
      if (req.body.popularity.sortOrder !== undefined) {
        course.popularity.sortOrder = req.body.popularity.sortOrder;
        updated = true;
        updatedFields.push('popularity.sortOrder');
      }
      console.log("⭐ Updated popularity");
    }
    
    if (!updated) {
      console.log("⚠️ No fields to update");
      return this.success(res, { course }, 'No changes made');
    }
    
    console.log("💾 Saving to database...");
    console.log("Updated fields:", updatedFields);
    await course.save();
    console.log("✅ Save successful!");
    
    // Final discount recalculation (in case totalFees changed)
    if (course.discount?.isDiscounted && course.discount.discountPercentage > 0) {
      const discountedAmount = course.totalFees * (course.discount.discountPercentage / 100);
      course.discount.discountedPrice = Math.round(course.totalFees - discountedAmount);
      await course.save();
      console.log("💰 Discount recalculated:", course.discount.discountedPrice);
    }
    
    const freshCourse = await Course.findById(id)
      .populate('instructors', 'name email profilePicture bio')
      .populate('createdBy', 'name');
    
    console.log("💰 Final totalFees:", freshCourse.totalFees);
    console.log("=".repeat(50));
    
    return this.success(res, { 
      course: freshCourse,
      updatedFields: updatedFields
    }, 'Course updated successfully');
    
  } catch (error) {
    console.error("❌ Update error:", error);
    console.error("Error stack:", error.stack);
    return this.error(res, error.message || 'Failed to update course', 500);
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

// ✅ Create and export a single instance (ONLY THIS)
const courseController = new CourseController();
export default courseController;