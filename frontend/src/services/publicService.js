// services/publicService.js
import api from './api'

export const publicService = {
  // Get all public courses
  getCourses: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/courses/public${query ? `?${query}` : ''}`)
  },

  // Get course by slug
  getCourseBySlug: async (slug) => {
    return await api.get(`/courses/public/slug/${slug}`)
  },

  // Get course by ID
  getCourseById: async (id) => {
    return await api.get(`/courses/public/${id}`)
  },

  // Get featured courses
  getFeaturedCourses: async (limit = 6) => {
    return await api.get(`/courses/public/featured?limit=${limit}`)
  },

  // Get popular courses
  getPopularCourses: async (limit = 8) => {
    return await api.get(`/courses/public/popular?limit=${limit}`)
  },

  // Get course categories
  getCourseCategories: async () => {
    return await api.get('/courses/public/categories')
  },

  // Submit inquiry
  submitInquiry: async (data) => {
    return await api.post('/public/inquiry', data)
  },

  // Verify certificate
  verifyCertificate: async (certificateId) => {
    return await api.get(`/public/verify-certificate/${certificateId}`)
  },

  // Check fee status
  checkFeeStatus: async (enrollmentNo) => {
    return await api.get(`/public/check-fee/${enrollmentNo}`)
  },

  // Get events
  getEvents: async () => {
    return await api.get('/public/events')
  },

  // Get notices
  getNotices: async () => {
    return await api.get('/public/notices')
  },

  // Get contact info
  getContactInfo: async () => {
    return await api.get('/public/contact')
  }
}

export default publicService