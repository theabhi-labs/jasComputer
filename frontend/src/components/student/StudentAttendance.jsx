import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { studentService } from '../../services'
import { Card, Button, Alert } from '../common'
import { FaCalendarAlt, FaCheck, FaTimes, FaClock, FaChartLine, FaDownload, FaArrowLeft } from 'react-icons/fa'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const StudentAttendance = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 })
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchAttendance()
  }, [dateRange])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const response = await studentService.getStudentAttendance(user._id, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      if (response.success) {
        setAttendance(response.data.attendances)
        setSummary(response.data.stats)
        // Process monthly data for chart
        const monthly = processMonthlyData(response.data.attendances)
        setMonthlyData(monthly)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (attendances) => {
    const days = []
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const attendance = attendances.find(a => format(new Date(a.date), 'yyyy-MM-dd') === date)
      days.unshift({
        date,
        status: attendance?.status || 'absent',
        checkIn: attendance?.checkInTime,
        checkOut: attendance?.checkOutTime
      })
    }
    return days.slice(-30)
  }

  const getStatusIcon = (status) => {
    const icons = {
      present: <FaCheck className="text-green-500" />,
      absent: <FaTimes className="text-red-500" />,
      late: <FaClock className="text-yellow-500" />
    }
    return icons[status] || <FaTimes className="text-gray-400" />
  }

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-600',
      absent: 'bg-red-100 text-red-600',
      late: 'bg-yellow-100 text-yellow-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const attendanceChartData = {
    labels: monthlyData.map(d => format(new Date(d.date), 'dd MMM')),
    datasets: [{
      label: 'Attendance',
      data: monthlyData.map(d => d.status === 'present' ? 1 : d.status === 'late' ? 0.5 : 0),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const summaryChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [summary.present, summary.absent, summary.late],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0
    }]
  }

  const handleExport = () => {
    // In production, export to CSV/PDF
    alert('Export functionality coming soon')
  }

  if (loading) {
    return <div className="text-center py-12">Loading attendance...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <Button variant="outline" onClick={handleExport}>
          <FaDownload className="inline mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50">
          <p className="text-sm text-blue-600">Total Days</p>
          <p className="text-2xl font-bold text-blue-700">{summary.total}</p>
        </Card>
        <Card className="bg-green-50">
          <p className="text-sm text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{summary.present}</p>
        </Card>
        <Card className="bg-red-50">
          <p className="text-sm text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
        </Card>
        <Card className="bg-yellow-50">
          <p className="text-sm text-yellow-600">Attendance %</p>
          <p className="text-2xl font-bold text-yellow-700">{summary.percentage}%</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Attendance Trend (Last 30 Days)">
          <div className="h-64">
            <Line 
              data={attendanceChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 1, ticks: { callback: (v) => v === 1 ? 'Present' : v === 0.5 ? 'Late' : 'Absent' } } }
              }} 
            />
          </div>
        </Card>
        
        <Card title="Attendance Summary">
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={summaryChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Date Filter */}
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
          <Button onClick={fetchAttendance}>Apply Filter</Button>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card title="Attendance Details">
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        {format(new Date(record.date), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.checkInTime || '-'}</td>
                    <td className="px-4 py-3 text-sm">{record.checkOutTime || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No attendance records found for the selected period</p>
        )}
      </Card>
    </div>
  )
}

export default StudentAttendance