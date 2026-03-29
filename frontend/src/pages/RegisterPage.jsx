// // src/pages/RegisterPage.jsx
// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Input, Button, Alert } from '../components/common'
// import { authService } from '../services/authService'
// import { publicService } from '../services/publicService'
// import oracleStorageService from '../services/oracleStorageService'

// const RegisterPage = () => {
//   const [courses, setCourses] = useState([])
//   const [loadingCourses, setLoadingCourses] = useState(true)
//   const [currentStep, setCurrentStep] = useState(1)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [uploadProgress, setUploadProgress] = useState({})
//   const [studentId, setStudentId] = useState(null)
//   const [otp, setOtp] = useState('')
//   const [showOtpInput, setShowOtpInput] = useState(false)
//   const [uploadingDocs, setUploadingDocs] = useState(false)
//   const [verifyingEmail, setVerifyingEmail] = useState(false)
//   const [processingPayment, setProcessingPayment] = useState(false)
//   const [uploadedFiles, setUploadedFiles] = useState({
//     photo: null,
//     aadharCard: null,
//     tenthMarksheet: null,
//     twelfthMarksheet: null,
//     transferCertificate: null,
//     casteCertificate: null
//   })
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     fatherName: '',
//     dateOfBirth: '',
//     gender: 'male',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       pincode: ''
//     },
//     course: '',
//     feeStructure: {
//       totalFees: 0,
//       admissionFee: 0,
//       joiningFee: 0,
//       remainingFees: 0
//     },
//     documents: {
//       photo: null,
//       aadharCard: null,
//       tenthMarksheet: null,
//       twelfthMarksheet: null,
//       transferCertificate: null,
//       casteCertificate: null
//     },
//     verificationStatus: {
//       emailVerified: false,
//       documentsVerified: false
//     },
//     paymentStatus: {
//       admissionFeePaid: false,
//       joiningFeePaid: false,
//       transactionId: '',
//       paymentDate: null
//     }
//   })
  
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchCourses()
//   }, [])

//   const fetchCourses = async () => {
//     try {
//       const response = await publicService.getCourses()
//       if (response.success) {
//         setCourses(response.data.courses || response.data || [])
//       }
//     } catch (error) {
//       console.error('Error fetching courses:', error)
//       setError('Failed to load courses. Please refresh the page.')
//     } finally {
//       setLoadingCourses(false)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.')
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }))
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleFileChange = (e, documentType) => {
//     const file = e.target.files[0]
//     if (file) {
//       const validation = oracleStorageService.validateFile(file, documentType)
      
//       if (!validation.valid) {
//         setError(validation.error)
//         return
//       }
      
//       setFormData(prev => ({
//         ...prev,
//         documents: {
//           ...prev.documents,
//           [documentType]: file
//         }
//       }))
//       setError('')
//     }
//   }

//   const handleCourseChange = (e) => {
//     const courseId = e.target.value
//     const selectedCourse = courses.find(c => c._id === courseId)
//     if (selectedCourse) {
//       const admissionFee = Math.round(selectedCourse.totalFees * 0.2)
//       const joiningFee = Math.round(selectedCourse.totalFees * 0.3)
//       const remainingFees = selectedCourse.totalFees - (admissionFee + joiningFee)
      
//       setFormData(prev => ({
//         ...prev,
//         course: courseId,
//         feeStructure: {
//           totalFees: selectedCourse.totalFees,
//           admissionFee: admissionFee,
//           joiningFee: joiningFee,
//           remainingFees: remainingFees
//         }
//       }))
//     }
//   }

//   const validateStep = () => {
//     switch(currentStep) {
//       case 1:
//         if (!formData.name) return 'Full name is required'
//         if (!formData.email) return 'Email is required'
//         if (!formData.password) return 'Password is required'
//         if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
//         if (formData.password.length < 6) return 'Password must be at least 6 characters'
//         if (!formData.phone) return 'Phone number is required'
//         if (!/^[6-9]\d{9}$/.test(formData.phone)) return 'Enter a valid 10-digit mobile number'
//         if (!formData.fatherName) return "Father's name is required"
//         if (!formData.dateOfBirth) return 'Date of birth is required'
//         if (!formData.address.street) return 'Street address is required'
//         if (!formData.address.city) return 'City is required'
//         if (!formData.address.state) return 'State is required'
//         if (!formData.address.pincode) return 'Pincode is required'
//         if (!/^\d{6}$/.test(formData.address.pincode)) return 'Pincode must be 6 digits'
//         return null
        
//       case 2:
//         if (!formData.course) return 'Please select a course'
//         return null
        
//       case 3:
//         if (!formData.documents.photo) return 'Please upload your photo'
//         if (!formData.documents.aadharCard) return 'Please upload Aadhar card'
//         if (!formData.documents.tenthMarksheet) return 'Please upload 10th marksheet'
//         return null
        
//       case 4:
//         if (!formData.verificationStatus.emailVerified) {
//           return 'Please verify your email first'
//         }
//         return null
        
//       case 5:
//         if (!formData.paymentStatus.transactionId) {
//           return 'Please complete the payment'
//         }
//         return null
        
//       default:
//         return null
//     }
//   }

//   const createStudentAccount = async () => {
//     try {
//       const response = await authService.registerStudent({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         phone: formData.phone,
//         fatherName: formData.fatherName,
//         dateOfBirth: formData.dateOfBirth,
//         gender: formData.gender,
//         address: formData.address,
//         course: formData.course,
//         feeStructure: formData.feeStructure,
//         registrationStatus: 'pending_documents'
//       })
      
//       if (response.success) {
//         setStudentId(response.data.studentId)
//         setSuccess('Student account created! Now proceed with document upload.')
//         return response.data.studentId
//       }
//       return null
//     } catch (error) {
//       setError(error.message || 'Failed to create student account')
//       return null
//     }
//   }

//   const sendEmailVerification = async () => {
//     setVerifyingEmail(true)
//     try {
//       const response = await authService.sendVerificationEmail(formData.email)
//       if (response.success) {
//         setSuccess('Verification OTP sent to your email')
//         setShowOtpInput(true)
//         setOtp('')
//         return true
//       }
//       return false
//     } catch (error) {
//       setError('Failed to send verification email')
//       return false
//     } finally {
//       setVerifyingEmail(false)
//     }
//   }

//   const verifyEmailOTP = async () => {
//     if (!otp || otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP')
//       return false
//     }
    
//     setVerifyingEmail(true)
//     try {
//       const response = await authService.verifyEmail(formData.email, otp)
//       if (response.success) {
//         setFormData(prev => ({
//           ...prev,
//           verificationStatus: {
//             ...prev.verificationStatus,
//             emailVerified: true
//           }
//         }))
//         setSuccess('Email verified successfully!')
//         setShowOtpInput(false)
//         return true
//       }
//       return false
//     } catch (error) {
//       setError('Invalid OTP. Please try again.')
//       return false
//     } finally {
//       setVerifyingEmail(false)
//     }
//   }

//   const uploadDocumentToOracle = async (studentId, documentType, file) => {
//     try {
//       setUploadProgress(prev => ({ ...prev, [documentType]: 30 }))
      
//       let response;
//       switch(documentType) {
//         case 'photo':
//           response = await oracleStorageService.uploadProfilePicture(file)
//           break
//         case 'aadharCard':
//           response = await oracleStorageService.uploadAadharCard(studentId, file)
//           break
//         case 'tenthMarksheet':
//         case 'twelfthMarksheet':
//           response = await oracleStorageService.uploadMarksheet(studentId, file)
//           break
//         default:
//           response = await oracleStorageService.uploadStudentDocument(studentId, file, documentType)
//       }
      
//       setUploadProgress(prev => ({ ...prev, [documentType]: 100 }))
      
//       if (response.success) {
//         setUploadedFiles(prev => ({
//           ...prev,
//           [documentType]: {
//             url: response.data?.url || response.url,
//             objectName: response.data?.objectName || response.objectName,
//             fileName: file.name,
//             uploadedAt: new Date()
//           }
//         }))
//         return true
//       }
//       return false
//     } catch (error) {
//       console.error(`Error uploading ${documentType}:`, error)
//       setUploadProgress(prev => ({ ...prev, [documentType]: 0 }))
//       return false
//     }
//   }

//   const uploadAllDocuments = async (studentId) => {
//     const documentsToUpload = [
//       { key: 'photo', required: true, label: 'Photo' },
//       { key: 'aadharCard', required: true, label: 'Aadhar Card' },
//       { key: 'tenthMarksheet', required: true, label: '10th Marksheet' },
//       { key: 'twelfthMarksheet', required: false, label: '12th Marksheet' },
//       { key: 'transferCertificate', required: false, label: 'Transfer Certificate' },
//       { key: 'casteCertificate', required: false, label: 'Caste Certificate' }
//     ]
    
//     let allSuccess = true
//     let uploadedCount = 0
    
//     for (const doc of documentsToUpload) {
//       if (formData.documents[doc.key]) {
//         const success = await uploadDocumentToOracle(studentId, doc.key, formData.documents[doc.key])
//         if (success) {
//           uploadedCount++
//         } else if (doc.required) {
//           allSuccess = false
//           setError(`Failed to upload ${doc.label}`)
//           break
//         }
//       }
//     }
    
//     if (allSuccess && uploadedCount > 0) {
//       setSuccess(`Successfully uploaded ${uploadedCount} documents to Oracle Cloud.`)
      
//       await authService.updateDocumentStatus(studentId, {
//         documentsSubmitted: true,
//         submissionDate: new Date(),
//         uploadedFiles: uploadedFiles
//       })
      
//       setFormData(prev => ({
//         ...prev,
//         verificationStatus: {
//           ...prev.verificationStatus,
//           documentsVerified: true
//         }
//       }))
      
//       setTimeout(() => setCurrentStep(4), 1500)
//       return true
//     }
//     return false
//   }

//   const processPayment = async () => {
//     setProcessingPayment(true)
//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000))
      
//       const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
      
//       setFormData(prev => ({
//         ...prev,
//         paymentStatus: {
//           ...prev.paymentStatus,
//           admissionFeePaid: true,
//           joiningFeePaid: true,
//           transactionId: transactionId,
//           paymentDate: new Date().toISOString()
//         }
//       }))
      
//       setSuccess(`Payment successful! Transaction ID: ${transactionId}`)
//       return true
//     } catch (error) {
//       setError('Payment failed. Please try again.')
//       return false
//     } finally {
//       setProcessingPayment(false)
//     }
//   }

//   const completeRegistration = async () => {
//     try {
//       const response = await authService.completeStudentRegistration({
//         studentId: studentId,
//         registrationComplete: true,
//         registrationDate: new Date(),
//         paymentStatus: formData.paymentStatus,
//         verificationStatus: formData.verificationStatus,
//         uploadedDocuments: uploadedFiles
//       })
      
//       if (response.success) {
//         setSuccess('Registration completed successfully! Redirecting to login...')
//         setTimeout(() => navigate('/login'), 3000)
//         return true
//       }
//       return false
//     } catch (error) {
//       setError('Failed to complete registration. Please contact support.')
//       return false
//     }
//   }

//   const handleNext = async (e) => {
//     e.preventDefault()
//     e.stopPropagation()
    
//     setError('')
//     setSuccess('')
    
//     const validationError = validateStep()
//     if (validationError) {
//       setError(validationError)
//       window.scrollTo({ top: 0, behavior: 'smooth' })
//       return
//     }
    
//     setLoading(true)
    
//     try {
//       switch(currentStep) {
//         case 1:
//           const id = await createStudentAccount()
//           if (id) {
//             setStudentId(id)
//             setCurrentStep(2)
//             window.scrollTo({ top: 0, behavior: 'smooth' })
//           }
//           break
          
//         case 2:
//           setCurrentStep(3)
//           window.scrollTo({ top: 0, behavior: 'smooth' })
//           break
          
//         case 3:
//           if (!studentId) {
//             setError('Please complete personal information first')
//             break
//           }
//           setUploadingDocs(true)
//           const uploadSuccess = await uploadAllDocuments(studentId)
//           setUploadingDocs(false)
//           if (uploadSuccess) {
//             setCurrentStep(4)
//             window.scrollTo({ top: 0, behavior: 'smooth' })
//           }
//           break
          
//         case 4:
//           setCurrentStep(5)
//           window.scrollTo({ top: 0, behavior: 'smooth' })
//           break
          
//         case 5:
//           const paymentSuccess = await processPayment()
//           if (paymentSuccess) {
//             await completeRegistration()
//           }
//           break
          
//         default:
//           break
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePrevious = () => {
//     setCurrentStep(prev => prev - 1)
//     setError('')
//     setSuccess('')
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   // Animation variants
//   const pageVariants = {
//     initial: { opacity: 0, x: 100 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -100 }
//   }

//   const stepVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -30 }
//   }

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   }

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 }
//   }

//   const steps = ['Personal Info', 'Course Selection', 'Documents', 'Verification', 'Payment']

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header Animation */}
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-10"
//         >
//           <motion.h2 
//             className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
//             whileHover={{ scale: 1.05 }}
//           >
//             Student Registration
//           </motion.h2>
//           <p className="mt-3 text-gray-600">
//             Already have an account?{' '}
//             <Link to="/login" className="text-blue-600 font-semibold hover:underline transition-all">
//               Sign in
//             </Link>
//           </p>
//         </motion.div>

//         {/* Step Indicator with Animation */}
//         <motion.div 
//           className="mb-10"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.5 }}
//         >
//           <div className="flex justify-between">
//             {steps.map((step, index) => (
//               <motion.div 
//                 key={index} 
//                 className="flex flex-col items-center flex-1"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <motion.div
//                   className={`
//                     w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
//                     transition-all duration-500 shadow-lg
//                     ${currentStep > index + 1 ? 'bg-green-500 text-white' : ''}
//                     ${currentStep === index + 1 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-4 ring-blue-200' : ''}
//                     ${currentStep < index + 1 ? 'bg-gray-300 text-gray-600' : ''}
//                   `}
//                   animate={{
//                     scale: currentStep === index + 1 ? [1, 1.1, 1] : 1
//                   }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {currentStep > index + 1 ? '✓' : index + 1}
//                 </motion.div>
//                 <span className={`text-xs mt-2 text-center font-medium hidden sm:block ${currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
//                   {step}
//                 </span>
//               </motion.div>
//             ))}
//           </div>
//           <motion.div 
//             className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden"
//             initial={{ width: "0%" }}
//             animate={{ width: "100%" }}
//             transition={{ duration: 0.5 }}
//           >
//             <motion.div 
//               className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
//               initial={{ width: 0 }}
//               animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
//               transition={{ duration: 0.5 }}
//             />
//           </motion.div>
//         </motion.div>

//         {/* Alert Messages with Animation */}
//         <AnimatePresence>
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />
//             </motion.div>
//           )}
//           {success && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Main Form Container */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="bg-white rounded-2xl shadow-2xl overflow-hidden"
//         >
//           <form onSubmit={(e) => e.preventDefault()} className="p-8">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentStep}
//                 variants={pageVariants}
//                 initial="initial"
//                 animate="animate"
//                 exit="exit"
//                 transition={{ duration: 0.4, type: "tween" }}
//               >
//                 {currentStep === 1 && (
//                   <motion.div variants={containerVariants} initial="hidden" animate="visible">
//                     <motion.h3 className="text-2xl font-bold text-gray-900 mb-6" variants={itemVariants}>
//                       Personal Information
//                     </motion.h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                       {[
//                         { label: 'Full Name', name: 'name', type: 'text', required: true, placeholder: 'Enter your full name' },
//                         { label: 'Email Address', name: 'email', type: 'email', required: true, placeholder: 'your@email.com' },
//                         { label: 'Password', name: 'password', type: 'password', required: true, placeholder: 'Create password' },
//                         { label: 'Confirm Password', name: 'confirmPassword', type: 'password', required: true, placeholder: 'Confirm password' },
//                         { label: 'Phone Number', name: 'phone', type: 'tel', required: true, placeholder: '9876543210' },
//                         { label: "Father's Name", name: 'fatherName', type: 'text', required: true, placeholder: "Father's full name" },
//                         { label: 'Date of Birth', name: 'dateOfBirth', type: 'date', required: true },
//                       ].map((field, idx) => (
//                         <motion.div key={idx} variants={itemVariants}>
//                           <Input
//                             label={field.label}
//                             name={field.name}
//                             type={field.type}
//                             value={formData[field.name]}
//                             onChange={handleChange}
//                             required={field.required}
//                             placeholder={field.placeholder}
//                           />
//                         </motion.div>
//                       ))}
                      
//                       <motion.div variants={itemVariants}>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
//                         <div className="flex space-x-4">
//                           {['male', 'female'].map(g => (
//                             <label key={g} className="flex items-center cursor-pointer">
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value={g}
//                                 checked={formData.gender === g}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </motion.div>
                      
//                       {['address.street', 'address.city', 'address.state', 'address.pincode'].map((field, idx) => (
//                         <motion.div key={idx} variants={itemVariants}>
//                           <Input
//                             label={field.split('.')[1].charAt(0).toUpperCase() + field.split('.')[1].slice(1)}
//                             name={field}
//                             value={formData.address[field.split('.')[1]]}
//                             onChange={handleChange}
//                             required
//                             placeholder={`Enter ${field.split('.')[1]}`}
//                           />
//                         </motion.div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}

//                 {currentStep === 2 && (
//                   <motion.div variants={containerVariants} initial="hidden" animate="visible">
//                     <motion.h3 className="text-2xl font-bold text-gray-900 mb-6" variants={itemVariants}>
//                       Select Your Course
//                     </motion.h3>
//                     <motion.div variants={itemVariants}>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Choose Course *</label>
//                       {loadingCourses ? (
//                         <div className="flex justify-center py-8">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         </div>
//                       ) : (
//                         <select
//                           value={formData.course}
//                           onChange={handleCourseChange}
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           required
//                         >
//                           <option value="">Select a course</option>
//                           {courses.map(course => (
//                             <option key={course._id} value={course._id}>
//                               {course.name} - ₹{course.totalFees?.toLocaleString()}
//                             </option>
//                           ))}
//                         </select>
//                       )}
//                     </motion.div>
                    
//                     {formData.course && (
//                       <motion.div
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.3 }}
//                         className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
//                       >
//                         <h4 className="text-lg font-semibold text-gray-900 mb-3">Fee Structure</h4>
//                         <div className="space-y-2">
//                           <div className="flex justify-between"><span>Total Fees:</span><span className="font-bold">₹{formData.feeStructure.totalFees.toLocaleString()}</span></div>
//                           <div className="flex justify-between"><span>Admission Fee (20%):</span><span className="text-yellow-600 font-bold">₹{formData.feeStructure.admissionFee.toLocaleString()}</span></div>
//                           <div className="flex justify-between"><span>Joining Fee (30%):</span><span className="text-blue-600 font-bold">₹{formData.feeStructure.joiningFee.toLocaleString()}</span></div>
//                           <div className="flex justify-between border-t pt-2"><span>Remaining (50%):</span><span className="text-green-600 font-bold">₹{formData.feeStructure.remainingFees.toLocaleString()}</span></div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 )}

//                 {currentStep === 3 && (
//                   <motion.div variants={containerVariants} initial="hidden" animate="visible">
//                     <motion.h3 className="text-2xl font-bold text-gray-900 mb-6" variants={itemVariants}>
//                       Upload Documents
//                     </motion.h3>
//                     <motion.div className="bg-yellow-50 rounded-lg p-4 mb-6" variants={itemVariants}>
//                       <p className="text-sm text-yellow-800">✓ Max size: 5MB for documents, 2MB for photos</p>
//                       <p className="text-sm text-yellow-800">✓ Allowed formats: PDF, JPG, PNG</p>
//                     </motion.div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                       {[
//                         { key: 'photo', label: 'Passport Size Photo', required: true },
//                         { key: 'aadharCard', label: 'Aadhar Card', required: true },
//                         { key: 'tenthMarksheet', label: '10th Marksheet', required: true },
//                         { key: 'twelfthMarksheet', label: '12th Marksheet', required: false },
//                         { key: 'transferCertificate', label: 'Transfer Certificate', required: false },
//                         { key: 'casteCertificate', label: 'Caste Certificate', required: false }
//                       ].map((doc, idx) => (
//                         <motion.div key={idx} variants={itemVariants}>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {doc.label} {doc.required && <span className="text-red-500">*</span>}
//                           </label>
//                           <input
//                             type="file"
//                             accept="image/*,application/pdf"
//                             onChange={(e) => handleFileChange(e, doc.key)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                           />
//                           {formData.documents[doc.key] && (
//                             <div className="mt-1">
//                               <p className="text-xs text-green-600">✓ {formData.documents[doc.key].name}</p>
//                               {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
//                                 <div className="mt-1">
//                                   <div className="bg-gray-200 rounded-full h-1">
//                                     <div className="bg-blue-600 h-1 rounded-full transition-all" style={{ width: `${uploadProgress[doc.key]}%` }} />
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </motion.div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}

//                 {currentStep === 4 && (
//                   <motion.div variants={containerVariants} initial="hidden" animate="visible">
//                     <motion.h3 className="text-2xl font-bold text-gray-900 mb-6" variants={itemVariants}>
//                       Email Verification
//                     </motion.h3>
                    
//                     <motion.div className="border rounded-lg p-6" variants={itemVariants}>
//                       <div className="flex items-center justify-between flex-wrap gap-4">
//                         <div>
//                           <p className="text-gray-600">Email: <strong>{formData.email}</strong></p>
//                           {formData.verificationStatus.emailVerified ? (
//                             <p className="text-green-600 mt-2">✓ Email verified</p>
//                           ) : (
//                             <p className="text-yellow-600 mt-2">⚠ Not verified yet</p>
//                           )}
//                         </div>
//                         {!formData.verificationStatus.emailVerified && (
//                           <Button
//                             type="button"
//                             variant="secondary"
//                             onClick={sendEmailVerification}
//                             isLoading={verifyingEmail}
//                           >
//                             Send OTP
//                           </Button>
//                         )}
//                       </div>
                      
//                       {showOtpInput && !formData.verificationStatus.emailVerified && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto' }}
//                           className="mt-4"
//                         >
//                           <div className="flex space-x-2">
//                             <Input
//                               placeholder="Enter 6-digit OTP"
//                               value={otp}
//                               onChange={(e) => setOtp(e.target.value)}
//                               className="flex-1 text-center text-2xl tracking-widest"
//                               maxLength={6}
//                             />
//                             <Button type="button" onClick={verifyEmailOTP} isLoading={verifyingEmail}>
//                               Verify
//                             </Button>
//                           </div>
//                         </motion.div>
//                       )}
//                     </motion.div>
                    
//                     {formData.verificationStatus.documentsVerified && (
//                       <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
//                       >
//                         <p className="text-green-800">✓ Documents uploaded successfully. Admin will verify them shortly.</p>
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 )}

//                 {currentStep === 5 && (
//                   <motion.div variants={containerVariants} initial="hidden" animate="visible">
//                     <motion.h3 className="text-2xl font-bold text-gray-900 mb-6" variants={itemVariants}>
//                       Complete Payment
//                     </motion.h3>
                    
//                     <motion.div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6" variants={itemVariants}>
//                       <h4 className="text-lg font-semibold mb-3">Payment Summary</h4>
//                       <div className="space-y-2">
//                         <div className="flex justify-between"><span>Admission Fee:</span><span>₹{formData.feeStructure.admissionFee.toLocaleString()}</span></div>
//                         <div className="flex justify-between"><span>Joining Fee:</span><span>₹{formData.feeStructure.joiningFee.toLocaleString()}</span></div>
//                         <div className="border-t pt-2 mt-2">
//                           <div className="flex justify-between"><span className="font-bold">Total to Pay:</span><span className="font-bold text-blue-600 text-xl">₹{(formData.feeStructure.admissionFee + formData.feeStructure.joiningFee).toLocaleString()}</span></div>
//                         </div>
//                       </div>
//                     </motion.div>
                    
//                     <motion.div className="border rounded-lg p-6" variants={itemVariants}>
//                       <Button
//                         type="button"
//                         variant="primary"
//                         className="w-full"
//                         onClick={() => {
//                           const demoId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
//                           setFormData(prev => ({
//                             ...prev,
//                             paymentStatus: { ...prev.paymentStatus, transactionId: demoId }
//                           }))
//                           setSuccess(`Demo transaction ID generated: ${demoId}`)
//                         }}
//                       >
//                         Generate Demo Transaction ID
//                       </Button>
//                     </motion.div>
                    
//                     {formData.paymentStatus.transactionId && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
//                       >
//                         <p className="text-green-800">Transaction ID: <strong>{formData.paymentStatus.transactionId}</strong></p>
//                         <p className="text-sm text-green-700 mt-1">Click "Complete Registration" to finish</p>
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 )}
//               </motion.div>
//             </AnimatePresence>

//             {/* Navigation Buttons */}
//             <motion.div 
//               className="mt-8 flex justify-between"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               {currentStep > 1 && (
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Button type="button" variant="secondary" onClick={handlePrevious}>
//                     ← Previous
//                   </Button>
//                 </motion.div>
//               )}
//               <motion.div 
//                 className={currentStep === 1 ? "ml-auto" : ""}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button
//                   type="button"
//                   onClick={handleNext}
//                   isLoading={loading || uploadingDocs || processingPayment}
//                 >
//                   {currentStep === 5 ? 'Complete Registration ✓' : 'Next →'}
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </form>
//         </motion.div>
//       </div>

//       {/* Loading Overlay for Document Upload */}
//       <AnimatePresence>
//         {uploadingDocs && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl p-8 text-center max-w-md"
//             >
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-700 font-medium">Uploading documents to Oracle Cloud...</p>
//               <p className="text-sm text-gray-500 mt-2">Please don't close this window</p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// export default RegisterPage