// courseConstants.js
export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All Levels'
}

export const COURSE_DURATION_UNITS = {
  MONTHS: 'months',
  YEARS: 'years',
  WEEKS: 'weeks',
  DAYS: 'days'
}

export const COURSE_SORT_OPTIONS = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  POPULARITY: 'popularity',
  RATING: 'rating',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  FEATURED: 'featured'
}

export const CERTIFICATE_TYPES = {
  DIGITAL: 'Digital',
  PHYSICAL: 'Physical',
  BOTH: 'Both'
}

export const PROJECT_DIFFICULTY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
}

// Helper functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export const formatDuration = (duration) => {
  if (!duration) return ''
  const { value, unit } = duration
  return `${value} ${unit}${value > 1 ? '' : ''}`
}

export const getDiscountPrice = (originalPrice, discountPercentage) => {
  if (!discountPercentage) return originalPrice
  return originalPrice - (originalPrice * discountPercentage / 100)
}

export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return (sum / ratings.length).toFixed(1)
}

export const getCourseStatus = (isActive) => {
  return isActive ? 'Active' : 'Inactive'
}

export const getCourseStatusColor = (isActive) => {
  return isActive ? 'success' : 'error'
}