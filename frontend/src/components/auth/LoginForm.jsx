import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button, Input, Alert } from '../common'
import { FaEnvelope, FaLock, FaUserGraduate } from 'react-icons/fa'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message || 'Invalid credentials')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-white rounded-[2rem] shadow-xl shadow-blue-100 flex items-center justify-center mb-6 border border-white">
            <FaUserGraduate className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Admin Login
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Enter your admin credentials
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 lg:p-10 border border-slate-50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
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
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

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

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-[0.98] transition-all"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
