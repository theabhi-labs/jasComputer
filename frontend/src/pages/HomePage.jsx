import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaGraduationCap, FaUsers, FaTrophy, FaClock, FaChalkboardTeacher, 
  FaBook, FaArrowRight, FaStar, FaStarHalfAlt, FaRegStar, 
  FaCertificate, FaProjectDiagram, FaRupeeSign, FaTag, FaRegClock,
  FaChevronRight, FaPlayCircle, FaAward, FaRocket, FaHandsHelping,
  FaChartLine, FaCheckCircle, FaLaptopCode, FaWhatsapp, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaQuoteLeft
} from 'react-icons/fa'
import { publicService } from '../services/publicService'

const HomePage = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)

  // Hero section images for auto-scroll
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop",
      title: "Expert Computer Training",
      subtitle: "Learn from Industry Professionals"
    },
    {
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
      title: "Modern Computer Lab",
      subtitle: "State-of-the-art Facilities"
    },
    {
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop",
      title: "Practical Learning",
      subtitle: "Hands-on Experience"
    },
    {
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop",
      title: "Career Oriented Courses",
      subtitle: "Job-ready Skills"
    }
  ]

  useEffect(() => {
    fetchData()
    // Auto-scroll hero images every 5 seconds
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, featuredRes] = await Promise.all([
        publicService.getCourses({ limit: 4 }),
        publicService.getFeaturedCourses(3)
      ])
      
      if (coursesRes.success) {
        setCourses(coursesRes.data.courses || coursesRes.data || [])
      }
      if (featuredRes.success) {
        setFeaturedCourses(featuredRes.data.courses || featuredRes.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
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
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-blue-100 text-blue-800',
      'Advanced': 'bg-red-100 text-red-800',
      'All Levels': 'bg-purple-100 text-purple-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  const getCurrentPrice = (course) => {
    if (course.discount?.isDiscounted && course.discount?.discountedPrice > 0) {
      return course.discount.discountedPrice
    }
    return course.totalFees
  }

  const features = [
    { 
      icon: FaGraduationCap, 
      title: 'Expert Faculty', 
      desc: 'Learn from industry experts with years of teaching experience',
      color: 'blue',
      stats: '10+ Expert Teachers'
    },
    { 
      icon: FaUsers, 
      title: 'Small Batches', 
      desc: 'Personalized attention with limited students per batch',
      color: 'green',
      stats: '10-15 Students/Batch'
    },
    { 
      icon: FaTrophy, 
      title: 'Proven Results', 
      desc: 'Track record of 90% success rate in competitive exams',
      color: 'yellow',
      stats: '500+ Success Stories'
    },
    { 
      icon: FaClock, 
      title: 'Flexible Timings', 
      desc: 'Multiple batches to suit your schedule',
      color: 'purple',
      stats: 'Morning & Evening Batches'
    },
    { 
      icon: FaChalkboardTeacher, 
      title: 'Modern Teaching', 
      desc: 'Smart classes with digital learning tools',
      color: 'indigo',
      stats: 'Interactive Learning'
    },
    { 
      icon: FaBook, 
      title: 'Comprehensive Study', 
      desc: 'Updated syllabus with quality study materials',
      color: 'red',
      stats: '5000+ Practice Questions'
    }
  ]

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = 'https://placehold.co/400x300/3B82F6/white?text=Course'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Auto-Scrolling Images - Added pt-20 for navbar spacing */}
      <section className="relative h-screen min-h-[600px] overflow-hidden pt-20 lg:pt-24">
        {/* Background Images with Ken Burns Effect */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transform scale-100 transition-transform duration-[10s]"
            />
          </div>
        ))}
        
        {/* Gradient Overlay - Blue Theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/85 to-cyan-800/90 z-20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-32 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl z-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl z-20 animate-pulse delay-1000"></div>
        
        {/* Hero Content */}
        <div className="relative z-30 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-12">
              <div className="lg:w-1/2 animate-fade-in-up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-blue-400/30">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-100 tracking-wide">
                    JAS Computer Institute & Training Center
                  </span>
                </div>
                
                {/* Main Heading */}
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                  Best Computer Training in{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    Suriyawan
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-lg lg:text-xl mb-8 text-blue-100 leading-relaxed max-w-xl lg:max-w-full">
                  Job-oriented courses: DCA, ADCA, Tally, Typing, MS Office with Govt. recognized certificates
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link 
                    to="/register" 
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      Get Started
                      <FaRocket className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link 
                    to="/courses" 
                    className="inline-flex items-center justify-center border-2 border-blue-400 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm"
                  >
                    Explore Courses
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-blue-100 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition">
                      <FaCheckCircle className="text-cyan-400 text-sm" />
                    </div>
                    <span className="font-medium">10+ Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition">
                      <FaCheckCircle className="text-cyan-400 text-sm" />
                    </div>
                    <span className="font-medium">5+ Expert Teachers</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition">
                      <FaCheckCircle className="text-cyan-400 text-sm" />
                    </div>
                    <span className="font-medium">500+ Students Trained</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Course Cards */}
              <div className="hidden lg:block lg:w-1/2 mt-12 lg:mt-0 animate-fade-in-right">
                <div className="relative">
                  {/* Animated Background Glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl filter blur-2xl opacity-20 animate-pulse"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl filter blur-xl opacity-30"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-blue-500/50 transition">
                          <FaLaptopCode className="text-2xl text-white" />
                        </div>
                        <p className="text-base font-bold text-white">DCA/ADCA</p>
                        <p className="text-xs text-blue-200 mt-1">6-12 Months</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group cursor-pointer hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-cyan-500/50 transition">
                          <FaBook className="text-2xl text-white" />
                        </div>
                        <p className="text-base font-bold text-white">Tally with GST</p>
                        <p className="text-xs text-blue-200 mt-1">3 Months</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 transition-all duration-300 group cursor-pointer hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-indigo-500/50 transition">
                          <FaGraduationCap className="text-2xl text-white" />
                        </div>
                        <p className="text-base font-bold text-white">Basic Computer</p>
                        <p className="text-xs text-blue-200 mt-1">2 Months</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:border-sky-400/50 transition-all duration-300 group cursor-pointer hover:scale-105">
                        <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-sky-500/50 transition">
                          <FaClock className="text-2xl text-white" />
                        </div>
                        <p className="text-base font-bold text-white">Typing Course</p>
                        <p className="text-xs text-blue-200 mt-1">2 Months</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/20 text-center">
                      <p className="text-xs text-blue-200">
                        ✨ Govt. Recognized Certificate • Job Assistance • Practical Training
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`transition-all duration-300 ${
                index === currentHeroIndex 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section with Cards - Updated to Blue Theme */}
      <section className="  bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 px-4 py-1 rounded-full mb-4">
              <FaHandsHelping className="mr-2" />
              <span className="text-sm font-semibold">Why Choose Us</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              We Provide the <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Best Learning</span> Experience
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover what makes us the preferred choice for students in Suriyawan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.desc}</p>
                <div className="flex items-center text-sm text-blue-600 font-semibold">
                  <FaChartLine className="mr-1" />
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section - Updated to Blue Theme */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 px-4 py-1 rounded-full mb-4">
              <FaBook className="mr-2" />
              <span className="text-sm font-semibold">Popular Courses</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Our <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Top Courses</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a wide range of courses designed to help you succeed
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                          <FaGraduationCap className="text-white text-4xl" />
                        </div>
                      )}
                      {course.discount?.isDiscounted && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          {course.discount.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <FaRegClock className="mr-1" />
                          {course.duration?.value} {course.duration?.unit}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                        {course.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-1">
                          {renderStars(course.rating?.average || 0)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({course.rating?.count || 0})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        {course.discount?.isDiscounted ? (
                          <div>
                            <span className="text-xs line-through text-gray-400">
                              ₹{course.totalFees?.toLocaleString()}
                            </span>
                            <span className="ml-1 text-lg font-bold text-red-600">
                              ₹{getCurrentPrice(course)?.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            ₹{course.totalFees?.toLocaleString()}
                          </span>
                        )}
                        {course.certificateProvided && (
                          <FaCertificate className="text-green-500 text-sm" title="Certificate Provided" />
                        )}
                      </div>
                      <button
                        onClick={() => handleViewDetails(course.slug)}
                        className="w-full py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link 
                  to="/courses" 
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105 duration-300"
                >
                  View All Courses
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stats Section - Updated to Blue Theme */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-white/80">Students Trained</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">10+</div>
              <div className="text-white/80">Expert Teachers</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">15+</div>
              <div className="text-white/80">Courses</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">90%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Updated to Blue Theme */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join 500+ successful students who trusted JAS Computer Institute for their career growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105 duration-300"
              >
                Enroll Now
                <FaRocket className="ml-2" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contact Us
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default HomePage