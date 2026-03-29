import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp, 
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin,
  FaArrowRight, FaCheckCircle, FaSpinner, FaPaperPlane,
  FaUser, FaComment, FaMobileAlt, FaHeadset, FaStar,
  FaTrophy, FaUsers, FaCopy, FaBuilding
} from 'react-icons/fa'
import { toast } from 'react-toastify'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you within 24 hours.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setFormSubmitting(false)
    }, 1500)
  }

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText('+91 9369121091')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Phone number copied to clipboard!')
  }

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'Visit Us',
      details: ['JAS Computer Institute & Training Center', 'Chaumuhani, Purani Bazar', 'Suriyawan, Uttar Pradesh - 221403'],
      action: { text: 'Get Directions', link: 'https://maps.google.com/?q=JAS+COMPUTER+INSTITUTE+SURiYAWAN' }
    },
    {
      icon: FaPhone,
      title: 'Call Us',
      details: ['+91 9369121091', '+91 8887456321'],
      action: { text: 'Copy Number', onClick: copyPhoneNumber }
    },
    {
      icon: FaEnvelope,
      title: 'Email Us',
      details: ['jasinstitute.suriyawan@gmail.com'],
      action: { text: 'Send Email', link: 'mailto:jasinstitute.suriyawan@gmail.com' }
    },
    {
      icon: FaClock,
      title: 'Working Hours',
      details: ['Monday - Saturday: 10:00 AM - 6:00 PM', 'Sunday: Closed'],
      action: { text: 'Schedule Visit', link: '/contact#schedule' }
    }
  ]

  const socialLinks = [
    { icon: FaFacebook, name: 'Facebook', link: 'https://facebook.com/jascomputer', color: 'hover:bg-[#1877f2]' },
    { icon: FaInstagram, name: 'Instagram', link: 'https://instagram.com/jascomputer', color: 'hover:bg-[#e4405f]' },
    { icon: FaTwitter, name: 'Twitter', link: 'https://twitter.com/jascomputer', color: 'hover:bg-[#1da1f2]' },
    { icon: FaYoutube, name: 'YouTube', link: 'https://youtube.com/@jascomputer', color: 'hover:bg-[#ff0000]' },
    { icon: FaLinkedin, name: 'LinkedIn', link: 'https://linkedin.com/company/jascomputer', color: 'hover:bg-[#0a66c2]' },
    { icon: FaWhatsapp, name: 'WhatsApp', link: 'https://wa.me/919369121091', color: 'hover:bg-[#25d366]' }
  ]

  const faqs = [
    {
      question: 'What courses do you offer?',
      answer: 'We offer DCA, ADCA, Tally with GST, Basic Computer, Typing (Hindi/English), Web Design, and many more job-oriented computer courses.'
    },
    {
      question: 'Do you provide certificates?',
      answer: 'Yes, we provide government-recognized certificates upon successful completion of the course.'
    },
    {
      question: 'Is there a demo class available?',
      answer: 'Yes, we offer free demo classes. You can visit our center or contact us to schedule a demo session.'
    },
    {
      question: 'What are the batch timings?',
      answer: 'We have morning (10 AM - 12 PM), afternoon (12 PM - 2 PM), and evening (4 PM - 6 PM) batches. Weekend batches are also available.'
    }
  ]

  const stats = [
    { icon: FaUsers, value: '10K+', label: 'Students Trained' },
    { icon: FaTrophy, value: '95%', label: 'Success Rate' },
    { icon: FaHeadset, value: '24/7', label: 'Support Available' },
    { icon: FaStar, value: '4.9', label: 'Google Rating' }
  ]

  return (
    <>
      <Helmet>
        <title>Contact JAS Computer Institute | Get in Touch for Computer Courses in Suriyawan</title>
        <meta name="description" content="Contact JAS Computer Institute in Suriyawan for computer courses, career guidance, and admissions. Call +91 9369121091 or visit us at Chaumuhani, Purani Bazar." />
        <meta name="keywords" content="contact JAS Computer Institute, computer training center Suriyawan, best computer institute contact, JAS Computer Institute phone number, computer courses enquiry" />
        <meta property="og:title" content="Contact JAS Computer Institute | Get in Touch" />
        <meta property="og:description" content="Reach out to us for any queries about computer courses, admissions, or career guidance. We're here to help!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.jascomputerinstitute.com/contact" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.jascomputerinstitute.com/contact" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <FaHeadset className="text-blue-200 text-sm" />
                <span className="text-blue-100 font-medium text-sm">24/7 Support Available</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Get in <span className="text-blue-300">Touch</span> With Us
              </h1>
              <p className="text-xl text-blue-100 font-light leading-relaxed max-w-2xl mx-auto">
                Have questions about our courses? Need career guidance? We're here to help you succeed!
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-16 z-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all text-center border border-gray-100">
                  <div className="inline-flex p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-blue-600 mb-3 text-2xl">
                    <stat.icon />
                  </div>
                  <p className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information Cards */}
              <div>
                <div className="mb-8">
                  <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Contact Info</span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
                    Let's <span className="text-blue-600">Connect</span>
                  </h2>
                  <p className="text-gray-600">
                    We'd love to hear from you! Reach out through any of these channels, and our team will respond promptly.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                          <info.icon />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                          ))}
                          {info.action && (
                            info.action.link ? (
                              <a 
                                href={info.action.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:gap-2 transition-all"
                              >
                                {info.action.text}
                                <FaArrowRight className="text-xs" />
                              </a>
                            ) : (
                              <button
                                onClick={info.action.onClick}
                                className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:gap-2 transition-all"
                              >
                                {copied ? <FaCheckCircle /> : <FaCopy />}
                                {info.action.text}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Media Links */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Connect With Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:text-white ${social.color} transition-all duration-300 hover:-translate-y-1`}
                        aria-label={social.name}
                      >
                        <social.icon className="text-lg" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Response on WhatsApp</h3>
                      <p className="text-sm text-gray-600">Get instant answers to your queries</p>
                    </div>
                    <a
                      href="https://wa.me/919369121091?text=Hi%20JAS%20Computer%20Institute%2C%20I'm%20interested%20in%20your%20courses"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all hover:scale-105"
                    >
                      <FaWhatsapp className="text-lg" />
                      Chat Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                    <h3 className="text-2xl font-bold text-white">Send us a Message</h3>
                    <p className="text-blue-100 text-sm mt-1">Fill out the form and we'll get back to you within 24 hours</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <FaMobileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <div className="relative">
                          <FaComment className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Course Inquiry / Admission"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Tell us about your interest, questions, or requirements..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {formSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          Send Message
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      By submitting this form, you agree to our privacy policy. We respect your privacy.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="h-[450px] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.234567!2d82.4050249!3d25.4651286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398fe3d0edfb8de9%3A0xdef7acc6bf581418!2sJAS%20COMPUTER%20INSTITUTE%20%26%20TRAINING%20CENTER!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="JAS Computer Institute Location - Chaumuhani, Suriyawan"
                ></iframe>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600 text-xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">JAS Computer Institute & Training Center</p>
                    <p className="text-sm text-gray-600">Chaumuhani, Purani Bazar, Suriyawan, Uttar Pradesh - 221403</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <FaHeadset className="text-blue-600 text-sm" />
                <span className="text-blue-600 font-medium text-sm">FAQ</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked <span className="text-blue-600">Questions</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find quick answers to common questions about our courses and services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of successful students who trusted JAS Computer Institute for their career growth
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105"
                >
                  Enroll Now
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link 
                  to="/courses" 
                  className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  )
}

export default ContactPage