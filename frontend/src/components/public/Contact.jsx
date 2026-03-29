import React, { useState } from 'react'
import { publicService } from '../../services'
import { Button, Input, Alert } from '../common'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    courseName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await publicService.submitInquiry(formData)
      if (response.success) {
        setSuccess('Thank you! Our team will contact you within 24 hours.')
        setFormData({ name: '', email: '', phone: '', message: '', courseName: '' })
      } else {
        setError(response.message || 'Failed to submit inquiry')
      }
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: FaMapMarkerAlt, title: 'Visit Us', details: '123 Education Hub, Andheri East, Mumbai - 400001, Maharashtra, India' },
    { icon: FaPhone, title: 'Call Us', details: '+91 98765 43210, +91 98765 43211' },
    { icon: FaEnvelope, title: 'Email Us', details: 'info@coachingms.com, admissions@coachingms.com' },
    { icon: FaClock, title: 'Working Hours', details: 'Monday - Saturday: 9:00 AM - 7:00 PM, Sunday: Closed' }
  ]

  const socialLinks = [
    { icon: FaFacebook, name: 'Facebook', link: 'https://facebook.com', color: 'bg-blue-600' },
    { icon: FaTwitter, name: 'Twitter', link: 'https://twitter.com', color: 'bg-sky-500' },
    { icon: FaInstagram, name: 'Instagram', link: 'https://instagram.com', color: 'bg-pink-600' },
    { icon: FaYoutube, name: 'YouTube', link: 'https://youtube.com', color: 'bg-red-600' },
    { icon: FaWhatsapp, name: 'WhatsApp', link: 'https://wa.me/919876543210', color: 'bg-green-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl">Have questions? We're here to help!</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="10-digit mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Interested In (Optional)
                </label>
                <Input
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  placeholder="e.g., JEE, NEET, Foundation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <Button type="submit" isLoading={loading} className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-full">
                      <info.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      <p className="text-gray-600 mt-1">{info.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h2>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white p-3 rounded-full hover:opacity-90 transition flex items-center justify-center w-12 h-12`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.803810386387!2d72.869217!3d19.113210!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c7e5c8b5c5b5%3A0x5b5b5b5b5b5b5b5b!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact