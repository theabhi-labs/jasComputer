import api from './api'

export const authService = {
  // Student Register
  registerStudent: async (data) => {
    const response = await api.post('/auth/student/register', data)
    return response
  },

  // Student Login
  loginStudent: async (email, password) => {
    const response = await api.post('/auth/student/login', { email, password })
    if (response.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  // Admin/Teacher Login
  loginUser: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  // Verify Email
verifyEmail: async ({ email, otp, userType }) => {
  return await api.post('/auth/verify-email', { email, otp, userType })
},

  // Resend OTP
resendVerification: async ({ email, userType }) => {
  return await api.post('/auth/resend-verification', { email, userType })
},

  // Forgot Password
  forgotPassword: async (email, userType) => {
    return await api.post('/auth/forgot-password', { email, userType })
  },

  // Reset Password
  resetPassword: async (email, otp, newPassword, userType) => {
    return await api.post('/auth/reset-password', { email, otp, newPassword, userType })
  },

  // Change Password
  changePassword: async (currentPassword, newPassword, userType) => {
    return await api.post(`/auth/change-password?userType=${userType}`, { currentPassword, newPassword })
  },

  // Get Current User
  getMe: async (userType) => {
    return await api.get(`/auth/me?userType=${userType}`)
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}