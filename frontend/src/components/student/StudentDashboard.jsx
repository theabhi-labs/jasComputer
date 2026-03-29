import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services'
import { 
  FaMoneyBillWave, FaCalendarCheck, FaCertificate, 
  FaChartLine, FaBook, FaClock, FaBell
} from 'react-icons/fa'
import { Line, Doughnut } from 'react-chartjs-2'
import { format } from 'date-fns'
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

const StudentDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    attendancePercentage: 0,
    totalClasses: 0,
    presentClasses: 0,
    certificates: 0,
    upcomingTests: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      // ✅ Use dashboardService directly, no userType needed
      const response = await dashboardService.getStudentDashboard()
      
      if (response.success) {
        const data = response.data
        setDashboardData(data)
        setStats({
          totalFees: data.fee?.totalFees || 0,
          paidFees: data.fee?.paidAmount || 0,
          pendingFees: data.fee?.pendingAmount || 0,
          attendancePercentage: data.attendance?.percentage || 0,
          totalClasses: data.attendance?.totalDays || 0,
          presentClasses: data.attendance?.presentDays || 0,
          certificates: data.certificates?.length || 0,
          upcomingTests: data.upcomingTests?.length || 0
        })
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

  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [stats.presentClasses, stats.totalClasses - stats.presentClasses],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0
    }]
  }

  const attendanceTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Attendance %',
      data: [85, 88, 92, stats.attendancePercentage],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center max-w-md mx-auto">
        <p className="font-semibold">❌ {error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here's your academic progress overview</p>
        {dashboardData?.batch && (
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
            <FaBook className="w-4 h-4" />
            <span>{dashboardData.batch.name}</span>
            <span className="text-blue-400">•</span>
            <span>{dashboardData.batch.timing?.startTime} - {dashboardData.batch.timing?.endTime}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalFees.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Paid: ₹{stats.paidFees.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
              <p className="text-xs text-gray-500 mt-1">{stats.presentClasses}/{stats.totalClasses} days</p>
            </div>
            <FaCalendarCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Fees</p>
              <p className="text-2xl font-bold text-red-600">₹{stats.pendingFees.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Due soon</p>
            </div>
            <FaChartLine className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
              <p className="text-xs text-gray-500 mt-1">Earned</p>
            </div>
            <FaCertificate className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-72">
            <Line 
              data={attendanceTrendData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { min: 0, max: 100 } }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={attendanceData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Present: {stats.presentClasses} days</p>
            <p className="text-sm text-gray-600">Absent: {stats.totalClasses - stats.presentClasses} days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard