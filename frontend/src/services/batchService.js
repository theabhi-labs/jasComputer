import api from './api'

export const batchService = {
  // Get all batches
  getAllBatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/batches?${query}`)
  },

  // Get batch by ID
  getBatchById: async (id) => {
    return await api.get(`/batches/${id}`)
  },

  // Create batch
  createBatch: async (data) => {
    return await api.post('/batches', data)
  },

  // Update batch
  updateBatch: async (id, data) => {
    return await api.put(`/batches/${id}`, data)
  },

  // Change batch status
  changeStatus: async (id, status) => {
    return await api.patch(`/batches/${id}/status`, { status })
  },

  // Delete batch
  deleteBatch: async (id) => {
    return await api.delete(`/batches/${id}`)
  }
}