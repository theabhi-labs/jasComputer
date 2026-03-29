import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authService } from '../../services'
import { Button, Input, Alert } from '../common'
import { FaEnvelopeOpenText, FaCheckCircle, FaRedoAlt, FaArrowLeft, FaShieldAlt } from 'react-icons/fa'

const VerifyEmail = () => {
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
        setSuccess('Email verified successfully! Welcome aboard.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(response.message || 'Invalid OTP code. Please try again.')
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
        setSuccess('A fresh OTP has been sent to your inbox!')
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
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 bg-white shadow-2xl shadow-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 mb-6 border border-blue-50/50 animate-pulse">
            <FaEnvelopeOpenText size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Check Your Email
          </h2>
          <p className="mt-3 text-slate-500 font-medium px-4">
            We've sent a 6-digit verification code to <span className="text-blue-600 font-bold">{email || 'your email'}</span>
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4 rounded-2xl shadow-lg shadow-red-50 border-none" />}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center shadow-lg shadow-emerald-50">
            <FaCheckCircle className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
            <p className="text-emerald-700 font-bold text-sm leading-tight">{success}</p>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-white p-8 md:p-10">
          <form onSubmit={handleVerify} className="space-y-6">
            
            {/* Account Type Toggle (Small) */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                {['student', 'user'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      userType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {type === 'user' ? 'Staff' : 'Student'}
                  </button>
                ))}
              </div>
            </div>

            {/* OTP Input Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                {countdown > 0 && (
                   <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                     Expires in {countdown}s
                   </span>
                )}
              </div>
              <div className="relative group">
                <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  placeholder="000000"
                  className="pl-12 bg-slate-50 border-none rounded-2xl py-5 focus:ring-2 focus:ring-blue-600 text-center text-2xl font-black tracking-[0.5em] transition-all placeholder:text-slate-200 placeholder:tracking-normal"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-4 rounded-2xl font-black shadow-xl shadow-blue-100 uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all">
              Verify Account
            </Button>

            <div className="flex flex-col items-center space-y-4 pt-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || resendLoading}
                className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-colors uppercase tracking-widest"
              >
                <FaRedoAlt className={`${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? 'Requesting...' : 'Resend Code'}
              </button>
              
              <div className="h-px w-12 bg-slate-100" />

              <Link to="/register" className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                <FaArrowLeft size={10} /> Use different email
              </Link>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-8 text-[11px] text-slate-400 font-medium px-6">
          Didn't receive it? Please check your <b>Spam</b> or <b>Promotions</b> folder before requesting a new code.
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail