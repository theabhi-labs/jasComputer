import React, { useState, useEffect, useCallback } from 'react'
import { courseService } from '../../services'
import { Button, Modal, ConfirmModal, Alert, Loader } from '../common'
import { 
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, 
  FaStar, FaUsers, FaProjectDiagram, FaCertificate, FaClock,
  FaTag, FaLayerGroup, FaRupeeSign, FaSearch, FaFilter, FaTimes,
  FaChartLine, FaDownload, FaCalendarAlt, FaGraduationCap,
  FaChevronLeft, FaChevronRight, FaThLarge, FaList, FaSortAmountDown,
  FaFilter as FaFilterIcon, FaSync, FaBookOpen, FaAward, FaDollarSign,
  FaRegClock, FaChartBar, FaArrowUp, FaCheckCircle, FaSpinner,
  FaGlobe, FaLanguage, FaInfoCircle, FaPlayCircle, FaFileAlt
} from 'react-icons/fa'
import CourseForm from './CourseForm'

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    isActive: '',
    sortBy: 'newest'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [filters, pagination.page])

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined || params[key] === null) {
          delete params[key]
        }
      })
      
      const response = await courseService.getAllCourses(params)
      if (response.success) {
        setCourses(response.data.courses)
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        })
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (course) => {
    try {
      const response = await courseService.toggleStatus(course._id)
      if (response.success) {
        fetchCourses()
      } else {
        setError(response.message || 'Failed to toggle status')
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle status')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await courseService.deleteCourse(selectedCourse._id)
      if (response.success) {
        fetchCourses()
        setShowDeleteConfirm(false)
        setSelectedCourse(null)
      } else {
        setError(response.message || 'Failed to delete course')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course')
    }
  }

  const handleView = (course) => {
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      isActive: '',
      sortBy: 'newest'
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Beginner': 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200',
      'Intermediate': 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200',
      'Advanced': 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200',
      'All Levels': 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200'
    }
    return colors[level] || 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200'
  }

  const getCurrentPrice = (course) => {
    if (course.discount?.isDiscounted && course.discount?.discountedPrice > 0) {
      return course.discount.discountedPrice
    }
    return course.totalFees
  }

  const stats = {
    total: pagination.total,
    active: courses.filter(c => c.isActive).length,
    featured: courses.filter(c => c.popularity?.featured).length,
    discounted: courses.filter(c => c.discount?.isDiscounted).length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.popularity?.enrollments || 0), 0)
  }

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Fixed Header Container - prevents modal overlap */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Course Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage, organize, and optimize your course catalog
              </p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200 rounded-xl px-5 py-2.5"
            >
              <FaPlus className="inline mr-2 text-sm" />
              Add New Course
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError('')} 
              className="mb-6 animate-fade-in rounded-xl"
            />
          )}

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg shadow-blue-200">
                  <FaLayerGroup className="text-white text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Active Courses</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2.5 shadow-lg shadow-emerald-200">
                  <FaToggleOn className="text-white text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Featured</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.featured}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-2.5 shadow-lg shadow-amber-200">
                  <FaStar className="text-white text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Discounted</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{stats.discounted}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-2.5 shadow-lg shadow-rose-200">
                  <FaTag className="text-white text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Enrollments</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalEnrollments.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-lg shadow-purple-200">
                  <FaUsers className="text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden sticky top-20 z-30">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search by course name, code, category, or skills..."
                      className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    />
                    {filters.search && (
                      <button
                        onClick={() => setFilters({ ...filters, search: '' })}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                      showFilters || Object.values(filters).some(v => v && v !== 'newest')
                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaFilterIcon className="text-sm" />
                    <span className="text-sm font-medium hidden sm:inline">Filters</span>
                    {(showFilters || Object.values(filters).some(v => v && v !== 'newest')) && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    {viewMode === 'grid' ? <FaList className="text-sm" /> : <FaThLarge className="text-sm" />}
                    <span className="text-sm font-medium hidden sm:inline">
                      {viewMode === 'grid' ? 'List View' : 'Grid View'}
                    </span>
                  </button>
                  
                  <button
                    onClick={fetchCourses}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    title="Refresh"
                  >
                    <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        placeholder="Filter by category"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Level</label>
                      <select
                        name="level"
                        value={filters.level}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      >
                        <option value="">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                      <select
                        name="isActive"
                        value={filters.isActive}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
                      <select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="popularity">Most Popular</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      <FaTimes className="text-xs" />
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State for Refresh */}
          {loading && courses.length > 0 && (
            <div className="flex justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {/* Courses Grid/List */}
          {courses.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <FaLayerGroup className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first course</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <FaPlus className="inline mr-2" />
                Add Your First Course
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <div 
                  key={course._id} 
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://via.placeholder.com/400x300/3B82F6/white?text=Course'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaGraduationCap className="text-white text-5xl opacity-50" />
                      </div>
                    )}
                    {course.discount?.isDiscounted && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse">
                        {course.discount.discountPercentage}% OFF
                      </div>
                    )}
                    {course.popularity?.featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                        <FaStar className="text-xs" />
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1 flex-1 group-hover:text-blue-600 transition">
                        {course.name}
                      </h3>
                      <button
                        onClick={() => handleToggleStatus(course)}
                        className={`flex-shrink-0 ${course.isActive ? 'text-emerald-500' : 'text-gray-400'} hover:scale-110 transition-transform`}
                        title={course.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {course.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 font-mono">{course.code || 'No code'}</p>
                    
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 min-h-[40px]">
                      {course.shortDescription || (course.fullDescription?.substring(0, 80)) || 'No description'}
                    </p>

                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getLevelBadgeColor(course.level)}`}>
                        <FaTag className="mr-1 text-xs" />
                        {course.level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FaRegClock className="text-gray-400 text-xs" />
                        <span>{course.duration?.value} {course.duration?.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FaUsers className="text-gray-400 text-xs" />
                        <span>{course.popularity?.enrollments?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FaStar className="text-amber-400 text-xs" />
                        <span>{course.rating?.average?.toFixed(1) || '0'} ({course.rating?.count || 0})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FaCertificate className="text-gray-400 text-xs" />
                        <span>{course.certificateProvided ? 'Certified' : 'No Cert'}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      {course.discount?.isDiscounted ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs line-through text-gray-400">
                              ₹{course.totalFees?.toLocaleString()}
                            </span>
                            <span className="ml-2 text-lg font-bold text-red-600">
                              ₹{getCurrentPrice(course)?.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                            Save {course.discount.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{course.totalFees?.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleView(course)}
                        className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1.5 group/btn"
                      >
                        <FaEye className="text-xs group-hover/btn:scale-110 transition" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1.5 group/btn"
                      >
                        <FaEdit className="text-xs group-hover/btn:scale-110 transition" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowDeleteConfirm(true)
                        }}
                        className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1.5 group/btn"
                      >
                        <FaTrash className="text-xs group-hover/btn:scale-110 transition" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollments</th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                              <FaGraduationCap className="text-white text-sm" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition">{course.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{course.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                            {course.level}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <FaRegClock className="text-gray-400 text-xs" />
                            {course.duration?.value} {course.duration?.unit}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {course.discount?.isDiscounted ? (
                            <div className="flex flex-col">
                              <span className="text-xs line-through text-gray-400">₹{course.totalFees?.toLocaleString()}</span>
                              <span className="text-sm font-bold text-red-600">₹{getCurrentPrice(course)?.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-blue-600">₹{course.totalFees?.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{course.popularity?.enrollments?.toLocaleString() || 0}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(course)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              course.isActive 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {course.isActive ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                            {course.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleView(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <FaEye className="text-sm" />
                            </button>
                            <button onClick={() => handleEdit(course)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Edit">
                              <FaEdit className="text-sm" />
                            </button>
                            <button onClick={() => { setSelectedCourse(course); setShowDeleteConfirm(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        pagination.page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 group"
        >
          <FaArrowUp className="text-sm group-hover:-translate-y-0.5 transition" />
        </button>
      )}

      {/* Modals with proper z-index to prevent header overlap */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add New Course" 
        size="large"
        className="z-50"
      >
        <CourseForm onSuccess={() => { setShowAddModal(false); fetchCourses() }} />
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Course" 
        size="large"
        className="z-50"
      >
        <CourseForm course={selectedCourse} onSuccess={() => { setShowEditModal(false); setSelectedCourse(null); fetchCourses() }} />
      </Modal>

      <Modal 
        isOpen={showViewModal} 
        onClose={() => { setShowViewModal(false); setSelectedCourse(null) }} 
        title="Course Details" 
        size="large"
        className="z-50"
      >
        {selectedCourse && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {/* Hero Section */}
            <div className="flex flex-col sm:flex-row items-start gap-5 pb-4 border-b border-gray-100">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                {selectedCourse.thumbnail ? (
                  <img src={selectedCourse.thumbnail} alt={selectedCourse.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaGraduationCap className="text-white text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                  {selectedCourse.popularity?.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      <FaStar className="text-xs" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-mono mb-2">{selectedCourse.code}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getLevelBadgeColor(selectedCourse.level)}`}>
                    {selectedCourse.level}
                  </span>
                  {selectedCourse.certificateProvided && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      <FaCertificate className="inline mr-1 text-xs" />
                      Certificate
                  </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                    <FaLanguage className="inline mr-1 text-xs" />
                    {selectedCourse.language || 'English'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500 text-sm" />
                Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedCourse.fullDescription || selectedCourse.description || 'No description available'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaDollarSign className="text-green-500" />
                  Pricing
                </h3>
                {selectedCourse.discount?.isDiscounted ? (
                  <div>
                    <p className="text-2xl font-bold text-red-600">₹{getCurrentPrice(selectedCourse)?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 line-through">₹{selectedCourse.totalFees?.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">Save {selectedCourse.discount.discountPercentage}%</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">₹{selectedCourse.totalFees?.toLocaleString()}</p>
                )}
                {selectedCourse.installmentAllowed && (
                  <p className="text-xs text-gray-500 mt-2">Installments available ({selectedCourse.numberOfInstallments} payments)</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaChartBar className="text-purple-500" />
                  Statistics
                </h3>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Enrollments:</span>
                    <span className="font-semibold">{selectedCourse.popularity?.enrollments?.toLocaleString() || 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Views:</span>
                    <span className="font-semibold">{selectedCourse.popularity?.views?.toLocaleString() || 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <FaStar className="text-amber-400 text-xs" />
                      {selectedCourse.rating?.average?.toFixed(1) || '0'} ({selectedCourse.rating?.count || 0} reviews)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaRegClock className="text-blue-500" />
                  Duration
                </h3>
                <p className="text-gray-600 text-sm">{selectedCourse.duration?.value} {selectedCourse.duration?.unit}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaUsers className="text-green-500" />
                  Target Audience
                </h3>
                <p className="text-gray-600 text-sm">{selectedCourse.targetAudience?.join(', ') || 'General'}</p>
              </div>
            </div>

            {/* Skills */}
            {selectedCourse.skillsToLearn?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaBookOpen className="text-purple-500" />
                  Skills to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skillsToLearn.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {selectedCourse.prerequisites?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaCheckCircle className="text-amber-500" />
                  Prerequisites
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                  {selectedCourse.prerequisites.map((prereq, idx) => (
                    <li key={idx}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projects Count */}
            {selectedCourse.projects?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaProjectDiagram className="text-red-500" />
                  Projects ({selectedCourse.projects.length})
                </h3>
                <p className="text-gray-600 text-sm">{selectedCourse.totalProjects || selectedCourse.projects.length} hands-on projects included</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => { setShowDeleteConfirm(false); setSelectedCourse(null) }} 
        onConfirm={handleDelete} 
        title="Delete Course" 
        message={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`} 
        confirmText="Delete" 
        confirmVariant="danger" 
      />
    </div>
  )
}

export default CourseManagement