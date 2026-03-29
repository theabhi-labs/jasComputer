import api from './api'

export const attendanceService = {
  // Mark attendance
  markAttendance: async (data) => {
    return await api.post('/attendance/mark', data)
  },

  // Get attendance by batch and date
  getAttendanceByBatchAndDate: async (batchId, date) => {
    return await api.get(`/attendance/batch/${batchId}/date/${date}`)
  },

  // Get student attendance
  getStudentAttendance: async (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/attendance/student/${studentId}?${query}`)
  },

  // Get batch attendance summary
  getBatchAttendanceSummary: async (batchId, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/attendance/batch/${batchId}/summary?${query}`)
  },

  // Update attendance
  updateAttendance: async (id, data) => {
    return await api.put(`/attendance/${id}`, data)
  }
}