import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPrint, FaArrowLeft, FaAward, FaShieldAlt } from 'react-icons/fa'
import { certificateService } from '../services/certificateService'

const CertificateDownloadPage = () => {
  const { certificateId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [qrFailed, setQrFailed] = useState(false)

  useEffect(() => {
    fetchCertificateDetails()
  }, [certificateId])

  const buildQrFromUrl = (verifyUrl) => {
    const target = verifyUrl || window.location.href
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(target)}`
  }

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true)
      setQrFailed(false)
      const response = await certificateService.verifyCertificate(certificateId)
      const data = response?.verificationData || response?.data?.verificationData
      if (data && data.valid) {
        setCertificate(data)
        const rawQr = data.qrCode
        let finalQr = null
        if (typeof rawQr === 'string' && rawQr.trim()) {
          if (rawQr.startsWith('http') || rawQr.startsWith('data:image')) {
            finalQr = rawQr
          } else if (rawQr.startsWith('<svg')) {
            finalQr = `data:image/svg+xml;base64,${btoa(rawQr)}`
          } else {
            finalQr = `data:image/png;base64,${rawQr}`
          }
        }
        if (!finalQr) {
          finalQr = buildQrFromUrl(data.verificationUrl)
        }
        setQrCodeUrl(finalQr)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleQrError = () => {
    if (qrFailed) return
    setQrFailed(true)
    setQrCodeUrl(buildQrFromUrl(certificate?.verificationUrl))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Certificate</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family= Cinzel:wght@600;700;900&family=Montserrat:wght@400;500;600&display=swap');

        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          nav, footer, .print-hide { display: none !important; }
          body { margin: 0; padding: 0; background: none; }
          
          .cert-card {
            box-shadow: none !important;
            width: 100vw !important;
            height: 100vh !important;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .cert-card .gold-border-frame {
            padding: 6px !important;
            border-radius: 0 !important;
            height: 100vh !important;
          }
          
          .inner-content {
            height: 100vh !important;
            min-height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          
          .print-qr {
            width: 85px !important;
            height: 85px !important;
          }
          
          .print-qr img {
            width: 100% !important;
            height: 100% !important;
          }
          
          .print-signature {
            font-size: 32px !important;
          }
        }

        .font-serif-premium { font-family: 'Cinzel', serif; }
        .font-body-premium { font-family: 'Cormorant Garamond', serif; }
        .font-signature { font-family: 'Great Vibes', cursive; }
        
        .gold-foil {
          background: linear-gradient(135deg, #f8e9b7 0%, #e8b923 25%, #f4d03f 50%, #d4af37 75%, #b8860b 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .gold-border-frame {
          background: linear-gradient(135deg, #b8860b, #f4d03f 20%, #d4af37 50%, #f4d03f 80%, #b8860b);
          padding: 6px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.4);
        }
        
        .guilloche-bg {
          background-image:
            radial-gradient(circle at 20% 30%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(circle at 30% 80%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(212,175,55,0.08) 0%, transparent 50%),
            repeating-linear-gradient(40deg, rgba(139,69,19,0.03) 0px, rgba(139,69,19,0.03) 2px, transparent 2px, transparent 18px);
        }
      `}} />

      <div className="max-w-6xl mx-auto">
        {/* Action bar */}
        <div className="flex justify-between items-center mb-8 print-hide">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-300 font-semibold hover:text-amber-400 transition"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-10 py-3 rounded-full font-bold flex items-center hover:brightness-110 shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95"
          >
            <FaPrint className="mr-3" /> Print Official Certificate
          </button>
        </div>

        {/* MAIN CERTIFICATE */}
        <div className="cert-card gold-border-frame rounded-2xl shadow-2xl shadow-black/70 overflow-hidden">
          <div className="relative bg-[#fdfaf3] overflow-hidden inner-content min-h-[680px] flex items-center justify-center">
            <div className="guilloche-bg absolute inset-0 pointer-events-none" />

            {/* Double inner border with more elegance */}
            <div className="border-[4px] border-double border-amber-800/70 w-full h-full m-4 p-8 relative flex flex-col justify-between">
              
              {/* Ornamental corners - more premium */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-700 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-700 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-700 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-700 rounded-br-xl" />

              {/* Subtle watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-8deg]">
                <h1 className="text-[140px] font-serif-premium font-black tracking-[-4px] text-amber-900">JAS</h1>
              </div>

              {/* Top Branding - Premium Look */}
              <div className="relative z-10 text-center pt-6">
                <div className="flex justify-center items-center gap-6 mb-4">
                  <FaAward className="text-amber-600 text-4xl" />
                  <div className="h-px w-12 bg-amber-600" />
                  <h3 className="text-blue-950 text-[13px] font-bold tracking-[0.5em] uppercase font-body-premium">Certified Institute</h3>
                  <div className="h-px w-12 bg-amber-600" />
                  <FaShieldAlt className="text-amber-600 text-4xl" />
                </div>

                <h1 className="gold-foil text-5xl md:text-6xl font-serif-premium font-black tracking-[-2px] drop-shadow-md">
                  JAS COMPUTER INSTITUTE
                </h1>
                <p className="text-slate-600 text-sm tracking-[0.4em] uppercase mt-2 font-body-premium">ESTD 2012 • AFFILIATED TRAINING CENTER</p>
                
                <div className="flex justify-center mt-6">
                  <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
                </div>
              </div>

              {/* Certificate Content - More Premium Spacing */}
              <div className="relative z-10 text-center my-6">
                <div className="text-amber-700 font-bold tracking-[0.5em] uppercase text-sm mb-8 flex items-center justify-center font-body-premium">
                  <span className="h-px w-16 bg-amber-600 mr-6" />
                  CERTIFICATE OF ACHIEVEMENT
                  <span className="h-px w-16 bg-amber-600 ml-6" />
                </div>

                <p className="text-slate-600 italic text-xl font-body-premium">This is to certify that</p>
                
                <h2 className="text-6xl md:text-7xl font-signature text-blue-950 my-6 py-1 tracking-tight drop-shadow-sm">
                  {certificate?.student?.name || 'Student Name'}
                </h2>

                <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed font-body-premium px-8">
                  has successfully completed the prescribed course of study and passed the final examination with distinction in
                </p>

                <h3 className="text-3xl md:text-4xl font-serif-premium font-bold text-slate-800 mt-8 uppercase tracking-widest">
                  {certificate?.course?.name || 'Computer Application Course'}
                </h3>
              </div>

              {/* Bottom Footer - Improved Layout */}
              <div className="relative z-10 w-full flex items-end justify-between px-6 pb-8">
                {/* Left: Issue Details */}
                <div className="w-1/3 text-left">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="text-lg font-semibold text-slate-800 border-b border-amber-700/40 pb-1 inline-block min-w-[160px]">
                    {certificate?.issueDate
                      ? new Date(certificate.issueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '---'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-4 tracking-tighter">
                    CERTIFICATE ID: <span className="font-bold">{certificateId}</span>
                  </p>
                </div>

                {/* Center: QR Code - Clean Overlay */}
                <div className="w-1/3 flex flex-col items-center">
                  <div className="relative bg-white p-3 border-2 border-amber-700/70 shadow-xl rounded-md print-qr">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan to verify certificate"
                        className="w-20 h-20 print-qr-img"
                        onError={handleQrError}
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center text-xs text-slate-400">QR</div>
                    )}
                    {/* Small, non-intrusive JAS mark in corner - better for scannability */}
                    <div className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow tracking-widest">JAS</div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3 font-body-premium">SCAN TO VERIFY</span>
                </div>

                {/* Right: Signature */}
                <div className="w-1/3 text-right">
                  <div>
                    <p className="font-signature text-3xl text-slate-800 mb-[-4px] print-signature">Md. Jakir</p>
                    <div className="w-52 h-px bg-slate-800 ml-auto mt-1" />
                    <p className="text-sm font-bold text-slate-800 mt-2">Managing Director</p>
                    <p className="text-xs text-slate-500">JAS Computer Institute</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateDownloadPage