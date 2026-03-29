import { format, formatDistance, parseISO } from 'date-fns'
import { DATE_FORMATS } from './constants'

// Date Helpers
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(dateObj, formatStr)
  } catch (error) {
    return '-'
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME)
}

export const formatTimeAgo = (date) => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return formatDistance(dateObj, new Date(), { addSuffix: true })
  } catch (error) {
    return '-'
  }
}

// Number Helpers
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (number) => {
  if (!number && number !== 0) return '-'
  return new Intl.NumberFormat('en-IN').format(number)
}

export const formatPercentage = (value) => {
  if (!value && value !== 0) return '-'
  return `${value}%`
}

// String Helpers
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str, length = 50) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
}

// Object Helpers
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string') return obj.trim() === ''
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

// File Helpers
export const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || ''
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Color Helpers
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Status Helpers
export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'gray',
    completed: 'blue',
    dropped: 'red',
    pending: 'yellow',
    paid: 'green',
    partially_paid: 'blue',
    overdue: 'red',
    present: 'green',
    absent: 'red',
    late: 'yellow',
    issued: 'green',
    revoked: 'red'
  }
  return colors[status] || 'gray'
}

export const getStatusBadge = (status) => {
  const color = getStatusColor(status)
  return `bg-${color}-100 text-${color}-600`
}

// URL Helpers
export const getQueryParams = (url) => {
  const params = {}
  new URL(url).searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value)
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// Local Storage Helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}