import React, { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../../services'
import { Card } from '../common'
import { Doughnut, Bar } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, UserCheck, BookOpen, Layers, 
  CreditCard, Calendar, Clock, Star,
  Download, RefreshCw, ChevronRight, Mail,
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
  TrendingUp, TrendingDown, Activity, Bell,
  Shield, Sparkles, Zap, Eye, Settings
} from 'lucide-react'
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
)

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [hoveredStat, setHoveredStat] = useState(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const response = await dashboardService.getAdminDashboard()
      if (response.success) {
        setDashboard(response.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Dashboard Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 300000) // Auto-refresh every 5 mins
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const stats = [
    { 
      title: 'Total Students', 
      value: dashboard?.overview?.totalStudents || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      trend: '+12.5%', 
      trendUp: true,
      detail: 'Active enrollments',
      secondaryValue: `${dashboard?.overview?.activeStudents || 0} active`
    },
    { 
      title: 'Total Teachers', 
      value: dashboard?.overview?.totalTeachers || 0, 
      icon: UserCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      trend: '+2.1%', 
      trendUp: true,
      detail: 'Faculty members',
      secondaryValue: 'All active'
    },
    { 
      title: 'Active Courses', 
      value: dashboard?.overview?.totalCourses || 0, 
      icon: BookOpen, 
      color: 'text-violet-600', 
      bg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      trend: '+4.3%', 
      trendUp: true,
      detail: 'Live courses',
      secondaryValue: '100% online'
    },
    { 
      title: 'Ongoing Batches', 
      value: dashboard?.overview?.totalBatches || 0, 
      icon: Layers, 
      color: 'text-indigo-600', 
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      trend: '+1.2%', 
      trendUp: true,
      detail: 'Current sessions',
      secondaryValue: 'Starting soon'
    },
    { 
      title: 'Revenue', 
      value: `₹${(dashboard?.overview?.totalFeesCollected / 1000).toFixed(1)}K`, 
      icon: CreditCard, 
      color: 'text-amber-600', 
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      trend: '+18.7%', 
      trendUp: true,
      detail: 'This month',
      secondaryValue: '↑ vs last month'
    },
    { 
      title: 'Attendance', 
      value: `${dashboard?.overview?.todayAttendance || 0}%`, 
      icon: Calendar, 
      color: 'text-rose-600', 
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100',
      trend: '+5.4%', 
      trendUp: true,
      detail: 'Today\'s rate',
      secondaryValue: '↑ from yesterday'
    },
    { 
      title: 'Dues Pending', 
      value: `₹${(dashboard?.overview?.pendingFees / 1000).toFixed(1)}K`, 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      trend: '-2.1%', 
      trendUp: false,
      detail: 'Overdue payments',
      secondaryValue: 'Improving'
    },
    { 
      title: 'Active Now', 
      value: dashboard?.overview?.activeStudents || 0, 
      icon: Star, 
      color: 'text-sky-600', 
      bg: 'bg-gradient-to-br from-sky-50 to-sky-100',
      trend: '+10.2%', 
      trendUp: true,
      detail: 'Currently online',
      secondaryValue: 'Peak hour'
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-8 text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">
        Loading insights...
      </p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50"
    >
      <div className="p-6 lg:p-10 space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 rounded-xl">
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                Management Suite
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              System Insights
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              Welcome back, Administrator
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-xs text-emerald-600 font-mono">Live Data</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-600 font-mono">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-sm font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
            >
              <Download size={18} /> Export Report
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchDashboard} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onHoverStart={() => setHoveredStat(i)}
              onHoverEnd={() => setHoveredStat(null)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <stat.icon size={24} strokeWidth={1.8} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl ${
                    stat.trendUp 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{stat.detail}</span>
                    <span className="text-slate-400 font-mono">{stat.secondaryValue}</span>
                  </div>
                </div>

                {/* Animated progress indicator */}
                <AnimatePresence>
                  {hoveredStat === i && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full origin-left"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section - Enhanced */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Doughnut Chart Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 lg:p-8 h-full hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full" />
                  Student Demographics
                </h4>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-600">Gender Ratio</span>
                </div>
              </div>
              <div className="relative flex items-center justify-center py-8">
                <div className="w-full max-w-[280px] mx-auto">
                  <Doughnut 
                    data={{
                      labels: dashboard?.distribution?.gender?.map(g => g._id?.toUpperCase() || 'UNKNOWN') || [],
                      datasets: [{
                        data: dashboard?.distribution?.gender?.map(g => g.count) || [],
                        backgroundColor: ['#6366f1', '#f43f5e', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 15,
                        borderRadius: 8,
                      }]
                    }} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: true,
                      cutout: '75%',
                      plugins: { 
                        legend: { 
                          position: 'bottom', 
                          labels: { 
                            boxWidth: 10, 
                            usePointStyle: true, 
                            font: { weight: '700', size: 11 },
                            padding: 16,
                            color: '#334155'
                          } 
                        },
                        tooltip: {
                          backgroundColor: '#1e293b',
                          titleColor: '#f1f5f9',
                          bodyColor: '#cbd5e1',
                          padding: 12,
                          cornerRadius: 12,
                        }
                      } 
                    }} 
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {dashboard?.overview?.totalStudents}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Students</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bar Chart Card - Enhanced */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 lg:p-8 h-full hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full" />
                  Course Enrollment Analytics
                </h4>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                      Real-time Data
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[340px]">
                <Bar 
                  data={{
                    labels: dashboard?.distribution?.courses?.map(c => c.courseName) || [],
                    datasets: [{
                      label: 'Enrolled Students',
                      data: dashboard?.distribution?.courses?.map(c => c.count) || [],
                      backgroundColor: 'rgba(99, 102, 241, 0.8)',
                      hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
                      borderRadius: 12,
                      barPercentage: 0.65,
                      categoryPercentage: 0.8,
                    }]
                  }} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: { 
                      y: { 
                        grid: { display: false, drawBorder: false }, 
                        border: { display: false }, 
                        ticks: { 
                          font: { weight: '600', size: 11 }, 
                          color: '#94a3b8',
                          stepSize: 1
                        },
                        title: {
                          display: true,
                          text: 'Number of Students',
                          color: '#64748b',
                          font: { size: 11, weight: '600' }
                        }
                      },
                      x: { 
                        grid: { display: false }, 
                        border: { display: false }, 
                        ticks: { 
                          font: { weight: '600', size: 11 }, 
                          color: '#475569',
                          maxRotation: 45,
                          minRotation: 45
                        } 
                      }
                    },
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                          label: (context) => ` Enrolled: ${context.raw} students`
                        }
                      }
                    },
                    layout: {
                      padding: { top: 20, bottom: 20 }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Section - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          {/* Recent Students Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="group"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg tracking-tight">New Admissions</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Recently enrolled students</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ x: 4 }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <ChevronRight className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                </motion.button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {dashboard?.recentStudents?.map((student, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 6, backgroundColor: '#f8fafc' }}
                      key={i} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight">{student.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1 font-mono">{student.enrollmentNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-wider">
                          {student.course?.name || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {(!dashboard?.recentStudents || dashboard.recentStudents.length === 0) && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No recent admissions</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Inquiries Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="group"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl">
                    <Mail className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg tracking-tight">Active Inquiries</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Pending follow-ups</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ x: 4 }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                </motion.button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {dashboard?.recentInquiries?.map((inq, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 6 }}
                      key={i} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Mail className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight">{inq.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[180px] mt-1">{inq.email}</p>
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          inq.status === 'pending' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {inq.status === 'pending' ? 'Pending' : 'Resolved'}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {(!dashboard?.recentInquiries || dashboard.recentInquiries.length === 0) && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No active inquiries</p>
                </div>
              )}
              
              <motion.button 
                whileHover={{ backgroundColor: '#f1f5f9' }}
                className="w-full mt-6 py-3 text-[11px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-wider transition-all border-t border-slate-100 rounded-b-2xl flex items-center justify-center gap-2"
              >
                <Settings size={12} />
                Manage CRM Records
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>
  {`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `}
</style>
    </motion.div>
  )
}

export default AdminDashboard