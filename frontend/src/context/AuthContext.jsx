import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (token) {
      try {
        jwtDecode(token)
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid token:', error)
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const setAuthSession = (userData, newToken) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)

      if (data.success) {
        setAuthSession(data.user, data.token)
        return { success: true, user: data.user }
      }

      return { success: false, message: data.message || 'Login failed' }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.debug ||
        error.message ||
        'Server error. Please try again.'

      console.error('Login error:', error.response?.data || error.message)
      return { success: false, message }
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const hasRole = (roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const isSuperAdmin = user?.role === 'super_admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isTeacher,
    isStudent,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
