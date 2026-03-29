import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { teacherService } from '../../services'
import { Card, Button, Input, Alert, Loader } from '../common'
import { FaDownload, FaCalendarAlt, FaChartLine, FaEye } from 'react-icons/fa'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { Line, Bar } from 'react-chartjs-2'

const ViewAttendance = () => {
  const [searchParams] = useSearchParams()
  const batchId = searchParams.get('batch')
  
  const [batch, setBatch] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (batchId) {
      fetchData()
    }
  }, [batchId, dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch batch details
      const batchRes = await teacherService.getBatchDetails(batchId)
      if (batchRes.success) {
        setBatch(batchRes.data.batch)
      }

      // Fetch attendance report
      const reportRes = await teacherService.getAttendanceReport(batchId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      if (reportRes.success) {
        setAttendanceData(reportRes.data)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const attendanceTrendData = {
    labels: attendanceData?.dailySummary?.map(d => format(new Date(d.date), 'dd MMM')) || [],
    datasets: [{
      label: 'Present Students',
      data: attendanceData?.dailySummary?.map(d => d.present) || [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Total Students',
      data: attendanceData?.dailySummary?.map(d => d.total) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const studentWiseData = {
    labels: attendanceData?.studentSummary?.map(s => s.student?.name) || [],
    datasets: [{
      label: 'Attendance Percentage',
      data: attendanceData?.studentSummary?.map(s => parseFloat(s.percentage)) || [],
      backgroundColor: '#3b82f6',
      borderRadius: 8
    }]
  }

  const handleExport = async () => {
    try {
      const response = await teacherService.exportAttendanceReport(batchId, dateRange)
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_report_${batchId}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setError('Failed to export report')
    }
  }

  if (!batchId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">View Attendance</h1>
        <Card>
          <div className="text-center py-12">
            <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Please select a batch to view attendance</p>
            <Button className="mt-4" onClick={() => window.location.href = '/dashboard/my-batches'}>
              View My Batches
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
          <p className="text-gray-600 mt-1">Batch: {batch?.name}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <FaDownload className="inline mr-2" />
          Export Report
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button onClick={fetchData}>Apply Filter</Button>
        </div>
      </Card>

      {attendanceData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50">
              <p className="text-sm text-blue-600">Total Days</p>
              <p className="text-2xl font-bold text-blue-700">{attendanceData.totalDays}</p>
            </Card>
            <Card className="bg-green-50">
              <p className="text-sm text-green-600">Average Attendance</p>
              <p className="text-2xl font-bold text-green-700">{attendanceData.averageAttendance}%</p>
            </Card>
            <Card className="bg-purple-50">
              <p className="text-sm text-purple-600">Total Students</p>
              <p className="text-2xl font-bold text-purple-700">{attendanceData.totalStudents}</p>
            </Card>
            <Card className="bg-yellow-50">
              <p className="text-sm text-yellow-600">Highest Attendance</p>
              <p className="text-2xl font-bold text-yellow-700">{attendanceData.highestAttendance}%</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Attendance Trend">
              <div className="h-80">
                <Line 
                  data={attendanceTrendData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } }
                  }} 
                />
              </div>
            </Card>

            <Card title="Student-wise Attendance">
              <div className="h-80 overflow-y-auto">
                <Bar 
                  data={studentWiseData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { position: 'top' } }
                  }} 
                />
              </div>
            </Card>
          </div>

          {/* Student-wise Details Table */}
          <Card title="Student-wise Attendance Details">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceData.studentSummary?.map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.student?.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {student.student?.enrollmentNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {student.present}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {student.absent}
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        {student.late}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className={student.percentage >= 75 ? 'text-green-600' : student.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              student.percentage >= 75 ? 'bg-green-500' :
                              student.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default ViewAttendance