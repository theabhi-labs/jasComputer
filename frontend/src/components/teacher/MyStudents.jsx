// src/components/teacher/MyStudents.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { teacherService } from '../../services'
import { Card, Button, Input, Alert, Modal } from '../common'
import { FaSearch, FaEye, FaChartLine, FaDownload, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa'  // ← Add FaUsers if needed
import { format } from 'date-fns'

// If you need FaUsers, add it to the import above:
// import { FaUsers, FaSearch, FaEye, FaChartLine, FaDownload, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa'

const MyStudents = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [error, setError] = useState('')
  const [batchName, setBatchName] = useState('')
  const batchId = searchParams.get('batch')

  useEffect(() => {
    if (batchId) {
      fetchStudents()
    } else {
      setLoading(false)
    }
  }, [batchId])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await teacherService.getBatchStudents(batchId)
      if (response.success) {
        setStudents(response.data.students || [])
        setBatchName(response.data.batchName || 'Batch')
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading students...</div>
  }

  if (!batchId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Students</h1>
        <Card>
          <div className="text-center py-12">
            <span className="text-6xl">👨‍🎓</span>
            <p className="text-gray-500 mt-4">Please select a batch to view students</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard/my-batches')}>
              View My Batches
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 mt-1">Batch: {batchName}</p>
        </div>
        <Button variant="outline">
          <FaDownload className="inline mr-2" />
          Export List
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Search */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, enrollment or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="secondary" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Enrollment No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Admission Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{student.enrollmentNo}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.course?.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaEnvelope className="w-3 h-3 mr-1" />
                          {student.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaPhone className="w-3 h-3 mr-1" />
                          {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`font-semibold ${getAttendanceColor(student.attendancePercentage || 85)}`}>
                          {student.attendancePercentage || 85}%
                        </span>
                        <div className="w-20 h-1 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-1 rounded-full ${
                              (student.attendancePercentage || 85) >= 75 ? 'bg-green-500' :
                              (student.attendancePercentage || 85) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendancePercentage || 85}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(student.admissionDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowDetailsModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"
                        title="View Performance"
                      >
                        <FaChartLine />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchTerm ? 'No students found matching your search' : 'No students in this batch'}
          </p>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Total: {filteredStudents.length} students</p>
        </div>
      </Card>

      {/* Student Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Student Details" size="lg">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 border-b pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedStudent.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                <p className="text-gray-500">{selectedStudent.enrollmentNo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{selectedStudent.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Father's Name</p>
                <p>{selectedStudent.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p>{format(new Date(selectedStudent.dateOfBirth), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p>{selectedStudent.course?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p>{batchName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Admission Date</p>
                <p>{format(new Date(selectedStudent.admissionDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedStudent.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {selectedStudent.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedStudent.address && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Address</p>
                <p className="text-gray-600">
                  {selectedStudent.address.street}, {selectedStudent.address.city}, 
                  {selectedStudent.address.state} - {selectedStudent.address.pincode}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button size="sm" variant="outline">
                <FaChartLine className="inline mr-1" /> View Performance
              </Button>
              <Button size="sm" onClick={() => navigate(`/dashboard/mark-attendance?batch=${batchId}&student=${selectedStudent._id}`)}>
                Mark Attendance
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyStudents