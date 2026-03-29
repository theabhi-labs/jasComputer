// CoursesPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { Input, Modal, Loader, Alert } from '../components/common'
import { 
  FaSearch, FaStar, FaStarHalfAlt, FaRegStar, FaClock, 
  FaRupeeSign, FaTag, FaGraduationCap, FaBookOpen, 
  FaProjectDiagram, FaCertificate, FaUsers, FaInfoCircle,
  FaArrowRight, FaFilter, FaTimes, FaLayerGroup, FaCheckCircle,
  FaChartLine, FaBriefcase, FaCode, FaRegClock, FaShareAlt,
  FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaTelegram,
  FaLink, FaCopy, FaHeart, FaRegHeart, FaEye, FaThumbsUp,
  FaChartBar, FaCalendarAlt, FaDownload, FaPrint
} from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'

// Social Share Component
const SocialShareModal = ({ isOpen, onClose, course }) => {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/courses/${course?.slug || course?._id}`
    : ''
  
  const shareTitle = course?.name || 'Check out this course'
  const shareDescription = course?.shortDescription || 'Amazing course from JAS Computer Institute'
  
  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-[#1877f2] hover:bg-[#0e6bdb]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-[#1da1f2] hover:bg-[#0c8ae8]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-[#25d366] hover:bg-[#1da45c]',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-[#0a66c2] hover:bg-[#0854a3]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-[#26a5e4] hover:bg-[#1f8bc0]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
    }
  ]
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-scale-in">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Share this course</h3>
              <p className="text-sm text-gray-500 mt-1">Spread the knowledge!</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Course Preview */}
          <div className="mb-6 p-3 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{shareTitle}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{shareDescription}</p>
          </div>
          
          {/* Social Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color} text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-transform hover:scale-105`}
                onClick={onClose}
              >
                <social.icon className="text-lg" />
                <span className="text-xs">{social.name}</span>
              </a>
            ))}
          </div>
          
          {/* Copy Link */}
          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full px-4 py-3 pr-24 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2"
            >
              {copied ? <FaCheckCircle /> : <FaCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Course Card Component
const CourseCard = ({ course, onViewDetails, onEnroll, onShare, isFavorite, onToggleFavorite }) => {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-xs" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 text-xs" />)
      }
    }
    return stars
  }

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-emerald-100 text-emerald-700',
      'Intermediate': 'bg-blue-100 text-blue-700',
      'Advanced': 'bg-amber-100 text-amber-700',
      'All Levels': 'bg-purple-100 text-purple-700'
    }
    return colors[level] || 'bg-gray-100 text-gray-700'
  }

  const getCurrentPrice = (course) => {
    if (course.discount?.isDiscounted && course.discount?.discountedPrice > 0) {
      return course.discount.discountedPrice
    }
    return course.totalFees
  }

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = 'https://placehold.co/400x300/3B82F6/white?text=JAS+Course'
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Thumbnail with Overlay */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={course.thumbnail || 'https://placehold.co/400x300/3B82F6/white?text=JAS+Course'}
          alt={course.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {course.discount?.isDiscounted && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse">
              {course.discount.discountPercentage}% OFF
            </span>
          )}
          {course.popularity?.featured && (
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
              <FaStar className="text-xs" /> Featured
            </span>
          )}
        </div>
        
        {/* Level Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(course._id)
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 text-sm" />
          ) : (
            <FaRegHeart className="text-gray-600 text-sm" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          {course.category && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {course.category}
            </span>
          )}
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FaEye className="text-gray-400" />
            <span>{course.popularity?.views || 0}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {course.shortDescription || course.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {renderStars(course.rating?.average || 0)}
          </div>
          <span className="text-xs font-medium text-gray-600">
            {course.rating?.average?.toFixed(1) || 'New'}
          </span>
          <span className="text-xs text-gray-400">
            ({course.rating?.count || 0} reviews)
          </span>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-2 border-t border-b border-gray-100">
          <div className="text-center">
            <FaRegClock className="text-blue-500 text-xs mx-auto mb-1" />
            <p className="text-xs text-gray-600">{course.duration?.value} {course.duration?.unit}</p>
          </div>
          <div className="text-center">
            <FaUsers className="text-blue-500 text-xs mx-auto mb-1" />
            <p className="text-xs text-gray-600">{course.popularity?.enrollments || 0}</p>
          </div>
          <div className="text-center">
            <FaProjectDiagram className="text-blue-500 text-xs mx-auto mb-1" />
            <p className="text-xs text-gray-600">{course.projects?.length || 0} Projects</p>
          </div>
        </div>
        
        {/* Skills Preview */}
        {course.skillsToLearn?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {course.skillsToLearn.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {course.skillsToLearn.length > 3 && (
                <span className="text-xs text-blue-500 font-medium">
                  +{course.skillsToLearn.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Price */}
        <div className="mb-4">
          {course.discount?.isDiscounted ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm line-through text-gray-400">
                ₹{course.totalFees?.toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-red-600">
                ₹{getCurrentPrice(course)?.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-medium">
                Save {course.discount.discountPercentage}%
              </span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              ₹{course.totalFees?.toLocaleString()}
            </div>
          )}
          {course.installmentAllowed && (
            <p className="text-xs text-gray-500 mt-1">
              EMI from ₹{Math.ceil(course.totalFees / (course.numberOfInstallments || 3)).toLocaleString()}/month
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(course.slug)}
            className="flex-1 px-3 py-2 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1 group/btn"
          >
            <FaInfoCircle className="text-sm group-hover/btn:scale-110 transition" />
            Details
          </button>
          <button
            onClick={() => onShare(course)}
            className="px-3 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-300"
            title="Share"
          >
            <FaShareAlt className="text-sm" />
          </button>
          <button
            onClick={() => onEnroll(course._id)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1 group/btn"
          >
            Enroll
            <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </div>
  )
}

const CoursesPage = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    priceRange: '',
    certificate: '',
    sortBy: 'newest'
  })
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteCourses')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [searchTerm, filters, courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await publicService.getCourses()
      
      if (response && response.success) {
        const coursesData = response.data?.courses || response.data || []
        setCourses(coursesData)
        setFilteredCourses(coursesData)
        
        const uniqueCategories = [...new Set(coursesData.map(c => c.category).filter(Boolean))]
        setCategories(uniqueCategories)
      } else {
        setError(response?.message || 'Failed to load courses')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError(error.message || 'Failed to load courses. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...courses]

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        course.skillsToLearn?.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level)
    }

    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category)
    }

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          filtered = filtered.filter(course => course.totalFees === 0)
          break
        case 'under5000':
          filtered = filtered.filter(course => course.totalFees < 5000)
          break
        case '5000-20000':
          filtered = filtered.filter(course => course.totalFees >= 5000 && course.totalFees <= 20000)
          break
        case '20000-50000':
          filtered = filtered.filter(course => course.totalFees >= 20000 && course.totalFees <= 50000)
          break
        case 'above50000':
          filtered = filtered.filter(course => course.totalFees > 50000)
          break
        default:
          break
      }
    }

    if (filters.certificate) {
      filtered = filtered.filter(course => course.certificateProvided === (filters.certificate === 'yes'))
    }

    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.totalFees - b.totalFees)
        break
      case 'price_high':
        filtered.sort((a, b) => b.totalFees - a.totalFees)
        break
      case 'popularity':
        filtered.sort((a, b) => (b.popularity?.enrollments || 0) - (a.popularity?.enrollments || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default:
        break
    }

    setFilteredCourses(filtered)
  }

  const handleViewDetails = (slug) => {
    navigate(`/courses/${slug}`)
  }

  const handleEnroll = (courseId) => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate(`/enroll/${courseId}`)
    } else {
      navigate(`/login?redirect=/enroll/${courseId}`)
    }
  }

  const handleShare = (course) => {
    setSelectedCourse(course)
    setShowShareModal(true)
  }

  const handleToggleFavorite = (courseId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
      localStorage.setItem('favoriteCourses', JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const clearFilters = () => {
    setFilters({
      level: '',
      category: '',
      priceRange: '',
      certificate: '',
      sortBy: 'newest'
    })
    setSearchTerm('')
  }

  const isFavorite = (courseId) => favorites.includes(courseId)

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>All Courses | JAS Computer Institute - Best Computer Training in Suriyawan</title>
        <meta name="description" content="Explore our wide range of computer courses including DCA, ADCA, Tally, Typing, and Basic Computer. Join JAS Computer Institute for job-oriented training with certificate." />
        <meta name="keywords" content="computer courses, DCA course, ADCA course, Tally course, typing course, basic computer, JAS Computer Institute, Suriyawan" />
        <meta property="og:title" content="All Courses | JAS Computer Institute" />
        <meta property="og:description" content="Explore our comprehensive computer courses designed for beginners to advanced learners." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.jascomputerinstitute.com/courses" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <FaGraduationCap className="text-sm" />
                <span className="text-sm font-medium">100+ Courses Available</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Explore Our{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Computer Courses
                </span>
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Job-oriented training programs designed to make you industry-ready
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search courses by name, skill, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              
              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <span className="text-sm text-blue-200">Popular:</span>
                {['DCA', 'ADCA', 'Tally', 'Typing', 'MS Office', 'Web Design'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {/* Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <FaFilter className="text-blue-500" />
                <span className="font-medium">Filters</span>
                {(filters.level || filters.category || filters.priceRange || filters.certificate) && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(filters).filter(v => v && v !== 'newest').length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-blue-600">{filteredCourses.length}</span> courses found
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaFilter className="text-blue-500" />
                  Filter Courses
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <FaTimes className="text-xs" />
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Level</label>
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="under5000">Under ₹5,000</option>
                    <option value="5000-20000">₹5,000 - ₹20,000</option>
                    <option value="20000-50000">₹20,000 - ₹50,000</option>
                    <option value="above50000">Above ₹50,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate</label>
                  <select
                    value={filters.certificate}
                    onChange={(e) => setFilters({ ...filters, certificate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    <option value="yes">Certificate Provided</option>
                    <option value="no">No Certificate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <FaSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                We couldn't find any courses matching your criteria. Try adjusting your filters or search term.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onViewDetails={handleViewDetails}
                  onEnroll={handleEnroll}
                  onShare={handleShare}
                  isFavorite={isFavorite(course._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default CoursesPage