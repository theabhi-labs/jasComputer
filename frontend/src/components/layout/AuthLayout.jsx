import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { FaGraduationCap, FaBook, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa'

const AuthLayout = () => {
  const location = useLocation()
  
  const getTitle = () => {
    if (location.pathname === '/login') return 'Welcome Back'
    if (location.pathname === '/register') return 'Create Account'
    if (location.pathname === '/forgot-password') return 'Reset Password'
    if (location.pathname === '/reset-password') return 'Set New Password'
    if (location.pathname === '/verify-email') return 'Verify Email'
    return 'Authentication'
  }

  const getSubtitle = () => {
    if (location.pathname === '/login') return 'Sign in to access your dashboard'
    if (location.pathname === '/register') return 'Start your learning journey today'
    if (location.pathname === '/forgot-password') return "Don't worry, we'll send you a reset link"
    if (location.pathname === '/reset-password') return 'Create a strong password'
    if (location.pathname === '/verify-email') return 'Enter the OTP sent to your email'
    return 'Please authenticate to continue'
  }

  const showBackButton = location.pathname !== '/login' && location.pathname !== '/register'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-20">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FaGraduationCap className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold tracking-tight">CoachingMS</span>
            </Link>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                {getTitle() === 'Welcome Back' ? 'Welcome Back!' : 
                 getTitle() === 'Create Account' ? 'Start Your Journey' : 
                 getTitle() === 'Reset Password' ? 'Secure Your Account' : 
                 'Verify Your Identity'}
              </h1>
              <p className="text-lg text-blue-100">
                {getSubtitle()}
              </p>
            </div>
          </div>
          
          {/* Testimonial / Stats */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold">Join 1K+ students</p>
                <p className="text-xs text-blue-200">Trusted by top educators</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <FaBook className="w-4 h-4" />
                <span>100+ Courses</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <FaChalkboardTeacher className="w-4 h-4" />
                <span>Expert Faculty</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <FaGraduationCap className="w-4 h-4" />
                <span>90% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-sm text-gray-500 mt-1">{getSubtitle()}</p>
          </div>
          
          {/* Back Button */}
          {showBackButton && (
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          )}
          
          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <Outlet />
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout