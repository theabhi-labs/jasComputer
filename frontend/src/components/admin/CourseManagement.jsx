import React, { useState, useEffect } from 'react'
import { courseService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import { 
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, 
  FaStar, FaUsers, FaProjectDiagram, FaCertificate, FaClock,
  FaTag, FaLayerGroup, FaRupeeSign, FaSearch, FaFilter, FaTimes,
  FaChartLine, FaDownload, FaCalendarAlt, FaGraduationCap,
  FaChevronLeft, FaChevronRight, FaThLarge, FaList, FaSortAmountDown,
  FaFilter as FaFilterIcon, FaSync, FaBookOpen, FaAward
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
  const [viewMode, setViewMode] = useState('grid') // grid or list
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

  useEffect(() => {
    fetchCourses()
  }, [filters, pagination.page])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
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

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Beginner': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
      'Advanced': 'bg-amber-100 text-amber-800 border-amber-200',
      'All Levels': 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200'
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Course Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, organize, and optimize your course catalog
            </p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-200"
          >
            <FaPlus className="inline mr-2" />
            Add New Course
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
            className="mb-6 animate-fade-in"
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-xl p-2">
                <FaLayerGroup className="text-blue-600 text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Courses</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
              </div>
              <div className="bg-emerald-100 rounded-xl p-2">
                <FaToggleOn className="text-emerald-600 text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Featured</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.featured}</p>
              </div>
              <div className="bg-amber-100 rounded-xl p-2">
                <FaStar className="text-amber-600 text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Discounted</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{stats.discounted}</p>
              </div>
              <div className="bg-rose-100 rounded-xl p-2">
                <FaTag className="text-rose-600 text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalEnrollments}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-2">
                <FaUsers className="text-purple-600 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by course name, code, or skills..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                    showFilters || Object.values(filters).some(v => v && v !== 'newest')
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaFilterIcon className="text-sm" />
                  <span className="text-sm font-medium hidden sm:inline">Filters</span>
                </button>
                
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
                >
                  {viewMode === 'grid' ? <FaList className="text-sm" /> : <FaThLarge className="text-sm" />}
                  <span className="text-sm font-medium hidden sm:inline">
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </span>
                </button>
                
                <button
                  onClick={fetchCourses}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  title="Refresh"
                >
                  <FaSync className="text-sm" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      placeholder="Filter by category"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
                    <select
                      name="level"
                      value={filters.level}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popularity">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courses Grid/List */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaLayerGroup className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first course</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <FaPlus className="inline mr-2" />
              Add Your First Course
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://placehold.co/400x300/3B82F6/white?text=Course'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaGraduationCap className="text-white text-5xl opacity-50" />
                    </div>
                  )}
                  {course.discount?.isDiscounted && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {course.discount.discountPercentage}% OFF
                    </div>
                  )}
                  {course.popularity?.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                      <FaStar className="text-xs" />
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4">
                  {/* Title and Status */}
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
                  
                  <p className="text-xs text-gray-500 mb-2">{course.code || 'No code'}</p>
                  
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {course.shortDescription || course.description?.substring(0, 80) || 'No description'}
                  </p>

                  {/* Level Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getLevelBadgeColor(course.level)}`}>
                      <FaTag className="mr-1 text-xs" />
                      {course.level}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FaClock className="text-gray-400" />
                      <span>{course.duration?.value} {course.duration?.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <FaUsers className="text-gray-400" />
                      <span>{course.popularity?.enrollments || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <FaStar className="text-amber-400" />
                      <span>{course.rating?.average?.toFixed(1) || '0'} ({course.rating?.count || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <FaCertificate className="text-gray-400" />
                      <span>{course.certificateProvided ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Pricing */}
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
                        <span className="text-xs text-green-600 font-medium">
                          Save {course.discount.discountPercentage}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-blue-600">
                        ₹{course.totalFees?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleView(course)}
                      className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-xs" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaEdit className="text-xs" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course)
                        setShowDeleteConfirm(true)
                      }}
                      className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollments</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <FaGraduationCap className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{course.name}</p>
                            <p className="text-xs text-gray-500">{course.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                          {course.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {course.duration?.value} {course.duration?.unit}
                      </td>
                      <td className="px-4 py-3">
                        {course.discount?.isDiscounted ? (
                          <div>
                            <span className="text-xs line-through text-gray-400">₹{course.totalFees}</span>
                            <span className="ml-1 text-sm font-bold text-red-600">₹{getCurrentPrice(course)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-blue-600">₹{course.totalFees}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{course.popularity?.enrollments || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(course)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            course.isActive 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {course.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {course.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
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
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <div className="flex gap-1">
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
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white shadow-sm'
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
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* Modals remain the same */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Course" size="large">
        <CourseForm onSuccess={() => { setShowAddModal(false); fetchCourses() }} />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="large">
        <CourseForm course={selectedCourse} onSuccess={() => { setShowEditModal(false); setSelectedCourse(null); fetchCourses() }} />
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedCourse(null) }} title="Course Details" size="large">
        {selectedCourse && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start gap-4">
              {selectedCourse.thumbnail && (
                <img src={selectedCourse.thumbnail} alt={selectedCourse.name} className="w-24 h-24 object-cover rounded-xl" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                <p className="text-sm text-gray-500">{selectedCourse.code}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getLevelBadgeColor(selectedCourse.level)}`}>
                    {selectedCourse.level}
                  </span>
                  {selectedCourse.certificateProvided && (
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">Certificate</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm">{selectedCourse.fullDescription || selectedCourse.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                <p className="text-2xl font-bold text-blue-600">₹{getCurrentPrice(selectedCourse)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
                <p className="text-sm">Enrollments: {selectedCourse.popularity?.enrollments || 0}</p>
                <p className="text-sm">Rating: {selectedCourse.rating?.average?.toFixed(1) || 0} ({selectedCourse.rating?.count || 0})</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedCourse(null) }} onConfirm={handleDelete} title="Delete Course" message={`Are you sure you want to delete "${selectedCourse?.name}"?`} confirmText="Delete" confirmVariant="danger" />
    </div>
  )
}

export default CourseManagement