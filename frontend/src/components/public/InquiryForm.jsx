import React, { useState, useEffect } from 'react'
import { publicService } from '../../services'
import { Button, Input, Alert } from '../common'
import { FaUser, FaEnvelope, FaPhone, FaBook, FaComment, FaCheckCircle } from 'react-icons/fa'

const InquiryForm = () => {
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    courseName: '',
    message: '',
    preferredBatch: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await publicService.getCourses()
      if (response.success) {
        setCourses(response.data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'course') {
      const selectedCourse = courses.find(c => c._id === value)
      setFormData({
        ...formData,
        course: value,
        courseName: selectedCourse?.name || ''
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await publicService.submitInquiry(formData)
      if (response.success) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          course: '',
          courseName: '',
          message: '',
          preferredBatch: ''
        })
      } else {
        setError(response.message || 'Failed to submit inquiry')
      }
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your inquiry has been submitted successfully. Our team will contact you within 24 hours.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request Information</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below and our admissions team will get back to you
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Interested In
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Batch Timing
              </label>
              <select
                name="preferredBatch"
                value={formData.preferredBatch}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select preferred timing</option>
                <option value="Morning (7 AM - 9 AM)">Morning (7 AM - 9 AM)</option>
                <option value="Day (10 AM - 12 PM)">Day (10 AM - 12 PM)</option>
                <option value="Afternoon (2 PM - 4 PM)">Afternoon (2 PM - 4 PM)</option>
                <option value="Evening (5 PM - 7 PM)">Evening (5 PM - 7 PM)</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaComment className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your message or questions here..."
                ></textarea>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Submit Inquiry
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By submitting this form, you agree to our terms and privacy policy.
              We will contact you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InquiryForm