import React, { useState, useEffect } from 'react'
import { courseService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import { 
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, 
  FaStar, FaUsers, FaCertificate, FaClock,
  FaTag, FaLayerGroup, FaSearch, FaTimes,
  FaSync, FaGraduationCap,
  FaChevronLeft, FaChevronRight, FaThLarge, FaList, FaFilter as FaFilterIcon
} from 'react-icons/fa'
import CourseForm from './CourseForm'

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDrawer, setShowAddDrawer] = useState(false) // Changed to Drawer logic
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '', category: '', level: '', isActive: '', sortBy: 'newest'
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })

  useEffect(() => { fetchCourses() }, [filters, pagination.page])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters }
      Object.keys(params).forEach(key => (params[key] === '' || params[key] === undefined) && delete params[key])
      const response = await courseService.getAllCourses(params)
      if (response.success) {
        setCourses(response.data.courses)
        setPagination({ ...pagination, total: response.data.pagination.total, pages: response.data.pagination.pages })
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch courses')
    } finally { setLoading(false) }
  }

  // ... (Keeping your existing logic for handleToggleStatus, handleDelete, etc.)
  const handleToggleStatus = async (course) => { /* logic */ }
  const handleEdit = (course) => { setSelectedCourse(course); setShowEditModal(true) }
  const handleView = (course) => { setSelectedCourse(course); setShowViewModal(true) }
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* 1. RIGHT SIDE DRAWER (Add Course) */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${showAddDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAddDrawer(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-500 ease-out ${showAddDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
                <p className="text-sm text-gray-500">Fill in the details to publish a new program.</p>
              </div>
              <button onClick={() => setShowAddDrawer(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <CourseForm onSuccess={() => { setShowAddDrawer(false); fetchCourses() }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Course Catalog
            </h1>
            <p className="mt-2 text-gray-500 font-medium">
              Manage your educational content and student offerings.
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDrawer(true)}
            className="group bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
          >
            <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Course</span>
          </Button>
        </div>

        {/* Stats Grid - High Contrast Premium Look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Courses', val: pagination.total, icon: <FaLayerGroup />, color: 'blue' },
            { label: 'Active', val: courses.filter(c => c.isActive).length, icon: <FaToggleOn />, color: 'emerald' },
            { label: 'Enrollments', val: '2.4k', icon: <FaUsers />, color: 'purple' },
            { label: 'Avg Rating', val: '4.8', icon: <FaStar />, color: 'amber' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>{stat.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Utility Bar */}
        <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-3 shadow-lg mb-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title, code, or technology..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black rounded-xl transition-all"
              value={filters.search}
              onChange={handleFilterChange}
              name="search"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-medium transition-all ${showFilters ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <FaFilterIcon /> Filters
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1" />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 px-4 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><FaThLarge /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 px-4 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><FaList /></button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-gray-400 animate-pulse font-medium">Fetching courses...</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
            {courses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                viewMode={viewMode} 
                onEdit={() => handleEdit(course)}
                onView={() => handleView(course)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-component for individual card UX
const CourseCard = ({ course, viewMode, onEdit, onView }) => {
  const isGrid = viewMode === 'grid';
  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-blue-100 overflow-hidden ${!isGrid && 'flex items-center p-4 gap-6'}`}>
      <div className={`relative overflow-hidden ${isGrid ? 'h-52 w-full' : 'h-24 w-40 rounded-xl flex-shrink-0'}`}>
        <img 
          src={course.thumbnail || 'https://placehold.co/600x400?text=Course'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
           <button onClick={onView} className="w-full py-2 bg-white/20 backdrop-blur-md text-white rounded-lg text-sm font-semibold hover:bg-white hover:text-black transition-all">Quick View</button>
        </div>
      </div>
      
      <div className={`p-5 flex-1 ${!isGrid && 'py-0'}`}>
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.level}</span>
           <span className="text-lg font-bold text-gray-900">₹{course.totalFees}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{course.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{course.shortDescription}</p>
        
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><FaClock /> {course.duration?.value} {course.duration?.unit}</span>
            <span className="flex items-center gap-1"><FaUsers /> {course.popularity?.enrollments || 0}</span>
          </div>
          <button onClick={onEdit} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"><FaEdit /></button>
        </div>
      </div>
    </div>
  )
}

export default CourseManagement