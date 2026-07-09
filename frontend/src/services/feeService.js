// src/services/feeService.js
import api from './api';

const feeService = {
  // ==================== FEE CRUD ====================
  createFee: async (feeData) => {
    return await api.post('/users/fees', feeData);
  },

  getAllFees: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/users/fees${query ? `?${query}` : ''}`);
  },

  getOutstandingFees: async () => {
    return await api.get('/users/fees/outstanding');
  },

  getStudentFeeSummary: async (studentId) => {
    return await api.get(`/users/fees/student/${studentId}/summary`);
  },

  updateFee: async (feeId, updateData) => {
    return await api.put(`/users/fees/${feeId}`, updateData);
  },

  deleteFee: async (feeId) => {
    return await api.delete(`/users/fees/${feeId}`);
  },

  // ==================== PAYMENT & DISCOUNT ====================
  makePayment: async (feeId, paymentData) => {
    return await api.patch(`/users/fees/${feeId}/payment`, paymentData);
  },

  applyDiscount: async (feeId, discountData) => {
    return await api.patch(`/users/fees/${feeId}/discount`, discountData);
  },

  // ==================== TRANSACTIONS ====================
  createTransaction: async (transactionData) => {
    return await api.post('/users/transactions', transactionData);
  },

  getAllTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/users/transactions${query ? `?${query}` : ''}`);
  },

  getTransactionById: async (transactionId) => {
    return await api.get(`/users/transactions/${transactionId}`);
  },

  updateTransaction: async (transactionId, updateData) => {
    return await api.put(`/users/transactions/${transactionId}`, updateData);
  },

  deleteTransaction: async (transactionId) => {
    return await api.delete(`/users/transactions/${transactionId}`);
  },

  // ==================== SUMMARY ====================
  getFeeTransactionSummary: async (feeId) => {
    return await api.get(`/users/transactions/fee/${feeId}/summary`);
  },

  getStudentTransactions: async (studentId) => {
    return await api.get(`/users/transactions/student/${studentId}`);
  },
};

export default feeService;