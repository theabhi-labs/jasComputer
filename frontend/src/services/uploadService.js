import api from './api'

export const uploadService = {
  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const response = await api.post('/uploads/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Upload student document (single)
  uploadStudentDocument: async (studentId, formData, metadata = {}) => {
    try {
      const response = await api.post(`/uploads/student/${studentId}/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: metadata
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Upload multiple student documents
  uploadMultipleDocuments: async (studentId, formData) => {
    try {
      const response = await api.post(`/uploads/student/${studentId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Upload marksheet
  uploadMarksheet: async (studentId, formData) => {
    try {
      const response = await api.post(`/uploads/student/${studentId}/marksheet`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Upload Aadhar card
  uploadAadharCard: async (studentId, formData) => {
    try {
      const response = await api.post(`/uploads/student/${studentId}/aadhar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Upload certificate
  uploadCertificate: async (certificateId, studentId, formData) => {
    try {
      const response = await api.post(`/uploads/certificate/${certificateId}/student/${studentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Delete file
  deleteFile: async (objectName) => {
    try {
      const response = await api.delete(`/uploads/${objectName}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
  
  // Get file URL
  getFileUrl: async (objectName) => {
    try {
      const response = await api.get(`/uploads/${objectName}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}