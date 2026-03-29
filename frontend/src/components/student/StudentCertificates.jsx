// src/components/student/StudentCertificates.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { certificateService } from '../../services'
import { Card, Button, Alert, Loader } from '../common'
import { FaArrowLeft, FaDownload, FaEye, FaShare, FaQrcode, FaCheckCircle, FaCertificate } from 'react-icons/fa'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const StudentCertificates = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    console.log('🔵 Fetching certificates...')
    try {
      const response = await certificateService.getStudentCertificates(user._id)
      console.log('🔵 Response:', response)
      if (response.success) {
        setCertificates(response.data.certificates || [])
      } else {
        setError(response.message || 'Failed to fetch certificates')
      }
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError(err.message || 'Failed to fetch certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (cert) => {
    window.open(cert.pdfUrl || '#', '_blank')
    alert('Download functionality coming soon')
  }

  const handleShare = (cert) => {
    const url = `${window.location.origin}/verify-certificate/${cert.certificateId}`
    navigator.clipboard.writeText(url)
    alert('Verification link copied to clipboard!')
  }

  const getTypeLabel = (type) => {
    const labels = {
      course_completion: 'Course Completion',
      achievement: 'Achievement',
      participation: 'Participation',
      bonafide: 'Bonafide'
    }
    return labels[type] || type
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">❌ {error}</p>
        <Button onClick={fetchCertificates}>Retry</Button>
      </div>
    )
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Certificates</h1>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert._id} hover>
              <div className="text-center">
                <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCertificate className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{getTypeLabel(cert.type)}</h3>
                <p className="text-sm text-gray-500">{cert.courseId?.name}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Issued: {format(new Date(cert.issueDate), 'dd MMM yyyy')}
                </p>
                {cert.percentage && (
                  <p className="text-sm font-semibold text-primary-600 mt-1">{cert.percentage}%</p>
                )}
                {cert.grade && (
                  <p className="text-sm font-semibold text-primary-600 mt-1">Grade: {cert.grade}</p>
                )}
              </div>
              <div className="flex justify-center space-x-3 mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedCert(cert)
                    setShowViewModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="View Certificate"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleDownload(cert)}
                  className="text-green-600 hover:text-green-800"
                  title="Download PDF"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={() => handleShare(cert)}
                  className="text-purple-600 hover:text-purple-800"
                  title="Share Verification Link"
                >
                  <FaShare />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FaCertificate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No certificates issued yet</p>
            <p className="text-sm text-gray-400 mt-2">Certificates will appear here once issued by admin</p>
          </div>
        </Card>
      )}

      {/* View Certificate Modal */}
      {showViewModal && selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Certificate Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="text-center mb-6">
                  <FaCertificate className="w-16 h-16 text-primary-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Certificate of {getTypeLabel(selectedCert.type)}</h2>
                  <p className="text-gray-600 mt-2">This certificate is proudly presented to</p>
                  <h3 className="text-3xl font-bold text-primary-600 my-4">{user?.name}</h3>
                  <p className="text-gray-600">for successfully completing</p>
                  <h4 className="text-xl font-semibold mt-2">{selectedCert.courseId?.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-mono text-sm">{selectedCert.certificateId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p>{format(new Date(selectedCert.issueDate), 'dd MMM yyyy')}</p>
                  </div>
                  {selectedCert.percentage && (
                    <div>
                      <p className="text-sm text-gray-500">Percentage</p>
                      <p className="font-semibold text-primary-600">{selectedCert.percentage}%</p>
                    </div>
                  )}
                  {selectedCert.grade && (
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-semibold text-primary-600">{selectedCert.grade}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Issued By</p>
                    <p>{selectedCert.issuedBy?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verification Status</p>
                    <span className="inline-flex items-center text-green-600">
                      <FaCheckCircle className="mr-1" /> Verified
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border text-center">
                  <FaQrcode className="w-24 h-24 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Scan QR code to verify</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {`${window.location.origin}/verify-certificate/${selectedCert.certificateId}`}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mt-6">
                <Button onClick={() => handleDownload(selectedCert)}>
                  <FaDownload className="inline mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedCert)}>
                  <FaShare className="inline mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentCertificates

