import React from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa'

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      icon: FaCheckCircle,
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      accent: 'bg-emerald-500',
      shadow: 'shadow-emerald-100'
    },
    error: {
      icon: FaTimesCircle,
      bg: 'bg-rose-50/80',
      text: 'text-rose-900',
      border: 'border-rose-200',
      accent: 'bg-rose-500',
      shadow: 'shadow-rose-100'
    },
    warning: {
      icon: FaExclamationCircle,      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      accent: 'bg-amber-500',
      shadow: 'shadow-amber-100'
    },
    info: {
      icon: FaInfoCircle,
      bg: 'bg-blue-50/80',
      text: 'text-blue-900',
      border: 'border-blue-200',
      accent: 'bg-blue-500',
      shadow: 'shadow-blue-100'
    }
  }

  const current = types[type]
  const Icon = current.icon

  return (
    // 'animate-in fade-in slide-in-from-top-4' se alert smooth entrance lega
    <div className={`
      relative overflow-hidden flex items-center justify-between 
      ${current.bg} ${current.text} ${current.border} ${current.shadow}
      backdrop-blur-md border rounded-2xl p-4 mb-4 shadow-lg 
      animate-in fade-in slide-in-from-top-4 duration-500
    `}>
      
      {/* Premium Side Accent Bar */}
      <div className={`absolute left-0 top-0 h-full w-1.5 ${current.accent}`} />

      <div className="flex items-center ml-2">
        <div className={`p-2 rounded-xl bg-white/50 mr-4 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold tracking-tight">{message}</span>
      </div>

      {onClose && (
        <button 
          onClick={onClose} 
          className="p-2 rounded-xl hover:bg-black/5 transition-colors group"
        >
          <FaTimes className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}
    </div>
  )
}

export default Alert