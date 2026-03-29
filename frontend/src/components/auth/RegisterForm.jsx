// src/pages/RegisterForm.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicService, studentService } from '../../services'
import { authService } from '../../services/authService'
import { Alert } from '../common'
import {
  FaArrowRight, FaArrowLeft, FaCheckCircle, FaBookOpen,
  FaUpload, FaRupeeSign, FaCreditCard, FaShieldAlt,
  FaSpinner, FaRegClock, FaEye, FaEyeSlash, FaUser,
  FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt,
  FaFileAlt, FaImage, FaIdCard, FaGraduationCap
} from 'react-icons/fa'

// ─────────────────────────────────────────────────────────────
//  STEP ORDER:
//   1 → Personal Info   2 → Email OTP   3 → Course
//   4 → Documents       5 → Payment
// ─────────────────────────────────────────────────────────────

const STEP_META = [
  { num: 1, label: 'Personal', icon: FaUser },
  { num: 2, label: 'Verify', icon: FaShieldAlt },
  { num: 3, label: 'Course', icon: FaBookOpen },
  { num: 4, label: 'Documents', icon: FaFileAlt },
  { num: 5, label: 'Payment', icon: FaCreditCard },
]

// ── Reusable input wrapper ───────────────────────────────────
const InputField = ({ label, required, icon: Icon, hint, children }) => (
  <div className="group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none
          group-focus-within:text-blue-500 transition-colors z-10">
          <Icon />
        </div>
      )}
      {children}
    </div>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
)

const inputCls = (hasIcon = true) =>
  `w-full ${hasIcon ? 'pl-10' : 'px-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
   text-slate-800 placeholder-slate-400 text-sm
   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
   transition-all duration-200`

// ────────────────────────────────────────────────────────────
const RegisterForm = () => {
  const navigate = useNavigate()

  // ── Core state ───────────────────────────────────────────────
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── OTP state ────────────────────────────────────────────────
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  // ── Locked email (set once after Step 1 submit) ──────────────
  const [registeredEmail, setRegisteredEmail] = useState('')

  // ── Student & upload state ───────────────────────────────────
  const [studentId, setStudentId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState({
    photo: null, aadharCard: null, marksheet: null
  })
  const [uploading, setUploading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [dragOver, setDragOver] = useState(null)

  // ── File input refs — direct DOM read avoids stale closure ───
  const photoRef = useRef(null)
  const aadharRef = useRef(null)
  const marksheetRef = useRef(null)

  // ── Form data ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', fatherName: '', motherName: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    dateOfBirth: '', gender: 'male', bloodGroup: 'O+',
    courseId: '', feeStructure: { totalFees: 0 }
  })

  // ── Animated step transition ─────────────────────────────────
  const goToStep = (next) => {
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 180)
  }

  // ── OTP countdown ────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return
    const id = setInterval(() => {
      setOtpTimer(prev => {
        const next = prev - 1
        if (next <= 0) { localStorage.removeItem('otpTimerStart'); clearInterval(id) }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [otpTimer])

  // ── Restore progress on mount (localStorage only) ───────────
  useEffect(() => {
    if (localStorage.getItem('paymentDone') === 'true') { navigate('/login'); return }

    const savedEmail = localStorage.getItem('registeredEmail')
    if (savedEmail) setRegisteredEmail(savedEmail)

    const savedFormData = localStorage.getItem('step1FormData')
    if (savedFormData) { try { setFormData(JSON.parse(savedFormData)) } catch (_) { } }

    const savedCourse = localStorage.getItem('selectedCourse')
    if (savedCourse) {
      try {
        const c = JSON.parse(savedCourse)
        setFormData(prev => ({
          ...prev,
          courseId: c.courseId || prev.courseId,
          feeStructure: { totalFees: c.fee || 0 }
        }))
      } catch (_) { }
    }

    const savedStudentId = localStorage.getItem('studentId')
    if (!savedStudentId) { setStep(1); return }
    setStudentId(savedStudentId)

    const savedStep = parseInt(localStorage.getItem('registrationStep') || '1', 10)
    const emailVerified = localStorage.getItem('emailVerified') === 'true'
    const documentsUploaded = localStorage.getItem('documentsUploaded') === 'true'

    let resolved = savedStep
    if (resolved === 2 && emailVerified) { resolved = 3; localStorage.setItem('registrationStep', '3') }
    if (resolved < 4 && documentsUploaded) { resolved = 4; localStorage.setItem('registrationStep', '4') }
    setStep(resolved)

    if (resolved === 2) {
      const t = localStorage.getItem('otpTimerStart')
      if (t) {
        const remaining = Math.max(0, 60 - Math.floor((Date.now() - parseInt(t, 10)) / 1000))
        if (remaining > 0) setOtpTimer(remaining)
      }
    }
  }, [navigate])

  // ── Fetch courses ────────────────────────────────────────────
  useEffect(() => {
    publicService.getCourses()
      .then(r => { if (r.success) setCourses(r.data.courses || r.data || []) })
      .catch(e => console.error('Fetch courses:', e))
      .finally(() => setLoadingCourses(false))
  }, [])

  // ── Helpers ──────────────────────────────────────────────────
  const getRegisteredEmail = () =>
    registeredEmail || localStorage.getItem('registeredEmail') || ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = name.startsWith('address.')
        ? { ...prev, address: { ...prev.address, [name.split('.')[1]]: value } }
        : { ...prev, [name]: value }
      localStorage.setItem('step1FormData', JSON.stringify(updated))
      return updated
    })
  }

  const handleCourseChange = (e) => {
    const courseId = e.target.value
    const c = courses.find(x => x._id === courseId)
    const updated = { ...formData, courseId, feeStructure: { totalFees: c?.totalFees || 0 } }
    setFormData(updated)
    localStorage.setItem('step1FormData', JSON.stringify(updated))
  }

  const validateStep1 = () => {
    if (!formData.name) return 'Name is required'
    if (!formData.email) return 'Email is required'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    if (!formData.phone) return 'Phone number is required'
    if (!/^[6-9]\d{9}$/.test(formData.phone)) return 'Enter a valid 10-digit mobile number'
    if (!formData.fatherName) return "Father's name is required"
    if (!formData.dateOfBirth) return 'Date of birth is required'
    return null
  }

  // ════════════════════════════════════════════════════════════
  //  STEP 1 — Personal Info
  // ════════════════════════════════════════════════════════════
  const handleStep1Submit = async (e) => {
    e.preventDefault(); e.stopPropagation()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const res = await studentService.createStudentRegistration({
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, fatherName: formData.fatherName, motherName: formData.motherName,
        address: formData.address, dateOfBirth: formData.dateOfBirth,
        gender: formData.gender, bloodGroup: formData.bloodGroup
      })
      if (res.success) {
        const id = res.data.studentId || res.data._id
        const lockedEmail = formData.email.trim().toLowerCase()
        localStorage.setItem('studentId', id)
        localStorage.setItem('registeredEmail', lockedEmail)
        localStorage.setItem('registrationStep', '2')
        localStorage.setItem('step1Completed', 'true')
        localStorage.setItem('otpTimerStart', Date.now().toString())
        setStudentId(id); setRegisteredEmail(lockedEmail); setOtpTimer(60)
        setSuccess('OTP sent to your email!')
        goToStep(2)
      } else { setError(res.message || 'Registration failed') }
    } catch (err) {
      if (err.message?.toLowerCase().includes('already')) {
        const eId = localStorage.getItem('studentId')
        const eEmail = localStorage.getItem('registeredEmail')
        if (eId && eEmail) {
          setStudentId(eId); setRegisteredEmail(eEmail)
          setSuccess('Continuing existing registration.')
          goToStep(2); return
        }
      }
      setError(err.response?.data?.message || err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  // ════════════════════════════════════════════════════════════
  //  STEP 2 — OTP
  // ════════════════════════════════════════════════════════════
  const handleOtpInput = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const arr = otp.split('')
    arr[index] = digit
    const newOtp = arr.join('').slice(0, 6)
    setOtp(newOtp)
    if (digit && index < 5) otpRefs[index + 1].current?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs[index - 1].current?.focus()
  }

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setOtp(paste)
    if (paste.length === 6) otpRefs[5].current?.focus()
    e.preventDefault()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); e.stopPropagation()
    const emailToUse = getRegisteredEmail()
    if (!emailToUse) { setError('Email not found. Please restart.'); return }
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const res = await authService.verifyEmail({ email: emailToUse, otp: otp.trim(), userType: 'student' })
      if (res.success) {
        localStorage.setItem('registrationStep', '3')
        localStorage.setItem('emailVerified', 'true')
        localStorage.removeItem('otpTimerStart')
        setSuccess('Email verified! Now select your course.')
        goToStep(3)
      } else { setError(res.message || 'Invalid OTP') }
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('already verified')) {
        localStorage.setItem('registrationStep', '3')
        localStorage.setItem('emailVerified', 'true')
        setSuccess('Email already verified! Proceeding to course selection.')
        goToStep(3); return
      }
      setError(msg || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResendOTP = async () => {
    const emailToUse = getRegisteredEmail()
    if (!emailToUse) { setError('Email not found. Please restart.'); return }
    setOtpLoading(true); setError('')
    try {
      const res = await authService.resendVerification({ email: emailToUse, userType: 'student' })
      if (res.success) {
        setOtpTimer(60); localStorage.setItem('otpTimerStart', Date.now().toString())
        setSuccess('OTP resent! Check your inbox.')
      } else {
        if (res.message?.toLowerCase().includes('already verified')) {
          localStorage.setItem('registrationStep', '3')
          localStorage.setItem('emailVerified', 'true')
          setSuccess('Email already verified!')
          goToStep(3); return
        }
        setError(res.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally { setOtpLoading(false) }
  }

  // ════════════════════════════════════════════════════════════
  //  STEP 3 — Course Selection
  // ════════════════════════════════════════════════════════════
  const handleStep3Submit = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!formData.courseId) { setError('Please select a course'); return }
    setError(''); setLoading(true)
    try {
      const selected = courses.find(c => c._id === formData.courseId)
      const res = await studentService.updateStudentCourse(studentId, {
        courseId: formData.courseId,
        courseName: selected?.name,
        courseFee: selected?.totalFees
      })
      if (res.success) {
        localStorage.setItem('registrationStep', '4')
        localStorage.setItem('selectedCourse', JSON.stringify({
          courseId: formData.courseId, name: selected?.name, fee: selected?.totalFees
        }))
        setSuccess('Course selected! Now upload your documents.')
        goToStep(4)
      } else { setError(res.message || 'Failed to select course') }
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed') }
    finally { setLoading(false) }
  }

  // ════════════════════════════════════════════════════════════
  //  STEP 4 — Documents
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
  console.log('Uploaded Docs:', uploadedDocs)
}, [uploadedDocs])

  const handleFileChange = (docType, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5MB'); return }
    setUploadedDocs(prev => ({ ...prev, [docType]: file }))
    setError('')
  }

  const handleDrop = (docType, e) => {
    e.preventDefault(); setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(docType, file)
  }

  const handleUploadDocuments = async (e) => {
    if (e?.preventDefault) e.preventDefault()
  if (e?.stopPropagation) e.stopPropagation()

  const photoFile     = photoRef.current?.files?.[0]
  const aadharFile    = aadharRef.current?.files?.[0]
  const marksheetFile = marksheetRef.current?.files?.[0]

  // Debug — console mein check karo files aa rahi hain ya nahi
  console.log('Files:', { photoFile, aadharFile, marksheetFile })
  if (!photoFile || !aadharFile || !marksheetFile) {
    setError('Please upload all three required documents')
    return
  }
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('photo', photoFile)
      fd.append('aadharCard', aadharFile)
      fd.append('previousYearMarksheet', marksheetFile)

      const savedStudentId = localStorage.getItem('studentId')
      const res = await studentService.uploadMultipleDocuments(savedStudentId, fd)
      if (res.success) {
        await studentService.updateDocumentStatus(savedStudentId, { documentsUploaded: true })
        localStorage.setItem('registrationStep', '5')
        localStorage.setItem('documentsUploaded', 'true')
        setSuccess('Documents uploaded! Proceed to payment.')
        goToStep(5)
      } else { setError(res.message || 'Upload failed') }
    } catch (err) { setError(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  // ════════════════════════════════════════════════════════════
  //  STEP 5 — Payment
  // ════════════════════════════════════════════════════════════
  const handlePayment = async (e) => {
    e.preventDefault(); e.stopPropagation()
    setPaymentLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 1500)) // replace with Razorpay
      await studentService.updatePaymentStatus(studentId, {
        paymentStatus: 'completed', paymentMethod: 'online',
        paymentDate: new Date().toISOString()
      })
      localStorage.setItem('registrationStep', '6')
      localStorage.setItem('paymentDone', 'true')
      localStorage.removeItem('step1FormData')
      localStorage.removeItem('step1Completed')
      localStorage.removeItem('registeredEmail')
      setPaymentDone(true)
      setSuccess('Registration complete! Redirecting to login...')
      setTimeout(() => navigate('/login', { state: { registrationComplete: true } }), 2000)
    } catch (err) { setError(err.message || 'Payment failed. Please try again.') }
    finally { setPaymentLoading(false) }
  }

  // ── Reset ────────────────────────────────────────────────────
  const resetRegistration = () => {
    if (!window.confirm('Reset registration? All data will be lost.')) return
      ;[
        'studentId', 'registrationStep', 'step1FormData', 'step1Completed',
        'otpTimerStart', 'emailVerified', 'documentsUploaded',
        'selectedCourse', 'paymentDone', 'registeredEmail',
        'uploaded_photo', 'uploaded_aadharCard', 'uploaded_marksheet'
      ].forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  // ════════════════════════════════════════════════════════════
  //  FILE UPLOAD CARD
  // ════════════════════════════════════════════════════════════
  const FileUploadCard = ({ docKey, label, accept, icon: Icon, inputRef, hint }) => {
    const file = uploadedDocs[docKey]
    const isDragging = dragOver === docKey
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(docKey) }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => handleDrop(docKey, e)}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : file
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileChange(docKey, e.target.files[0])}
        />
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
            ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {file ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">
              {label} <span className="text-rose-400">*</span>
            </p>
            {file
              ? <p className="text-xs text-emerald-600 truncate mt-0.5">✓ {file.name}</p>
              : <p className="text-xs text-slate-400 mt-0.5">{hint} · Max 5MB · Drag or click</p>
            }
          </div>
          {!file ? (
            <span className="text-xs font-semibold text-blue-500 bg-blue-100 px-3 py-1.5 rounded-lg flex-shrink-0">
              Browse
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setUploadedDocs(p => ({ ...p, [docKey]: null }))
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="text-xs font-medium text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100
                px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  //  RENDER STEPS
  // ════════════════════════════════════════════════════════════

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <InputField label="Full Name" required icon={FaUser}>
          <input type="text" name="name" value={formData.name} onChange={handleChange}
            className={inputCls()} placeholder="Rahul Sharma" />
        </InputField>

        <InputField label="Email Address" required icon={FaEnvelope}>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            className={inputCls()} placeholder="you@example.com" />
        </InputField>

        <InputField label="Password" required icon={FaLock}>
          <input type={showPassword ? 'text' : 'password'} name="password"
            value={formData.password} onChange={handleChange}
            className={inputCls()} placeholder="Min. 6 characters" />
          <button type="button" onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </InputField>

        <InputField label="Confirm Password" required icon={FaLock}>
          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange}
            className={inputCls()} placeholder="Re-enter password" />
          <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </InputField>

        <InputField label="Phone Number" required icon={FaPhone} hint="10-digit Indian number">
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
            className={inputCls()} placeholder="9876543210" maxLength="10" />
        </InputField>

        <InputField label="Father's Name" required icon={FaUser}>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
            className={inputCls()} placeholder="Father's full name" />
        </InputField>

        <InputField label="Mother's Name" icon={FaUser}>
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange}
            className={inputCls()} placeholder="Mother's full name" />
        </InputField>

        <InputField label="Date of Birth" required>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
            className={inputCls(false)} />
        </InputField>

        <InputField label="Gender" required>
          <div className="flex gap-2 pt-0.5">
            {['male', 'female', 'other'].map(g => (
              <label key={g} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl cursor-pointer
                border text-sm font-medium transition-all duration-200
                ${formData.gender === g
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                <input type="radio" name="gender" value={g} checked={formData.gender === g}
                  onChange={handleChange} className="hidden" />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </InputField>

        <InputField label="Blood Group">
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
            className={inputCls(false)}>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </InputField>
      </div>

      {/* Address */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <FaMapMarkerAlt className="text-slate-400 text-sm" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address Details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" name="address.street" value={formData.address.street}
            onChange={handleChange} className={`md:col-span-2 ${inputCls(false)}`}
            placeholder="Street / Area / Colony" />
          <input type="text" name="address.city" value={formData.address.city}
            onChange={handleChange} className={inputCls(false)} placeholder="City" />
          <input type="text" name="address.state" value={formData.address.state}
            onChange={handleChange} className={inputCls(false)} placeholder="State" />
          <input type="text" name="address.pincode" value={formData.address.pincode}
            onChange={handleChange} className={inputCls(false)} placeholder="Pincode" maxLength="6" />
          <input type="text" name="address.country" value={formData.address.country}
            onChange={handleChange} className={inputCls(false)} placeholder="Country" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading}
          className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm
            hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5
            active:translate-y-0 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
            flex items-center gap-2.5">
          {loading && <FaSpinner className="animate-spin" />}
          {loading ? 'Registering...' : <><span>Register &amp; Send OTP</span> <FaArrowRight /></>}
        </button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Email badge */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
          <FaEnvelope />
        </div>
        <div>
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">OTP sent to</p>
          <p className="text-sm font-bold text-blue-800">{getRegisteredEmail()}</p>
        </div>
      </div>

      {/* 6 individual OTP boxes */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Enter 6-digit OTP
        </label>
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <input
              key={i}
              ref={otpRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={otp[i] || ''}
              onChange={(e) => handleOtpInput(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl
                outline-none transition-all duration-200
                ${otp[i]
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-slate-50 text-slate-800'}
                focus:border-blue-500 focus:bg-white focus:shadow-sm focus:shadow-blue-100`}
            />
          ))}
        </div>
      </div>

      <button
        type="button" onClick={handleVerifyOTP}
        disabled={loading || otp.length !== 6}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm
          hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5
          active:translate-y-0 transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
          flex items-center justify-center gap-2.5">
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <div className="text-center">
        {otpTimer > 0 ? (
          <p className="text-sm text-slate-400 flex items-center justify-center gap-1.5">
            <FaRegClock className="text-xs" />
            Resend in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
          </p>
        ) : (
          <button type="button" onClick={handleResendOTP} disabled={otpLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium
              inline-flex items-center gap-1.5 transition-colors disabled:opacity-60">
            {otpLoading && <FaSpinner className="animate-spin text-xs" />}
            Didn't receive? Resend OTP
          </button>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-5">
      {loadingCourses ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          <p className="text-sm text-slate-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FaGraduationCap className="text-4xl mx-auto mb-3 opacity-30" />
          <p className="text-sm">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <label key={course._id}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${formData.courseId === course._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                  ${formData.courseId === course._id ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}>
                  {formData.courseId === course._id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold transition-colors
                    ${formData.courseId === course._id ? 'text-blue-800' : 'text-slate-700'}`}>
                    {course.name}
                  </p>
                  {course.duration && (
                    <p className="text-xs text-slate-400 mt-0.5">{course.duration}</p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className={`text-sm font-bold ${formData.courseId === course._id ? 'text-blue-600' : 'text-slate-600'}`}>
                  ₹{(course.totalFees || 0).toLocaleString('en-IN')}
                </p>
                <input type="radio" name="courseId" value={course._id}
                  checked={formData.courseId === course._id}
                  onChange={handleCourseChange} className="hidden" />
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <button type="button" onClick={() => goToStep(2)}
          className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm
            hover:bg-slate-200 transition-all duration-200 flex items-center gap-2">
          <FaArrowLeft /> Back
        </button>
        <button type="submit" disabled={loading || !formData.courseId}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm
            hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5
            active:translate-y-0 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
            flex items-center gap-2">
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Saving...' : <>Continue <FaArrowRight /></>}
        </button>
      </div>
    </form>
  )

  const renderStep4 = () => (
    <form onSubmit={handleUploadDocuments} className="space-y-4">
      <p className="text-sm text-slate-500 pb-1">
        Upload clear, readable copies. PDF, JPG, or PNG. Max 5MB each.
      </p>

      {/* ← JSX tags ki jagah direct function call */}
      {FileUploadCard({ docKey: 'photo', label: 'Passport Size Photo', accept: 'image/*', icon: FaImage, inputRef: photoRef, hint: 'JPG or PNG' })}
      {FileUploadCard({ docKey: 'aadharCard', label: 'Aadhar Card', accept: '.pdf,.jpg,.jpeg,.png', icon: FaIdCard, inputRef: aadharRef, hint: 'PDF, JPG, or PNG' })}
      {FileUploadCard({ docKey: 'marksheet', label: 'Previous Year Marksheet', accept: '.pdf,.jpg,.jpeg,.png', icon: FaFileAlt, inputRef: marksheetRef, hint: 'PDF, JPG, or PNG' })}

      {uploading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <FaSpinner className="animate-spin text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-700">Uploading documents...</p>
            <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <button type="button" onClick={() => goToStep(3)}
          className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm
          hover:bg-slate-200 transition-all duration-200 flex items-center gap-2">
          <FaArrowLeft /> Back
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={handleUploadDocuments}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm
    hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5
    active:translate-y-0 transition-all duration-200
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
    flex items-center gap-2">
          {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
          {uploading ? 'Uploading...' : 'Upload & Continue'}
        </button>
      </div>
    </form>
  )

  const renderStep5 = () => {
    const fee = formData.feeStructure.totalFees || 0
    return (
      <div className="space-y-5">
        {/* Fee summary card */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Summary</p>
          </div>
          <div className="px-5 py-4 space-y-3 bg-white">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Course Fee</span>
              <span className="font-semibold text-slate-700">₹{fee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Registration Fee</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{fee.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FaShieldAlt className="text-emerald-500 flex-shrink-0" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>

        {paymentDone ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <FaCheckCircle className="text-emerald-500 text-xl flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Payment Successful!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <button onClick={handlePayment} disabled={paymentLoading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm
              hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5
              active:translate-y-0 transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
              flex items-center justify-center gap-2.5">
            {paymentLoading ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
            {paymentLoading ? 'Processing...' : `Pay ₹${fee.toLocaleString('en-IN')}`}
          </button>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4
            shadow-lg shadow-blue-200">
            <FaGraduationCap className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Registration</h1>
          <p className="text-sm text-slate-400 mt-1">Complete all steps to enroll</p>
        </div>

        {/* Progress bar */}
        <div className="mb-7">
          <div className="flex items-start justify-between relative">
            {/* Background line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 z-0" />
            {/* Active line */}
            <div
              className="absolute top-5 left-5 h-0.5 bg-blue-500 z-0 transition-all duration-500 ease-out"
              style={{ width: `calc(${((step - 1) / 4) * 100}% - 0px)` }}
            />
            {STEP_META.map(({ num, label, icon: Icon }) => (
              <div key={num} className="flex flex-col items-center gap-1.5 z-10" style={{ flex: '1 1 0' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${step > num
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : step === num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 ring-4 ring-blue-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                  {step > num
                    ? <FaCheckCircle className="text-sm" />
                    : <Icon className="text-sm" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors text-center
                  ${step >= num ? 'text-blue-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step heading */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            {['', 'Personal Information', 'Verify Your Email', 'Choose a Course', 'Upload Documents', 'Complete Payment'][step]}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {[
              '',
              'Fill in your basic details to create your account',
              'Enter the OTP sent to your email address',
              'Select the course you want to enroll in',
              'Upload required documents for verification',
              'Pay your course fee to complete enrollment'
            ][step]}
          </p>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className="space-y-2 mb-5">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
          </div>
        )}

        {/* Main card with step animation */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8
          transition-all duration-200 ease-out
          ${animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 text-sm px-1">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Login
            </Link>
          </p>
          <button onClick={resetRegistration}
            className="text-xs text-slate-300 hover:text-rose-400 transition-colors">
            Reset registration
          </button>
        </div>

      </div>
    </div>
  )
}

export default RegisterForm