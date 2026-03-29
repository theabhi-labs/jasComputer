import api from './api'

export const dashboardService = {
  // Get super admin dashboard
  getSuperAdminDashboard: async () => {
    return await api.get('/dashboard/super-admin')
  },

  // Get admin dashboard
  getAdminDashboard: async () => {
    return await api.get('/dashboard/admin')
  },

  // Get teacher dashboard
  getTeacherDashboard: async () => {
    return await api.get('/dashboard/teacher')
  },

  // Get student dashboard
  getStudentDashboard: async () => {
    return await api.get('/dashboard/student')
  }
}