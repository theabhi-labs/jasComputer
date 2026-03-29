import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { teacherService } from '../../services'
import { Card } from '../common'
import { 
  FaUsers, FaChalkboardTeacher, FaCalendarCheck, FaClock, 
  FaChartLine, FaUserGraduate, FaBook, FaCheckCircle, FaSpinner
} from 'react-icons/fa'
import { Line, Bar } from 'react-chartjs-2'
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
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await teacherService.getTeacherDashboard()
      console.log('Teacher Dashboard Response:', response)
      if (response.success) {
        setDashboard(response.data)
      } else {
        setError(response.message || 'Failed to load dashboard')
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // Stats Cards Data
  const stats = [
    { title: 'Total Students', value: dashboard?.overview?.totalStudents || 0, icon: FaUsers, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'My Batches', value: dashboard?.overview?.totalBatches || 0, icon: FaChalkboardTeacher, color: 'green', bg: 'bg-green-50', text: 'text-green-600' },
    { title: "Today's Classes", value: dashboard?.overview?.todayClasses || 0, icon: FaCalendarCheck, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
    { title: "Today's Attendance", value: dashboard?.overview?.todayAttendance || 0, icon: FaUserGraduate, color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { title: 'Avg Attendance', value: `${dashboard?.overview?.averageAttendance || 0}%`, icon: FaChartLine, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' }
  ]

  // Attendance Chart Data
  const attendanceData = {
    labels: dashboard?.batches?.map(b => b.batchName) || ['No Data'],
    datasets: [{
      label: 'Attendance %',
      data: dashboard?.batches?.map(b => parseFloat(b.percentage)) || [0],
      backgroundColor: '#3b82f6',
      borderRadius: 8
    }]
  }

  // Weekly Chart Data
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{
      label: 'Classes Conducted',
      data: dashboard?.weeklySchedule?.map(w => w.classes) || [0, 0, 0, 0, 0, 0],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Students Present',
      data: dashboard?.weeklySchedule?.map(w => w.present) || [0, 0, 0, 0, 0, 0],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center max-w-md">
          <p className="font-semibold">❌ {error}</p>
          <button 
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here's your teaching overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className={`${stat.bg} rounded-xl p-4 shadow-sm hover:shadow-md transition`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.text}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Batch-wise Attendance">
          {dashboard?.batches?.length > 0 ? (
            <div className="h-80">
              <Bar 
                data={attendanceData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { position: 'top' },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } }
                  },
                  scales: { y: { max: 100, ticks: { callback: (v) => `${v}%` } } }
                }} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaChartLine className="w-12 h-12 mb-3" />
              <p>No batch data available</p>
            </div>
          )}
        </Card>
        
        <Card title="Weekly Performance Trend">
          <div className="h-80">
            <Line 
              data={weeklyData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card title="Today's Classes">
        {dashboard?.todayClasses?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.todayClasses.map((cls, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-900">{cls.batchName}</p>
                  <p className="text-sm text-gray-500">{cls.subject} • {cls.timing}</p>
                  <p className="text-xs text-gray-400 mt-1">Room: {cls.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{cls.students} students</p>
                  <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                    Mark Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaCalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        )}
      </Card>

      {/* Recent Activities */}
      <Card title="Recent Activities">
        {dashboard?.recentActivities?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.type === 'attendance' ? 'bg-green-100' : 
                  activity.type === 'assignment' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {activity.type === 'attendance' ? <FaCheckCircle className="text-green-600" /> :
                   activity.type === 'assignment' ? <FaBook className="text-blue-600" /> : <FaUserGraduate className="text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </Card>

      {/* Pending Tasks */}
      {dashboard?.pendingTasks?.length > 0 && (
        <Card title="Pending Tasks">
          <div className="space-y-2">
            {dashboard.pendingTasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                  Due: {task.dueDate}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default TeacherDashboard