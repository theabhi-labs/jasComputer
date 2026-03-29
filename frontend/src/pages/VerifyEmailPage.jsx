import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authService } from '../services'
import { Button, Input, Alert } from '../components/common'
import { FaEnvelope, FaCheckCircle, FaRedoAlt } from 'react-icons/fa'

const VerifyEmailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [userType, setUserType] = useState('student')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authService.verifyEmail(email, otp, userType)
      if (response.success) {
        setSuccess('Email verified successfully! Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(response.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    setError('')

    try {
      const response = await authService.resendVerification(email, userType)
      if (response.success) {
        setSuccess('OTP resent successfully!')
        setCountdown(60)
      } else {
        setError(response.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <FaEnvelope className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">We've sent a verification code to your email address</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleVerify} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={!!location.state?.email}
          />

          <Input
            label="Verification Code (OTP)"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Verify Email
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || resendLoading}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRedoAlt className="mr-1" />
              {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="border-t pt-4 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500">
                register again
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyEmailPage