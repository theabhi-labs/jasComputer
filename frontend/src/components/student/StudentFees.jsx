import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { studentService, feeService } from '../../services'
import { Card, Button, Alert, Modal } from '../common'
import { FaRupeeSign, FaCalendarAlt, FaReceipt, FaDownload, FaEye, FaArrowLeft } from 'react-icons/fa'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import PayFee from './PayFee'

const StudentFees = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [feeDetails, setFeeDetails] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeeDetails()
    fetchPaymentHistory()
  }, [])

  const fetchFeeDetails = async () => {
    try {
      const response = await feeService.getFeeByStudent(user._id)
      if (response.success) {
        setFeeDetails(response.data.fee)
      }
    } catch (error) {
      console.error('Error fetching fee details:', error)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await studentService.getPaymentHistory(user._id, { limit: 10 })
      if (response.success) {
        setPayments(response.data.payments)
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-600',
      pending: 'bg-yellow-100 text-yellow-600',
      partially_paid: 'bg-blue-100 text-blue-600',
      overdue: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusText = (status) => {
    const texts = {
      paid: 'Paid',
      pending: 'Pending',
      partially_paid: 'Partially Paid',
      overdue: 'Overdue'
    }
    return texts[status] || status
  }

  if (loading) {
    return <div className="text-center py-12">Loading fee details...</div>
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fee Details</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {feeDetails ? (
        <>
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50">
              <p className="text-sm text-blue-600">Total Fees</p>
              <p className="text-2xl font-bold text-blue-700">₹{feeDetails.totalFees?.toLocaleString()}</p>
            </Card>
            <Card className="bg-green-50">
              <p className="text-sm text-green-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-700">₹{feeDetails.paidAmount?.toLocaleString()}</p>
            </Card>
            <Card className="bg-red-50">
              <p className="text-sm text-red-600">Pending Amount</p>
              <p className="text-2xl font-bold text-red-700">₹{feeDetails.pendingAmount?.toLocaleString()}</p>
            </Card>
            <Card className="bg-yellow-50">
              <p className="text-sm text-yellow-600">Due Date</p>
              <p className="text-lg font-bold text-yellow-700">{format(new Date(feeDetails.dueDate), 'dd MMM yyyy')}</p>
            </Card>
          </div>

          {/* Status and Payment Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feeDetails.status)}`}>
                Status: {getStatusText(feeDetails.status)}
              </span>
            </div>
            {feeDetails.status !== 'paid' && (
              <Button onClick={() => setShowPayModal(true)}>
                <FaRupeeSign className="inline mr-2" />
                Pay Now
              </Button>
            )}
          </div>

          {/* Payment History */}
          <Card title="Payment History">
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm capitalize">{payment.paymentMode}</td>
                        <td className="px-4 py-3 text-sm font-mono">{payment.receiptNo}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowReceiptModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No payment history available</p>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">No fee record found. Please contact administration.</p>
        </Card>
      )}

      {/* Pay Fee Modal */}
      <PayFee
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={() => {
          fetchFeeDetails()
          fetchPaymentHistory()
          setShowPayModal(false)
        }}
        feeDetails={feeDetails}
      />

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Payment Receipt" size="md">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Coaching Management System</h2>
              <p className="text-sm text-gray-500">Payment Receipt</p>
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
            <div className="border-t pt-4 text-center">
              <Button variant="outline" onClick={() => {}}>
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

export default StudentFees