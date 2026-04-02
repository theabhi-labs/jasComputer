// src/components/admin/AddStudent.jsx
import React, { useState, useContext, useEffect } from 'react'
import { Modal, Button, Alert } from '../../components/common'
import { studentService } from '../../services'
import { AuthContext } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUser, FaEnvelope, FaPhone, FaUserTie, FaCalendar, 
  FaMapMarkerAlt, FaCheckCircle, FaBookOpen, FaSpinner, 
  FaHeartbeat, FaVenusMars, FaGraduationCap, FaUserShield, 
  FaHome, FaCity, FaMap, FaCode, FaInfoCircle, FaTimes,
  FaArrowLeft, FaArrowRight, FaSave
} from 'react-icons/fa'
import { Import } from 'lucide-react'

const AddStudent = ({ isOpen, onClose, onSuccess, courses }) => {
  const { user } = useContext(AuthContext)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    motherName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    courseId: '',
    courseName: ''
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCourseChange = (e) => {
    const courseId = e.target.value
    const selectedCourse = courses.find(c => c._id === courseId)
    
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        courseId: courseId,
        courseName: selectedCourse.name
      }))
    }
  }

  const validateStep1 = () => {
    if (!formData.name) return 'Full name is required'
    if (!formData.email) return 'Email address is required'
    if (!formData.phone) return 'Phone number is required'
    if (!/^[6-9]\d{9}$/.test(formData.phone)) return 'Enter a valid 10-digit mobile number'
    if (!formData.fatherName) return "Father's name is required"
    if (!formData.dateOfBirth) return 'Date of birth is required'
    return null
  }

  const validateStep2 = () => {
    if (!formData.courseId) return 'Please select a course'
    return null
  }

  const handleNextStep = () => {
    const err = validateStep1()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep(2)
  }

  const handlePrevStep = () => {
    setStep(1)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const err = validateStep2()
    if (err) {
      setError(err)
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        courseId: formData.courseId,
        courseName: formData.courseName
      }
      
      const response = await studentService.adminCreateStudent(studentData)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create student')
      }
      
      const successMsg = `✅ Student created successfully!\n\n📧 Email: ${formData.email}\n🔐 Password: ${response.data.defaultPassword}\n🆔 Enrollment ID: ${response.data.enrollmentId}\n📚 Course: ${formData.courseName}\n\n📧 Welcome email sent to student with login credentials.`
      
      setSuccess(successMsg)
      
      setTimeout(() => {
        onSuccess()
        onClose()
        resetForm()
      }, 4000)
      
    } catch (err) {
      console.error('Create student error:', err)
      setError(err.message || err.response?.data?.message || 'Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', fatherName: '', motherName: '',
      address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      dateOfBirth: '', gender: 'male', bloodGroup: 'O+', courseId: '', 
      courseName: ''
    })
    setError('')
    setSuccess('')
    setStep(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>

        <div className="relative group">
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>

        <div className="relative group">
          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>

        <div className="relative group">
          <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Father's Name *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>

        <div className="relative group">
          <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Mother's Name"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="relative group">
          <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>

        <div className="relative group">
          <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="relative group">
          <FaHeartbeat className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <FaMapMarkerAlt className="inline mr-1" /> Address
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <FaHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="relative">
              <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="relative">
              <FaMap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="relative">
              <FaCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength="6"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-md"
        >
          Continue <FaArrowRight />
        </button>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Course Selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <FaBookOpen className="inline mr-1" /> Select Course *
        </label>
        <select
          value={formData.courseId}
          onChange={handleCourseChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          required
        >
          <option value="">-- Choose a course --</option>
          {courses && courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Course Summary */}
      {formData.courseId && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaGraduationCap className="text-blue-600" />
            Course Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-gray-600">Course Name:</span>
              <span className="font-medium text-gray-800">{formData.courseName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-700">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1">
              <li>✓ Student receives <strong>welcome email</strong> with login credentials</li>
              <li>✓ Default password: <strong className="font-mono">JAS@123</strong></li>
              <li>✓ Student can login and complete remaining steps</li>
              <li>✓ Student can change password using "Forgot Password"</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="submit"
          disabled={loading || !formData.courseId}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {loading ? 'Creating...' : 'Create Student'}
        </button>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaUserShield className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Student</h2>
                  <p className="text-xs text-blue-100">Step {step} of 2</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex gap-2">
                <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Personal Info</span>
                <span>Course Selection</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <Alert type="error" message={error} onClose={() => setError('')} className="mb-4 rounded-xl" />
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800 whitespace-pre-line">
                      {success}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer */}
            {user && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaUserShield className="text-gray-400" />
                  <span>Creating as: {user.name} ({user.role})</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>Default password: <code className="bg-gray-200 px-1 rounded">JAS@123</code></span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AddStudent