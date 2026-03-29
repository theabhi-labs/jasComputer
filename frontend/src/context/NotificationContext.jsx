import React, { createContext, useState, useCallback, useContext } from 'react'
import toast from 'react-hot-toast'

export const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    if (notification.toast !== false) {
      switch (notification.type) {
        case 'success':
          toast.success(notification.message)
          break
        case 'error':
          toast.error(notification.message)
          break
        case 'warning':
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg`}>
              {notification.message}
            </div>
          ))
          break
        default:
          toast(notification.message)
      }
    }
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const removed = prev.find(n => n.id === id)
      if (removed && !removed.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1))
      }
      return prev.filter(n => n.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const showError = useCallback((error, defaultMessage = 'Something went wrong') => {
    const message = error?.message || error?.data?.message || defaultMessage
    addNotification({
      type: 'error',
      message,
      autoClose: 5000
    })
  }, [addNotification])

  const showSuccess = useCallback((message) => {
    addNotification({
      type: 'success',
      message,
      autoClose: 3000
    })
  }, [addNotification])

  const showInfo = useCallback((message) => {
    addNotification({
      type: 'info',
      message,
      autoClose: 4000
    })
  }, [addNotification])

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showError,
    showSuccess,
    showInfo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}