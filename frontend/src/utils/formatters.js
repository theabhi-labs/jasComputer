import { format, parseISO, differenceInDays } from 'date-fns'
import { DATE_FORMATS } from './constants'

// Date Formatters
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, formatStr)
  } catch {
    return '-'
  }
}

export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate, 'dd MMM')
  const end = formatDate(endDate, 'dd MMM yyyy')
  return `${start} - ${end}`
}

export const formatRelativeTime = (date) => {
  if (!date) return '-'
  const now = new Date()
  const then = typeof date === 'string' ? parseISO(date) : new Date(date)
  const diffDays = differenceInDays(now, then)
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Currency Formatters
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minFraction || 0,
    maximumFractionDigits: options.maxFraction || 0
  }).format(amount)
}

export const formatCurrencyCompact = (amount) => {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
  return formatCurrency(amount)
}

// Number Formatters
export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: options.minFraction || 0,
    maximumFractionDigits: options.maxFraction || 0
  }).format(num)
}

export const formatCompactNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Percentage Formatter
export const formatPercentage = (value, decimal = 1) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimal)}%`
}

// Phone Formatter
export const formatPhone = (phone) => {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

// PAN Formatter
export const formatPAN = (pan) => {
  if (!pan) return '-'
  return pan.toUpperCase()
}

// Aadhar Formatter
export const formatAadhar = (aadhar) => {
  if (!aadhar) return '-'
  const cleaned = aadhar.replace(/\D/g, '')
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  }
  return aadhar
}

// Name Formatter
export const formatName = (name) => {
  if (!name) return '-'
  return name.split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
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

// Address Formatter
export const formatAddress = (address) => {
  if (!address) return '-'
  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode
  ].filter(Boolean)
  return parts.join(', ')
}

// Duration Formatter
export const formatDuration = (months) => {
  if (months >= 12) {
    const years = months / 12
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  return `${months} ${months === 1 ? 'month' : 'months'}`
}

// File Size Formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Time Formatter
export const formatTime = (time) => {
  if (!time) return '-'
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Batch Days Formatter
export const formatDays = (days) => {
  if (!days || days.length === 0) return '-'
  if (days.length === 7) return 'Daily'
  return days.map(d => d.slice(0, 3)).join(', ')
}

// Enrollment Number Formatter
export const formatEnrollmentNo = (enrollmentNo) => {
  if (!enrollmentNo) return '-'
  return enrollmentNo
}

// Certificate ID Formatter
export const formatCertificateId = (id) => {
  if (!id) return '-'
  return id
}