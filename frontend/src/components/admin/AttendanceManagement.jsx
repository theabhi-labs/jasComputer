// src/components/admin/AttendanceManagement.jsx
import React, { useState, useEffect } from 'react'
import { attendanceService, batchService, studentService } from '../../services'
import { Card, Button, Input, Alert, Loader } from '../common'
import { FaCalendarCheck, FaCheck, FaTimes, FaClock, FaUserGraduate, FaSave } from 'react-icons/fa'
import { format } from 'date-fns'
import LoaderJAS from '../common/Loader'

const AttendanceManagement = () => {
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      fetchAttendance()
    }
  }, [selectedBatch, selectedDate])

  const fetchBatches = async () => {
    try {
      const response = await batchService.getAllBatches()
      if (response.success) {
        setBatches(response.data.batches || [])
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch batches')
    }
  }

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const studentsRes = await studentService.getAllStudents({ batch: selectedBatch, limit: 1000 })
      if (studentsRes.success) {
        const studentsList = studentsRes.data.students || []
        
        const initialAttendance = studentsList.map(student => ({
          studentId: student._id,
          studentName: student.name,
          enrollmentNo: student.enrollmentNo,
          status: 'absent',
          checkInTime: '',
          checkOutTime: '',
          remarks: ''
        }))
        
        const attendanceRes = await attendanceService.getAttendanceByBatchAndDate(selectedBatch, selectedDate)
        if (attendanceRes.success && attendanceRes.data.attendance) {
          attendanceRes.data.attendance.forEach(att => {
            const index = initialAttendance.findIndex(a => a.studentId === att.studentId._id)
            if (index !== -1) {
              initialAttendance[index].status = att.status
              initialAttendance[index].checkInTime = att.checkInTime || ''
              initialAttendance[index].checkOutTime = att.checkOutTime || ''
              initialAttendance[index].remarks = att.remarks || ''
            }
          })
        }
        setAttendance(initialAttendance)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (index, status) => {
    const updated = [...attendance]
    updated[index].status = status
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
      
      const response = await attendanceService.markAttendance({
        batchId: selectedBatch,
        date: selectedDate,
        attendances: attendanceData
      })
      
      if (response.success) {
        setSuccess('Attendance saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || 'Failed to save attendance')
      }
    } catch (error) {
      setError(error.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    percentage: attendance.length > 0 
      ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
      : 0
  }

  if (loading && !attendance.length) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Mark and manage daily attendance</p>
        </div>
        {selectedBatch && (
          <Button onClick={handleSave} isLoading={saving}>
            <FaSave className="inline mr-2" />
            Save Attendance
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} - {batch.course?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {selectedBatch && (
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={() => handleMarkAll('present')}>
                <FaCheck className="mr-1" /> Mark All Present
              </Button>
              <Button variant="secondary" onClick={() => handleMarkAll('absent')}>
                <FaTimes className="mr-1" /> Mark All Absent
              </Button>
            </div>
          )}
        </div>
      </Card>

      {selectedBatch && attendance.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 p-4">
              <p className="text-sm text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </Card>
            <Card className="bg-green-50 p-4">
              <p className="text-sm text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </Card>
            <Card className="bg-red-50 p-4">
              <p className="text-sm text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </Card>
            <Card className="bg-yellow-50 p-4">
              <p className="text-sm text-yellow-600">Late</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
            </Card>
            <Card className="bg-purple-50 p-4">
              <p className="text-sm text-purple-600">Attendance %</p>
              <p className="text-2xl font-bold text-purple-700">{stats.percentage}%</p>
            </Card>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Enrollment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{student.enrollmentNo}</td>
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
                      <input
                        type="time"
                        value={student.checkInTime}
                        onChange={(e) => {
                          const updated = [...attendance]
                          updated[index].checkInTime = e.target.value
                          setAttendance(updated)
                        }}
                        disabled={student.status === 'absent'}
                        className="px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={student.checkOutTime}
                        onChange={(e) => {
                          const updated = [...attendance]
                          updated[index].checkOutTime = e.target.value
                          setAttendance(updated)
                        }}
                        disabled={student.status === 'absent'}
                        className="px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => {
                          const updated = [...attendance]
                          updated[index].remarks = e.target.value
                          setAttendance(updated)
                        }}
                        placeholder="Remarks"
                        className="px-2 py-1 border rounded w-32"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

export default AttendanceManagement