import api from './api'

export const studentService = {
  // ==================== REGISTRATION FLOW (5 STEPS) ====================
  
  createStudentRegistration: async (data) => {
    const response = await api.post('/auth/register/step1', data)
    return response
  },

  updateStudentCourse: async (studentId, data) => {
  const response = await api.put(`/auth/register/${studentId}/course`, data)
  return response
},

  sendEmailOTP: async (studentId) => {
    const response = await api.post(`/students/${studentId}/send-otp`)
    return response
  },

  verifyEmailOTP: async (studentId, otp) => {
    const response = await api.post(`/students/${studentId}/verify-email`, { otp })
    return response
  },


uploadMultipleDocuments: async (studentId, formData) => {
    try {
      const response = await api.post(`/students/${studentId}/upload-documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Upload error:', error)
      throw error.response?.data || error
    }
  },

payAdmissionFee: async (studentId, paymentData) => {
  try {
    const response = await api.post(`/students/${studentId}/pay-admission`, paymentData)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
},

  adminCreateStudent: async (data) => {
    try {
      const response = await api.post('/students/admin/students/register', {
        ...data,
        isAdminCreated: true,
        emailVerified: true,  // Auto verify email
        registrationStatus: 'completed'  // Skip to completed
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }},


  updateDocumentStatus: async (studentId, data) => {
    const response = await api.put(`/students/${studentId}/documents`, data)
    return response
  },


  payAdmissionFee: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/pay-admission`, data)
    return response
  },

 
  verifyPayment: async (studentId, paymentData) => {
    const response = await api.post(`/students/${studentId}/verify-payment`, paymentData)
    return response
  },


  completeRegistration: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/complete-registration`, data)
    return response
  },


  getRegistrationProgress: async (studentId) => {
    const response = await api.get(`/auth/register/${studentId}/progress`)
    return response
  },

  resendOTP: async (studentId) => {
    const response = await api.post(`/students/${studentId}/resend-otp`)
    return response
  },

  // ==================== STUDENT CRUD OPERATIONS ====================
  
  getAllStudents: async (params = {}) => {
    const query = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key]) query.append(key, params[key])
    })
    const response = await api.get(`/students?${query.toString()}`)
    return response
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`)
    return response
  },

  getStudentByEnrollment: async (enrollmentNo) => {
    const response = await api.get(`/students/enrollment/${enrollmentNo}`)
    return response
  },

  createStudent: async (data) => {
    const response = await api.post('/students', data)
    return response
  },

  updateStudent: async (id, data) => {
    const response = await api.put(`/students/${id}`, data)
    return response
  },

  changeStatus: async (id, status, reason = '') => {
    const response = await api.patch(`/students/${id}/status`, { status, reason })
    return response
  },

  assignBatch: async (id, batchId) => {
    const response = await api.patch(`/students/${id}/assign-batch`, { batchId })
    return response
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`)
    return response
  },

  // ==================== STUDENT STATISTICS ====================
  
  getStudentStats: async () => {
    const response = await api.get('/students/stats')
    return response
  },

  getRegistrationStats: async () => {
    const response = await api.get('/students/stats/registration')
    return response
  },

  getPendingAdmissionFees: async () => {
    const response = await api.get('/students/pending-admission')
    return response
  },

  // ==================== STUDENT DOCUMENTS ====================
  
  uploadDocument: async (studentId, file, docType) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('docType', docType)
    const response = await api.post(`/students/${studentId}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response
  },

  getDocuments: async (studentId) => {
    const response = await api.get(`/students/${studentId}/documents`)
    return response
  },

  deleteDocument: async (studentId, documentId) => {
    const response = await api.delete(`/students/${studentId}/documents/${documentId}`)
    return response
  },

  // ==================== STUDENT FEES ====================
  
  getStudentFees: async (studentId) => {
    const response = await api.get(`/fees/student/${studentId}`)
    return response
  },

  getPaymentHistory: async (studentId, params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    const response = await api.get(`/fees/student/${studentId}/payments?${query.toString()}`)
    return response
  },

  getPaymentStatus: async (studentId) => {
    const response = await api.get(`/students/${studentId}/payment-status`)
    return response
  },

  refundAdmissionFee: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/refund-admission`, data)
    return response
  },

  // ==================== STUDENT ATTENDANCE ====================
  
  getStudentAttendance: async (studentId, params = {}) => {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    const response = await api.get(`/students/${studentId}/attendance?${query.toString()}`)
    return response
  },

  getAttendanceSummary: async (studentId) => {
    const response = await api.get(`/students/${studentId}/attendance-summary`)
    return response
  },

  markAttendance: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/attendance`, data)
    return response
  },

  // ==================== STUDENT BATCH ====================
  
  getStudentBatch: async (studentId) => {
    const response = await api.get(`/students/${studentId}/batch`)
    return response
  },

  getStudentBatchHistory: async (studentId) => {
    const response = await api.get(`/students/${studentId}/batch-history`)
    return response
  },

  // ==================== STUDENT DASHBOARD ====================
  
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student')
    return response
  },

  getStudentProfile: async () => {
    const response = await api.get('/auth/me?userType=student')
    return response
  },

  updateStudentProfile: async (data) => {
    const response = await api.put('/students/profile', data)
    return response
  },

  // ==================== STUDENT COURSES ====================
  
  getEnrolledCourses: async () => {
    const response = await api.get('/students/enrolled-courses')
    return response
  },

  getCourseDetails: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`)
    return response
  },

  // ==================== STUDENT CERTIFICATES ====================
  
  getStudentCertificates: async (studentId) => {
    const response = await api.get(`/certificates/student/${studentId}`)
    return response
  },

  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    })
    return response
  },

  verifyCertificate: async (certificateId) => {
    const response = await api.get(`/public/verify-certificate/${certificateId}`)
    return response
  },

  // ==================== STUDENT NOTIFICATIONS ====================
  
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.isRead) query.append('isRead', params.isRead)
    const response = await api.get(`/notifications/student?${query.toString()}`)
    return response
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch('/notifications/read-all')
    return response
  },

  // ==================== STUDENT REPORTS ====================
  
  generateProgressReport: async (studentId) => {
    const response = await api.get(`/students/${studentId}/progress-report`)
    return response
  },

  getPerformanceAnalytics: async (studentId) => {
    const response = await api.get(`/students/${studentId}/performance`)
    return response
  },

  // ==================== STUDENT EXPORT ====================
  
  exportStudents: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.course) query.append('course', params.course)
    const response = await api.get(`/students/export?${query.toString()}`, {
      responseType: 'blob'
    })
    return response
  },

  exportStudentData: async (studentId) => {
    const response = await api.get(`/students/${studentId}/export`, {
      responseType: 'blob'
    })
    return response
  }
}

export default studentService