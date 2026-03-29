// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  STUDENT_LOGIN: '/auth/student/login',
  STUDENT_REGISTER: '/auth/student/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_OTP: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  GET_ME: '/auth/me',
  
  // Students
  STUDENTS: '/students',
  STUDENT_STATS: '/students/stats',
  ASSIGN_BATCH: (id) => `/students/${id}/assign-batch`,
  
  // Courses
  COURSES: '/courses',
  PUBLIC_COURSES: '/public/courses',
  
  // Batches
  BATCHES: '/batches',
  
  // Fees
  FEES: '/fees',
  FEE_SUMMARY: '/fees/summary',
  PAYMENT: (studentId) => `/fees/student/${studentId}/payment`,
  PAYMENT_HISTORY: (studentId) => `/fees/student/${studentId}/payments`,
  
  // Attendance
  ATTENDANCE: '/attendance/mark',
  BATCH_ATTENDANCE: (batchId, date) => `/attendance/batch/${batchId}/date/${date}`,
  STUDENT_ATTENDANCE: (studentId) => `/attendance/student/${studentId}`,
  
  // Certificates
  CERTIFICATES: '/certificates',
  GENERATE_CERTIFICATE: '/certificates/generate',
  VERIFY_CERTIFICATE: (id) => `/public/verify-certificate/${id}`,
  
  // Inquiries
  INQUIRIES: '/inquiries',
  PUBLIC_INQUIRY: '/public/inquiry',
  
  // Dashboard
  DASHBOARD: {
    SUPER_ADMIN: '/dashboard/super-admin',
    ADMIN: '/dashboard/admin',
    TEACHER: '/dashboard/teacher',
    STUDENT: '/dashboard/student'
  }
}

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
}

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HOLIDAY: 'holiday'
}

// Fee Status
export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue'
}

// Payment Modes
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: '💰' },
  { value: 'online', label: 'Online', icon: '💳' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
]

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

// Genders
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Days of Week
export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

// Months
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed'
}

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50, 100]
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, hh:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  MONTH_YEAR: 'MMMM yyyy',
  TIME: 'hh:mm a'
}

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec489a',
  gray: '#6b7280'
}