// src/routes/AppRouter.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Layouts
import MainLayout from '../components/layout/MainLayout'
import DashboardLayout from '../components/layout/DashboardLayout'

// Route Guards
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'

// Pages
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import CoursesPage from '../pages/CoursesPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import VerifyCertificatePage from '../pages/VerifyCertificatePage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ProfilePage from '../pages/ProfilePage'

import AdminDashboard from '../components/admin/AdminDashboard'



import CourseManagement from '../components/admin/CourseManagement'
import CertificateManagement from '../components/admin/CertificateManagement'
import FeeManagement from '../components/admin/feeManagment'

const AppRouter = () => {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    )
  }

  // 🔥 Dynamic Dashboard Decide
  const getDashboard = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') return <AdminDashboard />
    return <div>Unauthorized</div>
  }

  return (
    <Routes>

      {/* 🌐 Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verify-certificate" element={<VerifyCertificatePage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* 🔐 Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Common */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* 🔥 Single Dashboard */}
          <Route path="/dashboard" element={getDashboard()} />


          {/* 🛠️ Admin Routes */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <>
              <Route path="/dashboard/students" element={<StudentManagement />} />
              <Route path="/dashboard/courses" element={<CourseManagement />} />
              <Route path="/dashboard/attendance" element={<AttendanceManagement />} />
              <Route path="/dashboard/certificates" element={<CertificateManagement />} />
              <Route path='/dashboard/fees' element={< FeeManagement />}/>
            </>
          )}

        </Route>
      </Route>

    </Routes>
  )
}

export default AppRouter