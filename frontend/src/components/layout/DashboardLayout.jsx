// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  FaHome, FaMoneyBillWave, FaCalendarCheck, FaCertificate, 
  FaBook, FaReceipt, FaUser, FaSignOutAlt, FaUsers, FaChalkboardTeacher,
  FaClipboardList, FaChartLine, FaEnvelope, FaBars, FaTimes,
  FaChevronDown, FaBell, FaSearch, FaMoon, FaSun
} from 'react-icons/fa'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const role = user?.role
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Student Menu
  const studentMenu = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'blue' },
    { path: '/dashboard/my-fees', icon: FaMoneyBillWave, label: 'My Fees', color: 'green' },
    { path: '/dashboard/my-attendance', icon: FaCalendarCheck, label: 'My Attendance', color: 'purple' },
    { path: '/dashboard/my-certificates', icon: FaCertificate, label: 'My Certificates', color: 'orange' },
    { path: '/dashboard/my-courses', icon: FaBook, label: 'My Courses', color: 'pink' },
    { path: '/dashboard/payment-history', icon: FaReceipt, label: 'Payment History', color: 'indigo' },
    { path: '/profile', icon: FaUser, label: 'Profile', color: 'gray' }
  ]

  // Teacher Menu
  const teacherMenu = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'blue' },
    { path: '/dashboard/my-students', icon: FaUsers, label: 'My Students', color: 'green' },
    { path: '/dashboard/mark-attendance', icon: FaCalendarCheck, label: 'Mark Attendance', color: 'purple' },
    { path: '/dashboard/my-batches', icon: FaClipboardList, label: 'My Batches', color: 'orange' },
    { path: '/profile', icon: FaUser, label: 'Profile', color: 'gray' }
  ]

  // Admin Menu
  const adminMenu = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'blue' },
    { path: '/dashboard/students', icon: FaUsers, label: 'Students', color: 'green' },
    { path: '/dashboard/teachers', icon: FaChalkboardTeacher, label: 'Teachers', color: 'purple' },
    { path: '/dashboard/courses', icon: FaBook, label: 'Courses', color: 'orange' },
    { path: '/dashboard/batches', icon: FaClipboardList, label: 'Batches', color: 'pink' },
    { path: '/dashboard/fees', icon: FaMoneyBillWave, label: 'Fees', color: 'indigo' },
    { path: '/dashboard/attendance', icon: FaCalendarCheck, label: 'Attendance', color: 'red' },
    { path: '/dashboard/certificates', icon: FaCertificate, label: 'Certificates', color: 'yellow' },
    { path: '/dashboard/inquiries', icon: FaEnvelope, label: 'Inquiries', color: 'teal' },
    { path: '/dashboard/reports', icon: FaChartLine, label: 'Reports', color: 'cyan' },
    { path: '/profile', icon: FaUser, label: 'Profile', color: 'gray' }
  ]

  let menu = studentMenu
  if (role === 'teacher') menu = teacherMenu
  if (role === 'admin' || role === 'super_admin') menu = adminMenu

  const currentPage = menu.find(item => item.path === location.pathname)?.label || 'Dashboard'

  // Get initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop, slide-in on mobile */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-30 w-72 lg:w-64 h-full 
        bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                JAS Computer
              </h2>
              <p className="text-xs text-gray-500 mt-1">Institute & Training Center</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="mt-5 flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{role?.replace('_', ' ') || 'Student'}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            // Fix: Replace dynamic color classes with static ones to avoid TailCSS purge issues
            const colorMap = {
              blue: 'blue',
              green: 'green',
              purple: 'purple',
              orange: 'orange',
              pink: 'pink',
              indigo: 'indigo',
              gray: 'gray',
              red: 'red',
              yellow: 'yellow',
              teal: 'teal',
              cyan: 'cyan'
            }
            const activeColor = colorMap[item.color] || 'blue'
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r from-${activeColor}-500/20 to-${activeColor}-600/20 border-l-4 border-${activeColor}-500` 
                    : 'hover:bg-gray-800/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? `text-${activeColor}-400` : 'text-gray-400 group-hover:text-white'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${activeColor}-400 animate-pulse`} />
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 group"
          >
            <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  <FaBars className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{currentPage}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block mt-0.5">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Search - Desktop */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-2">
                  <FaSearch className="text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none text-sm ml-2 focus:outline-none w-40 lg:w-64"
                  />
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                  <FaBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* User Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{getInitials()}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'User'}</p>
                      <p className="text-xs text-gray-500 capitalize">{role?.replace('_', ' ') || 'Student'}</p>
                    </div>
                    <FaChevronDown className={`hidden sm:block text-gray-400 text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-up">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span>My Profile</span>
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden mt-3">
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                <FaSearch className="text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none text-sm ml-2 focus:outline-none flex-1"
                />
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>
      {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default DashboardLayout