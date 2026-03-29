import React from 'react'

const Loader = ({ message = "Loading Excellence..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z- overflow-hidden">
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500"></div>

      {/* Floating Loader Card */}
      <div className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 border border-slate-100 flex flex-col items-center max-w-xs w-full mx-4 animate-in fade-in zoom-in duration-300">
        
        {/* The "Brain" of the Loader - Unique Animation */}
        <div className="relative w-20 h-20 mb-8">
          {/* Outer Ring - Pulse */}
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
          
          {/* Middle Ring - Faster Spin */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin duration-700"></div>
          
          {/* Inner Circle - Steady Glow */}
          <div className="absolute inset-4 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-lg shadow-blue-400/50 animate-pulse rotate-45"></div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none italic">
            Coaching<span className="text-blue-600">.</span>MS
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            {message}
          </p>
        </div>

        {/* Bottom Decorative Dots */}
        <div className="flex gap-1.5 mt-6">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

export default Loader