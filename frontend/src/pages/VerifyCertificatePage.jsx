// pages/VerifyCertificatePage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaCertificate, FaShieldAlt, FaCheckCircle } from 'react-icons/fa'
import { certificateService } from '../services/certificateService'
import Alert from '../components/common/Alert'

const VerifyCertificatePage = () => {
  const navigate = useNavigate()
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!certificateId.trim()) {
      setError('Please enter a certificate ID')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const response = await certificateService.verifyCertificate(certificateId)
      console.log('Full response:', response)
      
      // Extract the verification data from the response
      // Structure: response.data.verificationData (since your interceptor returns response.data)
      const verificationData = response?.verificationData || response?.data?.verificationData
      
      if (verificationData && verificationData.valid === true) {
        // Extract student and course information
        const studentName = verificationData.student?.name || 'N/A'
        const courseName = verificationData.course?.name || 'N/A'
        const issueDate = verificationData.issueDate
        const grade = verificationData.grade
        const percentage = verificationData.percentage
        
        setSuccess({
          studentName: studentName,
          courseName: courseName,
          completionDate: issueDate,
          grade: grade,
          percentage: percentage,
          certificateId: certificateId
        })

        // Redirect to download page after 2 seconds
        setTimeout(() => {
          navigate(`/certificate-download/${certificateId}`)
        }, 2000)
      } else if (verificationData && verificationData.valid === false) {
        setError(verificationData.message || 'Invalid certificate ID. Please check and try again.')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Error verifying certificate:', err)
      
      if (typeof err === 'string') {
        setError(err)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to verify certificate. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setCertificateId(e.target.value.toUpperCase())
    setError('')
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-3 mb-4">
            <FaShieldAlt className="text-blue-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Certificate</h1>
          <p className="text-gray-600">
            Enter the certificate ID to verify its authenticity
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center text-white">
              <FaCertificate className="text-2xl mr-3" />
              <div>
                <p className="font-semibold">Certificate Verification System</p>
                <p className="text-sm text-blue-100">Each certificate has a unique ID</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={certificateId}
                    onChange={handleInputChange}
                    placeholder="e.g., JASA0326001"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <FaCertificate className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the certificate ID printed on your certificate
                </p>
              </div>

              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800">Certificate Verified!</h3>
                      <div className="text-sm text-green-700 mt-2 space-y-1">
                        <p>
                          <strong>Student:</strong> {success.studentName}
                        </p>
                        <p>
                          <strong>Course:</strong> {success.courseName}
                        </p>
                        {success.grade && (
                          <p>
                            <strong>Grade:</strong> {success.grade} ({success.percentage}%)
                          </p>
                        )}
                        <p>
                          <strong>Issue Date:</strong>{' '}
                          {success.completionDate ? new Date(success.completionDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                        <p>
                          <strong>Certificate ID:</strong> {success.certificateId}
                        </p>
                      </div>
                      <p className="text-sm text-green-600 mt-3">
                        Redirecting to certificate download...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !certificateId.trim()}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Verify Certificate
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FaShieldAlt className="mr-1 text-green-500" />
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center">
              <FaCertificate className="mr-1 text-blue-500" />
              <span>Globally Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCertificatePage