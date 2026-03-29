import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { publicService } from '../../services'
import { FaSearch, FaFilter, FaClock, FaRupeeSign, FaStar, FaBookOpen } from 'react-icons/fa'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDuration, setFilterDuration] = useState('')
  const [filterFee, setFilterFee] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = [...courses]
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterDuration) {
      filtered = filtered.filter(course => {
        if (filterDuration === '0-6') return course.duration.value <= 6
        if (filterDuration === '6-12') return course.duration.value > 6 && course.duration.value <= 12
        if (filterDuration === '12+') return course.duration.value > 12
        return true
      })
    }
    
    if (filterFee) {
      filtered = filtered.filter(course => {
        if (filterFee === '0-25000') return course.totalFees <= 25000
        if (filterFee === '25000-50000') return course.totalFees > 25000 && course.totalFees <= 50000
        if (filterFee === '50000+') return course.totalFees > 50000
        return true
      })
    }
    
    setFilteredCourses(filtered)
  }, [searchTerm, filterDuration, filterFee, courses])

  const fetchCourses = async () => {
    try {
      const response = await publicService.getCourses()
      if (response.success) {
        setCourses(response.data.courses)
        setFilteredCourses(response.data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-xl">Choose the right course for your career goals</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Durations</option>
              <option value="0-6">0-6 months</option>
              <option value="6-12">6-12 months</option>
              <option value="12+">12+ months</option>
            </select>
            <select
              value={filterFee}
              onChange={(e) => setFilterFee(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Fees</option>
              <option value="0-25000">Under ₹25,000</option>
              <option value="25000-50000">₹25,000 - ₹50,000</option>
              <option value="50000+">Above ₹50,000</option>
            </select>
            {(searchTerm || filterDuration || filterFee) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterDuration('')
                  setFilterFee('')
                }}
                className="text-primary-600 hover:text-primary-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">Found {filteredCourses.length} courses</p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'} 
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-primary-600">
                    {course.duration.value} {course.duration.unit}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaClock className="mr-1" />
                      <span>{course.duration.value} {course.duration.unit}</span>
                    </div>
                    <div className="flex items-center text-primary-600 font-bold">
                      <FaRupeeSign className="mr-1" />
                      <span>{course.totalFees?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">4.8 (500+ reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaBookOpen className="mr-1" />
                      <span>Comprehensive</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/register?course=${course._id}`}
                    className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses