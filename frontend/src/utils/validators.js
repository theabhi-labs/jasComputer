// Email Validation
// validation.js
import { format } from 'date-fns'

// ==================== BASIC VALIDATIONS ====================

/**
 * Email Validation
 * Validates standard email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Phone Validation (Indian Mobile Number)
 * Validates 10-digit Indian mobile numbers starting with 6-9
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * Landline Phone Validation
 * Validates Indian landline numbers with STD code
 */
export const isValidLandline = (phone) => {
  const landlineRegex = /^(0[1-9]\d{1,9})$/
  return landlineRegex.test(phone)
}

/**
 * Password Validation - Basic
 * Minimum 6 characters
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

/**
 * Strong Password Validation
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
 */
export const isStrongPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

/**
 * Password Strength Checker
 * Returns strength level and suggestions
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'Weak', suggestions: ['Enter a password'] }
  
  let score = 0
  const suggestions = []
  
  if (password.length >= 8) score++
  else suggestions.push('Use at least 8 characters')
  
  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Add uppercase letters')
  
  if (/[a-z]/.test(password)) score++
  else suggestions.push('Add lowercase letters')
  
  if (/[0-9]/.test(password)) score++
  else suggestions.push('Add numbers')
  
  if (/[@$!%*?&]/.test(password)) score++
  else suggestions.push('Add special characters (@$!%*?&)')
  
  let level = 'Weak'
  if (score >= 4) level = 'Strong'
  else if (score >= 3) level = 'Medium'
  
  return { score, level, suggestions }
}

/**
 * Name Validation
 * 2-50 characters, letters, spaces, and basic punctuation
 */
export const isValidName = (name) => {
  const nameRegex = /^[A-Za-z\s\.\'-]{2,50}$/
  return name && name.trim().length >= 2 && name.trim().length <= 50 && nameRegex.test(name)
}

/**
 * Pincode Validation (Indian)
 * 6-digit Indian pincode starting with 1-9
 */
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

/**
 * Date Validation
 * Checks if date is valid
 */
export const isValidDate = (date) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

/**
 * Future Date Check
 */
export const isFutureDate = (date) => {
  return new Date(date) > new Date()
}

/**
 * Past Date Check
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date()
}

/**
 * Age Validation
 * Returns true if age is within range
 */
export const isValidAge = (dateOfBirth, minAge = 5, maxAge = 100) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= minAge && age <= maxAge
}

/**
 * URL Validation
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ==================== INDIAN DOCUMENT VALIDATIONS ====================

/**
 * PAN Card Validation
 * Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
 */
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan.toUpperCase())
}

/**
 * Aadhar Card Validation
 * 12-digit number starting with 2-9
 */
export const isValidAadhar = (aadhar) => {
  const aadharRegex = /^[2-9]{1}[0-9]{11}$/
  return aadharRegex.test(aadhar)
}

/**
 * GST Number Validation
 * Format: 22AAAAA0000A1Z5
 */
export const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gst.toUpperCase())
}

/**
 * Voter ID Validation
 * Format: ABC1234567
 */
export const isValidVoterID = (voterId) => {
  const voterRegex = /^[A-Z]{3}[0-9]{7}$/
  return voterRegex.test(voterId.toUpperCase())
}

/**
 * Passport Number Validation
 * Format: A1234567 (1 letter, 7 digits)
 */
export const isValidPassport = (passport) => {
  const passportRegex = /^[A-Z]{1}[0-9]{7}$/
  return passportRegex.test(passport.toUpperCase())
}

/**
 * Driving License Validation (Indian format)
 * Format: UP-14-1234567890
 */
export const isValidDrivingLicense = (license) => {
  const licenseRegex = /^[A-Z]{2}-\d{2}-\d{10,12}$/
  return licenseRegex.test(license.toUpperCase())
}

// ==================== NUMBER VALIDATIONS ====================

/**
 * Amount Validation
 * Positive number up to 10 million
 */
export const isValidAmount = (amount) => {
  return !isNaN(amount) && amount > 0 && amount <= 10000000
}

/**
 * Percentage Validation
 * 0-100
 */
export const isValidPercentage = (percentage) => {
  return !isNaN(percentage) && percentage >= 0 && percentage <= 100
}

/**
 * Integer Validation
 */
export const isValidInteger = (num, min = null, max = null) => {
  if (isNaN(num) || !Number.isInteger(Number(num))) return false
  const value = Number(num)
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}

/**
 * Decimal Validation with precision
 */
export const isValidDecimal = (num, min = null, max = null, precision = 2) => {
  if (isNaN(num)) return false
  const value = Number(num)
  const decimalPlaces = (value.toString().split('.')[1] || '').length
  if (decimalPlaces > precision) return false
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}

// ==================== FORM VALIDATIONS ====================

/**
 * Login Form Validation
 */
export const validateLogin = (email, password) => {
  const errors = {}
  
  if (!email) errors.email = 'Email is required'
  else if (!isValidEmail(email)) errors.email = 'Invalid email format'
  
  if (!password) errors.password = 'Password is required'
  else if (!isValidPassword(password)) errors.password = 'Password must be at least 6 characters'
  
  return errors
}

/**
 * Registration Form Validation
 */
export const validateStudentRegistration = (data) => {
  const errors = {}
  
  // Personal Information
  if (!data.name) errors.name = 'Name is required'
  else if (!isValidName(data.name)) errors.name = 'Name must be 2-50 characters (letters, spaces, dots, hyphens)'
  
  if (!data.email) errors.email = 'Email is required'
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format'
  
  if (!data.password) errors.password = 'Password is required'
  else if (!isValidPassword(data.password)) errors.password = 'Password must be at least 6 characters'
  
  if (!data.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  
  if (!data.phone) errors.phone = 'Phone number is required'
  else if (!isValidPhone(data.phone)) errors.phone = 'Invalid Indian mobile number (10 digits, starts with 6-9)'
  
  if (!data.fatherName) errors.fatherName = "Father's name is required"
  else if (!isValidName(data.fatherName)) errors.fatherName = "Father's name must be 2-50 characters"
  
  if (!data.motherName) errors.motherName = "Mother's name is required"
  
  // Address
  if (!data.address?.street) errors['address.street'] = 'Street address is required'
  if (!data.address?.city) errors['address.city'] = 'City is required'
  if (!data.address?.state) errors['address.state'] = 'State is required'
  if (!data.address?.pincode) errors['address.pincode'] = 'Pincode is required'
  else if (!isValidPincode(data.address.pincode)) errors['address.pincode'] = 'Invalid pincode (6 digits)'
  
  // Date of Birth
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
  else if (!isValidDate(data.dateOfBirth)) errors.dateOfBirth = 'Invalid date'
  else if (!isValidAge(data.dateOfBirth, 5, 100)) errors.dateOfBirth = 'Age must be between 5 and 100 years'
  
  if (!data.gender) errors.gender = 'Gender is required'
  if (!data.course) errors.course = 'Course is required'
  
  // Optional: Aadhar Card
  if (data.aadharNumber && !isValidAadhar(data.aadharNumber)) {
    errors.aadharNumber = 'Invalid Aadhar number (12 digits, starts with 2-9)'
  }
  
  return errors
}

/**
 * Teacher Registration Validation
 */
export const validateTeacherRegistration = (data) => {
  const errors = validateStudentRegistration(data)
  
  // Additional teacher validations
  if (!data.qualification) errors.qualification = 'Qualification is required'
  if (!data.experience) errors.experience = 'Experience is required'
  else if (!isValidInteger(data.experience, 0, 50)) errors.experience = 'Experience must be between 0 and 50 years'
  
  if (data.panNumber && !isValidPAN(data.panNumber)) {
    errors.panNumber = 'Invalid PAN number format'
  }
  
  return errors
}

/**
 * Fee Payment Validation
 */
export const validateFeePayment = (amount, pendingAmount, paidAmount = 0) => {
  const errors = {}
  
  if (!amount) errors.amount = 'Amount is required'
  else if (!isValidAmount(amount)) errors.amount = 'Invalid amount'
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0'
  else if (amount > pendingAmount) errors.amount = `Amount cannot exceed ₹${pendingAmount.toLocaleString()}`
  else if (amount < 0) errors.amount = 'Amount cannot be negative'
  
  if (paidAmount + amount > pendingAmount) {
    errors.amount = `Total payment (₹{(paidAmount + amount).toLocaleString()}) exceeds pending amount`
  }
  
  return errors
}

/**
 * Course Form Validation
 */
export const validateCourse = (data) => {
  const errors = {}
  
  if (!data.name) errors.name = 'Course name is required'
  else if (data.name.length < 3) errors.name = 'Course name must be at least 3 characters'
  
  if (!data.totalFees) errors.totalFees = 'Course fees is required'
  else if (!isValidAmount(data.totalFees)) errors.totalFees = 'Invalid fee amount'
  
  if (!data.duration?.value) errors['duration.value'] = 'Duration is required'
  else if (!isValidInteger(data.duration.value, 1, 60)) errors['duration.value'] = 'Duration must be between 1 and 60'
  
  if (!data.fullDescription && !data.description) {
    errors.fullDescription = 'Course description is required'
  }
  
  return errors
}

/**
 * Batch Form Validation
 */
export const validateBatch = (data) => {
  const errors = {}
  
  if (!data.name) errors.name = 'Batch name is required'
  if (!data.course) errors.course = 'Course is required'
  if (!data.startDate) errors.startDate = 'Start date is required'
  else if (!isValidDate(data.startDate)) errors.startDate = 'Invalid start date'
  else if (!isFutureDate(data.startDate)) errors.startDate = 'Start date must be in the future'
  
  if (!data.endDate) errors.endDate = 'End date is required'
  else if (!isValidDate(data.endDate)) errors.endDate = 'Invalid end date'
  else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = 'End date must be after start date'
  }
  
  if (!data.capacity) errors.capacity = 'Capacity is required'
  else if (!isValidInteger(data.capacity, 1, 100)) errors.capacity = 'Capacity must be between 1 and 100'
  
  if (!data.timing) errors.timing = 'Timing is required'
  
  return errors
}

