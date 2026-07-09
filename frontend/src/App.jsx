import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Loader from './components/common/Loader'
import ErrorBoundary from './components/common/ErrorBoundary'

// Layouts
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import HomePage from './pages/HomePage'
import LoginForm from './components/auth/LoginForm'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import VerifyCertificatePage from './pages/VerifyCertificatePage'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import CertificateDownloadPage from './pages/CertificateDownloadPage'
import ProfilePage from './pages/ProfilePage'

import AdminDashboard from './components/admin/AdminDashboard'



// Admin
import StudentManagement from './components/admin/StudentManagement'
import CourseManagement from './components/admin/CourseManagement'
import CertificateManagement from './components/admin/CertificateManagement'

// Guards
import PrivateRoute from './routes/PrivateRoute'
import PublicRoute from './routes/PublicRoute'
import FeeManagement from './components/admin/feeManagment'

function App() {
  const { loading, user } = useAuth()

  if (loading) return <Loader />

  // 🔥 Dynamic Dashboard Resolver
  const renderDashboard = () => {
    if (user?.role === 'student') return <StudentDashboard />
    if (user?.role === 'teacher') return <TeacherDashboard />
    if (user?.role === 'admin' || user?.role === 'super_admin') return <AdminDashboard />
    return <div>Unauthorized</div>
  }

  return (
    <ErrorBoundary>
      <Routes>

        {/* 🌐 PUBLIC */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
          <Route path="/certificate-download/:certificateId" element={<CertificateDownloadPage />} />
          <Route path="/certificate-download" element={<CertificateDownloadPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* 🔐 PROTECTED */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Common */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* ✅ SINGLE DASHBOARD */}
            <Route path="/dashboard" element={renderDashboard()} />

            {/* 👨‍🎓 STUDENT */}
            {user?.role === 'student' && (
              <>
                <Route path="/dashboard/my-fees" element={<StudentFees />} />
                <Route path="/dashboard/my-certificates" element={<StudentCertificates />} />
                <Route path="/dashboard/my-courses" element={<StudentCourses />} />
                <Route path="/dashboard/payment-history" element={<PaymentHistory />} />
              </>
            )}

            {/* 🛠️ ADMIN */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <>
                <Route path="/dashboard/students" element={<StudentManagement />} />
                <Route path="/dashboard/courses" element={<CourseManagement />} />
                <Route path="/dashboard/certificates" element={<CertificateManagement />} />
                <Route path="/dashboard/fees" element={<FeeManagement/>} />

              </>
            )}

          </Route>
        </Route>

      </Routes>
    </ErrorBoundary>
  )
}

export default App