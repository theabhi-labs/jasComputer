import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { studentService, courseService } from '../../services'
import { Card, Button, Alert } from '../common'
import { FaBook, FaClock, FaRupeeSign, FaCalendarAlt, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa'
import { format } from 'date-fns'

const StudentCourses = () => {
  const { user } = useAuth()
  const [currentCourse, setCurrentCourse] = useState(null)
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [courseRes, availableRes] = await Promise.all([
        studentService.getEnrolledCourses(),
        courseService.getAllCourses({ isActive: true })
      ])
      if (courseRes.success) setCurrentCourse(courseRes.data.course)
      if (availableRes.success) setAvailableCourses(availableRes.data.courses)
    } catch (error) {
      setError(error.message || 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading courses...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Current Course */}
      {currentCourse && (
        <Card title="Currently Enrolled" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-primary-100 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-primary-700">{currentCourse.name}</h3>
                <p className="text-primary-600 mt-1">{currentCourse.code}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-3" />
                  <span>Duration: {currentCourse.duration?.value} {currentCourse.duration?.unit}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaRupeeSign className="mr-3" />
                  <span>Total Fees: ₹{currentCourse.totalFees?.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-3" />
                  <span>Enrolled: {format(new Date(user?.admissionDate), 'dd MMM yyyy')}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Course Description</h4>
                <p className="text-gray-600 text-sm">{currentCourse.description}</p>
              </div>
              {currentCourse.eligibility && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility</h4>
                  <p className="text-gray-600 text-sm">{currentCourse.eligibility}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Batch Information */}
      {user?.batch && (
        <Card title="Batch Information" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Batch Name</p>
              <p className="font-medium">{user.batch.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timing</p>
              <p>{user.batch.timing?.startTime} - {user.batch.timing?.endTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days</p>
              <p>{user.batch.days?.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p>{user.batch.room || 'Not assigned'}</p>
            </div>
          </div>
          {user.batch.teachers?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Faculty</p>
              <div className="flex flex-wrap gap-2">
                {user.batch.teachers.map((teacher, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <FaChalkboardTeacher className="inline mr-1" />
                    {teacher.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Available Courses */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCourses.slice(0, 3).map((course) => (
          <Card key={course._id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <FaBook className="text-primary-600" />
              </div>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                New
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{course.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">{course.duration?.value} {course.duration?.unit}</span>
              <span className="font-bold text-primary-600">₹{course.totalFees?.toLocaleString()}</span>
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => alert('Contact admin for course upgrade')}>
              Request Upgrade
            </Button>
          </Card>
        ))}
      </div>

      {!currentCourse && (
        <Card>
          <div className="text-center py-12">
            <FaUserGraduate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No course enrolled yet</p>
            <Button className="mt-4" onClick={() => window.location.href = '/contact'}>
              Contact Admin
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default StudentCourses