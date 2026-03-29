// services/certificateService.js
import api from './api'

export const certificateService = {
  // Get all certificates
  getAllCertificates: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/certificates?${query}`)
  },

  // Get certificate by ID
  getCertificateById: async (id) => {
    return await api.get(`/certificates/${id}`)
  },

  // Get student certificates
  getStudentCertificates: async (studentId) => {
    return await api.get(`/certificates/student/${studentId}`)
  },

  // Generate certificate
  generateCertificate: async (data) => {
    return await api.post('/certificates/generate', data)
  },

  // Verify certificate (public)
  verifyCertificate: async (certificateId) => {
    // api interceptor already returns response.data
    return await api.get(`/certificates/verify/${certificateId}`)
  },

  // Download certificate (public)
  downloadCertificate: async (certificateId) => {
    return await api.get(`/certificates/download/${certificateId}`)
  },

  // Revoke certificate
  revokeCertificate: async (id, reason) => {
    return await api.patch(`/certificates/${id}/revoke`, { reason })
  },

  // Get certificate stats
  getCertificateStats: async () => {
    return await api.get('/certificates/stats')
  }
}