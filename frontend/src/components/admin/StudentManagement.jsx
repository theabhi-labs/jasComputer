import React, { useState, useEffect } from 'react'
import { studentService, courseService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaFilter,
  FaDownload, FaUserGraduate, FaEnvelope, FaPhone,
  FaCalendarAlt, FaRupeeSign, FaCheckCircle, FaTimesCircle,
  FaClock, FaSpinner, FaUpload, FaFileExcel, FaFileCode,
  FaMoneyBillWave, FaCreditCard, FaWallet, FaInfoCircle  // ← Add FaInfoCircle here
} from 'react-icons/fa'
import AddStudent from './AddStudent'
import EditStudent from './EditStudent'
import StudentDetailsModal from './StudentDetailsModal'
import * as XLSX from 'xlsx'
import LoaderJAS from '../common/Loader'

const StudentManagement = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [courses, setCourses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingPayment: 0,
    completedRegistration: 0
  })
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Payment Modal State
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    method: 'cash',
    notes: '',
    transactionId: `ADM-${Date.now()}`
  })
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchCourses()
    fetchStats()
  }, [pagination.page, filterStatus, filterCourse, filterPaymentStatus])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterCourse && { course: filterCourse }),
        ...(filterPaymentStatus && { paymentStatus: filterPaymentStatus })
      }
      const response = await studentService.getAllStudents(params)
      if (response.success) {
        setStudents(response.data.students || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || response.data.pagination?.total || 0,
          totalPages: response.data.totalPages || response.data.pagination?.totalPages || 1
        }))
      } else {
        setError(response.message || 'Failed to fetch students')
      }
    } catch (error) {
      console.error('Fetch students error:', error)
      setError(error.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await studentService.getStudentStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses()
      if (response.success) {
        setCourses(response.data.courses || response.data || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await studentService.deleteStudent(selectedStudent._id)
      if (response.success) {
        setSuccess('Student deleted successfully')
        fetchStudents()
        fetchStats()
        setShowDeleteConfirm(false)
        setSelectedStudent(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || 'Failed to delete student')
      }
    } catch (error) {
      setError(error.message || 'Failed to delete student')
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchStudents()
  }

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const response = await studentService.getAllStudents({ limit: 10000 })
      if (response.success) {
        const data = response.data.students || response.data || []

        const excelData = data.map(student => ({
          'Enrollment ID': student.enrollmentId || 'N/A',
          'Name': student.name,
          'Email': student.email,
          'Phone': student.phone,
          'Father Name': student.fatherName || 'N/A',
          'Mother Name': student.motherName || 'N/A',
          'Course': student.course?.name || student.courseName || 'N/A',
          'Status': student.status || 'pending',
          'Admission Fee Status': student.admissionFeePaid ? 'Paid' : 'Pending',
          'Documents Uploaded': student.documentsUploaded ? 'Yes' : 'No',
          'Registration Status': student.registrationStatus || 'pending',
          'Registration Complete': student.registrationComplete ? 'Yes' : 'No',
          'Admission Date': student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A',
          'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
          'Gender': student.gender || 'N/A',
          'Blood Group': student.bloodGroup || 'N/A',
          'Address': student.address ? `${student.address.street || ''}, ${student.address.city || ''}, ${student.address.state || ''} - ${student.address.pincode || ''}` : 'N/A'
        }))

        const ws = XLSX.utils.json_to_sheet(excelData)
        const colWidths = [
          { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
          { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
          { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
          { wch: 12 }, { wch: 40 }
        ]
        ws['!cols'] = colWidths

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Students')
        const fileName = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(wb, fileName)

        setSuccess(`Exported ${data.length} students to Excel successfully`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Export to Excel error:', error)
      setError('Failed to export to Excel')
    }
    setShowExportMenu(false)
  }

  // Export to JSON
  const exportToJSON = async () => {
    try {
      const response = await studentService.getAllStudents({ limit: 10000 })
      if (response.success) {
        const data = response.data.students || response.data || []

        const jsonData = data.map(student => ({
          enrollmentId: student.enrollmentId || 'N/A',
          name: student.name,
          email: student.email,
          phone: student.phone,
          fatherName: student.fatherName || 'N/A',
          motherName: student.motherName || 'N/A',
          course: {
            id: student.course?._id || student.courseId,
            name: student.course?.name || student.courseName || 'N/A',
            fee: student.course?.totalFees || student.courseFee || 0
          },
          status: student.status || 'pending',
          admissionFeePaid: student.admissionFeePaid || false,
          documentsUploaded: student.documentsUploaded || false,
          registrationStatus: student.registrationStatus || 'pending',
          registrationComplete: student.registrationComplete || false,
          registrationDate: student.registrationDate || null,
          admissionDate: student.admissionDate || null,
          dateOfBirth: student.dateOfBirth || null,
          gender: student.gender || 'N/A',
          bloodGroup: student.bloodGroup || 'N/A',
          address: student.address || {},
          documents: student.documents || {},
          feeStructure: student.feeStructure || {},
          paymentHistory: student.paymentHistory || [],
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        }))

        const jsonString = JSON.stringify(jsonData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)

        setSuccess(`Exported ${data.length} students to JSON successfully`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Export to JSON error:', error)
      setError('Failed to export to JSON')
    }
    setShowExportMenu(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      registered: 'bg-purple-100 text-purple-800'
    }
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getRegistrationStatusBadge = (student) => {
    if (student.registrationComplete && student.admissionFeePaid && student.documentsUploaded) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>
    } else if (student.admissionFeePaid) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Payment Done, Pending Docs</span>
    } else if (student.documentsUploaded) {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Docs Uploaded, Pending Payment</span>
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending Registration</span>
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('')
    setFilterCourse('')
    setFilterPaymentStatus('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (loading && students.length === 0) {
    return <Loader />
  }

  return (
    <div className="p-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Management</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents || 0}</p>
              </div>
              <FaUserGraduate className="text-3xl opacity-75" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Students</p>
                <p className="text-2xl font-bold">{stats.activeStudents || 0}</p>
              </div>
              <FaCheckCircle className="text-3xl opacity-75" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Payment</p>
                <p className="text-2xl font-bold">{stats.pendingPayment || 0}</p>
              </div>
              <FaRupeeSign className="text-3xl opacity-75" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed Registration</p>
                <p className="text-2xl font-bold">{stats.completedRegistration || 0}</p>
              </div>
              <FaCheckCircle className="text-3xl opacity-75" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <FaPlus className="inline mr-2" />
            Add New Student
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2"
            >
              <FaDownload className="inline mr-2" />
              Export Data
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-t-lg"
                >
                  <FaFileExcel className="text-green-600" />
                  Export to Excel (.xlsx)
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-b-lg"
                >
                  <FaFileCode className="text-blue-600" />
                  Export to JSON (.json)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Input
                placeholder="Search by name, email, enrollment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <FaSearch className="inline mr-2" />
              Search
            </Button>
            {(searchTerm || filterStatus || filterCourse || filterPaymentStatus) && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No students found. Try adjusting your filters or add a new student.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {student.enrollmentId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-500">{student.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {student.course?.name || student.courseName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.admissionFeePaid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getRegistrationStatusBadge(student)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowDetailsModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowEditModal(true)
                        }}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowDeleteConfirm(true)
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {students.length} of {pagination.total} students
            </p>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddStudent
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchStudents()
          fetchStats()
          setShowAddModal(false)
        }}
        courses={courses}
      />

      <EditStudent
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={() => {
          fetchStudents()
          fetchStats()
          setShowEditModal(false)
        }}
        student={selectedStudent}
        courses={courses}
      />

      <StudentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedStudent(null)
        }}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.name}? This action cannot be undone and will remove all associated data including documents and payment records.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}

export default StudentManagement