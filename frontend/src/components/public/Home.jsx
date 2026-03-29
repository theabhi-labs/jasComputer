import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { publicService } from '../../services'
import { FaGraduationCap, FaUsers, FaTrophy, FaClock, FaChalkboardTeacher, FaBook, FaArrowRight, FaStar } from 'react-icons/fa'

const Home = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await publicService.getCourses()
      if (response.success) {
        setCourses(response.data.courses.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: FaGraduationCap, title: 'Expert Faculty', desc: 'Learn from the best educators with years of experience', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
    { icon: FaUsers, title: 'Small Batches', desc: 'Personalized attention with limited students per batch', color: 'green', bg: 'bg-green-100', text: 'text-green-600' },
    { icon: FaTrophy, title: 'Proven Results', desc: 'Track record of 90% success rate in competitive exams', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { icon: FaClock, title: 'Flexible Timings', desc: 'Multiple batches to suit your schedule', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' },
    { icon: FaChalkboardTeacher, title: 'Modern Teaching', desc: 'Smart classes with digital learning tools', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { icon: FaBook, title: 'Comprehensive Study', desc: 'Updated syllabus with quality study materials', color: 'red', bg: 'bg-red-100', text: 'text-red-600' }
  ]

  const stats = [
    { value: '10,000+', label: 'Students Trained', icon: FaUsers },
    { value: '95%', label: 'Success Rate', icon: FaTrophy },
    { value: '50+', label: 'Expert Faculty', icon: FaChalkboardTeacher },
    { value: '100+', label: 'Courses', icon: FaBook }
  ]

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'IIT Bombay Student',
      content: 'The faculty here is exceptional. They not only taught me concepts but also how to apply them effectively. I cleared JEE Advanced with AIR 456!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Priya Patel',
      role: 'AIIMS Student',
      content: 'Best coaching for NEET preparation. The study material and mock tests are top-notch. Highly recommended!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'Amit Kumar',
      role: 'NIT Student',
      content: 'Small batch size ensures personal attention. The teachers are always available for doubt clearing. Great experience!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">Your Gateway to Success</h1>
              <p className="text-xl mb-6 text-primary-100">
                Join India's leading coaching institute and turn your dreams into reality. 
                Expert guidance, comprehensive study material, and proven results.
              </p>
              <div className="flex space-x-4">
                <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center">
                  Get Started
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link to="/courses" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
                  View Courses
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600" 
                alt="Students studying"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-lg p-4">
                <p className="text-2xl font-bold text-primary-600">10,000+</p>
                <p className="text-sm text-gray-600">Happy Students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best learning environment with modern teaching methods and personalized attention
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition group">
                <div className={`${feature.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className={`w-8 h-8 ${feature.text}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Courses</h2>
            <p className="text-gray-600">Choose from our wide range of competitive exam preparation courses</p>
          </div>
          
          {loading ? (
            <div className="text-center">Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'} 
                    alt={course.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-primary-600 font-bold">₹{course.totalFees?.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{course.duration?.value} {course.duration?.unit}</span>
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
          
          <div className="text-center mt-8">
            <Link to="/courses" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700">
              View All Courses
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-gray-600">Success stories from our alumni</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of successful students who trusted us</p>
          <Link to="/register" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Enroll Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home