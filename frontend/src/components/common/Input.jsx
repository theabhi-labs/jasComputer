import React from 'react'

const Input = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
  icon: Icon, // Naya prop: Leading icon ke liye
  ...props 
}) => {
  return (
    <div className="group mb-6 w-full">
      {/* Label with Premium Typography */}
      {label && (
        <label className="flex items-center text-[13px] font-bold text-slate-500 mb-2 tracking-wide uppercase group-focus-within:text-blue-600 transition-colors">
          {label}
          {required && <span className="text-rose-500 ml-1.5 text-lg leading-none">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Optional Icon Styling */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Icon size={18} />
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full transition-all duration-300 ease-in-out
            bg-slate-50/50 hover:bg-white border-2 
            rounded-2xl text-slate-900 text-sm font-medium
            placeholder:text-slate-400 placeholder:font-normal
            ${Icon ? 'pl-12 pr-4' : 'px-5'} py-3.5
            ${error 
              ? 'border-rose-100 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
              : 'border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:shadow-xl focus:shadow-blue-500/5'
            }
            outline-none
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Animated Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <div className="w-1 h-1 bg-rose-500 rounded-full" />
          <p className="text-xs font-bold text-rose-500 tracking-tight italic">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Input