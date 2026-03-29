import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { teacherService } from '../../services'
import { Card, Button, Input, Alert, Loader } from '../common'
import { FaCheck, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import { format } from 'date-fns'

const MarkAttendance = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const batchId = searchParams.get('batch')
  const studentId = searchParams.get('student')
  
  const [batch, setBatch] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ✅ Use useCallback to memoize fetch function
  const fetchBatchAndStudents = useCallback(async () => {
    if (!batchId) return
    
    setLoading(true)
    try {
      // Fetch batch details
      const batchRes = await teacherService.getBatchDetails(batchId)
      if (batchRes.success) {
        setBatch(batchRes.data.batch)
      }

      // Fetch students
      const studentsRes = await teacherService.getBatchStudents(batchId)
      if (studentsRes.success) {
        const studentsList = studentsRes.data.students || []

        // Fetch existing attendance for this date
        const attendanceRes = await teacherService.getBatchAttendance(batchId, selectedDate)
        
        // Initialize attendance array
        const initialAttendance = studentsList.map(student => ({
          studentId: student._id,
          studentName: student.name,
          enrollmentNo: student.enrollmentNo,
          status: 'absent',
          checkInTime: '',
          checkOutTime: '',
          remarks: ''
        }))

        // Override with existing attendance
        if (attendanceRes.success && attendanceRes.data.attendance) {
          attendanceRes.data.attendance.forEach(att => {
            const index = initialAttendance.findIndex(a => a.studentId === att.studentId._id)
            if (index !== -1) {
              initialAttendance[index].status = att.status
              initialAttendance[index].checkInTime = att.checkInTime || ''
              initialAttendance[index].checkOutTime = att.checkOutTime || ''
              initialAttendance[index].remarks = att.remarks || ''
              initialAttendance[index].attendanceId = att._id
            }
          })
        }

        // Filter by specific student if provided
        if (studentId) {
          const filtered = initialAttendance.filter(s => s.studentId === studentId)
          setAttendance(filtered)
        } else {
          setAttendance(initialAttendance)
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [batchId, selectedDate, studentId])

  // ✅ Only run when batchId exists
  useEffect(() => {
    if (batchId) {
      fetchBatchAndStudents()
    } else {
      setLoading(false)
    }
  }, [batchId, fetchBatchAndStudents])

  const handleStatusChange = (index, status) => {
    const updated = [...attendance]
    updated[index].status = status
    setAttendance(updated)
  }

  const handleTimeChange = (index, field, value) => {
    const updated = [...attendance]
    updated[index][field] = value
    setAttendance(updated)
  }

  const handleMarkAll = (status) => {
    const updated = attendance.map(att => ({ ...att, status }))
    setAttendance(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const attendanceData = attendance.map(att => ({
        studentId: att.studentId,
        status: att.status,
        checkInTime: att.checkInTime,
        checkOutTime: att.checkOutTime,
        remarks: att.remarks
      }))

      const response = await teacherService.markAttendance({
        batchId,
        date: selectedDate,
        attendances: attendanceData
      })

      if (response.success) {
        setSuccess('Attendance saved successfully!')
        // Refresh data after save
        fetchBatchAndStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || 'Failed to save attendance')
      }
    } catch (err) {
      setError(err.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length
  }

  // Show loading state
  if (loading) {
    return <Loader />
  }

  // If no batchId, show message with button
  if (!batchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <span className="text-6xl mb-4 block">📋</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Batch Selected</h2>
          <p className="text-gray-500 mb-4">Please select a batch to mark attendance</p>
          <Button onClick={() => navigate('/dashboard/my-batches')}>
            Go to My Batches
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/my-batches')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Batches
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-1">Batch: {batch?.name}</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <FaSave className="inline mr-2" />
          Save Attendance
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Date Selector and Stats */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleMarkAll('present')}>
                <FaCheck className="mr-1" /> Mark All Present
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleMarkAll('absent')}>
                <FaTimes className="mr-1" /> Mark All Absent
              </Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600">Present</p>
              <p className="text-xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-600">Absent</p>
              <p className="text-xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-yellow-600">Late</p>
              <p className="text-xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card>
        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found in this batch</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {student.enrollmentNo}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.status === 'present' ? 'bg-green-100 text-green-600' :
                          student.status === 'absent' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={student.checkInTime}
                        onChange={(e) => handleTimeChange(index, 'checkInTime', e.target.value)}
                        className="w-28"
                        disabled={student.status === 'absent'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="time"
                        value={student.checkOutTime}
                        onChange={(e) => handleTimeChange(index, 'checkOutTime', e.target.value)}
                        className="w-28"
                        disabled={student.status === 'absent'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => handleTimeChange(index, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        className="w-32"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default MarkAttendance