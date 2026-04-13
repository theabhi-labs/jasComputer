import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button, Input, Alert } from '../common'
import { FaEnvelope, FaLock, FaUserGraduate, FaChalkboardTeacher, FaArrowRight, FaEnvelopeOpenText } from 'react-icons/fa'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNeedsVerification(false)
    
    try {
      const role = userType === 'student' ? 'student' : 'user'
      const response = await login(email, password, role)
      
      if (response.success) {
        navigate('/dashboard')
      } else {
        // Check if error is about email verification
        if (response.message?.includes('verify your email') || response.message?.includes('email verified')) {
          setNeedsVerification(true)
          setPendingEmail(email)
          setError('')
        } else {
          setError(response.message || 'Invalid credentials. Please try again.')
        }
      }
    } catch (err) {
      // Check if error response contains verification message
      if (err.response?.data?.message?.includes('verify your email')) {
        setNeedsVerification(true)
        setPendingEmail(email)
        setError('')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    navigate('/verify-email', { state: { email: pendingEmail } })
  }

  const demoAccounts = [
    { type: 'Admin', email: 'admin@coaching.com', password: 'Admin@123', role: 'user' },
    { type: 'Teacher', email: 'teacher@coaching.com', password: 'Teacher@123', role: 'user' },
    { type: 'Student', email: 'student@coaching.com', password: '123456', role: 'student' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Icon Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-white rounded-[2rem] shadow-xl shadow-blue-100 flex items-center justify-center mb-6 border border-white transition-transform hover:scale-105 duration-300">
            <FaUserGraduate className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Continue your learning journey today
          </p>
        </div>

        {/* Email Verification Required Message */}
        {needsVerification && (
          <div className="mb-6 animate-fade-in-up">
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <FaEnvelopeOpenText className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800">Email Verification Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please verify your email address to login. We've sent a verification code to:
                  </p>
                  <p className="font-mono text-sm font-bold text-amber-800 mt-2 break-all">
                    {pendingEmail}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleResendOTP}
                      className="text-sm font-bold text-amber-700 hover:text-amber-800 underline-offset-2 hover:underline transition-all"
                    >
                      Resend Verification Code
                    </button>
                    <button
                      onClick={() => setNeedsVerification(false)}
                      className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-all"
                    >
                      Try Different Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Handling */}
        <div className="mb-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 lg:p-10 border border-slate-50">
          
          {/* Custom Animated User Toggle */}
          <div className="p-1.5 bg-slate-100/80 rounded-2xl flex relative mb-8">
            <button
              type="button"
              onClick={() => {
                setUserType('student')
                setNeedsVerification(false)
                setError('')
              }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                userType === 'student' ? 'text-white shadow-lg bg-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaUserGraduate size={14} /> Student
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('user')
                setNeedsVerification(false)
                setError('')
              }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                userType === 'user' ? 'text-white shadow-lg bg-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaChalkboardTeacher size={14} /> Staff
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <FaEnvelope />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-12 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <FaLock />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-12 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-[0.98] transition-all">
              Sign In <FaArrowRight className="inline ml-2 text-xs" />
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-slate-600 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-black text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-all">
            Join now
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm