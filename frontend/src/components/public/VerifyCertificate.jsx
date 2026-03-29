import React, { useState } from 'react'
import { publicService } from '../../services'
import { Input, Button, Alert, Card } from '../common'
import { FaCheckCircle, FaTimesCircle, FaDownload, FaShare, FaQrcode, FaCertificate } from 'react-icons/fa'

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await publicService.verifyCertificate(certificateId.trim())
      if (response.success && response.data.isValid) {
        setResult(response.data.certificate)
      } else {
        setError('Certificate not found or invalid')
      }
    } catch (err) {
      setError('Failed to verify certificate. Please check the ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/verify-certificate/${certificateId}`
    navigator.clipboard.writeText(url)
    alert('Verification link copied to clipboard!')
  }

  const handleDownload = () => {
    // In production, download PDF
    alert('Download functionality coming soon')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <FaCertificate className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          <p className="text-gray-600 mt-2">Enter the certificate ID to verify authenticity</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate ID
              </label>
              <Input
                placeholder="Enter certificate ID (e.g., CERT/2025/123456)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: CERT/2025/123456 or 67d8a1b2c3d4e5f6g7h8i9j
              </p>
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Verify Certificate
            </Button>
          </form>
        </Card>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Verification Result */}
        {result && (
          <Card>
            <div className="text-center">
              <div className="mb-4">
                <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Valid Certificate
              </h2>
              <p className="text-gray-600 mb-6">This certificate is authentic and verified</p>

              {/* Certificate Details */}
              <div className="border rounded-lg p-6 bg-gray-50 mb-6">
                <div className="text-center mb-4">
                  <FaCertificate className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">Certificate of Completion</h3>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-mono text-sm font-medium">{result.certificateId}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium text-lg">{result.studentName}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Father's Name</p>
                    <p className="font-medium">{result.fatherName}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Enrollment No.</p>
                    <p className="font-mono">{result.enrollmentNo}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{result.course}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{result.duration}</p>
                  </div>
                  {result.grade && (
                    <div className="border-b pb-2">
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-bold text-primary-600">{result.grade}</p>
                    </div>
                  )}
                  {result.percentage && (
                    <div className="border-b pb-2">
                      <p className="text-sm text-gray-500">Percentage</p>
                      <p className="font-bold text-primary-600">{result.percentage}%</p>
                    </div>
                  )}
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p>{new Date(result.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issued By</p>
                    <p className="font-medium">{result.issuedBy}</p>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="mt-6 p-4 bg-white rounded-lg border text-center">
                  <FaQrcode className="w-24 h-24 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Scan QR code to verify</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={handleDownload}>
                  <FaDownload className="inline mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <FaShare className="inline mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VerifyCertificate