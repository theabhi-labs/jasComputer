// CourseDetailPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { Loader, Alert } from '../components/common'
import { 
  FaStar, FaStarHalfAlt, FaRegStar, FaClock, FaRupeeSign,
  FaProjectDiagram, FaCertificate, FaUsers, FaArrowRight,
  FaCheckCircle, FaBookOpen, FaGraduationCap, FaTag,
  FaBriefcase, FaCode, FaRegClock, FaGlobe, FaLanguage,
  FaAward, FaChartLine, FaPlayCircle, FaShareAlt, FaBookmark,
  FaRegBookmark, FaUserGraduate, FaVideo, FaFileAlt, FaDownload,
  FaHeart, FaRegHeart, FaShieldAlt, FaMobileAlt, FaHeadset,
  FaWhatsapp, FaCalendarAlt, FaLevelUpAlt
} from 'react-icons/fa'

const CourseDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [expandedModules, setExpandedModules] = useState([])

  useEffect(() => {
    fetchCourseDetails()
  }, [slug])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await publicService.getCourseBySlug(slug)
      
      if (response && response.success) {
        setCourse(response.data?.course || response.data)
      } else {
        setError(response?.message || 'Course not found')
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      setError(error.message || 'Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = () => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate(`/enroll/${course._id}`)
    } else {
      navigate(`/login?redirect=/enroll/${course._id}`)
    }
  }

  const handleWhatsAppEnquiry = () => {
    const message = `Hi, I'm interested in the "${course.name}" course. Can you please provide more details?`
    window.open(`https://wa.me/918756248193,?text=${encodeURIComponent(message)}`, '_blank')
  }

  const toggleModule = (index) => {
    if (expandedModules.includes(index)) {
      setExpandedModules(expandedModules.filter(i => i !== index))
    } else {
      setExpandedModules([...expandedModules, index])
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />)
      }
    }
    return stars
  }

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-700 border-green-200',
      'Intermediate': 'bg-blue-100 text-blue-700 border-blue-200',
      'Advanced': 'bg-red-100 text-red-700 border-red-200',
      'All Levels': 'bg-purple-100 text-purple-700 border-purple-200'
    }
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getCurrentPrice = () => {
    if (course?.discount?.isDiscounted && course?.discount?.discountedPrice > 0) {
      return course.discount.discountedPrice
    }
    return course?.totalFees
  }

  const getTotalLectures = () => {
    return course?.syllabus?.reduce((acc, module) => acc + (module.topics?.length || 0), 0) || 0
  }

  const getTotalDuration = () => {
    return course?.syllabus?.reduce((acc, module) => acc + (module.moduleDuration || 0), 0) || 
           course?.duration?.value || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <Alert type="error" message={error || 'Course not found'} />
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with padding-top to account for fixed navbar */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 overflow-hidden pt-20 lg:pt-24">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getLevelColor(course.level)} bg-opacity-90 backdrop-blur-sm`}>
                  <FaLevelUpAlt className="inline mr-1 text-xs" />
                  {course.level}
                </span>
                {course.popularity?.featured && (
                  <span className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    ⭐ Featured
                  </span>
                )}
                {course.certificateProvided && (
                  <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    <FaCertificate className="inline mr-1" />
                    Certificate
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                {course.name}
              </h1>
              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                {course.shortDescription}
              </p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStarHalfAlt className="text-yellow-400" />
                  <span className="ml-2 font-semibold">4.8 (58 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{course.popularity?.enrollments || 100} students enrolled</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Price Card */}
            <div className="lg:ml-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto lg:mx-0">
                <div className="text-center mb-4">
                  {course.discount?.isDiscounted ? (
                    <div>
                      <span className="text-3xl line-through text-gray-400">₹{course.totalFees?.toLocaleString()}</span>
                      <span className="text-4xl font-bold text-red-600 ml-3">₹{getCurrentPrice()?.toLocaleString()}</span>
                      <div className="mt-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Save {course.discount.discountPercentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-blue-600">₹{course.totalFees?.toLocaleString()}</div>
                  )}
                </div>
                
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mb-3"
                >
                  <FaGraduationCap />
                  Enroll Now
                  <FaArrowRight className="group-hover:translate-x-1 transition" />
                </button>
                
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="w-full border-2 border-green-500 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp />
                  Get Free Consultation
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                   Lifetime access portal • Certificate included
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview', icon: FaBookOpen },
                  { id: 'curriculum', label: 'Curriculum', icon: FaProjectDiagram },
                  { id: 'instructor', label: 'Instructor', icon: FaUserGraduate },
                  { id: 'reviews', label: 'Reviews', icon: FaStar }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="text-sm" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab - Enhanced */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaBookOpen className="text-blue-500" />
                    About This Course
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {course.fullDescription || course.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                {course.skillsToLearn?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      What You'll Learn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.skillsToLearn.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                          <FaCheckCircle className="text-green-500 text-sm" />
                          <span className="text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes */}
                {course.learningOutcomes?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaAward className="text-yellow-500" />
                      Learning Outcomes
                    </h2>
                    <ul className="space-y-2">
                      {course.learningOutcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <FaCheckCircle className="text-blue-500 mt-1 text-sm" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Career Opportunities */}
                {course.careerOpportunities?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaBriefcase className="text-blue-500" />
                      Career Opportunities
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {course.careerOpportunities.map((career, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Tab - Enhanced with Accordion */}
            {activeTab === 'curriculum' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{getTotalLectures()} lectures</span>
                    <span>{getTotalDuration()} hours total</span>
                  </div>
                </div>
                
                {course.syllabus?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {course.syllabus.map((module, idx) => (
                      <div key={idx} className="hover:bg-gray-50 transition">
                        <button
                          onClick={() => toggleModule(idx)}
                          className="w-full px-6 py-4 flex justify-between items-center text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <FaPlayCircle className={`text-blue-500 transition-transform ${expandedModules.includes(idx) ? 'rotate-90' : ''}`} />
                              <span className="font-semibold text-gray-900">{module.moduleName}</span>
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500 ml-7">
                              {module.topics?.length && <span>{module.topics.length} lectures</span>}
                              {module.moduleDuration && <span>{module.moduleDuration} hours</span>}
                            </div>
                          </div>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedModules.includes(idx) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedModules.includes(idx) && module.topics?.length > 0 && (
                          <div className="px-6 pb-4 pl-14">
                            <ul className="space-y-2">
                              {module.topics.map((topic, tidx) => (
                                <li key={tidx} className="flex items-center gap-2 text-gray-600 text-sm py-1">
                                  <FaPlayCircle className="text-blue-400 text-xs" />
                                  <span>{topic.topicName}</span>
                                  {topic.duration && (
                                    <span className="text-gray-400 text-xs ml-auto">{topic.duration} min</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <FaProjectDiagram className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>Curriculum coming soon...</p>
                  </div>
                )}
              </div>
            )}

            {/* Instructor Tab - Enhanced */}
            {activeTab === 'instructor' && (
              <div className="space-y-4">
                {course.instructors?.length > 0 ? (
                  course.instructors.map((instructor, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                      <div className="flex items-start gap-5">
                        {instructor.profilePicture ? (
                          <img
                            src={instructor.profilePicture}
                            alt={instructor.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <FaGraduationCap className="text-white text-3xl" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
                          {instructor.title && (
                            <p className="text-blue-600 text-sm font-medium mt-1">{instructor.title}</p>
                          )}
                          <div className="flex gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> 4.9 Instructor Rating</span>
                            <span className="flex items-center gap-1"><FaUsers /> 1,245 Students</span>
                            <span className="flex items-center gap-1"><FaPlayCircle /> 3 Courses</span>
                          </div>
                          {instructor.bio && (
                            <p className="text-gray-600 mt-3 leading-relaxed">{instructor.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                    <FaUserGraduate className="text-5xl mx-auto mb-3 text-gray-300" />
                    <p>Instructor information coming soon...</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab - Enhanced */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <FaStar className="text-4xl text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Student Reviews</h3>
                <p className="text-gray-500 mb-6">Be the first to review this course!</p>
                <button className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition">
                  Write a Review
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Course Includes Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500" />
                  This course includes:
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-gray-600">
                    <FaDownload className="text-blue-500" />
                    <span>Downloadable resources</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <FaCertificate className="text-blue-500" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <FaHeadset className="text-blue-500" />
                    <span>24/7 support</span>
                  </li>
                </ul>
              </div>

              {/* Prerequisites Card */}
              {course.prerequisites?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Prerequisites
                  </h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((pre, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Audience Card */}
              {course.targetAudience?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <FaUsers className="text-blue-500" />
                    Target Audience
                  </h3>
                  <ul className="space-y-2">
                    {course.targetAudience.map((audience, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{audience}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage