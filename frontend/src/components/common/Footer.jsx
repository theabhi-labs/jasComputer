import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronRight, FaClock, FaLaptopCode, FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FaFacebookF, href: "https://facebook.com/jascomputer", color: "hover:bg-blue-600", label: "Facebook" },
    { icon: FaTwitter, href: "https://twitter.com/jascomputer", color: "hover:bg-sky-500", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com/jascomputer", color: "hover:bg-pink-600", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@jascomputer", color: "hover:bg-red-600", label: "YouTube" },
  ]

  const quickLinks = [
    { name: 'Home', link: '/', description: 'JAS Computer Institute Home' },
    { name: 'Courses', link: '/courses', description: 'Computer Courses in Suriyawan' },
    { name: 'About Us', link: '/about', description: 'About JAS Computer Institute' },
    { name: 'Contact', link: '/contact', description: 'Contact JAS Computer Institute' },
    { name: 'Verify Certificate', link: '/verify-certificate', description: 'Verify Your Certificate' },
    { name: 'Download Certificate', link: '/certificate-download', description: 'Download Digital Certificate' },
  ]

  const popularCourses = [
    { name: 'DCA Course', link: '/courses/dca', duration: '6 Months' },
    { name: 'ADCA Course', link: '/courses/adca', duration: '12 Months' },
    { name: 'Tally with GST', link: '/courses/tally', duration: '3 Months' },
    { name: 'Basic Computer', link: '/courses/basic-computer', duration: '2 Months' },
    { name: 'Typing Course', link: '/courses/typing', duration: '2 Months' },
  ]

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919369121091?text=Hi%20JAS%20Computer%20Institute%2C%20I%27m%20interested%20in%20your%20courses', '_blank')
  }

  return (
    <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-300 pt-16 pb-8">
      {/* Top Section: Full Width Background, Contained Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Brand Identity - SEO Optimized */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                JAS<span className="text-blue-500 text-3xl lg:text-4xl">.</span>Computer
              </h3>
              <p className="text-xs text-blue-400 mt-1 font-medium">Institute & Training Center</p>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              Best computer training institute in Chaumuhani, Suriyawan. Job-oriented courses with government recognized certificates.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 transition-all duration-300 ${social.color} hover:text-white hover:-translate-y-1 hover:shadow-lg`}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - SEO Friendly */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.link}
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm"
                    title={item.description}
                  >
                    <FaChevronRight className="text-[8px] mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses - SEO Rich */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              Popular Courses
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {popularCourses.map((course) => (
                <li key={course.name}>
                  <Link
                    to={course.link}
                    className="group flex items-center justify-between text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    <span className="flex items-center">
                      <FaChevronRight className="text-[8px] mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                      {course.name}
                    </span>
                    <span className="text-xs text-gray-600 group-hover:text-blue-400">{course.duration}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Timing Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Contact Info
                <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-blue-500 rounded-full"></span>
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="p-2.5 bg-gray-800 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <FaMapMarkerAlt className="text-blue-400 group-hover:text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">
                      Chaumuhani, Purani Bazar
                    </p>
                    <p className="text-gray-500 text-xs">Suriyawan, Uttar Pradesh - 221403</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-800 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <FaPhone className="text-blue-400 group-hover:text-white text-sm" />
                  </div>
                  <div>
                    <a href="tel:+919369121091" className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm block">
                      +91 9369121091
                    </a>
                    <a href="tel:+918887456321" className="text-gray-500 text-xs hover:text-blue-400 transition-colors">
                      +91 8887456321
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-800 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <FaEnvelope className="text-blue-400 group-hover:text-white text-sm" />
                  </div>
                  <a href="mailto:jasinstitute.suriyawan@gmail.com" className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm break-all">
                    jasinstitute.suriyawan@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Timing Section - Blue Theme */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <FaClock className="text-blue-500 text-lg" />
                <h5 className="text-white font-semibold text-sm">Opening Hours</h5>
              </div>
              <div className="space-y-1">
                <p className="text-gray-300 text-sm font-medium">Monday - Saturday</p>
                <p className="text-blue-400 text-lg font-bold">10:00 AM - 6:00 PM</p>
                <p className="text-gray-500 text-xs mt-2">Sunday Closed</p>
              </div>
            </div>

            {/* AD Developer Button - Blue Theme */}
            <Link
              to="https://www.rootabhi.com/"
              className="relative group w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 overflow-hidden"
              aria-label="View AD Developer Portfolio"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon with pulse effect */}
              <div className="relative">
                <FaLaptopCode className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 animate-ping rounded-full bg-white/30 opacity-0 group-hover:opacity-100"></div>
              </div>

              <span className="relative text-base tracking-wide">View Developer Portfolio</span>

              {/* Animated arrow */}
              <FaChevronRight className="relative text-sm group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms - SEO Friendly */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-center md:text-left">
            <p className="text-gray-500">
              © {currentYear} <span className="text-blue-400 font-medium">JAS Computer Institute & Training Center</span>. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Best Computer Training Center in Chaumuhani, Suriyawan | Govt. Recognized Certificate
            </p>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="/privacy-policy" className="text-gray-500 hover:text-blue-400 transition-colors text-xs">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-gray-500 hover:text-blue-400 transition-colors text-xs">
              Terms of Service
            </a>
            <a href="/refund-policy" className="text-gray-500 hover:text-blue-400 transition-colors text-xs">
              Refund Policy
            </a>
            <a href="/sitemap.xml" className="text-gray-500 hover:text-blue-400 transition-colors text-xs">
              Sitemap
            </a>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "JAS Computer Institute & Training Center",
          "image": "https://www.jascomputerinstitute.com/logo.jpg",
          "description": "Best computer training institute in Chaumuhani, Suriyawan offering DCA, ADCA, Tally, Basic Computer, and Typing courses with government recognized certificates.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Chaumuhani, Purani Bazar",
            "addressLocality": "Suriyawan",
            "addressRegion": "Uttar Pradesh",
            "postalCode": "221404",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "25.4567",
            "longitude": "82.4567"
          },
          "url": "https://www.jascomputerinstitute.com",
          "telephone": "+919369121091",
          "openingHours": "Mo-Sa 10:00-18:00",
          "priceRange": "₹₹",
          "sameAs": [
            "https://facebook.com/jascomputer",
            "https://instagram.com/jascomputer",
            "https://twitter.com/jascomputer",
            "https://youtube.com/@jascomputer"
          ]
        })}
      </script>
    </footer>
  )
}

export default Footer