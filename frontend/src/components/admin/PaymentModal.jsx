// src/components/admin/PaymentModal.jsx
import React, { useState } from 'react'
import { Modal, Button, Alert } from '../../components/common'
import { studentService } from '../../services'
import { FaMoneyBillWave, FaCreditCard, FaWallet, FaRupeeSign, FaCheckCircle, FaSpinner, FaTimes, FaReceipt } from 'react-icons/fa'

const PaymentModal = ({ isOpen, onClose, onSuccess, student }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentDetails, setPaymentDetails] = useState({
    amount: student?.feeStructure?.courseFee || 0,
    method: 'cash',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await studentService.adminProcessPayment(student._id, paymentDetails)
      if (response.success) {
        setSuccess(`Payment of ₹${paymentDetails.amount} processed successfully via ${paymentDetails.method}`)
        setTimeout(() => {
          onSuccess()
          onClose()
          resetForm()
        }, 2000)
      } else {
        setError(response.message || 'Payment failed')
      }
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPaymentDetails({
      amount: student?.feeStructure?.courseFee || 0,
      method: 'cash',
      notes: ''
    })
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Process Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Student:</strong> {student?.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {student?.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Enrollment:</strong> {student?.enrollmentId || 'Pending'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Course:</strong> {student?.courseName}
          </p>
          <p className="text-sm font-semibold text-green-600 mt-2">
            <strong>Total Fees:</strong> ₹{student?.feeStructure?.courseFee?.toLocaleString()}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Payment Form */}
        <div className="space-y-4">
          <div className="relative">
            <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={paymentDetails.amount}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: parseFloat(e.target.value) })}
              placeholder="Amount (₹)"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <FaWallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={paymentDetails.method}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash 💵</option>
              <option value="bank_transfer">Bank Transfer 🏦</option>
              <option value="cheque">Cheque 📝</option>
              <option value="online">Online Payment 💳</option>
            </select>
          </div>

          <textarea
            value={paymentDetails.notes}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, notes: e.target.value })}
            placeholder="Transaction ID, Cheque Number, or Notes"
            rows="3"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">Amount to Collect:</span>
            <span className="text-xl font-bold text-green-700">₹{paymentDetails.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-green-700">Payment Method:</span>
            <span className="font-medium text-green-700 capitalize">{paymentDetails.method.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <FaReceipt className="inline mr-2" />
            {loading ? 'Processing...' : 'Process Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PaymentModal