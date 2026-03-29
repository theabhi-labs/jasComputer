// services/feeService.js
import api from './api'

export const feeService = {
  // ==================== FEE MANAGEMENT ====================
  
  // Get all fees with filters
  getAllFees: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/fees${query ? `?${query}` : ''}`)
  },

  // Get fee by ID
  getFeeById: async (id) => {
    return await api.get(`/fees/${id}`)
  },

  // Get fee by student ID
  getFeeByStudent: async (studentId) => {
    return await api.get(`/fees/student/${studentId}`)
  },

  // Create fee record
  createFeeRecord: async (data) => {
    return await api.post('/fees', data)
  },

  // Get fee summary/dashboard stats
  getFeeSummary: async () => {
    return await api.get('/fees/summary')
  },

  // Get overdue fees report
  getOverdueFees: async () => {
    return await api.get('/fees/overdue')
  },

  // Get collection report by date range
  getCollectionReport: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return await api.get(`/fees/collection-report${params.toString() ? `?${params}` : ''}`)
  },

  // ==================== PAYMENT ROUTES ====================
  
  // Make payment (generic)
  makePayment: async (studentId, data) => {
    return await api.post(`/fees/student/${studentId}/payment`, data)
  },

  // Pay admission fee specifically
 createRegistrationFee: async (data) => {
  try {
    const response = await api.post('/fees/registration', data)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
},

  // Pay installment specifically
  payInstallment: async (studentId, data) => {
    return await api.post(`/fees/student/${studentId}/pay-installment`, data)
  },

  // ==================== PAYMENT HISTORY ====================
  
  // Get payment history for a student
  getPaymentHistory: async (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return await api.get(`/fees/student/${studentId}/payments${query ? `?${query}` : ''}`)
  },

  // Get receipt by receipt number
  getReceipt: async (receiptNo) => {
    return await api.get(`/fees/receipt/${receiptNo}`)
  },

  // Generate invoice for student
  generateInvoice: async (studentId) => {
    return await api.get(`/fees/student/${studentId}/invoice`)
  },

  // ==================== INSTALLMENT ROUTES ====================
  
  // Update installment for a student
  updateInstallment: async (studentId, installmentNumber, data) => {
    return await api.put(`/fees/student/${studentId}/installment/${installmentNumber}`, data)
  },

  // ==================== NOTIFICATION ROUTES ====================
  
  // Send fee reminder
  sendReminder: async (studentId) => {
    return await api.post(`/fees/student/${studentId}/reminder`)
  },

  // ==================== HELPER FUNCTIONS ====================
  
  // Get student's fee summary with payment breakdown
  getStudentFeeSummary: async (studentId) => {
    try {
      const [feeResponse, paymentHistoryResponse] = await Promise.all([
        feeService.getFeeByStudent(studentId),
        feeService.getPaymentHistory(studentId)
      ])
      
      return {
        fee: feeResponse.data?.fee,
        paymentHistory: paymentHistoryResponse.data?.payments,
        summary: paymentHistoryResponse.data?.summary,
        paymentBreakdown: paymentHistoryResponse.data?.paymentBreakdown
      }
    } catch (error) {
      console.error('Error getting student fee summary:', error)
      throw error
    }
  },

  // Get dashboard data (for admin dashboard)
  getDashboardData: async () => {
    try {
      const [summary, overdue, recentFees] = await Promise.all([
        feeService.getFeeSummary(),
        feeService.getOverdueFees(),
        feeService.getAllFees({ limit: 10, sortBy: '-createdAt' })
      ])
      
      return {
        summary: summary.data,
        overdue: overdue.data,
        recentFees: recentFees.data?.fees || []
      }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      throw error
    }
  },

  // Get monthly collection report
  getMonthlyCollectionReport: async (year, month) => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    return await feeService.getCollectionReport(startDate, endDate)
  },

  // Get yearly collection report
  getYearlyCollectionReport: async (year) => {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`
    return await feeService.getCollectionReport(startDate, endDate)
  },

  // Process bulk payment (for multiple students)
  processBulkPayment: async (payments) => {
    const results = []
    for (const payment of payments) {
      try {
        const result = await feeService.makePayment(payment.studentId, payment.data)
        results.push({ success: true, studentId: payment.studentId, data: result.data })
      } catch (error) {
        results.push({ success: false, studentId: payment.studentId, error: error.message })
      }
    }
    return results
  },

  // Get payment status for a student
  getPaymentStatus: async (studentId) => {
    const fee = await feeService.getFeeByStudent(studentId)
    const admissionFeeStatus = fee.data?.fee?.admissionFeeStatus
    const paymentSummary = fee.data?.fee?.paymentSummary
    
    return {
      admissionFeePaid: admissionFeeStatus?.isPaid || false,
      admissionFeeAmount: admissionFeeStatus?.amount || 0,
      totalPaid: paymentSummary?.paidAmount || 0,
      totalPending: paymentSummary?.pendingAmount || 0,
      status: fee.data?.fee?.status || 'pending',
      installmentsPaid: paymentSummary?.installmentsPaid || 0,
      totalInstallments: paymentSummary?.totalInstallments || 1,
      nextDueDate: paymentSummary?.nextDueDate
    }
  }
}

export default feeService