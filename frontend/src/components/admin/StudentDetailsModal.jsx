// src/components/admin/StudentDetailsModal.jsx
import React from 'react'
import { Modal, Card, Button } from '../common'
import { 
  FaUser, FaEnvelope, FaPhone, FaUserTie, FaCalendarAlt, 
  FaMapMarkerAlt, FaBookOpen, FaRupeeSign, FaCreditCard,
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock,
  FaIdCard, FaTint, FaVenusMars, FaDownload, FaEye
} from 'react-icons/fa'
import { format } from 'date-fns'

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!student) return null

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800'
    }
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    }
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getStepText = (step) => {
    const steps = {
      1: 'Personal Information',
      2: 'Course Selection',
      3: 'Email Verification',
      4: 'Document Upload',
      5: 'Payment',
      6: 'Completed'
    }
    return steps[step] || 'Not Started'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return format(new Date(date), 'dd MMM yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  const handleViewDocument = (docUrl) => {
    if (docUrl) {
      window.open(docUrl, '_blank')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Details"
      size="lg"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {student.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600">Enrollment No: {student.enrollmentNo || 'Not Assigned'}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                  {student.status?.toUpperCase() || 'PENDING'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(student.paymentStatus)}`}>
                  {student.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <FaEnvelope className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{student.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaPhone className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{student.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaUserTie className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Father's Name</p>
                <p className="text-gray-900">{student.fatherName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaUserTie className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Mother's Name</p>
                <p className="text-gray-900">{student.motherName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaCalendarAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaVenusMars className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-900 capitalize">{student.gender || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FaTint className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-gray-900">{student.bloodGroup || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        {student.address && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Street</p>
                <p className="text-gray-900">{student.address.street || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-gray-900">{student.address.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-gray-900">{student.address.state || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="text-gray-900">{student.address.pincode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="text-gray-900">{student.address.country || 'India'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Course & Fee Information */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBookOpen className="text-blue-600" />
            Course & Fee Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Course Name</p>
              <p className="text-gray-900 font-medium">{student.course?.name || student.courseName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Fees</p>
              <p className="text-gray-900 font-medium">₹{student.course?.totalFees || student.courseFee || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admission Date</p>
              <p className="text-gray-900">{formatDate(student.admissionDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="text-gray-900 capitalize">{student.paymentMethod || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Registration Progress */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaClock className="text-blue-600" />
            Registration Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Step</span>
              <span className="text-sm font-medium text-blue-600">
                Step {student.registrationStep || 1}: {getStepText(student.registrationStep)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${((student.registrationStep || 1) / 6) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-6 gap-1 mt-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs ${
                    (student.registrationStep || 1) >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    {getStepText(step).split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Documents Section */}
        {student.documents && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaFileAlt className="text-blue-600" />
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {student.documents.photo && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Photo</span>
                    <button
                      onClick={() => handleViewDocument(student.documents.photo)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              )}
              {student.documents.aadharCard && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aadhar Card</span>
                    <button
                      onClick={() => handleViewDocument(student.documents.aadharCard)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              )}
              {student.documents.marksheet && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Marksheet</span>
                    <button
                      onClick={() => handleViewDocument(student.documents.marksheet)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Payment History */}
        {student.payments && student.payments.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaCreditCard className="text-blue-600" />
              Payment History
            </h3>
            <div className="space-y-3">
              {student.payments.map((payment, index) => (
                <div key={index} className="border-b last:border-0 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">₹{payment.amount}</p>
                      <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status?.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{payment.method}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.print()}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Print Details
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StudentDetailsModal