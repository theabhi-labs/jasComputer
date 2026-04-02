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
import RegisterPage from '../pages/RegisterPage'
import CoursesPage from '../pages/CoursesPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import VerifyCertificatePage from '../pages/VerifyCertificatePage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ProfilePage from '../pages/ProfilePage'

// Dashboards
import StudentDashboard from '../components/student/StudentDashboard'
import TeacherDashboard from '../components/teacher/TeacherDashboard'
import AdminDashboard from '../components/admin/AdminDashboard'

// Student Pages
import StudentFees from '../components/student/StudentFees'
import StudentAttendance from '../components/student/StudentAttendance'
import StudentCertificates from '../components/student/StudentCertificates'
import StudentCourses from '../components/student/StudentCourses'
import PaymentHistory from '../components/student/PaymentHistory'

// Teacher Pages
import MyStudents from '../components/teacher/MyStudents'
import MyBatches from '../components/teacher/MyBatches'
import MarkAttendance from '../components/teacher/MarkAttendance'
import ViewAttendance from '../components/teacher/ViewAttendance'

// Admin Pages
import StudentManagement from '../components/admin/StudentManagement'
import TeacherManagement from '../components/admin/TeacherManagement'
import CourseManagement from '../components/admin/CourseManagement'
import BatchManagement from '../components/admin/BatchManagement'
import AttendanceManagement from '../components/admin/AttendanceManagement'
import CertificateManagement from '../components/admin/CertificateManagement'
import InquiryManagement from '../components/admin/InquiryManagement'
import Reports from '../components/admin/Reports'

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
    if (user?.role === 'student') return <StudentDashboard />
    if (user?.role === 'teacher') return <TeacherDashboard />
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

          {/* 👨‍🎓 Student Routes */}
          {user?.role === 'student' && (
            <>
              <Route path="/dashboard/my-fees" element={<StudentFees />} />
              <Route path="/dashboard/my-attendance" element={<StudentAttendance />} />
              <Route path="/dashboard/my-certificates" element={<StudentCertificates />} />
              <Route path="/dashboard/my-courses" element={<StudentCourses />} />
              <Route path="/dashboard/payment-history" element={<PaymentHistory />} />
            </>
          )}

          {/* 👨‍🏫 Teacher Routes */}
          {user?.role === 'teacher' && (
            <>
              <Route path="/dashboard/my-students" element={<MyStudents />} />
              <Route path="/dashboard/my-batches" element={<MyBatches />} />
              <Route path="/dashboard/mark-attendance" element={<MarkAttendance />} />
              <Route path="/dashboard/view-attendance" element={<ViewAttendance />} />
            </>
          )}

          {/* 🛠️ Admin Routes */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <>
              <Route path="/dashboard/students" element={<StudentManagement />} />
              <Route path="/dashboard/teachers" element={<TeacherManagement />} />
              <Route path="/dashboard/courses" element={<CourseManagement />} />
              <Route path="/dashboard/batches" element={<BatchManagement />} />
              <Route path="/dashboard/attendance" element={<AttendanceManagement />} />
              <Route path="/dashboard/certificates" element={<CertificateManagement />} />
              <Route path="/dashboard/inquiries" element={<InquiryManagement />} />
              <Route path="/dashboard/reports" element={<Reports />} />
            </>
          )}

        </Route>
      </Route>

    </Routes>
  )
}

export default AppRouter