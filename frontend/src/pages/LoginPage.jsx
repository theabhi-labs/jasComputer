import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, Alert } from '../components/common'
import { authService } from '../services/authService'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      if (userType === 'student') {
        response = await authService.loginStudent(email, password)
      } else {
        response = await authService.loginUser(email, password)
      }
      
      if (response.success) {
        navigate('/dashboard')
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
            <div className="flex space-x-4">
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
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage