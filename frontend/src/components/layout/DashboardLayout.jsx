// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  FaHome, FaMoneyBillWave, FaCertificate, 
  FaBook, FaUser, FaSignOutAlt, FaUsers,
  FaBars, FaTimes, FaChevronDown, FaSearch
} from 'react-icons/fa'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // ✅ Admin Menu Only
  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'blue' },
    { path: '/dashboard/students', icon: FaUsers, label: 'Students', color: 'green' },
    { path: '/dashboard/courses', icon: FaBook, label: 'Courses', color: 'orange' },
    { path: '/dashboard/fees', icon: FaMoneyBillWave, label: 'Fees', color: 'indigo' },
    { path: '/dashboard/certificates', icon: FaCertificate, label: 'Certificates', color: 'yellow' },
  ]

  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'

  // Get initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">Admin</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const color = item.color || 'blue'
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r from-${color}-500/20 to-${color}-600/20 border-l-4 border-${color}-500` 
                    : 'hover:bg-gray-800/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? `text-${color}-400` : 'text-gray-400 group-hover:text-white'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${color}-400 animate-pulse`} />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
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
                    Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
                  </p>
                </div>
              </div>

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
                    <p className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</p>
                    <p className="text-xs text-gray-500 capitalize">Admin</p>
                  </div>
                  <FaChevronDown className={`hidden sm:block text-gray-400 text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
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
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default DashboardLayout