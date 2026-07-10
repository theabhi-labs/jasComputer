import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPrint, FaArrowLeft, FaAward, FaShieldAlt, FaCertificate } from 'react-icons/fa'
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

  // Build a QR image from a verification URL using a reliable provider,
  // always producing a fresh, absolute, correctly-encoded src.
  const buildQrFromUrl = (verifyUrl) => {
    const target = verifyUrl || window.location.href
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(target)}`
  }

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true)
      setQrFailed(false)
      const response = await certificateService.verifyCertificate(certificateId)
      const data = response?.verificationData || response?.data?.verificationData

      if (data && data.valid) {
        setCertificate(data)

        // FIX: previous logic mis-detected base64 vs URL vs raw SVG/text,
        // so the <img> tag often got a broken src and silently failed.
        // We now normalize every case explicitly and always have a
        // guaranteed-working fallback (QR generated straight from the
        // verification URL) if the backend didn't return a usable image.
        const rawQr = data.qrCode
        let finalQr = null

        if (typeof rawQr === 'string' && rawQr.trim()) {
          if (rawQr.startsWith('http') || rawQr.startsWith('data:image')) {
            finalQr = rawQr
          } else if (rawQr.startsWith('<svg')) {
            finalQr = `data:image/svg+xml;base64,${btoa(rawQr)}`
          } else {
            // assume raw base64 png payload
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

  // If the chosen QR src ever fails to load in the browser, fall back
  // immediately to a freshly generated one from the verification URL
  // instead of leaving a broken image icon on the certificate.
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Playfair+Display:wght@600;700;900&family=Dancing+Script:wght@700&family=Montserrat:wght@400;500;600;700&display=swap');

        @media print {
          @page { size: A4 landscape; margin: 0; }
          nav, footer, .print-hide { display: none !important; }
          body { margin: 0; padding: 0; background: none; }
          .cert-card {
            box-shadow: none !important;
            width: 100vw !important;
            height: 100vh !important;
            position: absolute;
            top: 0;
            left: 0;
          }
        }

        .font-serif-premium { font-family: 'Playfair Display', serif; }
        .font-body-premium { font-family: 'Cormorant Garamond', serif; }
        .font-signature { font-family: 'Dancing Script', cursive; }

        .gold-foil {
          background: linear-gradient(135deg, #fdf6d8 0%, #d4af37 22%, #f9e79f 40%, #b8860b 55%, #f9e79f 70%, #d4af37 85%, #fdf6d8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .gold-border-frame {
          background: linear-gradient(135deg, #b8860b, #f9e79f 25%, #d4af37 50%, #f9e79f 75%, #b8860b);
          padding: 3px;
        }

        .guilloche-bg {
          background-image:
            radial-gradient(circle at 0% 0%, rgba(212,175,55,0.06) 0%, transparent 45%),
            radial-gradient(circle at 100% 0%, rgba(212,175,55,0.06) 0%, transparent 45%),
            radial-gradient(circle at 0% 100%, rgba(212,175,55,0.06) 0%, transparent 45%),
            radial-gradient(circle at 100% 100%, rgba(212,175,55,0.06) 0%, transparent 45%),
            repeating-linear-gradient(45deg, rgba(15,23,42,0.02) 0px, rgba(15,23,42,0.02) 1px, transparent 1px, transparent 14px);
        }

        .seal-ring {
          background: conic-gradient(from 0deg, #b8860b, #f9e79f, #d4af37, #f9e79f, #b8860b, #f9e79f, #d4af37, #f9e79f, #b8860b);
        }
      `}} />

      <div className="max-w-5xl mx-auto">
        {/* Action bar */}
        <div className="flex justify-between items-center mb-6 print-hide">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-300 font-semibold hover:text-amber-400 transition"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-8 py-3 rounded-full font-bold flex items-center hover:brightness-110 shadow-xl shadow-amber-500/20 transition transform hover:scale-105"
          >
            <FaPrint className="mr-2" /> Print Official Certificate
          </button>
        </div>

        {/* --- MAIN CERTIFICATE --- */}
        <div className="cert-card gold-border-frame rounded-sm shadow-2xl shadow-black/60">
          <div className="relative bg-[#fdfaf3] overflow-hidden min-h-[680px] flex items-center justify-center">
            <div className="guilloche-bg absolute inset-0 pointer-events-none" />

            {/* Double inner border */}
            <div className="border-[3px] border-double border-amber-700/70 w-full h-full m-3 p-10 relative flex flex-col justify-between">

              {/* Corner ornaments */}
              <span className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-600" />
              <span className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-600" />
              <span className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-600" />
              <span className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-600" />

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                <h1 className="text-9xl font-serif-premium font-bold -rotate-45 whitespace-nowrap">JAS INSTITUTE</h1>
              </div>

              {/* Top Branding */}
              <div className="relative z-10 text-center">
                <div className="flex justify-center items-center gap-5 mb-3">
                  <FaAward className="text-amber-600 text-3xl" />
                  <h3 className="text-blue-950 text-[11px] font-bold tracking-[0.4em] uppercase font-body-premium">
                    Certified Institute
                  </h3>
                  <FaShieldAlt className="text-blue-950 text-3xl" />
                </div>

                <h1 className="gold-foil text-4xl md:text-5xl font-serif-premium font-black tracking-wide drop-shadow-sm">
                  JAS COMPUTER INSTITUTE
                </h1>
                <p className="text-slate-600 text-xs tracking-[0.35em] uppercase mt-1 font-body-premium">
                  &amp; Training Center
                </p>
                <div className="w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-3" />
              </div>

              {/* Certificate Content */}
              <div className="relative z-10 text-center my-4">
                <div className="text-amber-700 font-bold tracking-[0.45em] uppercase text-xs mb-6 flex items-center justify-center font-body-premium">
                  <span className="h-[1px] w-14 bg-amber-600 mr-4" />
                  Certificate of Achievement
                  <span className="h-[1px] w-14 bg-amber-600 ml-4" />
                </div>

                <p className="text-slate-500 italic text-lg font-body-premium">This is to certify that</p>

                <h2 className="text-5xl md:text-6xl font-signature text-blue-950 my-4 py-2 drop-shadow-sm">
                  {certificate?.student?.name || 'Student Name'}
                </h2>

                <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed font-body-premium">
                  has successfully completed the prescribed course of study and passed the final
                  examination with distinction in
                </p>

                <h3 className="text-2xl md:text-3xl font-serif-premium font-bold text-slate-800 mt-5 uppercase tracking-wider">
                  {certificate?.course?.name || 'Computer Application Course'}
                </h3>
              </div>

              {/* Bottom Footer */}
              <div className="relative z-10 w-full flex items-end justify-between px-2">

                {/* Left: Issue Details */}
                <div className="w-1/3 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-body-premium">
                    Issue Date
                  </p>
                  <p className="text-sm font-bold text-slate-800 border-b border-amber-700/30 inline-block min-w-[130px] pb-1">
                    {certificate?.issueDate
                      ? new Date(certificate.issueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '---'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono tracking-tighter mt-3">
                    CERTIFICATE NO: {certificateId}
                  </p>
                </div>

                {/* Center: QR Code */}
                <div className="w-1/3 flex flex-col items-center">
                  <div className="bg-white p-2 border-2 border-amber-700/60 shadow-lg mb-2 rounded-sm">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan to verify certificate"
                        className="w-16 h-16"
                        onError={handleQrError}
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center text-[8px] text-slate-400 text-center">
                        QR unavailable
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-body-premium">
                    Verify Authenticity
                  </span>
                </div>

                {/* Right: Signature + Seal */}
                <div className="w-1/3 flex items-end justify-end gap-4">
                  <div className="text-right">
                    <p className="font-signature text-2xl text-slate-800 mb-[-6px]">Md. Jakir</p>
                    <div className="w-40 h-[1.5px] bg-slate-800 ml-auto" />
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest mt-1 font-body-premium">
                      Managing Director
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-body-premium">
                      JAS Training Center
                    </p>
                  </div>

                  {/* Embossed seal */}
                  <div className="seal-ring w-16 h-16 rounded-full flex items-center justify-center shrink-0 -mb-1">
                    <div className="w-[52px] h-[52px] rounded-full bg-blue-950 flex flex-col items-center justify-center text-amber-300">
                      <FaCertificate className="text-lg" />
                      <span className="text-[6px] font-bold tracking-widest mt-0.5">JAS</span>
                    </div>
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