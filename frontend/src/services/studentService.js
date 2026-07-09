// src/services/studentService.js
import api from './api';

export const studentService = {

  getAllStudents: async (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) query.append(key, params[key]);
    });
    const response = await api.get(`/students?${query.toString()}`);
    return response;
  },

  // Get a single student by ID
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response;
  },

  // Create a new student
  createStudent: async (data) => {
    const response = await api.post('/students', data);
    return response;
  },

  // Update an existing student
  updateStudent: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response;
  },

  // Delete a student
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response;
  },

  // Upload student documents (local files)
  uploadDocuments: async (studentId, formData) => {
    const response = await api.post(`/students/${studentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },

  // Upload student document from URL
  uploadDocumentByUrl: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/documents/url`, data);
    return response;
  },

  // Delete student document
  deleteDocument: async (studentId, docId) => {
    const response = await api.delete(`/students/${studentId}/documents/${docId}`);
    return response;
  },


};

export default studentService;