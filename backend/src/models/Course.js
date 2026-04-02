import mongoose from 'mongoose';
import slugify from 'slugify';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    unique: true,
    trim: true
  },
  
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  
  code: {
    type: String,
    unique: true,
    trim: true
  },
  
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
    trim: true
  },
  
  fullDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  thumbnail: {
    type: String,
    default: ''
  },
  
  images: [{
    url: { type: String, required: true },
    caption: { type: String }
  }],
  
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['months', 'years', 'weeks', 'days'],
      default: 'months'
    }
  },
  
  totalFees: {
    type: Number,
    required: true,
    min: 0
  },
  
  installmentAllowed: {
    type: Boolean,
    default: true
  },
  
  numberOfInstallments: {
    type: Number,
    default: 1
  },
  
  skillsToLearn: [{
    type: String,
    trim: true
  }],
  
  syllabus: {
    type: [{
      moduleName: {
        type: String,
        required: true,
        trim: true
      },
      moduleDescription: {
        type: String,
        trim: true
      },
      topics: [{
        topicName: {
          type: String,
          required: true,
          trim: true
        },
        topicDescription: {
          type: String,
          trim: true
        },
        duration: {
          type: Number,
          help: 'Duration in hours'
        },
        resources: [{
          type: String,
          trim: true
        }]
      }],
      moduleDuration: {
        type: Number,
        help: 'Duration in hours'
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    default: []
  },
  
  careerOpportunities: [{
    type: String,
    trim: true
  }],
  
  careerPaths: [{
    role: {
      type: String,
      trim: true
    },
    averageSalary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  certificateProvided: {
    type: Boolean,
    default: true
  },
  
  certificateDetails: {
    type: {
      certificateType: {
        type: String,
        enum: ['Digital', 'Physical', 'Both'],
        default: 'Digital'
      },
      issuingAuthority: {
        type: String,
        trim: true
      },
      validity: {
        type: String,
        trim: true
      },
      additionalInfo: {
        type: String,
        trim: true
      }
    },
    default: null
  },
  
  totalProjects: {
    type: Number,
    default: 0,
    min: 0
  },
  
  projects: [{
    projectName: {
      type: String,
      required: true,
      trim: true
    },
    projectDescription: {
      type: String,
      trim: true
    },
    technologiesUsed: [{
      type: String,
      trim: true
    }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    duration: {
      type: Number,
      help: 'Duration in hours'
    },
    githubLink: {
      type: String,
      trim: true
    },
    demoLink: {
      type: String,
      trim: true
    }
  }],
  
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  targetAudience: [{
    type: String,
    trim: true
  }],
  
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner'
  },
  
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  features: [{
    type: String,
    trim: true
  }],
  
  benefits: [{
    type: String,
    trim: true
  }],
  
  whatIncludes: [{
    type: String,
    trim: true
  }],
  
  faqs: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  seoMetadata: {
    metaTitle: {
      type: String,
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    },
    metaKeywords: [{
      type: String,
      trim: true
    }],
    ogImage: {
      type: String,
      trim: true
    }
  },
  
  popularity: {
    views: {
      type: Number,
      default: 0
    },
    enrollments: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  
  discount: {
    isDiscounted: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    discountedPrice: {
      type: Number,
      default: 0
    },
    validUntil: {
      type: Date
    }
  },
  
  batches: [{
    batchName: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    schedule: {
      type: String,
      trim: true
    },
    seatsAvailable: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  category: {
    type: String,
    trim: true,
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  eligibility: {
    type: String,
    trim: true
  },
  
  eligibilityCriteria: [{
    type: String,
    trim: true
  }],
  
  image: {
    type: String,
    default: ''
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Helper function to generate unique slug
const generateUniqueSlug = async (baseSlug, model, excludeId = null, counter = 0) => {
  const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
  const query = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await model.findOne(query);
  if (existing) {
    return generateUniqueSlug(baseSlug, model, excludeId, counter + 1);
  }
  return slug;
};

// Pre-save middleware
courseSchema.pre('save', async function(next) {
  try {
    // Handle slug generation
    if (this.isNew) {
      // New course: generate slug from name
      const baseSlug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      this.slug = await generateUniqueSlug(baseSlug, this.constructor, null);
    } else if (this.isModified('name')) {
      // Existing course: name changed, generate new slug
      const baseSlug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      this.slug = await generateUniqueSlug(baseSlug, this.constructor, this._id);
    }
    
    // Generate course code for new courses only
    if (this.isNew && !this.code) {
      const Course = mongoose.model('Course');
      const count = await Course.countDocuments();
      this.code = `CRS${String(count + 1).padStart(4, '0')}`;
    }
    
    // Auto-generate SEO metadata
    if (this.isNew || this.isModified('name') || this.isModified('shortDescription')) {
      if (!this.seoMetadata) {
        this.seoMetadata = {};
      }
      
      if (!this.seoMetadata.metaTitle && this.name) {
        this.seoMetadata.metaTitle = this.name;
      }
      
      if (!this.seoMetadata.metaDescription && this.shortDescription) {
        this.seoMetadata.metaDescription = this.shortDescription.substring(0, 160);
      }
      
      if (!this.seoMetadata.metaKeywords && this.tags?.length) {
        this.seoMetadata.metaKeywords = [...this.tags.slice(0, 10)];
      }
    }
    
    // Calculate discounted price
    if (this.discount?.isDiscounted && this.discount.discountPercentage > 0) {
      const discountedAmount = this.totalFees * (this.discount.discountPercentage / 100);
      this.discount.discountedPrice = Math.round(this.totalFees - discountedAmount);
    } else if (this.discount && !this.discount.isDiscounted) {
      this.discount.discountedPrice = 0;
    }
    
    // Sync total projects count
    if (this.projects) {
      this.totalProjects = this.projects.length;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
courseSchema.methods.getDurationDisplay = function() {
  return `${this.duration.value} ${this.duration.unit}`;
};

courseSchema.methods.getCurrentPrice = function() {
  if (this.discount?.isDiscounted && this.discount.discountedPrice > 0 && this.isDiscountValid()) {
    return this.discount.discountedPrice;
  }
  return this.totalFees;
};

courseSchema.methods.getDiscountPercentage = function() {
  if (this.discount?.isDiscounted) {
    return this.discount.discountPercentage;
  }
  return 0;
};

courseSchema.methods.isDiscountValid = function() {
  if (!this.discount || !this.discount.isDiscounted) return false;
  if (this.discount.validUntil && this.discount.validUntil < new Date()) return false;
  return true;
};

courseSchema.methods.getTotalSyllabusDuration = function() {
  let totalDuration = 0;
  if (this.syllabus?.length) {
    this.syllabus.forEach(module => {
      if (module.moduleDuration) totalDuration += module.moduleDuration;
      if (module.topics?.length) {
        module.topics.forEach(topic => {
          if (topic.duration) totalDuration += topic.duration;
        });
      }
    });
  }
  return totalDuration;
};

courseSchema.methods.incrementViews = async function() {
  this.popularity.views += 1;
  await this.save();
};

courseSchema.methods.incrementEnrollments = async function() {
  this.popularity.enrollments += 1;
  await this.save();
};

courseSchema.methods.getCourseUrl = function() {
  return `/courses/${this.slug}`;
};

courseSchema.methods.getFullDetails = function() {
  return {
    ...this.toObject(),
    durationDisplay: this.getDurationDisplay(),
    currentPrice: this.getCurrentPrice(),
    discountPercentage: this.getDiscountPercentage(),
    isDiscountValid: this.isDiscountValid(),
    totalSyllabusDuration: this.getTotalSyllabusDuration(),
    totalProjectsCount: this.totalProjects,
    courseUrl: this.getCourseUrl()
  };
};

// Statics
courseSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

courseSchema.statics.findBySlugWithDetails = async function(slug) {
  const course = await this.findOne({ slug, isActive: true })
    .populate('instructors', 'name email profilePicture bio')
    .populate('createdBy', 'name');
  
  if (course) {
    return course.getFullDetails();
  }
  return null;
};

courseSchema.statics.getRelatedCourses = async function(courseId, category, limit = 4) {
  return this.find({
    _id: { $ne: courseId },
    category: category,
    isActive: true
  })
    .select('name slug thumbnail totalFees duration rating shortDescription level')
    .limit(limit)
    .lean();
};

// Update course with validation
courseSchema.statics.updateCourse = async function(courseId, updateData) {
  const course = await this.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Prevent direct modification of protected fields
  const protectedFields = ['slug', 'code', '_id', '__v', 'createdAt'];
  protectedFields.forEach(field => {
    if (updateData[field]) delete updateData[field];
  });
  
  // Apply updates
  Object.keys(updateData).forEach(key => {
    course[key] = updateData[key];
  });
  
  // Save will trigger pre-save middleware
  await course.save();
  return course;
};

// Partial update with optimization
courseSchema.statics.partialUpdate = async function(courseId, updateData) {
  const course = await this.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Remove protected fields
  const protectedFields = ['slug', 'code', '_id', '__v'];
  protectedFields.forEach(field => {
    delete updateData[field];
  });
  
  // Handle special field updates
  if (updateData.projects) {
    updateData.totalProjects = updateData.projects.length;
  }
  
  if (updateData.discount?.isDiscounted && (updateData.totalFees || course.totalFees)) {
    const totalFees = updateData.totalFees || course.totalFees;
    const discountPercent = updateData.discount.discountPercentage || course.discount?.discountPercentage || 0;
    updateData.discount.discountedPrice = Math.round(totalFees - (totalFees * discountPercent / 100));
  }
  
  // Apply updates
  Object.assign(course, updateData);
  await course.save();
  
  return course;
};

// Bulk update status
courseSchema.statics.bulkUpdateStatus = async function(courseIds, isActive) {
  return this.updateMany(
    { _id: { $in: courseIds } },
    { $set: { isActive } },
    { new: true, runValidators: true }
  );
};

// Indexes
courseSchema.index({ name: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ code: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ 'popularity.featured': -1, 'popularity.sortOrder': 1 });
courseSchema.index({ totalFees: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ tags: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;