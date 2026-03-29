import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services'
import { jwtDecode } from 'jwt-decode'

// Create context
export const AuthContext = createContext(null)

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(userData)
        setUserType(userData.role || 'student')
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid token:', error)
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = async (email, password, type = 'user') => {
    try {
      let response
      if (type === 'student') {
        response = await authService.loginStudent(email, password)
      } else {
        response = await authService.loginUser(email, password)
      }

      if (response.success) {
        const { token: newToken, user: userData } = response.data
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
        setUserType(userData.role || 'student')
        setIsAuthenticated(true)
        return { success: true, user: userData }
      }
      return { success: false, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' }
    }
  }

  const registerStudent = async (data) => {
    try {
      const response = await authService.registerStudent(data)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' }
    }
  }

  // FIXED: Logout function - only clear state, don't redirect
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Clear state
    setToken(null)
    setUser(null)
    setUserType(null)
    setIsAuthenticated(false)
    
    // Don't redirect here - let component handle navigation
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
    userType,
    login,
    logout,
    registerStudent,
    updateUser,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isTeacher,
    isStudent
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}