import React, { useState, useRef } from 'react'
import { publicService } from '../../services'
import { Input, Button, Alert, Card } from '../common'
import { FaCheckCircle, FaTimesCircle, FaDownload, FaShare, FaQrcode, FaCertificate, FaStamp } from 'react-icons/fa'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const certificateRef = useRef(null)

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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return

    try {
      const element = certificateRef.current
      const canvas = await html2canvas(element, {
        scale: 2, // high resolution
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      
      // Use landscape A4 (297x210 mm) to fit certificate width better
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      
      const imgWidth = 277 // A4 landscape usable width (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(`certificate_${result?.certificateId || 'download'}.pdf`)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('Failed to generate PDF. Please try again.')
    }
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

        {/* Verification Result - Certificate Template */}
        {result && (
          <div className="flex flex-col items-center">
            {/* This div is captured for PDF */}
            <div
              ref={certificateRef}
              className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-double border-amber-700 mb-6"
            >
              {/* Inner certificate border */}
              <div className="border-4 border-amber-600 m-2 p-6 relative">
                {/* Decorative corners */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-700"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-amber-700"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-amber-700"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-700"></div>

                {/* Logo / Seal */}
                <div className="text-center mb-4">
                  <FaStamp className="w-16 h-16 text-amber-700 mx-auto mb-2" />
                  <h2 className="text-3xl font-serif font-bold text-gray-800">JAS Computer Institute</h2>
                  <p className="text-gray-600 text-sm">(Recognised Computer Training Center)</p>
                  <p className="text-gray-500 text-xs">ROKAIYA COMPLEX, PURANI BAZAR, SURIYAWAN, BHADOHI - 221404</p>
                </div>

                <div className="border-t-2 border-gray-300 my-4"></div>

                <h3 className="text-center text-2xl font-serif font-bold uppercase tracking-wider text-amber-800 mb-4">
                  Certificate of Completion
                </h3>

                <p className="text-center text-gray-700 mb-6">
                  This is to certify that
                </p>

                <p className="text-center text-3xl font-bold text-gray-900 mb-2">
                  {result.studentName}
                </p>
                <p className="text-center text-gray-600 mb-1">S/o, D/o {result.fatherName}</p>

                <p className="text-center text-gray-700 mt-6 mb-2">
                  has successfully completed the course
                </p>

                <p className="text-center text-2xl font-bold text-primary-700 mb-2">
                  {result.course}
                </p>

                <p className="text-center text-gray-700">
                  Duration: {result.duration} &nbsp;|&nbsp; Enrollment No: {result.enrollmentNo}
                </p>

                {result.grade && result.percentage && (
                  <p className="text-center text-gray-700">
                    Grade: {result.grade} &nbsp;|&nbsp; Percentage: {result.percentage}%
                  </p>
                )}

                <div className="flex justify-between items-end mt-10">
                  <div className="text-center">
                    <div className="w-40 border-t border-gray-800 pt-1"></div>
                    <p className="text-sm text-gray-600 mt-1">Date: {new Date(result.issueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-t border-gray-800 pt-1"></div>
                    <p className="text-sm font-semibold text-gray-800 mt-1">M A Siddiqui</p>
                    <p className="text-xs text-gray-500">Director & CEO</p>
                  </div>
                </div>

                <div className="text-center mt-8 text-xs text-gray-500">
                  <FaQrcode className="inline mr-1" /> Certificate ID: {result.certificateId}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full max-w-md">
              <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
                <FaDownload className="inline mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <FaShare className="inline mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyCertificate