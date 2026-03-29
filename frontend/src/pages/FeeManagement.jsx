// src/components/admin/FeeManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { feeService, studentService, courseService } from '../../services'
import { Card, Button, Input, Alert, Modal, Loader } from '../common'
import { 
  FaRupeeSign, FaReceipt, FaDownload, FaEye, FaSearch, FaFilter, 
  FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaTimesCircle, 
  FaUser, FaIdCard, FaClock, FaCreditCard, FaUniversity, 
  FaMobileAlt, FaFileInvoice, FaPercent, FaWallet, FaChartLine,
  FaEnvelope, FaPrint, FaPlus, FaMinus, FaBuilding, FaSync
} from 'react-icons/fa'
import { format, addMonths } from 'date-fns'
import { debounce } from 'lodash'

const FeeManagement = () => {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [installments, setInstallments] = useState([])
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'cash',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [createFeeData, setCreateFeeData] = useState({
    studentId: '',
    courseId: '',
    admissionFee: 0,
    totalFees: 0,
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0
    },
    numberOfInstallments: 1,
    dueDate: '',
    customAmount: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    course: '',
    admissionFeePaid: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [summary, setSummary] = useState(null)
  const [selectedFee, setSelectedFee] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showInstallmentModal, setShowInstallmentModal] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)

  // Fetch data with loading state
  const fetchData = useCallback(async () => {
    setFilterLoading(true)
    try {
      const [feesRes, studentsRes, coursesRes, summaryRes] = await Promise.all([
        feeService.getAllFees(filters),
        studentService.getAllStudents({ limit: 1000 }),
        courseService.getAllCourses({ isActive: true }),
        feeService.getFeeSummary()
      ])
      if (feesRes.success) setFees(feesRes.data.fees)
      if (studentsRes.success) setStudents(studentsRes.data.students)
      if (coursesRes.success) setCourses(coursesRes.data.courses)
      if (summaryRes.success) setSummary(summaryRes.data)
    } catch (error) {
      setError(error.message || 'Failed to fetch data')
    } finally {
      setFilterLoading(false)
      setLoading(false)
    }
  }, [filters])

  // Debounced filter change
  const debouncedFetchData = useMemo(
    () => debounce(() => {
      fetchData()
    }, 500),
    [fetchData]
  )

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    debouncedFetchData()
    return () => {
      debouncedFetchData.cancel()
    }
  }, [filters, debouncedFetchData])

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId)
    setSelectedStudent(student)
    setCreateFeeData({ ...createFeeData, studentId })
  }



const handleAdmissionFeeChange = (value) => {
  const admissionFee = parseFloat(value) || 0
  setCreateFeeData(prev => ({ ...prev, admissionFee }))
  
  if (selectedCourse) {
    const totalWithAdmission = selectedCourse.totalFees + admissionFee
    let finalAmount = totalWithAdmission
    let discountAmount = 0
    
    if (createFeeData.discount.type === 'percentage' && createFeeData.discount.value > 0) {
      discountAmount = (totalWithAdmission * createFeeData.discount.value) / 100
      finalAmount = totalWithAdmission - discountAmount
    } else if (createFeeData.discount.type === 'fixed' && createFeeData.discount.value > 0) {
      discountAmount = createFeeData.discount.value
      finalAmount = totalWithAdmission - discountAmount
    }
    
    setCreateFeeData(prev => ({
      ...prev,
      totalFees: totalWithAdmission,
      discount: { ...prev.discount, amount: discountAmount },
      customAmount: finalAmount
    }))
    
    generateInstallments(finalAmount, createFeeData.numberOfInstallments, createFeeData.dueDate)
  }
}

  const generateInstallments = (totalAmount, numberOfInstallments, dueDate) => {
    const installmentAmount = Math.ceil(totalAmount / numberOfInstallments)
    const installmentsList = []
    const startDate = dueDate ? new Date(dueDate) : new Date()
    
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDateObj = addMonths(startDate, i - 1)
      installmentsList.push({
        installmentNumber: i,
        amount: i === numberOfInstallments ? totalAmount - (installmentAmount * (numberOfInstallments - 1)) : installmentAmount,
        dueDate: dueDateObj,
        status: 'pending',
        paidAmount: 0,
        paidDate: null
      })
    }
    setInstallments(installmentsList)
  }

  const handleDiscountChange = (type, value) => {
    const discountValue = parseFloat(value) || 0
    let discountAmount = 0
    let finalAmount = createFeeData.totalFees
    
    if (type === 'percentage') {
      discountAmount = (createFeeData.totalFees * discountValue) / 100
      finalAmount = createFeeData.totalFees - discountAmount
    } else if (type === 'fixed') {
      discountAmount = discountValue
      finalAmount = createFeeData.totalFees - discountAmount
    }
    
    setCreateFeeData({
      ...createFeeData,
      discount: {
        type,
        value: discountValue,
        amount: discountAmount
      },
      customAmount: finalAmount
    })
    
    generateInstallments(finalAmount, createFeeData.numberOfInstallments, createFeeData.dueDate)
  }

  const handleInstallmentCountChange = (count) => {
    const maxInstallments = selectedCourse ? 
      (selectedCourse.duration?.unit === 'months' ? Math.min(selectedCourse.duration.value, 12) : 6) : 12
    
    const newCount = Math.min(parseInt(count), maxInstallments)
    setCreateFeeData({
      ...createFeeData,
      numberOfInstallments: newCount
    })
    
    generateInstallments(createFeeData.customAmount, newCount, createFeeData.dueDate)
  }

  const handleCreateFee = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const feeData = {
        studentId: createFeeData.studentId,
        courseId: createFeeData.courseId,
        admissionFee: createFeeData.admissionFee,
        courseFee: selectedCourse?.totalFees || 0,
        totalFees: createFeeData.totalFees,
        discountedAmount: createFeeData.discount.amount,
        finalAmount: createFeeData.customAmount,
        numberOfInstallments: createFeeData.numberOfInstallments,
        installments: installments,
        discount: createFeeData.discount,
        dueDate: createFeeData.dueDate
      }
      
      const response = await feeService.createFee(feeData)
      if (response.success) {
        setSuccess('Fee structure created successfully!')
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
        setShowCreateFeeModal(false)
        resetCreateFeeForm()
      } else {
        setError(response.message || 'Failed to create fee')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to create fee')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const paymentDetails = {
        amount: parseFloat(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        transactionId: paymentData.transactionId,
        paymentDate: paymentData.paymentDate,
        notes: paymentData.notes
      }
      
      const response = await feeService.makePayment(selectedStudent._id, paymentDetails)
      if (response.success) {
        setSuccess('Payment successful!')
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
        setShowPaymentModal(false)
        setSelectedStudent(null)
        resetPaymentForm()
      } else {
        setError(response.message || 'Payment failed')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Payment failed')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (fee) => {
    try {
      const response = await feeService.sendReminder(fee.studentId._id)
      if (response.success) {
        setSuccess('Reminder sent successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || 'Failed to send reminder')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to send reminder')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleViewReceipt = (fee) => {
    setSelectedFee(fee)
    setShowReceiptModal(true)
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      search: '',
      course: '',
      admissionFeePaid: ''
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-600',
      pending: 'bg-yellow-100 text-yellow-600',
      partially_paid: 'bg-blue-100 text-blue-600',
      overdue: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusText = (status) => {
    const texts = {
      paid: 'Paid',
      pending: 'Pending',
      partially_paid: 'Partially Paid',
      overdue: 'Overdue'
    }
    return texts[status] || status
  }

  const resetCreateFeeForm = () => {
    setCreateFeeData({
      studentId: '',
      courseId: '',
      admissionFee: 0,
      totalFees: 0,
      discount: { type: 'percentage', value: 0, amount: 0 },
      numberOfInstallments: 1,
      dueDate: '',
      customAmount: 0
    })
    setSelectedStudent(null)
    setSelectedCourse(null)
    setInstallments([])
  }

  const resetPaymentForm = () => {
    setPaymentData({
      amount: '',
      paymentMode: 'cash',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  if (loading && fees.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Manage student fees, installments, and payments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateFeeModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="inline mr-2" />
            Create Fee Structure
          </Button>
          <Button 
            onClick={() => setShowPaymentModal(true)}
            variant="secondary"
          >
            <FaMoneyBillWave className="inline mr-2" />
            Collect Payment
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} className="animate-fade-in" />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} className="animate-fade-in" />
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaWallet className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Total Collected</p>
            <p className="text-2xl font-bold">₹{summary.totalPaid?.toLocaleString() || 0}</p>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaClock className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Total Pending</p>
            <p className="text-2xl font-bold">₹{summary.totalPending?.toLocaleString() || 0}</p>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaCalendarAlt className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Overdue</p>
            <p className="text-2xl font-bold">{summary.overdueCount || 0}</p>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaReceipt className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Total Fees</p>
            <p className="text-2xl font-bold">₹{summary.totalFees?.toLocaleString() || 0}</p>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaChartLine className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Collection Rate</p>
            <p className="text-2xl font-bold">{summary.collectionRate || 0}%</p>
          </Card>
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 transform transition-all duration-300 hover:scale-105">
            <FaBuilding className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90">Admission Fee</p>
            <p className="text-2xl font-bold">₹{summary.totalAdmissionFeePaid?.toLocaleString() || 0}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by name or enrollment..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <select
            value={filters.admissionFeePaid}
            onChange={(e) => setFilters({ ...filters, admissionFeePaid: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">Admission Fee Status</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
          <Button 
            variant="secondary" 
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <FaSync className={filterLoading ? "animate-spin" : ""} />
            Clear Filters
          </Button>
        </div>
        {filterLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        )}
      </Card>

      {/* Fees Table */}
      <Card className="overflow-x-auto transition-all duration-300">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Admission Fee</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Fees</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Paid</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pending</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Installments</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee._id} className="hover:bg-gray-50 transition-all duration-200">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fee.studentId?.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{fee.studentId?.enrollmentNo}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.courseId?.name}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    ₹{fee.admissionFee?.toLocaleString() || 0}
                    {fee.admissionFeePaid ? (
                      <FaCheckCircle className="text-green-500 text-sm" title="Paid" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-sm" title="Pending" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">₹{fee.totalFees?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-green-600">₹{fee.paidAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-red-600">₹{fee.pendingAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">
                      {fee.installments?.filter(i => i.status === 'paid').length || 0}/{fee.numberOfInstallments || 1}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFee(fee)
                        setShowInstallmentModal(true)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 block"
                    >
                      View Details
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {fee.dueDate && format(new Date(fee.dueDate), 'dd MMM yyyy')}
                  {new Date(fee.dueDate) < new Date() && fee.status !== 'paid' && (
                    <span className="ml-2 text-xs text-red-500">Overdue</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee.status)} transition-all duration-200`}>
                    {getStatusText(fee.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleViewReceipt(fee)}
                      className="text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-110"
                      title="View Receipt"
                    >
                      <FaReceipt />
                    </button>
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedStudent(fee.studentId)
                          setShowPaymentModal(true)
                        }}
                        className="text-green-600 hover:text-green-800 transition-all duration-200 hover:scale-110"
                        title="Collect Payment"
                      >
                        <FaMoneyBillWave />
                      </button>
                    )}
                    <button
                      onClick={() => handleSendReminder(fee)}
                      className="text-yellow-600 hover:text-yellow-800 transition-all duration-200 hover:scale-110"
                      title="Send Reminder"
                    >
                      <FaEnvelope />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create Fee Modal */}
<Modal isOpen={showCreateFeeModal} onClose={() => setShowCreateFeeModal(false)} title="Create Fee Structure" size="lg">
  <form onSubmit={handleCreateFee} className="space-y-4">
    {/* Student Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Student *</label>
      <select
        value={createFeeData.studentId}
        onChange={(e) => handleStudentSelect(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Student</option>
        {students.map(student => (
          <option key={student._id} value={student._id}>
            {student.name} - {student.enrollmentNo}
          </option>
        ))}
      </select>
    </div>

    {/* Course Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Course *</label>
      <select
        value={createFeeData.courseId}
        onChange={(e) => handleCourseSelect(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        disabled={!createFeeData.studentId}
      >
        <option value="">Select Course</option>
        {courses.map(course => (
          <option key={course._id} value={course._id}>
            {course.name} - ₹{course.totalFees?.toLocaleString()} ({course.duration?.value} {course.duration?.unit})
          </option>
        ))}
      </select>
      {!createFeeData.studentId && (
        <p className="text-xs text-yellow-600 mt-1">Please select a student first</p>
      )}
    </div>

    {/* Admission Fee (Same for all courses) */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Admission Fee (₹) - Same for all courses
      </label>
      <Input
        type="number"
        value={createFeeData.admissionFee || ''}
        onChange={(e) => handleAdmissionFeeChange(e.target.value)}
        placeholder="Enter admission fee amount"
        min="0"
        step="100"
      />
      <p className="text-xs text-gray-500 mt-1">Admission fee is common for all courses</p>
    </div>

    {selectedCourse && (
      <>
        {/* Course Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Fee Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-600">Course Fee:</p>
            <p className="font-medium">₹{selectedCourse.totalFees?.toLocaleString()}</p>
            <p className="text-gray-600">Admission Fee:</p>
            <p className="font-medium">₹{createFeeData.admissionFee?.toLocaleString() || 0}</p>
            <p className="text-gray-600 font-semibold">Total Fee:</p>
            <p className="font-medium text-blue-600 font-semibold">₹{(selectedCourse.totalFees + (createFeeData.admissionFee || 0)).toLocaleString()}</p>
          </div>
        </div>

        {/* Discount Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={createFeeData.discount.type}
              onChange={(e) => handleDiscountChange(e.target.value, createFeeData.discount.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            <input
              type="number"
              value={createFeeData.discount.value || ''}
              onChange={(e) => handleDiscountChange(createFeeData.discount.type, e.target.value)}
              placeholder={createFeeData.discount.type === 'percentage' ? 'Discount %' : 'Discount Amount'}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          {createFeeData.discount.amount > 0 && (
            <p className="text-sm text-green-600 mt-1">
              Discount: ₹{createFeeData.discount.amount?.toLocaleString()} | Net Payable: ₹{createFeeData.customAmount?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Installments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Installments (Max: {selectedCourse.duration?.unit === 'months' ? Math.min(selectedCourse.duration.value, 12) : 6})
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleInstallmentCountChange(createFeeData.numberOfInstallments - 1)}
              disabled={createFeeData.numberOfInstallments <= 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <FaMinus />
            </button>
            <input
              type="number"
              value={createFeeData.numberOfInstallments}
              onChange={(e) => handleInstallmentCountChange(e.target.value)}
              min="1"
              max={selectedCourse.duration?.unit === 'months' ? Math.min(selectedCourse.duration.value, 12) : 6}
              className="w-20 text-center px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleInstallmentCountChange(createFeeData.numberOfInstallments + 1)}
              disabled={createFeeData.numberOfInstallments >= (selectedCourse.duration?.unit === 'months' ? Math.min(selectedCourse.duration.value, 12) : 6)}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Installment Schedule */}
        {installments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installment Schedule</label>
            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Installment</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{inst.installmentNumber}</td>
                      <td className="px-3 py-2">₹{inst.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">{format(inst.dueDate, 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Input
          label="First Installment Due Date *"
          type="date"
          value={createFeeData.dueDate}
          onChange={(e) => {
            setCreateFeeData({ ...createFeeData, dueDate: e.target.value })
            if (selectedCourse) {
              generateInstallments(createFeeData.customAmount, createFeeData.numberOfInstallments, e.target.value)
            }
          }}
          required
        />
      </>
    )}

    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="secondary" onClick={() => {
        setShowCreateFeeModal(false)
        resetCreateFeeForm()
      }}>
        Cancel
      </Button>
      <Button type="submit" isLoading={loading} disabled={!createFeeData.courseId}>
        Create Fee Structure
      </Button>
    </div>
  </form>
</Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Collect Payment" size="md">
        <form onSubmit={handlePayment} className="space-y-4">
          {selectedStudent && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-500">{selectedStudent.enrollmentNo}</p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Amount (₹)"
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
            required
            min="1"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select
              value={paymentData.paymentMode}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <Input
            label="Payment Date"
            type="date"
            value={paymentData.paymentDate}
            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
            required
          />

          <Input
            label="Transaction ID (Optional)"
            value={paymentData.transactionId}
            onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
            placeholder="Enter transaction reference"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Process Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Payment Receipt" size="md">
        {selectedFee && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <FaFileInvoice className="text-4xl text-blue-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold">Payment Receipt</h2>
              <p className="text-sm text-gray-500">Receipt #{selectedFee._id?.slice(-6)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium">{selectedFee.studentId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Enrollment No:</span>
                <span className="font-medium">{selectedFee.studentId?.enrollmentNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{selectedFee.courseId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees:</span>
                <span className="font-medium">₹{selectedFee.totalFees?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">₹{selectedFee.paidAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Balance:</span>
                <span className="font-medium text-red-600">₹{selectedFee.pendingAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-medium ${getStatusColor(selectedFee.status)}`}>
                  {getStatusText(selectedFee.status)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowReceiptModal(false)} className="flex-1">
                Close
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                <FaPrint className="inline mr-2" />
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Installment Details Modal */}
      <Modal isOpen={showInstallmentModal} onClose={() => setShowInstallmentModal(false)} title="Installment Details" size="md">
        {selectedFee && selectedFee.installmentPlan?.installments && (
          <div className="space-y-3">
            {selectedFee.installmentPlan.installments.map((inst, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Installment {inst.installmentNumber}</span>
                  <span className={`text-xs px-2 py-1 rounded ${inst.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {inst.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">₹{inst.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid:</span>
                    <span className="ml-2">₹{inst.paidAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2">{format(new Date(inst.dueDate), 'dd MMM yyyy')}</span>
                  </div>
                  {inst.paidDate && (
                    <div>
                      <span className="text-gray-600">Paid Date:</span>
                      <span className="ml-2">{format(new Date(inst.paidDate), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FeeManagement