/**
 * Contact Form Validation
 */
export const validateContact = (data) => {
  const errors = {}
  
  if (!data.name) errors.name = 'Name is required'
  else if (!isValidName(data.name)) errors.name = 'Invalid name format'
  
  if (!data.email) errors.email = 'Email is required'
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format'
  
  if (!data.phone) errors.phone = 'Phone number is required'
  else if (!isValidPhone(data.phone)) errors.phone = 'Invalid phone number'
  
  if (!data.message) errors.message = 'Message is required'
  else if (data.message.length < 10) errors.message = 'Message must be at least 10 characters'
  else if (data.message.length > 1000) errors.message = 'Message cannot exceed 1000 characters'
  
  return errors
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Sanitize Input
 * Removes harmful characters
 */
export const sanitizeInput = (input) => {
  if (!input) return ''
  return input.replace(/[<>]/g, '').trim()
}

/**
 * Format Phone Number
 * Converts to Indian format
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Format PAN Number
 */
export const formatPAN = (pan) => {
  if (!pan) return ''
  return pan.toUpperCase()
}

/**
 * Format Aadhar Number
 * Adds spaces every 4 digits
 */
export const formatAadhar = (aadhar) => {
  if (!aadhar) return ''
  const cleaned = aadhar.replace(/\D/g, '')
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  }
  return aadhar
}

/**
 * Validate and Format Amount
 */
export const formatAmount = (amount) => {
  if (!amount) return '0'
  return Number(amount).toLocaleString('en-IN')
}

// Export all validations
export default {
  isValidEmail,
  isValidPhone,
  isValidLandline,
  isValidPassword,
  isStrongPassword,
  getPasswordStrength,
  isValidName,
  isValidPincode,
  isValidDate,
  isFutureDate,
  isPastDate,
  isValidAge,
  isValidUrl,
  isValidPAN,
  isValidAadhar,
  isValidGST,
  isValidVoterID,
  isValidPassport,
  isValidDrivingLicense,
  isValidAmount,
  isValidPercentage,
  isValidInteger,
  isValidDecimal,
  validateLogin,
  validateStudentRegistration,
  validateTeacherRegistration,
  validateFeePayment,
  validateCourse,
  validateBatch,
  validateContact,
  sanitizeInput,
  formatPhoneNumber,
  formatPAN,
  formatAadhar,
  formatAmount
}