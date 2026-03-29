import api from './api'

export const teacherService = {
  // ==================== TEACHER CRUD ====================
  
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

  // Create new teacher (admin only)
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

  // Change teacher status
  changeTeacherStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status })
    return response
  },

  // ==================== TEACHER DASHBOARD ====================
  
  // Get teacher dashboard
  getTeacherDashboard: async () => {
    const response = await api.get('/dashboard/teacher')
    return response
  },

  // Get teacher profile
  getTeacherProfile: async () => {
    const response = await api.get('/auth/me?userType=user')
    return response
  },

  // Update teacher profile
  updateTeacherProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response
  },

  // ==================== TEACHER BATCHES ====================
  
  // Get assigned batches
  getAssignedBatches: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    
    const response = await api.get(`/teachers/batches?${query.toString()}`)
    return response
  },

  // Get batch details
  getBatchDetails: async (batchId) => {
    const response = await api.get(`/batches/${batchId}`)
    return response
  },

  // Get batch students
  getBatchStudents: async (batchId, params = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    
    const response = await api.get(`/batches/${batchId}/students?${query.toString()}`)
    return response
  },

  // ==================== TEACHER ATTENDANCE ====================
  
  // Mark attendance
  markAttendance: async (data) => {
    const response = await api.post('/attendance/mark', data)
    return response
  },

  // Get batch attendance
  getBatchAttendance: async (batchId, date) => {
    const response = await api.get(`/attendance/batch/${batchId}/date/${date}`)
    return response
  },

  // Get attendance report
  getAttendanceReport: async (batchId, params = {}) => {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    
    const response = await api.get(`/attendance/batch/${batchId}/report?${query.toString()}`)
    return response
  },

  // Get student attendance
  getStudentAttendanceTeacher: async (studentId, params = {}) => {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    
    const response = await api.get(`/attendance/student/${studentId}?${query.toString()}`)
    return response
  },

  // ==================== TEACHER MARKS ====================
  
  // Add/update marks
  addMarks: async (data) => {
    const response = await api.post('/marks', data)
    return response
  },

  // Get student marks
  getStudentMarks: async (studentId, subject) => {
    const query = new URLSearchParams()
    if (subject) query.append('subject', subject)
    
    const response = await api.get(`/marks/student/${studentId}?${query.toString()}`)
    return response
  },

  // Get batch marks
  getBatchMarks: async (batchId, examType) => {
    const query = new URLSearchParams()
    if (examType) query.append('examType', examType)
    
    const response = await api.get(`/marks/batch/${batchId}?${query.toString()}`)
    return response
  },

  // Generate mark sheet
  generateMarkSheet: async (studentId, examType) => {
    const response = await api.get(`/marks/${studentId}/marksheet?examType=${examType}`)
    return response
  },

  // ==================== TEACHER ASSIGNMENTS ====================
  
  // Create assignment
  createAssignment: async (data) => {
    const response = await api.post('/assignments', data)
    return response
  },

  // Get assignments
  getAssignments: async (batchId) => {
    const response = await api.get(`/assignments?batchId=${batchId}`)
    return response
  },

  // Get assignment details
  getAssignmentDetails: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}`)
    return response
  },

  // Submit assignment (student)
  submitAssignment: async (assignmentId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response
  },

  // Grade assignment
  gradeAssignment: async (submissionId, data) => {
    const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, data)
    return response
  },

  // ==================== TEACHER TIMETABLE ====================
  
  // Get teacher timetable
  getTeacherTimetable: async () => {
    const response = await api.get('/teachers/timetable')
    return response
  },

  // Get weekly schedule
  getWeeklySchedule: async () => {
    const response = await api.get('/teachers/schedule/weekly')
    return response
  },

  // ==================== TEACHER NOTIFICATIONS ====================
  
  // Send notification to batch
  sendBatchNotification: async (batchId, data) => {
    const response = await api.post(`/notifications/batch/${batchId}`, data)
    return response
  },

  // Send notification to student
  sendStudentNotification: async (studentId, data) => {
    const response = await api.post(`/notifications/student/${studentId}`, data)
    return response
  },

  // Get teacher notifications
  getTeacherNotifications: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    
    const response = await api.get(`/notifications/teacher?${query.toString()}`)
    return response
  },

  // ==================== TEACHER SALARY ====================
  
  // Get salary details
  getSalaryDetails: async (month, year) => {
    const response = await api.get(`/teachers/salary?month=${month}&year=${year}`)
    return response
  },

  // Get salary history
  getSalaryHistory: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    
    const response = await api.get(`/teachers/salary/history?${query.toString()}`)
    return response
  },

  // ==================== TEACHER LEAVE ====================
  
  // Apply for leave
  applyLeave: async (data) => {
    const response = await api.post('/teachers/leave', data)
    return response
  },

  // Get leave requests
  getLeaveRequests: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    
    const response = await api.get(`/teachers/leave?${query.toString()}`)
    return response
  },

  // Cancel leave request
  cancelLeave: async (leaveId) => {
    const response = await api.delete(`/teachers/leave/${leaveId}`)
    return response
  },

  // ==================== TEACHER STATISTICS ====================
  
  // Get teacher statistics
  getTeacherStats: async () => {
    const response = await api.get('/teachers/stats')
    return response
  },

  // Get performance statistics
  getPerformanceStats: async () => {
    const response = await api.get('/teachers/performance')
    return response
  },

  // Get student feedback
  getStudentFeedback: async (batchId) => {
    const response = await api.get(`/teachers/feedback?batchId=${batchId}`)
    return response
  },

  // ==================== TEACHER EXPORT ====================
  
  // Export attendance report
  exportAttendanceReport: async (batchId, params = {}) => {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    
    const response = await api.get(`/attendance/batch/${batchId}/export?${query.toString()}`, {
      responseType: 'blob'
    })
    return response
  },

  // Export marks report
  exportMarksReport: async (batchId, examType) => {
    const response = await api.get(`/marks/batch/${batchId}/export?examType=${examType}`, {
      responseType: 'blob'
    })
    return response
  }
}