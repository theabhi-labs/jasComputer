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
  
  // Short description for cards/listings
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
    trim: true
  },
  
  // Full detailed description
  fullDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  // Thumbnail image
  thumbnail: {
    type: String,
    default: ''
  },
  
  // Additional images/gallery
  images: [
  {
    url: { type: String, required: true },
    caption: { type: String }
  }
],
  
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
  
  // Skills students will learn
  skillsToLearn: [{
    type: String,
    trim: true
  }],
  
  // Syllabus structured with modules and topics
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
  
  // Career opportunities after course completion
  careerOpportunities: [{
    type: String,
    trim: true
  }],
  
  // Job roles/career paths
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
  
  // Certificate provided or not
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
  
  // Total projects
  totalProjects: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Projects details
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
  
  // Learning outcomes
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  
  // Prerequisites
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  // Target audience
  targetAudience: [{
    type: String,
    trim: true
  }],
  
  // Course level
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner'
  },
  
  // Language
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  
  // Rating and reviews
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
  
  // Course features
  features: [{
    type: String,
    trim: true
  }],
  
  // Course benefits
  benefits: [{
    type: String,
    trim: true
  }],
  
  // What's included
  whatIncludes: [{
    type: String,
    trim: true
  }],
  
  // FAQ section
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
  
  // SEO metadata
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
  
  // Popularity and sorting
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
  
  // Discount and offers
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
  
  // Batch and schedule
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
  
  // Instructor details
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Category and subcategory
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
  
  // Additional eligibility criteria
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

// Function to generate unique slug
const generateUniqueSlug = async (baseSlug, model, counter = 0) => {
  const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
  const existing = await model.findOne({ slug });
  if (existing) {
    return generateUniqueSlug(baseSlug, model, counter + 1);
  }
  return slug;
};

// Generate slug and course code before save
courseSchema.pre('save', async function(next) {
  try {
    // Generate slug if name is modified or new
    if (this.isModified('name') || this.isNew) {
      const baseSlug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      this.slug = await generateUniqueSlug(baseSlug, this.constructor);
    }
    
    // Generate course code
    if (this.isNew && !this.code) {
      const Course = mongoose.model('Course');
      const count = await Course.countDocuments();
      this.code = `CRS${String(count + 1).padStart(4, '0')}`;
    }
    
    // Auto-generate SEO metadata if not provided
    if (this.isNew || this.isModified('name') || this.isModified('shortDescription')) {
      if (!this.seoMetadata || !this.seoMetadata.metaTitle) {
        this.seoMetadata = this.seoMetadata || {};
        this.seoMetadata.metaTitle = this.name;
      }
      if (!this.seoMetadata || !this.seoMetadata.metaDescription) {
        this.seoMetadata = this.seoMetadata || {};
        this.seoMetadata.metaDescription = this.shortDescription?.substring(0, 160) || '';
      }
      if (!this.seoMetadata || !this.seoMetadata.metaKeywords && this.tags?.length) {
        this.seoMetadata = this.seoMetadata || {};
        this.seoMetadata.metaKeywords = this.tags.slice(0, 10);
      }
    }
    
    // Calculate discounted price if discount is active
    if (this.discount && this.discount.isDiscounted && this.discount.discountPercentage > 0) {
      this.discount.discountedPrice = this.totalFees - (this.totalFees * this.discount.discountPercentage / 100);
    }
    
    // Auto-update totalProjects based on projects array
    if (this.projects && this.projects.length !== this.totalProjects) {
      this.totalProjects = this.projects.length;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Get duration display
courseSchema.methods.getDurationDisplay = function() {
  return `${this.duration.value} ${this.duration.unit}`;
};

// Get formatted price with discount
courseSchema.methods.getCurrentPrice = function() {
  if (this.discount && this.discount.isDiscounted && this.discount.discountedPrice > 0) {
    return this.discount.discountedPrice;
  }
  return this.totalFees;
};

// Get discount percentage
courseSchema.methods.getDiscountPercentage = function() {
  if (this.discount && this.discount.isDiscounted) {
    return this.discount.discountPercentage;
  }
  return 0;
};

// Check if discount is valid
courseSchema.methods.isDiscountValid = function() {
  if (!this.discount || !this.discount.isDiscounted) return false;
  if (this.discount.validUntil && this.discount.validUntil < new Date()) return false;
  return true;
};

// Get total syllabus duration
courseSchema.methods.getTotalSyllabusDuration = function() {
  let totalDuration = 0;
  if (this.syllabus && this.syllabus.length) {
    this.syllabus.forEach(module => {
      if (module.moduleDuration) {
        totalDuration += module.moduleDuration;
      }
      if (module.topics && module.topics.length) {
        module.topics.forEach(topic => {
          if (topic.duration) {
            totalDuration += topic.duration;
          }
        });
      }
    });
  }
  return totalDuration;
};

// Get total projects count
courseSchema.methods.getTotalProjectsCount = function() {
  return this.projects ? this.projects.length : 0;
};

// Increment views
courseSchema.methods.incrementViews = async function() {
  this.popularity.views += 1;
  await this.save();
};

// Increment enrollments
courseSchema.methods.incrementEnrollments = async function() {
  this.popularity.enrollments += 1;
  await this.save();
};

// Get course URL
courseSchema.methods.getCourseUrl = function() {
  return `/courses/${this.slug}`;
};

// Get full details including computed fields
courseSchema.methods.getFullDetails = function() {
  return {
    ...this.toObject(),
    durationDisplay: this.getDurationDisplay(),
    currentPrice: this.getCurrentPrice(),
    discountPercentage: this.getDiscountPercentage(),
    isDiscountValid: this.isDiscountValid(),
    totalSyllabusDuration: this.getTotalSyllabusDuration(),
    totalProjectsCount: this.getTotalProjectsCount(),
    courseUrl: this.getCourseUrl()
  };
};

// Static method to find by slug
courseSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Static method to find by slug with full details
courseSchema.statics.findBySlugWithDetails = async function(slug) {
  const course = await this.findOne({ slug, isActive: true })
    .populate('instructors', 'name email profilePicture bio')
    .populate('createdBy', 'name');
  
  if (course) {
    return course.getFullDetails();
  }
  return null;
};

// Static method to get related courses
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

// Indexes for better performance
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