import React, { useEffect } from 'react'
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'

// 1. Base Modal - The Foundation
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true 
}) => {
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z- flex items-center justify-center p-4 sm:p-6"
      onClick={handleOverlayClick}
    >
      {/* Premium Glassmorphic Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>

      {/* Modal Content Card */}
      <div className={`
        relative bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 
        ${sizes[size]} w-full max-h-[90vh] flex flex-col overflow-hidden
        animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 ease-out
      `}>
        
        {/* Header - Premium Minimalist Style */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <div className="h-1 w-8 bg-blue-600 rounded-full mt-1"></div>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body - Clean & Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}

// 2. Confirmation Modal - Action Oriented
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger'
}) => {
  const variants = {
    danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
    primary: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
  }

  const icons = {
    danger: <FaExclamationTriangle className="text-rose-500 w-12 h-12 mb-4" />,
    success: <FaCheckCircle className="text-emerald-500 w-12 h-12 mb-4" />,
    primary: <FaInfoCircle className="text-blue-500 w-12 h-12 mb-4" />
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        {icons[confirmVariant] || icons.primary}
        <p className="text-slate-600 font-medium mb-8 leading-relaxed px-4">{message}</p>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${variants[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// 3. Form Modal - Integrated Submit
export const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit,
  submitText = 'Save Changes',
  cancelText = 'Cancel',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="min-h-[100px]">
          {children}
        </div>
        
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                </div>
            ) : submitText}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// 4. Large Modal - For Complex Content
export const LargeModal = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        {children}
      </div>
    </Modal>
  )
}

export default Modal