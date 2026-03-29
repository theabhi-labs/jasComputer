import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services'
import { Button, Input, Alert } from '../common'
import { FaEnvelope, FaArrowLeft, FaShieldAlt, FaKey, FaUserGraduate, FaUserShield } from 'react-icons/fa'

const ForgotPassword = () => {
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
    if (!email) return setError('Please enter your email')
    setLoading(true); setError('');
    try {
      const response = await authService.forgotPassword(email, userType)
      if (response.success) {
        setSuccess('OTP sent successfully! Check your inbox.')
        setStep(2)
      } else {
        setError(response.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    if (newPassword.length < 6) return setError('Minimum 6 characters required')
    
    setLoading(true); setError('');
    try {
      const response = await authService.resetPassword(email, otp, newPassword, userType)
      if (response.success) {
        setSuccess('Password reset successful! Redirecting...')
        setTimeout(() => { window.location.href = '/login' }, 2500)
      } else {
        setError(response.message || 'Failed to reset password')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full relative">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/login" className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-md transition-all">
            <FaArrowLeft />
          </Link>
          <div className="flex gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-blue-100 mb-6 group transition-transform hover:scale-105">
            <FaShieldAlt className="text-3xl text-blue-600 group-hover:animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Recover Password' : 'Verify Identity'}
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            {step === 1 
              ? 'Enter your registered email to get an OTP code.' 
              : 'Protect your account with a strong new password.'}
          </p>
        </div>

        {/* Dynamic Alerts */}
        <div className="mb-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}
        </div>

        {/* STEP 1: Email Submission */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Select Profile</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'student', label: 'Student', icon: <FaUserGraduate /> },
                  { id: 'user', label: 'Staff', icon: <FaUserShield /> }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUserType(type.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                      userType === type.id 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-lg shadow-blue-100' 
                      : 'border-slate-50 bg-slate-50/50 text-slate-400 grayscale hover:grayscale-0'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="font-bold text-xs uppercase">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <FaEnvelope className="h-5 w-5 opacity-40 group-focus-within:opacity-100" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-14 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95">
              Request OTP Code
            </Button>
          </form>
        )}

        {/* STEP 2: OTP & Reset Submission */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between bg-blue-50/50 px-5 py-3 rounded-2xl border border-blue-100">
              <div className="text-xs font-bold text-blue-600 truncate">Sent to: {email}</div>
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-blue-500 hover:underline">Edit</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Code</label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="text-center text-2xl tracking-[0.5em] font-black rounded-2xl bg-slate-50 border-none"
                placeholder="000000"
                maxLength="6"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                <div className="relative group">
                  <FaKey className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-600 group-focus-within:opacity-100 transition-all" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-14 rounded-2xl bg-slate-50 border-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-2xl bg-slate-50 border-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button type="submit" isLoading={loading} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200">
                Secure Account
              </Button>
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors py-2"
              >
                Resend OTP Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword