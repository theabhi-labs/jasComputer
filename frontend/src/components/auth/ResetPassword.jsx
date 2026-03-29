import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../../services'
import { Button, Input, Alert } from '../common'
import { FaLock, FaCheckCircle, FaEnvelope, FaShieldAlt, FaKey, FaArrowLeft } from 'react-icons/fa'

const ResetPassword = () => {
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
        setTimeout(() => navigate('/login'), 2500)
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-white shadow-xl shadow-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-50">
            <FaShieldAlt size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-slate-500 font-medium italic">
            Secure your account with a new strong password
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4 rounded-2xl border-none shadow-lg shadow-red-100" />}
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center animate-bounce">
            <FaCheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
            <p className="text-emerald-700 font-bold text-sm">{success}</p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/60 rounded-[2.5rem] border border-white p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Account Type Toggle */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">Account Type</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl">
                {['student', 'user'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                      userType === type 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'user' ? 'Staff' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-12 bg-slate-50/50 border-none rounded-2xl py-4 focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* OTP Field */}
            <div className="group">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verification OTP</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  className="pl-12 bg-slate-50/50 border-none rounded-2xl py-4 focus:ring-2 focus:ring-blue-600 transition-all font-black tracking-[0.3em] text-center"
                  placeholder="000000"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-2" />

            {/* New Password */}
            <div className="group">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="pl-12 bg-slate-50/50 border-none rounded-2xl py-4 focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-12 bg-slate-50/50 border-none rounded-2xl py-4 focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-4 rounded-2xl font-black shadow-xl shadow-blue-100 uppercase tracking-widest text-xs mt-4 hover:scale-[1.02] active:scale-95 transition-all">
              Update Password
            </Button>

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                <FaArrowLeft /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
             