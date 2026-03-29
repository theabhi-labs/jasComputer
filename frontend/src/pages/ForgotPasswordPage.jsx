import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Button, Alert } from '../components/common'
import { authService } from '../services/authService'

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.forgotPassword(email, userType)
      if (response.success) {
        setSuccess('OTP sent to your email. Please check your inbox.')
        setStep(2)
      } else {
        setError(response.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authService.resetPassword(email, otp, newPassword, userType)
      if (response.success) {
        setSuccess('Password reset successful! Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
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
          <p className="mt-2 text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="bg-white shadow-lg rounded-lg p-8">
            <div className="mb-4">
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
                  Admin/Teacher
                </label>
              </div>
            </div>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
            />

            <Button type="submit" isLoading={loading} className="w-full mt-4">
              Send OTP
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="bg-white shadow-lg rounded-lg p-8">
            <Input
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter 6-digit OTP"
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />

            <Button type="submit" isLoading={loading} className="w-full mt-4">
              Reset Password
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-sm text-primary-600 hover:text-primary-500 text-center w-full"
            >
              ← Back to email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage