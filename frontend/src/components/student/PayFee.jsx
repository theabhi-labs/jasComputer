import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { feeService } from '../../services'
import { Modal, Input, Button, Alert } from '../common'
import { FaRupeeSign, FaCreditCard, FaMoneyBillWave, FaUniversity } from 'react-icons/fa'

const PayFee = ({ isOpen, onClose, onSuccess, feeDetails }) => {
  const { user } = useAuth()
  const [amount, setAmount] = useState(feeDetails?.pendingAmount || 0)
  const [paymentMode, setPaymentMode] = useState('online')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amount > feeDetails?.pendingAmount) {
      setError(`Amount cannot exceed pending amount: ₹${feeDetails?.pendingAmount}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await feeService.makePayment(user._id, {
        amount,
        paymentMode,
        transactionId: transactionId || `TXN${Date.now()}`
      })
      
      if (response.success) {
        onSuccess()
      } else {
        setError(response.message || 'Payment failed')
      }
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-4">Pay Fees</h2>
        
        <form onSubmit={handlePayment} className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Fees:</span>
              <span className="font-bold">₹{feeDetails?.totalFees?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="text-green-600 font-bold">₹{feeDetails?.paidAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-700 font-semibold">Pending Amount:</span>
              <span className="text-red-600 font-bold">₹{feeDetails?.pendingAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaRupeeSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={feeDetails?.pendingAmount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'online', icon: FaCreditCard, label: 'Online' },
                { value: 'cash', icon: FaMoneyBillWave, label: 'Cash' },
                { value: 'bank_transfer', icon: FaUniversity, label: 'Bank Transfer' }
              ].map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPaymentMode(mode.value)}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      paymentMode === mode.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional)</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction reference"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PayFee