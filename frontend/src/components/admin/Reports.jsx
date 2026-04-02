import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../common'
import { FaDownload, FaChartLine, FaUsers, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'
import { Line, Bar, Pie } from 'react-chartjs-2'
import LoaderJAS from '../common/Loader'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

// Register all required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const Reports = () => {
  const [reportType, setReportType] = useState('fee')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [reportType, dateRange])

  const fetchReport = async () => {
    setLoading(true)
    try {
      let data
      if (reportType === 'fee') {
        const response = await feeService.getFeeSummary()
        data = response.data
      } else if (reportType === 'student') {
        const response = await studentService.getStudentStats()
        data = response.data
      } else if (reportType === 'attendance') {
        // Fetch attendance summary
        data = {}
      }
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Implement export to CSV/PDF
    alert('Export functionality coming soon')
  }

  const feeChartData = {
    labels: reportData?.monthlyCollection?.map(m => m.monthName) || [],
    datasets: [{
      label: 'Fee Collection',
      data: reportData?.monthlyCollection?.map(m => m.total) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  }

  const studentChartData = {
    labels: reportData?.courseWise?.map(c => c.courseName) || [],
    datasets: [{
      label: 'Students',
      data: reportData?.courseWise?.map(c => c.count) || [],
      backgroundColor: '#3b82f6'
    }]
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <Button onClick={handleExport}>
          <FaDownload className="inline mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="fee">Fee Collection Report</option>
              <option value="student">Student Enrollment Report</option>
              <option value="attendance">Attendance Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <Button variant="secondary" onClick={fetchReport}>
            Generate
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading report...</div>
      ) : reportData && (
        <>
          {/* Summary Cards */}
          {reportType === 'fee' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50">
                <FaMoneyBillWave className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-green-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-700">₹{reportData.totalPaid?.toLocaleString() || 0}</p>
              </Card>
              <Card className="bg-yellow-50">
                <FaMoneyBillWave className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-sm text-yellow-600">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-700">₹{reportData.totalPending?.toLocaleString() || 0}</p>
              </Card>
              <Card className="bg-red-50">
                <FaChartLine className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-sm text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-700">{reportData.overdueCount || 0}</p>
              </Card>
            </div>
          )}

          {reportType === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50">
                <FaUsers className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{reportData.total || 0}</p>
              </Card>
              <Card className="bg-green-50">
                <FaUsers className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-700">{reportData.active || 0}</p>
              </Card>
              <Card className="bg-yellow-50">
                <FaUsers className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-sm text-yellow-600">Completed</p>
                <p className="text-2xl font-bold text-yellow-700">{reportData.completed || 0}</p>
              </Card>
              <Card className="bg-red-50">
                <FaUsers className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-sm text-red-600">Dropped</p>
                <p className="text-2xl font-bold text-red-700">{reportData.dropped || 0}</p>
              </Card>
            </div>
          )}

          {/* Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">
              {reportType === 'fee' ? 'Monthly Fee Collection Trend' : 'Course-wise Student Distribution'}
            </h3>
            <div className="h-80">
              {reportType === 'fee' ? (
                <Line data={feeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <Bar data={studentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          </Card>

          {/* Detailed Table */}
          {reportType === 'fee' && reportData?.statusWise && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Status-wise Breakdown</h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.statusWise.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 capitalize">{item._id}</td>
                      <td className="px-4 py-2 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {reportType === 'student' && reportData?.courseWise && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Course-wise Details</h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Course</th>
                    <th className="px-4 py-2 text-right">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.courseWise.map((course, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{course.courseName}</td>
                      <td className="px-4 py-2 text-right">{course.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default Reports