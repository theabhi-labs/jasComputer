import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services'
import { Button, Input, Alert } from '../components/common'
import { FaLock, FaCheckCircle } from 'react-icons/fa'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [userType, setUserType] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    if (email) setFormData(prev => ({ ...prev, email }))
    if (token) setFormData(prev => ({ ...prev, otp: token }))
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword,
        userType
      )
      
      if (response.success) {
        setSuccess('Password reset successful! Redirecting to login...')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(response.message || 'Failed to reset password')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mr-2"
                />
                Student
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="user"
                  checked={userType === 'user'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mr-2"
                />
                Staff
              </label>
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />

          <Input
            label="OTP Code"
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="Enter new password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm new password"
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Reset Password
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage