import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { studentService } from '../../services'
import { Card, Button, Modal } from '../common'
import { FaDownload, FaEye, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa'
import { format } from 'date-fns'

const PaymentHistory = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [pagination.page])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await studentService.getPaymentHistory(user._id, {
        page: pagination.page,
        limit: pagination.limit
      })
      if (response.success) {
        setPayments(response.data.payments)
        setPagination(prev => ({ ...prev, ...response.data.pagination }))
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReceipt = (payment) => {
    // In production, download PDF receipt
    alert('Download functionality coming soon')
  }

  const getPaymentModeIcon = (mode) => {
    const icons = {
      online: '💳',
      cash: '💰',
      bank_transfer: '🏦',
      cheque: '📝'
    }
    return icons[mode] || '💵'
  }

  const getPaymentModeLabel = (mode) => {
    const labels = {
      online: 'Online Payment',
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque'
    }
    return labels[mode] || mode
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h1>

      <Card>
        {loading ? (
          <div className="text-center py-12">Loading payment history...</div>
        ) : payments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-sm">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{payment.receiptNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center text-green-600 font-bold">
                          <FaRupeeSign className="w-3 h-3 mr-1" />
                          {payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                          {getPaymentModeIcon(payment.paymentMode)} {getPaymentModeLabel(payment.paymentMode)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">
                          {payment.transactionId || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowReceiptModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Receipt"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(payment)}
                            className="text-green-600 hover:text-green-800"
                            title="Download Receipt"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {payments.length} of {pagination.total} payments
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment history available</p>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Payment Receipt" size="md">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Coaching Management System</h2>
              <p className="text-sm text-gray-500">Official Payment Receipt</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt No:</span>
                <span className="font-mono font-medium">{selectedPayment.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{format(new Date(selectedPayment.paymentDate), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Enrollment No:</span>
                <span className="font-mono">{user?.enrollmentNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">₹{selectedPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="capitalize">{selectedPayment.paymentMode}</span>
              </div>
              {selectedPayment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{selectedPayment.transactionId}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                This is a computer generated receipt and does not require signature.
                For any queries, please contact the accounts department.
              </p>
            </div>
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => handleDownloadReceipt(selectedPayment)}>
                <FaDownload className="inline mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PaymentHistory