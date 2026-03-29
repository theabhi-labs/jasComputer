import api from './api'

export const courseService = {
  // ==================== PUBLIC ROUTES ====================
  
  // Get all public courses (with filters, sorting, pagination)
  getPublicCourses: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/courses/public${query ? `?${query}` : ''}`)
  },

  // Get featured courses
  getFeaturedCourses: async (limit = 6) => {
    return await api.get(`/courses/public/featured?limit=${limit}`)
  },

  // Get popular courses
  getPopularCourses: async (limit = 8) => {
    return await api.get(`/courses/public/popular?limit=${limit}`)
  },

  // Get course categories with counts
  getCourseCategories: async () => {
    return await api.get('/courses/public/categories')
  },

  // Get course by slug (SEO friendly URL)
  getCourseBySlug: async (slug) => {
    return await api.get(`/courses/public/slug/${slug}`)
  },

  // Get public course by ID
  getPublicCourseById: async (id) => {
    return await api.get(`/courses/public/${id}`)
  },

  // ==================== PROTECTED ROUTES ====================
  
  // Get all courses (authenticated - admin/teacher)
  getAllCourses: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/courses${query ? `?${query}` : ''}`)
  },

  // Get course by ID (authenticated)
  getCourseById: async (id) => {
    return await api.get(`/courses/${id}`)
  },

  // Create course
  createCourse: async (data) => {
    return await api.post('/courses', data)
  },

  // Update course
  updateCourse: async (id, data) => {
    return await api.put(`/courses/${id}`, data)
  },

  // Update course rating
  updateCourseRating: async (id, rating) => {
    return await api.patch(`/courses/${id}/rating`, { rating })
  },

  // Toggle course status (activate/deactivate)
  toggleStatus: async (id) => {
    return await api.patch(`/courses/${id}/toggle-status`)
  },

  // Delete course
  deleteCourse: async (id) => {
    return await api.delete(`/courses/${id}`)
  },

  // Bulk update course status
  bulkUpdateStatus: async (courseIds, isActive) => {
    return await api.patch('/courses/bulk/status', { courseIds, isActive })
  },

  // ==================== HELPER FUNCTIONS ====================
  
  // Get courses with advanced filters
  getCoursesWithFilters: async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...filters
    }
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })
    
    return await courseService.getAllCourses(params)
  },

  // Search courses
  searchCourses: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get courses by category
  getCoursesByCategory: async (category, filters = {}) => {
    const params = {
      category,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get courses by level
  getCoursesByLevel: async (level, filters = {}) => {
    const params = {
      level,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get courses by price range
  getCoursesByPriceRange: async (minPrice, maxPrice, filters = {}) => {
    const params = {
      minPrice,
      maxPrice,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get courses by skills
  getCoursesBySkills: async (skills, filters = {}) => {
    const params = {
      skills: Array.isArray(skills) ? skills.join(',') : skills,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get discounted courses
  getDiscountedCourses: async (filters = {}) => {
    const params = {
      isDiscounted: true,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get courses with certificate
  getCoursesWithCertificate: async (filters = {}) => {
    const params = {
      certificateProvided: true,
      ...filters
    }
    return await courseService.getAllCourses(params)
  },

  // Get course statistics (for dashboard)
  getCourseStats: async () => {
    try {
      const [allCourses, featuredCourses, categories] = await Promise.all([
        courseService.getAllCourses({ limit: 1 }),
        courseService.getFeaturedCourses(100),
        courseService.getCourseCategories()
      ])
      
      return {
        totalCourses: allCourses.data?.pagination?.total || 0,
        featuredCount: featuredCourses.data?.courses?.length || 0,
        categoriesCount: categories.data?.categories?.length || 0
      }
    } catch (error) {
      console.error('Error fetching course stats:', error)
      throw error
    }
  }
}

export default courseService