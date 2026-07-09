// src/components/admin/AddStudent.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Alert } from '../../components/common';
import { studentService, courseService } from '../../services';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaUserTie, FaCalendar,
  FaMapMarkerAlt, FaCheckCircle, FaBookOpen, FaSpinner,
  FaVenusMars, FaGraduationCap, FaUserShield,
  FaHome, FaCity, FaMap, FaCode, FaInfoCircle, FaTimes,
  FaArrowLeft, FaArrowRight, FaSave, FaIdCard, FaSync
} from 'react-icons/fa';

const AddStudent = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    aadharNo: '',
    course: '',
    courseName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    photo: '',
  });

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch courses
  const fetchCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      console.log('🔄 AddStudent: fetching courses...');
      const response = await courseService.getAllCourses();
      console.log('📦 Courses response:', response);

      if (response?.success === true && response?.data?.courses && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
        if (response.data.courses.length === 0) {
          setCoursesError('No courses found in database');
        }
      } else {
        setCoursesError('Unexpected response format');
        setCourses([]);
      }
    } catch (err) {
      console.error('❌ Fetch courses error:', err);
      setCoursesError(err.response?.data?.message || err.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // ----- Handlers -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find(c => c._id === courseId);
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        course: courseId,
        courseName: selectedCourse.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        course: '',
        courseName: ''
      }));
    }
  };

  // ----- Validations -----
  const validateStep1 = () => {
    if (!formData.name) return 'Full name is required';
    if (formData.name.length < 2) return 'Name must be at least 2 characters';
    if (!formData.email) return 'Email address is required';
    if (!formData.mobile) return 'Mobile number is required';
    if (!/^[0-9]{10}$/.test(formData.mobile)) return 'Enter a valid 10-digit mobile number';
    if (formData.alternateMobile && !/^[0-9]{10}$/.test(formData.alternateMobile)) return 'Enter a valid 10-digit alternate mobile number';
    if (!formData.fatherName) return "Father's name is required";
    if (!formData.motherName) return "Mother's name is required";
    if (!formData.dob) return 'Date of birth is required';
    if (!formData.gender) return 'Gender is required';
    if (!formData.aadharNo) return 'Aadhar number is required';
    if (!/^[0-9]{12}$/.test(formData.aadharNo)) return 'Enter a valid 12-digit Aadhar number';
    if (!formData.address) return 'Street address is required';
    if (!formData.city) return 'City is required';
    if (!formData.state) return 'State is required';
    if (!formData.pincode) return 'Pincode is required';
    if (!/^[0-9]{6}$/.test(formData.pincode)) return 'Enter a valid 6-digit pincode';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.course) return 'Please select a course';
    return null;
  };

  // ----- Navigation -----
  const handleNextStep = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  // ----- Submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile || undefined,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        gender: formData.gender,
        aadharNo: formData.aadharNo,
        course: formData.course,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        photo: formData.photo || undefined,
      };
      const response = await studentService.createStudent(payload);
      console.log('Student Create Response:', response);
      if (response?.success === true) {
        const successMsg = `✅ Student created successfully!\n\n👤 Name: ${formData.name}\n📧 Email: ${formData.email}\n🆔 Aadhar: ${formData.aadharNo}\n📚 Course: ${formData.courseName}`;
        setSuccess(successMsg);
        if (typeof onSuccess === 'function') onSuccess();
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      } else {
        throw new Error(response?.message || 'Student creation failed on server');
      }
    } catch (err) {
      console.error('Create student error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create student. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', mobile: '', alternateMobile: '', fatherName: '', motherName: '',
      dob: '', gender: 'Male', aadharNo: '', course: '', courseName: '',
      address: '', city: '', state: '', pincode: '', photo: ''
    });
    setError('');
    setSuccess('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ----- Render Step 1 -----
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
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>
        <div className="relative group">
          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="tel"
            name="alternateMobile"
            value={formData.alternateMobile}
            onChange={handleChange}
            placeholder="Alternate Mobile Number"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
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
            placeholder="Mother's Name *"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>
        <div className="relative group">
          <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-gray-700"
            required
          />
        </div>
        <div className="relative group">
          <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-gray-700 appearance-none"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="relative group md:col-span-2">
          <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            name="aadharNo"
            value={formData.aadharNo}
            onChange={handleChange}
            placeholder="Aadhar Number (12 digits) *"
            maxLength="12"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <FaMapMarkerAlt className="inline mr-1" /> Address Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative md:col-span-2">
              <FaHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address *"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div className="relative">
              <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City *"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div className="relative">
              <FaMap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State *"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div className="relative md:col-span-2">
              <FaCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode (6 digits) *"
                maxLength="6"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-md font-semibold"
        >
          Continue <FaArrowRight />
        </button>
      </div>
    </motion.div>
  );

  // ----- Render Step 2 -----
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <FaBookOpen className="inline mr-1" /> Select Course *
        </label>
        <div className="flex gap-2">
          <select
            name="course"
            value={formData.course}
            onChange={handleCourseChange}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-gray-700"
            required
            disabled={coursesLoading}
          >
            <option value="">-- Choose a course --</option>
            {coursesLoading ? (
              <option value="" disabled>⏳ Loading courses...</option>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} (₹{course.totalFees?.toLocaleString() || 0})
                </option>
              ))
            ) : (
              <option value="" disabled>⚠️ No courses available. Please add a course first.</option>
            )}
          </select>
          <button
            type="button"
            onClick={fetchCourses}
            disabled={coursesLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-1"
            title="Refresh courses"
          >
            <FaSync className={coursesLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {coursesError && (
          <p className="text-xs text-red-500 mt-1">⚠️ {coursesError}</p>
        )}
      </div>

      {formData.course && (
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
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total Course Fees:</span>
              <span className="font-bold text-indigo-600">
                ₹{courses.find(c => c._id === formData.course)?.totalFees?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-700">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1">
              <li>✓ Student profile record will be created in database</li>
              <li>✓ Default password is set to Student name + first 4 digits of Aadhar</li>
              <li>✓ You can register payments for this student under Fees dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-semibold text-gray-600"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="submit"
          disabled={loading || !formData.course || courses.length === 0 || coursesLoading}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md font-bold"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {loading ? 'Creating...' : 'Create Student'}
        </button>
      </div>
    </motion.div>
  );

  // ----- Main Modal -----
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
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
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
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
                <div className="text-sm text-green-800 whitespace-pre-line font-medium">
                  {success}
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </form>
        </div>

        {/* Footer */}
        {user && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaUserShield className="text-gray-400" />
              <span>Creating as: {user.name} ({user.role})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;