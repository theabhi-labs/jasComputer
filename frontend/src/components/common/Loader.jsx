import React from 'react';

const LoaderJAS = ({ message = "Loading Excellence..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden bg-slate-950">
      {/* Premium Backdrop Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>

      <div className="relative flex flex-col items-center">
        
        {/* Unique "JAS" Liquid Fill Container */}
        <div className="relative mb-10">
          <svg
            viewBox="0 0 200 80"
            className="w-48 h-24 md:w-64 md:h-32 select-none"
          >
            <defs>
              {/* Liquid Pattern */}
              <pattern
                id="liquid"
                patternUnits="userSpaceOnUse"
                width="200"
                height="200"
                viewBox="0 0 100 100"
              >
                <path
                  d="M 0 70 Q 25 60 50 70 T 100 70 V 100 H 0 Z"
                  fill="url(#liquidGradient)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0,0"
                    to="100,0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
              </pattern>

              {/* Gradient for the Liquid */}
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* Background Text (Outline) */}
            <text
              x="50%"
              y="50%"
              dy=".35em"
              textAnchor="middle"
              className="text-[60px] font-black tracking-tighter"
              style={{
                fill: 'transparent',
                stroke: 'rgba(59, 130, 246, 0.2)',
                strokeWidth: '1px',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              JAS
            </text>

            {/* Foreground Text (Filled with Liquid) */}
            <text
              x="50%"
              y="50%"
              dy=".35em"
              textAnchor="middle"
              className="text-[60px] font-black tracking-tighter"
              style={{
                fill: 'url(#liquid)',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              JAS
              <animate
                attributeName="y"
                from="20"
                to="-20"
                dur="3s"
                repeatCount="indefinite"
              />
            </text>
          </svg>
          
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-4 bg-blue-500/10 blur-3xl -z-10 animate-pulse"></div>
        </div>

        {/* Branding & Message */}
        <div className="text-center">
          <h3 className="text-white text-xl font-bold tracking-widest mb-1">
            JAS<span className="text-blue-500">.Computer</span>
          </h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] animate-pulse">
            {message}
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-40 h-[2px] bg-slate-800 mt-6 overflow-hidden rounded-full">
          <div className="h-full bg-blue-500 w-1/2 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoaderJAS;