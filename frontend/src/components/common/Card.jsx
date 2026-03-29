// src/components/common/Card.jsx
import React from 'react'

const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  hover = false,
  loading = false
}) => {
  const hoverClasses = hover ? 'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-200/50' : ''

  if (loading) {
    return (
      <div className={`bg-white rounded-[2rem] border border-slate-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded-full w-2/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-50 rounded-full w-full"></div>
            <div className="h-4 bg-slate-50 rounded-full w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden ${hoverClasses} ${className}`}>
      {(title || subtitle || Icon) && (
        <div className={`px-8 py-6 border-b border-slate-50 ${headerClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
                </div>
              )}
              <div>
                {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`p-8 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/50 backdrop-blur-sm">{footer}</div>}
    </div>
  )
}

export const StatsCard = ({ title, value, emoji, trend, trendValue, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  }

  return (
    <Card className="hover:border-blue-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
          {trend && (
            <div className={`flex items-center mt-3 text-xs font-bold px-2 py-1 rounded-full w-fit ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <span className="mr-1">{trend === 'up' ? '📈' : '📉'}</span>
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-3xl ${colors[color]} shadow-inner`}>
          <span className="text-2xl">{emoji}</span>
        </div>
      </div>
    </Card>
  )
}
// Info Card
export const InfoCard = ({ title, description, actionText, onAction, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  }

  return (
    <Card className={`border ${colors[color]} hover:shadow-md transition-shadow`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${colors[color]} bg-opacity-30`}>
          <span className="text-xl">ℹ️</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {actionText} →
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Course Card
export const CourseCard = ({ course, onEnroll }) => {
  return (
    <Card hover className="h-full flex flex-col group p-0">
      {course.image && (
        <div className="relative h-52 overflow-hidden">
          <img 
            src={course.image} 
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
            {course.duration?.value} {course.duration?.unit}
          </div>
        </div>
      )}
      <div className="p-8 flex-1">
        <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Investment</p>
            <p className="text-2xl font-black text-slate-900">₹{course.totalFees?.toLocaleString()}</p>
          </div>
          <button
            onClick={() => onEnroll(course._id)}
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
          >
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </Card>
  )
}

// Student Card
export const StudentCard = ({ student, onView, onEdit, onDelete }) => {
  return (
    <Card className="group">
      <div className="flex items-center space-x-5">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-lg leading-none mb-1">{student.name}</h4>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{student.enrollmentNo}</p>
          <p className="text-xs text-slate-400 mt-1">{student.email}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <button onClick={() => onView(student._id)} className="text-slate-400 hover:text-blue-600 p-2">
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-50 flex gap-3">
        <button onClick={() => onEdit(student._id)} className="flex-1 py-2 text-xs font-bold uppercase tracking-tighter text-slate-600 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(student._id)} className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all">
          🗑️ Delete
        </button>
      </div>
    </Card>
  )
}

// Payment Card
export const PaymentCard = ({ fee, onPay }) => {
  const statusConfig = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-rose-100 text-rose-700'
  }

  const statusEmoji = {
    paid: '✅',
    pending: '⏳',
    overdue: '⚠️'
  }

  return (
    <Card className="border-l-4 border-l-blue-600">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Invoice Status</h4>
          <p className="text-sm font-bold text-slate-400 italic">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig[fee.status]}`}>
          {statusEmoji[fee.status]} {fee.status}
        </span>
      </div>
      <div className="space-y-4 p-5 bg-slate-50 rounded-[2rem] mb-6 border border-slate-100/50">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Total Tuition</span>
          <span className="text-slate-900 font-black">₹{fee.totalFees?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Successfully Paid</span>
          <span className="text-emerald-600">₹{fee.paidAmount?.toLocaleString()}</span>
        </div>
        <div className="h-px bg-slate-200"></div>
        <div className="flex justify-between text-sm">
          <span className="font-black text-slate-900">Outstanding Balance</span>
          <span className="font-black text-rose-600">₹{fee.pendingAmount?.toLocaleString()}</span>
        </div>
      </div>
      {fee.status !== 'paid' && (
        <button
          onClick={() => onPay(fee._id)}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          💳 Pay Now
        </button>
      )}
    </Card>
  )
}

// Attendance Card
export const AttendanceCard = ({ attendance, date, status, onUpdate }) => {
  const statusConfig = {
    present: 'bg-emerald-500 shadow-emerald-200',
    absent: 'bg-rose-500 shadow-rose-200',
    late: 'bg-amber-500 shadow-amber-200'
  }

  const statusEmoji = {
    present: '✅',
    absent: '❌',
    late: '⏰'
  }

  return (
    <div className="group bg-white border border-slate-100 p-5 rounded-[1.5rem] hover:shadow-xl hover:shadow-slate-200/40 transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-12 rounded-full ${statusConfig[status] || 'bg-slate-200'} shadow-lg`}></div>
          <div>
            <p className="font-bold text-slate-900 tracking-tight">{attendance.studentName}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attendance.enrollmentNo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 mb-1">{date}</p>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${statusConfig[status]}`}>
            {statusEmoji[status]} {status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Card