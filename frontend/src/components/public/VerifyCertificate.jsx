import React, { useState, useRef } from 'react'
import { publicService } from '../../services'
import { Input, Button, Alert, Card } from '../common'
import { FaCheckCircle, FaTimesCircle, FaDownload, FaShare, FaQrcode, FaCertificate, FaStamp, FaAward } from 'react-icons/fa'
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
        scale: 3, // और भी बेहतर क्लैरिटी के लिए स्केल बढ़ाकर 3 किया
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      
      const imgWidth = 297 // पूरी A4 शीट कवर करने के लिए
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // मार्जिन 0 करके एकदम परफेक्ट फिटिंग दी है
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`certificate_${result?.certificateId || 'download'}.pdf`)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FaCertificate className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          <p className="text-gray-600 mt-2">Enter the certificate ID to verify authenticity</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 max-w-2xl mx-auto shadow-md">
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
                Example: CERT/2025/123456
              </p>
            </div>
            <Button type="submit" isLoading={loading} className="w-full bg-amber-600 hover:bg-amber-700">
              Verify Certificate
            </Button>
          </form>
        </Card>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Premium Certificate Template */}
        {result && (
          <div className="flex flex-col items-center mt-6">
            <div
              ref={certificateRef}
              className="w-full bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-2xl p-1 relative border-[16px] border-amber-800 select-none"
              style={{ aspectRatio: '1.414/1' }} // Standard A4 Aspect Ratio
            >
              {/* Thin Inner Gold Border */}
              <div className="border border-amber-600 h-full w-full p-8 relative flex flex-col justify-between">
                
                {/* Elegant Corner Ornaments */}
                <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-700"></div>
                <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-700"></div>
                <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-700"></div>
                <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-700"></div>

                {/* Institute Header */}
                <div className="text-center mt-2">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <FaAward className="w-8 h-8 text-amber-700 animate-pulse" />
                    <h2 className="text-4xl font-serif font-black tracking-wide text-gray-800">
                      JAS COMPUTER INSTITUTE
                    </h2>
                  </div>
                  <p className="text-amber-800 font-medium text-xs tracking-widest uppercase">Recognised Computer Training Center</p>
                  <p className="text-gray-500 text-[10px] mt-1 max-w-md mx-auto leading-relaxed">
                    ROKAIYA COMPLEX, PURANI BAZAR, SURIYAWAN, BHADOHI - 221404
                  </p>
                </div>

                {/* Main Content Area */}
                <div className="text-center my-auto flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
                    <span className="text-amber-800 font-serif italic text-lg tracking-wider">Certificate of Completion</span>
                    <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
                  </div>

                  <p className="text-gray-500 text-xs tracking-wide uppercase">This is proudly presented to</p>

                  <div>
                    <p className="text-4xl font-serif font-bold text-gray-900 border-b border-amber-200 inline-block pb-1 px-8">
                      {result.studentName}
                    </p>
                    <p className="text-gray-600 text-xs italic mt-2">Son / Daughter of {result.fatherName}</p>
                  </div>

                  <p className="text-gray-500 text-xs max-w-lg mx-auto leading-relaxed">
                    for successfully completing and fulfilling all requirements of the prescribed course of study in
                  </p>

                  <div>
                    <p className="text-2xl font-bold tracking-wide text-amber-900 uppercase">
                      {result.course}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 font-mono">
                      Enrollment No: <span className="text-gray-800 font-semibold">{result.enrollmentNo}</span> &nbsp;|&nbsp; Duration: <span className="text-gray-800 font-semibold">{result.duration}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Section with Signatures & Seal */}
                <div className="flex justify-between items-end px-6 mb-2">
                  <div className="text-center w-40">
                    <p className="text-xs font-mono text-gray-800 font-semibold mb-1">
                      {new Date(result.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="border-t border-gray-400 my-1"></div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Date of Issue</p>
                  </div>

                  {/* Visual Premium Logo Seal */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-amber-600/30 flex items-center justify-center opacity-40"></div>
                    <FaStamp className="w-10 h-10 text-amber-700/80 drop-shadow-sm" />
                  </div>

                  <div className="text-center w-40">
                    {/* Placeholder for Director Signature space */}
                    <p className="text-xs font-serif italic font-bold text-gray-800 mb-1">M A Siddiqui</p>
                    <div className="border-t border-gray-400 my-1"></div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-800 font-semibold">Director & CEO</p>
                  </div>
                </div>

                {/* Dynamic Footer Data */}
                <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 border-t border-gray-100 pt-2 font-mono">
                  <span>Verification Status: <span className="text-green-600 font-bold font-sans">✓ VERIFIED</span></span>
                  <span><FaQrcode className="inline mr-1 text-gray-500" /> ID: {result.certificateId}</span>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 w-full max-w-md mt-6">
              <Button onClick={handleDownloadPDF} className="flex-1 bg-amber-700 hover:bg-amber-800 text-white shadow-md">
                <FaDownload className="inline mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-50" onClick={handleShare}>
                <FaShare className="inline mr-2" />
                Share Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyCertificate