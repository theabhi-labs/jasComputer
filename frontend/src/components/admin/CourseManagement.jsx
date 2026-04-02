import React, { useState, useEffect, useCallback } from 'react'
import { courseService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import LoaderJAS from '../common/Loader'
import {
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye,
  FaStar, FaUsers, FaProjectDiagram, FaCertificate, FaClock,
  FaTag, FaLayerGroup, FaRupeeSign, FaSearch, FaFilter, FaTimes,
  FaChartLine, FaDownload, FaCalendarAlt, FaGraduationCap,
  FaChevronLeft, FaChevronRight, FaThLarge, FaList, FaSortAmountDown,
  FaFilter as FaFilterIcon, FaSync, FaBookOpen, FaAward
} from 'react-icons/fa'
import CourseForm from './CourseForm'

// ─── Portal Modal — renders at document.body level, always above header/sidebar ──
const PortalModal = ({ isOpen, onClose, title, children, size = 'xl' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    large: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
    '2xl': 'max-w-7xl'
  }[size] || 'max-w-6xl'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${maxW} mx-4 my-6 sm:my-10`}>
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FaBookOpen className="text-indigo-600 text-sm" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Modal (same portal approach) ─────────────────────────────────────
const PortalConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const btnCls = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaTrash className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-150">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-95 ${btnCls}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor = 'text-slate-800' }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-default">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className={`text-2xl font-black mt-1 ${valueColor}`}>{value}</p>
      </div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`${iconColor} text-base`} />
      </div>
    </div>
  </div>
)

// ─── Level badge ───────────────────────────────────────────────────────────────
const levelStyles = {
  Beginner:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Intermediate: 'bg-sky-50 text-sky-700 border border-sky-200',
  Advanced:     'bg-amber-50 text-amber-700 border border-amber-200',
  'All Levels': 'bg-violet-50 text-violet-700 border border-violet-200',
}
const LevelBadge = ({ level }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${levelStyles[level] || 'bg-slate-100 text-slate-600'}`}>
    {level}
  </span>
)

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
      <FaLayerGroup className="text-indigo-400 text-2xl" />
    </div>
    <p className="text-base font-bold text-slate-700 mb-1">No courses found</p>
    <p className="text-sm text-slate-400 mb-6">Create your first course to get started</p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
    >
      <FaPlus className="text-xs" />
      Add New Course
    </button>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
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

  useEffect(() => { fetchCourses() }, [filters, pagination.page])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters }
      Object.keys(params).forEach(key => { if (params[key] === '' || params[key] === undefined) delete params[key] })
      const response = await courseService.getAllCourses(params)
      if (response.success) {
        setCourses(response.data.courses)
        setPagination(p => ({ ...p, total: response.data.pagination.total, pages: response.data.pagination.pages }))
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
      if (response.success) fetchCourses()
      else setError(response.message || 'Failed to toggle status')
    } catch (err) { setError(err.message || 'Failed to toggle status') }
  }

  const handleDelete = async () => {
    try {
      const response = await courseService.deleteCourse(selectedCourse._id)
      if (response.success) { fetchCourses(); setShowDeleteConfirm(false); setSelectedCourse(null) }
      else setError(response.message || 'Failed to delete course')
    } catch (err) { setError(err.message || 'Failed to delete course') }
  }

  const handleView = (course) => { setSelectedCourse(course); setShowViewModal(true) }

  const handleEdit = async (courseId) => {
    try {
      setLoading(true);
      console.log("🔵 Fetching full course data for edit:", courseId);
      
      const response = await courseService.getCourseById(courseId);
      
      let courseData = null;
      if (response?.data?.course) {
        courseData = response.data.course;
      } else if (response?.course) {
        courseData = response.course;
      } else if (response) {
        courseData = response;
      }
      
      console.log("✅ Full course loaded:", courseData.name);
      console.log("✅ Syllabus:", courseData?.syllabus?.length);
      console.log("✅ Projects:", courseData?.projects?.length);
      console.log("✅ FAQs:", courseData?.faqs?.length);
      
      setSelectedCourse(courseData);
      setShowEditModal(true);
    } catch (error) {
      console.error("❌ Error fetching course:", error);
      setError(error.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(f => ({ ...f, [name]: value }))
    setPagination(p => ({ ...p, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', level: '', isActive: '', sortBy: 'newest' })
    setPagination(p => ({ ...p, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(p => ({ ...p, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCurrentPrice = (course) => {
    if (course.discount?.isDiscounted && course.discount?.discountedPrice > 0) return course.discount.discountedPrice
    return course.totalFees
  }

  const hasActiveFilters = filters.search || filters.category || filters.level || filters.isActive || filters.sortBy !== 'newest'

  const stats = {
    total: pagination.total,
    active: courses.filter(c => c.isActive).length,
    featured: courses.filter(c => c.popularity?.featured).length,
    discounted: courses.filter(c => c.discount?.isDiscounted).length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.popularity?.enrollments || 0), 0)
  }

  // ✅ LoaderJAS – only within content area, no full‑screen takeover
  if (loading && courses.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderJAS />
      </div>
    )
  }

  const fontLink = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`

  return (
    <div
      className="min-h-screen bg-slate-50/70"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <style>{fontLink}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <FaBookOpen className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Course Management</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium ml-12">Manage, organize and optimize your course catalog</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95 self-start sm:self-auto"
          >
            <FaPlus className="text-xs" />
            Add New Course
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6 text-sm text-red-700 font-medium">
            <span className="text-red-400">⚠</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <FaTimes className="text-xs" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
          <StatCard label="Total Courses"     value={stats.total}            icon={FaLayerGroup}  iconBg="bg-indigo-100"  iconColor="text-indigo-600"  valueColor="text-slate-800" />
          <StatCard label="Active"            value={stats.active}           icon={FaToggleOn}    iconBg="bg-emerald-100" iconColor="text-emerald-600" valueColor="text-emerald-600" />
          <StatCard label="Featured"          value={stats.featured}         icon={FaStar}        iconBg="bg-amber-100"   iconColor="text-amber-500"   valueColor="text-amber-600" />
          <StatCard label="Discounted"        value={stats.discounted}       icon={FaTag}         iconBg="bg-rose-100"    iconColor="text-rose-500"    valueColor="text-rose-600" />
          <StatCard label="Total Enrollments" value={stats.totalEnrollments} icon={FaUsers}       iconBg="bg-sky-100"     iconColor="text-sky-600"     valueColor="text-sky-600" />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, code, or skills…"
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                  ${showFilters || hasActiveFilters
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                <FaFilterIcon className="text-xs" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>

              <button
                onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-all duration-200"
                title={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
              >
                {viewMode === 'grid' ? <FaList className="text-xs" /> : <FaThLarge className="text-xs" />}
                <span className="hidden sm:inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
              </button>

              <button
                onClick={fetchCourses}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all duration-200"
                title="Refresh"
              >
                <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    placeholder="e.g. Web Development"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Level</label>
                  <div className="relative">
                    <select name="level" value={filters.level} onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all appearance-none">
                      <option value="">All Levels</option>
                      {['Beginner','Intermediate','Advanced','All Levels'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                  <div className="relative">
                    <select name="isActive" value={filters.isActive} onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all appearance-none">
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Sort By</label>
                  <div className="relative">
                    <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all appearance-none">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="popularity">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex justify-end">
                  <button onClick={handleClearFilters} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    × Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && courses.length > 0 && (
          <p className="text-xs text-slate-400 font-medium mb-4 ml-1">
            Showing {courses.length} of {pagination.total} courses
          </p>
        )}

        {/* Course Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.length === 0 ? (
              <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : courses.map((course) => (
              <div
                key={course._id}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/6366f1/white?text=Course' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaGraduationCap className="text-white/40 text-5xl" />
                    </div>
                  )}

                  {/* Overlay badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1">
                    {course.popularity?.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm">
                        <FaStar className="text-[10px]" /> Featured
                      </span>
                    )}
                    {course.discount?.isDiscounted && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm ml-auto">
                        {course.discount.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Status toggle overlay */}
                  <button
                    onClick={() => handleToggleStatus(course)}
                    className={`absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold shadow-md transition-all
                      ${course.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-600/80 text-white'}`}
                    title={course.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {course.isActive ? <FaToggleOn className="text-xs" /> : <FaToggleOff className="text-xs" />}
                    {course.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mb-2">{course.code || '—'}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                    {course.shortDescription || 'No description provided.'}
                  </p>

                  {/* Level + Duration */}
                  <div className="flex items-center justify-between mb-3">
                    <LevelBadge level={course.level} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <FaClock className="text-slate-400 text-[10px]" />
                      {course.duration?.value} {course.duration?.unit}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-slate-400 text-[10px]" />
                      {course.popularity?.enrollments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar className="text-amber-400 text-[10px]" />
                      {course.rating?.average?.toFixed(1) || '0.0'}
                      <span className="text-slate-400">({course.rating?.count || 0})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCertificate className="text-slate-400 text-[10px]" />
                      {course.certificateProvided ? 'Cert' : 'No cert'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {course.discount?.isDiscounted ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-red-600">
                          ₹{getCurrentPrice(course)?.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{course.totalFees?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {course.discount.discountPercentage}% off
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-indigo-600">
                        ₹{course.totalFees?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleView(course)}
                      className="flex-1 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150 border border-slate-100 hover:border-indigo-100"
                    >
                      <FaEye className="text-[10px]" /> View
                    </button>
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150 border border-slate-100 hover:border-emerald-100"
                    >
                      <FaEdit className="text-[10px]" /> Edit
                    </button>
                    <button
                      onClick={() => { setSelectedCourse(course); setShowDeleteConfirm(true) }}
                      className="flex-1 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150 border border-slate-100 hover:border-red-100"
                    >
                      <FaTrash className="text-[10px]" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {courses.length === 0 ? (
              <div className="p-12 text-center">
                <EmptyState onAdd={() => setShowAddModal(true)} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {['Course', 'Level', 'Duration', 'Price', 'Enrollments', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, i) => (
                      <tr key={course._id} className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors duration-150 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt="" className="w-full h-full object-cover rounded-xl"
                                  onError={e => { e.target.style.display = 'none' }} />
                              ) : (
                                <FaGraduationCap className="text-white text-sm" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate max-w-[160px]">{course.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{course.code || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><LevelBadge level={course.level} /></td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {course.duration?.value} {course.duration?.unit}
                        </td>
                        <td className="px-4 py-3">
                          {course.discount?.isDiscounted ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-red-600">₹{getCurrentPrice(course)?.toLocaleString()}</span>
                              <span className="text-[11px] text-slate-400 line-through">₹{course.totalFees?.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-indigo-600">₹{course.totalFees?.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{course.popularity?.enrollments || 0}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(course)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                              ${course.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
                          >
                            {course.isActive ? <FaToggleOn className="text-emerald-500" /> : <FaToggleOff className="text-slate-400" />}
                            {course.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {[
                              { fn: () => handleView(course), icon: FaEye, cls: 'hover:bg-indigo-50 hover:text-indigo-700', title: 'View' },
                              { fn: () => handleEdit(course._id), icon: FaEdit, cls: 'hover:bg-emerald-50 hover:text-emerald-700', title: 'Edit' },
                              { fn: () => { setSelectedCourse(course); setShowDeleteConfirm(true) }, icon: FaTrash, cls: 'hover:bg-red-50 hover:text-red-600', title: 'Delete' },
                            ].map(({ fn, icon: Icon, cls, title }) => (
                              <button key={title} onClick={fn} title={title}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 transition-all duration-150 ${cls}`}>
                                <Icon className="text-xs" />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let p
              if (pagination.pages <= 5) p = i + 1
              else if (pagination.page <= 3) p = i + 1
              else if (pagination.page >= pagination.pages - 2) p = pagination.pages - 4 + i
              else p = pagination.page - 2 + i
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150
                    ${pagination.page === p
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <PortalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Course"
        size="xl"
      >
        <CourseForm onSuccess={() => { setShowAddModal(false); fetchCourses() }} />
      </PortalModal>

      <PortalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Course"
        size="xl"
      >
        <CourseForm
          course={selectedCourse}
          onSuccess={() => { setShowEditModal(false); setSelectedCourse(null); fetchCourses() }}
        />
      </PortalModal>

      <PortalModal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedCourse(null) }}
        title="Course Details"
        size="large"
      >
        {selectedCourse && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0 shadow-md">
                {selectedCourse.thumbnail
                  ? <img src={selectedCourse.thumbnail} alt={selectedCourse.name} className="w-full h-full object-cover" />
                  : <FaGraduationCap className="text-white/50 text-3xl m-auto mt-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-slate-800 leading-snug">{selectedCourse.name}</h2>
                <p className="text-sm text-slate-400 font-mono mt-0.5">{selectedCourse.code}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <LevelBadge level={selectedCourse.level} />
                  {selectedCourse.certificateProvided && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FaCertificate className="text-[10px]" /> Certificate
                    </span>
                  )}
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${selectedCourse.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {selectedCourse.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {(selectedCourse.fullDescription || selectedCourse.description) && (
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.fullDescription || selectedCourse.description}</p>
              </div>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Price', value: `₹${getCurrentPrice(selectedCourse)?.toLocaleString()}`, color: 'text-indigo-600' },
                { label: 'Duration', value: `${selectedCourse.duration?.value} ${selectedCourse.duration?.unit}`, color: 'text-slate-700' },
                { label: 'Enrollments', value: selectedCourse.popularity?.enrollments || 0, color: 'text-slate-700' },
                { label: 'Rating', value: `${selectedCourse.rating?.average?.toFixed(1) || '0.0'} (${selectedCourse.rating?.count || 0})`, color: 'text-amber-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className={`text-base font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {selectedCourse.skillsToLearn?.length > 0 && (
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Skills Covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourse.skillsToLearn.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </PortalModal>

      <PortalConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedCourse(null) }}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${selectedCourse?.name}"? This cannot be undone.`}
        confirmText="Delete Course"
        confirmVariant="danger"
      />
    </div>
  )
}

export default CourseManagement