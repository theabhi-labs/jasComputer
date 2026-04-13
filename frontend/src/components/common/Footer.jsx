import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube, 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronRight, 
  FaClock, FaLaptopCode, FaWhatsapp, FaShieldAlt 
} from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FaFacebookF, href: "https://facebook.com/jascomputer", color: "hover:bg-blue-600", label: "Facebook" },
    { icon: FaTwitter, href: "https://twitter.com/jascomputer", color: "hover:bg-sky-500", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com/jascomputer", color: "hover:bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@jascomputer", color: "hover:bg-red-600", label: "YouTube" },
  ]

  const quickLinks = [
    { name: 'Home', link: '/', description: 'JAS Computer Institute Home' },
    { name: 'Courses', link: '/courses', description: 'Computer Courses in Suriyawan' },
    { name: 'About Us', link: '/about', description: 'About JAS Computer Institute' },
    { name: 'Contact', link: '/contact', description: 'Contact JAS Computer Institute' },
    { name: 'Verify Certificate', link: '/verify-certificate', description: 'Verify Your Certificate' },
  ]

  const popularCourses = [
    { name: 'DCA Course', duration: '6 Months' },
    { name: 'ADCA Course', duration: '12 Months' },
    { name: 'Tally with GST',  duration: '3 Months' },
    { name: 'Basic Computer',  duration: '2 Months' },
    { name: 'Typing Course',  duration: '2 Months' },
  ]

  return (
    <footer className="relative w-full bg-[#030712] text-gray-400 pt-16 pb-6 overflow-hidden border-t border-blue-500/20">
      {/* AI Glow Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Identity */}
          <div className="space-y-6">
            <Link to="/" className="group inline-block">
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tighter">
                JAS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">.COMPUTER</span>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-[1px] w-8 bg-blue-500"></span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">Training Center</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering the next generation with advanced technical skills. JAS Computer Institute is your gateway to a professional digital career.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all duration-500 ${social.color} hover:text-white hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Explore
            </h4>
            <ul className="grid grid-cols-1 gap-4">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.link}
                    className="group flex items-center text-sm hover:text-blue-400 transition-all duration-300"
                  >
                    <FaChevronRight className="text-[10px] mr-0 opacity-0 group-hover:mr-2 group-hover:opacity-100 transition-all text-blue-500" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              Trending Programs
            </h4>
            <ul className="space-y-4">
              {popularCourses.map((course) => (
                <li key={course.name}>
                  <Link
                    to={course.link}
                    className="group flex items-center justify-between p-2 -ml-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                  >
                    <span className="text-sm group-hover:text-cyan-400 transition-colors">{course.name}</span>
                    <span className="text-[10px] px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {course.duration}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Connect With Us</h4>
              <div className="space-y-4">
                <div className="flex gap-4 group">
                  <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-xs leading-relaxed group-hover:text-gray-200 transition-colors uppercase">
                    ROKAIYA COMPLEX, PURANI BAZAR, SURIYAWAN, BHADOHI 221404 (UP)
                  </p>
                </div>
                <div className="flex gap-4 group">
                  <FaPhone className="text-cyan-500 mt-1 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                  <div className="text-xs">
                    <a href="tel:+918756248193" className="block hover:text-white transition-colors tracking-widest">+91 8756248193</a>
                    <a href="tel:+919129774092" className="block hover:text-white transition-colors tracking-widest mt-1">+91 9129774092</a>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <FaEnvelope className="text-purple-500 mt-1 flex-shrink-0 group-hover:-translate-y-1 transition-transform" />
                  <a href="mailto:jascomputerinstitute@gmail.com" className="text-xs break-all hover:text-white transition-colors tracking-wider">
                    jascomputerinstitute@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Developer Button - AI Style */}
          {/* Developer Button - Slim & Sleek Version */}
<a
  href="https://www.rootabhi.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="relative group flex items-center gap-3 p-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
>
  {/* Hover Glow Effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

  {/* Icon Container - Small & Subtle */}
  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
    <FaLaptopCode size={14} className="group-hover:scale-110 transition-transform" />
  </div>

  {/* Text Content - Slim Layout */}
  <div className="relative z-10 flex flex-col">
    <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 group-hover:text-blue-400 transition-colors leading-none mb-1">
      Designer & Developer
    </span>
    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors tracking-wide">
      Abhishek Yadav
    </span>
  </div>

  {/* Arrow Icon - Animated */}
  <FaChevronRight className="ml-auto text-[10px] text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Server Online</span>
             </div>
             <p className="text-[10px] text-gray-500 font-medium">
               © {currentYear} JAS COMPUTER INSTITUTE & TRAINING CENTER
             </p>
          </div>
          
          <div className="flex flex-wrap gap-6 items-center">
            {['Privacy', 'Terms', 'Refund', 'Sitemap'].map((link) => (
              <a key={link} href={`/${link.toLowerCase()}`} className="text-[10px] uppercase tracking-widest font-bold hover:text-blue-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer