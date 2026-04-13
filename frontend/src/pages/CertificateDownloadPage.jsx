import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// FIX: FaCheckShield ko hata kar FaShieldAlt use kiya hai
import { FaPrint, FaArrowLeft, FaAward, FaShieldAlt } from 'react-icons/fa'
import { certificateService } from '../services/certificateService'

const CertificateDownloadPage = () => {
  const { certificateId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)

  useEffect(() => {
    fetchCertificateDetails()
  }, [certificateId])

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true)
      const response = await certificateService.verifyCertificate(certificateId)
      const data = response?.verificationData || response?.data?.verificationData
      
      if (data && data.valid) {
        setCertificate(data)
        const qr = data.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.verificationUrl || window.location.href)}`
        setQrCodeUrl(qr.startsWith('http') || qr.startsWith('data') ? qr : `data:image/png;base64,${qr}`)
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 print:p-0 print:bg-white">
      {/* PROFESSIONAL PRINT SETTINGS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&display=swap');
        
        @media print {
          @page { size: A4 landscape; margin: 0; }
          nav, footer, .print-hide { display: none !important; }
          body { margin: 0; padding: 0; background: none; }
          .cert-card { 
            box-shadow: none !important; 
            border: 12px solid #1e293b !important; 
            width: 100vw !important;
            height: 100vh !important;
            position: absolute;
            top: 0;
            left: 0;
          }
        }
        .font-serif-premium { font-family: 'Playfair Display', serif; }
        .font-signature { font-family: 'Dancing Script', cursive; }
      `}} />

      <div className="max-w-5xl mx-auto">
        {/* Buttons */}
        <div className="flex justify-between items-center mb-6 print-hide">
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-700 font-semibold hover:text-blue-700 transition">
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold flex items-center hover:bg-black shadow-xl transition transform hover:scale-105">
            <FaPrint className="mr-2" /> Print Official Certificate
          </button>
        </div>

        {/* --- MAIN CERTIFICATE --- */}
        <div className="cert-card relative bg-white shadow-2xl overflow-hidden border-[16px] border-slate-900 p-1 min-h-[680px] flex items-center justify-center">
          
          {/* Inner Border */}
          <div className="border-2 border-yellow-600 w-full h-full p-8 relative flex flex-col justify-between">
            
            {/* Watermark Background (Optional) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <h1 className="text-9xl font-bold -rotate-45">JAS INSTITUTE</h1>
            </div>

            {/* Top Branding Section */}
            <div className="relative z-10 text-center">
                <div className="flex justify-center items-center gap-4 mb-2">
                    <FaAward className="text-yellow-600 text-4xl" />
                    <div>
                        <h3 className="text-blue-900 text-sm font-bold tracking-[0.3em] uppercase"> Certified Institute</h3>
                    </div>
                    <FaShieldAlt className="text-blue-900 text-4xl" />
                </div>
                
                <h1 className="text-4xl font-serif-premium font-bold text-slate-800 border-b-2 border-yellow-600 pb-2 inline-block px-10">
                  JAS COMPUTER INSTITUTE & TRAINING CENTER
                </h1>
            </div>

            {/* Certificate Content */}
            <div className="relative z-10 text-center my-6">
              <div className="text-yellow-700 font-bold tracking-[0.4em] uppercase text-sm mb-6 flex items-center justify-center">
                <span className="h-[1px] w-12 bg-yellow-600 mr-4"></span>
                Certificate of Achievement
                <span className="h-[1px] w-12 bg-yellow-600 ml-4"></span>
              </div>

              <p className="text-slate-500 italic text-lg">This is to certify that</p>

              <h2 className="text-6xl font-signature text-blue-900 my-4 py-2 drop-shadow-sm">
                {certificate?.student?.name || 'Student Name'}
              </h2>

              <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                has successfully completed the prescribed course of study and passed the final examination with excellence in
              </p>

              <h3 className="text-3xl font-serif-premium font-bold text-slate-800 mt-4 mb-4 uppercase tracking-wider">
                {certificate?.course?.name || 'Computer Application Course'}
              </h3>

              <div className="inline-flex items-center gap-8 bg-slate-50 px-8 py-2 rounded-full border border-slate-100 shadow-sm">
                 <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Grade</p>
                    <p className="text-xl font-bold text-blue-900">{certificate?.grade || 'A+'}</p>
                 </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Percentage</p>
                    <p className="text-xl font-bold text-blue-900">{certificate?.percentage}%</p>
                 </div>
              </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="relative z-10 w-full flex items-end justify-between px-4">
              
              {/* Left: Issue Details */}
              <div className="w-1/3 text-left">
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-sm font-bold text-slate-800 border-b border-slate-200 inline-block min-w-[120px]">
                    {certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                    </p>
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-tighter">CERTIFICATE NO: {certificateId}</p>
              </div>

              {/* Center: QR Code */}
              <div className="w-1/3 flex flex-col items-center">
                <div className="bg-white p-1.5 border-2 border-slate-900 shadow-lg mb-2">
                  <img src={qrCodeUrl} alt="QR" className="w-16 h-16" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Verify Authenticity</span>
              </div>

              {/* Right: Signature */}
              <div className="w-1/3 text-right">
                <div className="mb-1">
                    <p className="font-signature text-2xl text-slate-800 mb-[-8px]">Md. Jakir</p>
                    <div className="w-40 h-[1.5px] bg-slate-800 ml-auto"></div>
                </div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Managing Director</p>
                <p className="text-[9px] text-slate-400 uppercase">JAS Training Center</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateDownloadPage