import api from './api'

export const userService = {
  // ==================== USER CRUD ====================
  
  // Get all users (admins & teachers)
  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.search) query.append('search', params.search)
    if (params.role) query.append('role', params.role)
    if (params.status) query.append('status', params.status)
    
    const response = await api.get(`/users?${query.toString()}`)
    return response
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response
  },

  // Create user (admin/teacher) - Super Admin only
  createUser: async (data) => {
    const response = await api.post('/auth/register', data)
    return response
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data)
    return response
  },

  // Change user status
  changeUserStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status })
    return response
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response
  },

  // ==================== TEACHER SPECIFIC ====================
  
  // Get all teachers
  getAllTeachers: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.search) query.append('search', params.search)
    if (params.status) query.append('status', params.status)
    
    const response = await api.get(`/users?role=teacher&${query.toString()}`)
    return response
  },

  // Get teacher by ID
  getTeacherById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response
  },

  // Create teacher
  createTeacher: async (data) => {
    const response = await api.post('/auth/register', {
      ...data,
      role: 'teacher'
    })
    return response
  },

  // Update teacher
  updateTeacher: async (id, data) => {
    const response = await api.put(`/users/${id}`, data)
    return response
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response
  },

  // ==================== ADMIN SPECIFIC ====================
  
  // Get all admins
  getAllAdmins: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.search) query.append('search', params.search)
    
    const response = await api.get(`/users?role=admin&${query.toString()}`)
    return response
  },

  // Create admin
  createAdmin: async (data) => {
    const response = await api.post('/auth/register', {
      ...data,
      role: 'admin'
    })
    return response
  },

  // ==================== USER STATISTICS ====================
  
  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/users/stats')
    return response
  },

  // Get teacher statistics
  getTeacherStats: async () => {
    const response = await api.get('/users/teachers/stats')
    return response
  },

  // ==================== USER PROFILE ====================
  
  // Update own profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('profileImage', file)
    
    const response = await api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response
  },

  // ==================== USER PERMISSIONS ====================
  
  // Get user permissions
  getUserPermissions: async (userId) => {
    const response = await api.get(`/users/${userId}/permissions`)
    return response
  },

  // Update user permissions (Admin only)
  updateUserPermissions: async (userId, permissions) => {
    const response = await api.put(`/users/${userId}/permissions`, { permissions })
    return response
  },

  // ==================== USER EXPORT ====================
  
  // Export users to CSV
  exportUsers: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.role) query.append('role', params.role)
    
    const response = await api.get(`/users/export?${query.toString()}`, {
      responseType: 'blob'
    })
    return response
  }
}