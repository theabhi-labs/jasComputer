import React from 'react'

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  
  // Premium Variants with Subtle Gradients & Ring focus
  const variants = {
    primary: 'bg-gradient-to-tr from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 ring-offset-2 focus:ring-2 focus:ring-blue-500',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm ring-offset-2 focus:ring-2 focus:ring-slate-200',
    danger: 'bg-gradient-to-tr from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300 text-white shadow-lg shadow-rose-500/25 focus:ring-2 focus:ring-rose-500',
    success: 'bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white shadow-lg shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900', // New: For subtle actions
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs uppercase tracking-wider font-bold',
    md: 'px-6 py-2.5 text-sm font-semibold',
    lg: 'px-8 py-3.5 text-base font-bold tracking-tight'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        relative overflow-hidden inline-flex items-center justify-center
        rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {/* Loading State with Premium Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Content wrapper to handle loading opacity */}
      <span className={`${isLoading ? 'opacity-0' : 'opacity-100'} flex items-center gap-2 transition-opacity duration-200`}>
        {children}
      </span>
    </button>
  )
}

export default Button