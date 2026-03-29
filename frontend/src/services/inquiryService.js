import api from './api'

export const inquiryService = {
  // Get all inquiries
  getAllInquiries: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.status) query.append('status', params.status)
    if (params.search) query.append('search', params.search)
    
    const response = await api.get(`/inquiries?${query.toString()}`)
    return response
  },

  // Get inquiry by ID
  getInquiryById: async (id) => {
    const response = await api.get(`/inquiries/${id}`)
    return response
  },

  // Create inquiry (public)
  createInquiry: async (data) => {
    const response = await api.post('/inquiries', data)
    return response
  },

  // Update inquiry status
  updateStatus: async (id, data) => {
    const response = await api.patch(`/inquiries/${id}/status`, data)
    return response
  },

  // Add remark to inquiry
  addRemark: async (id, data) => {
    const response = await api.post(`/inquiries/${id}/remark`, data)
    return response
  },

  // Convert inquiry to student
  convertToStudent: async (id, data) => {
    const response = await api.post(`/inquiries/${id}/convert`, data)
    return response
  },

  // Delete inquiry
  deleteInquiry: async (id) => {
    const response = await api.delete(`/inquiries/${id}`)
    return response
  },

  // Get inquiry statistics
  getInquiryStats: async () => {
    const response = await api.get('/inquiries/stats')
    return response
  }
}