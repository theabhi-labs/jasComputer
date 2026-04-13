import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  FaAward, FaUsers, FaChalkboardTeacher, FaBookOpen, FaHeart, 
  FaLightbulb, FaQuoteLeft, FaCheckCircle, FaArrowRight, 
  FaHistory, FaGraduationCap, FaRocket, FaGlobe, FaHandsHelping,
  FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin,
  FaStar, FaTrophy, FaBriefcase, FaCode, FaMobileAlt
} from 'react-icons/fa'

const AboutPage = () => {
  const values = [
    { 
      icon: FaHeart, 
      title: 'Excellence', 
      desc: 'Striving for the highest standards in education and continuous improvement.', 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      gradient: 'from-rose-500 to-rose-600'
    },
    { 
      icon: FaUsers, 
      title: 'Student First', 
      desc: 'Every decision prioritizes student success and holistic development.', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      icon: FaLightbulb, 
      title: 'Innovation', 
      desc: 'Embracing modern teaching methodologies and digital learning tools.', 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600'
    },
    { 
      icon: FaAward, 
      title: 'Integrity', 
      desc: 'Honest and transparent practices in all our operations.', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-emerald-600'
    }
  ]

  const stats = [
    { value: '1K+', label: 'Students Trained', icon: FaUsers, suffix: 'Happy Learners' },
    { value: '95%', label: 'Success Rate', icon: FaAward, suffix: 'Exam Pass Rate' },
    { value: '5+', label: 'Expert Faculty', icon: FaChalkboardTeacher, suffix: 'Qualified Teachers' },
    { value: '100+', label: 'Digital Courses', icon: FaBookOpen, suffix: 'Job-Oriented' }
  ]

  const achievements = [
    { year: '2010', title: 'Founded', description: 'Started with 20 students in Suriyawan' },
    { year: '2015', title: '500+ Students', description: 'Expanded to serve over 500 students' },
    { year: '2020', title: 'Digital Transformation', description: 'Launched online learning platform' },
    { year: '2024', title: '1K+ Alumni', description: 'Celebrating 500+ successful graduates' }
  ]

  // Updated team members with Director and Faculty as per provided info
  const teamMembers = [
    { name: 'M A Siddiqui', role: 'Director & CEO', experience: '15+ Years', expertise: 'Leadership & Strategy' },
    { name: 'Suman Yadav', role: ' Faculty', experience: '5+ Years', expertise: 'DCA / ADCA' },
    { name: 'Sabana Bano', role: 'Faculty', experience: '10+ Years', expertise: 'Tally & Accounting' },
    { name: 'Mohammad Afzal', role: 'Faculty', experience: '8+ Years', expertise: 'Web Development' }
  ]

  // Contact information as provided
  const contactInfo = {
    phones: ['8756248193', '9129774092'],
    address: 'ROKAIYA COMPLEX, PURANI BAZAR, SURIYAWAN, BHADOHI 221404 (UP)',
    email: 'jascomputerinstitute@gmail.com'
  }

  return (
    <>
      <Helmet>
        <title>About JAS Computer Institute | Best Computer Training Center in Suriyawan</title>
        <meta name="description" content="Learn about JAS Computer Institute - Established in 2010, we've trained 10,000+ students in computer courses like DCA, ADCA, Tally, and Typing. Your trusted computer training partner in Suriyawan." />
        <meta name="keywords" content="about JAS Computer Institute, computer training center Suriyawan, best computer institute in Suriyawan, JAS Computer Institute history, computer education Suriyawan" />
        <meta name="author" content="JAS Computer Institute & Training Center" />
        <meta property="og:title" content="About JAS Computer Institute | 10+ Years of Excellence in Computer Education" />
        <meta property="og:description" content="Discover our journey of empowering students since 2010. Over 10,000 students trained, 95% success rate, and 50+ expert faculty members." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.jascomputerinstitute.com/images/about-og.jpg" />
        <meta property="og:url" content="https://www.jascomputerinstitute.com/about" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About JAS Computer Institute - Your Trusted Computer Training Partner" />
        <meta name="twitter:description" content="Empowering students with job-oriented computer education since 2010." />
        <link rel="canonical" href="https://www.jascomputerinstitute.com/about" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "JAS Computer Institute & Training Center",
            "url": "https://www.jascomputerinstitute.com",
            "logo": "https://www.jascomputerinstitute.com/logo.png",
            "description": "Best computer training institute in Suriyawan offering DCA, ADCA, Tally, Typing, and Basic Computer courses.",
            "foundingDate": "2010",
            "founder": {
              "@type": "Person",
              "name": "M A Siddiqui"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "ROKAIYA COMPLEX, PURANI BAZAR",
              "addressLocality": "Suriyawan",
              "addressRegion": "Uttar Pradesh",
              "postalCode": "221404",
              "addressCountry": "IN"
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+91-8756248193",
                "contactType": "customer service"
              },
              {
                "@type": "ContactPoint",
                "telephone": "+91-9129774092",
                "contactType": "customer service"
              }
            ],
            "email": "jascomputerinstitute@gmail.com",
            "sameAs": [
              "https://www.facebook.com/jascomputer",
              "https://www.instagram.com/jascomputer",
              "https://twitter.com/jascomputer"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920')] bg-cover bg-center opacity-10"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <FaHistory className="text-blue-200 text-sm" />
                <span className="text-blue-100 font-medium text-sm tracking-wide">Established in 2010</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Shaping Futures with{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h1>
              <p className="text-xl text-blue-100 font-light leading-relaxed mb-8">
                Empowering students to achieve their dreams through a perfect blend of traditional wisdom and modern technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/courses" 
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Explore Courses
                  <FaArrowRight className="text-sm" />
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Stats Section - Enhanced Glassmorphism */}
        <section className="relative -mt-16 z-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group bg-white backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center border border-gray-100"
                >
                  <div className="inline-flex p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-blue-600 mb-4 text-2xl group-hover:scale-110 transition-transform">
                    <stat.icon />
                  </div>
                  <p className="text-3xl lg:text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.suffix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section - Enhanced */}
        <section className="py-20 lg:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="lg:w-1/2 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-100 rounded-full blur-2xl opacity-70 animate-pulse delay-1000"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop" 
                    alt="JAS Computer Institute Classroom - Computer Training in Suriyawan"
                    className="w-full h-[450px] object-cover hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
                
                {/* Quote Badge */}
                <div className="absolute bottom-8 -left-4 bg-white p-5 rounded-xl shadow-xl border border-gray-100 max-w-[220px]">
                  <FaQuoteLeft className="text-blue-500 mb-2 text-xl" />
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    "Education is not preparation for life; education is life itself."
                  </p>
                  <p className="text-xs text-gray-400 mt-2">- John Dewey</p>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                  <FaHistory className="text-blue-600 text-sm" />
                  <span className="text-blue-600 font-medium text-sm">Our Journey</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  A Journey of{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Dedication & Excellence
                  </span>
                </h2>
                <div className="space-y-5 text-gray-600 leading-relaxed">
                  <p>
                    JAS Computer Institute was founded in 2010 by <strong className="text-blue-600">M A Siddiqui</strong> with a simple yet powerful mission: to bridge the gap between student potential and academic excellence. What started in a single room with 20 motivated students has evolved into Suriyawan's most trusted computer training center.
                  </p>
                  <p>
                    We don't just teach computer skills; we build careers. Our focus on <strong className="text-blue-600">personalized mentorship</strong> and <strong className="text-blue-600">job-oriented training</strong> ensures that every student gets a clear roadmap to success.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">1K+ Alumni</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">95% Success Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">placement training & interview preparation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section - Journey */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <FaCalendarAlt className="text-blue-600 text-sm" />
                <span className="text-blue-600 font-medium text-sm">Our Milestones</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                The JAS <span className="text-blue-600">Journey</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From humble beginnings to becoming Suriyawan's premier computer training institute
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 hidden lg:block"></div>
              <div className="space-y-8">
                {achievements.map((item, index) => (
                  <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    <div className="lg:w-1/2"></div>
                    <div className="lg:w-1/2 relative">
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                        <div className="absolute left-1/2 lg:left-0 transform -translate-x-1/2 lg:-translate-x-1/2 -translate-y-1/2 top-0 lg:top-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div className="pl-0 lg:pl-8">
                          <span className="text-blue-600 font-bold text-sm">{item.year}</span>
                          <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Enhanced */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <FaHeart className="text-blue-600 text-sm" />
                <span className="text-blue-600 font-medium text-sm">Our Principles</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Values That <span className="text-blue-600">Guide Us</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The core principles that shape our approach to education and student development
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`${value.bg} ${value.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl group-hover:rotate-6 transition-transform`}>
                    <value.icon />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{value.title}</h3>
                  <p className="text-gray-500 text-sm text-center leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section - Enhanced */}
        <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <FaRocket className="text-blue-200 text-sm" />
                <span className="text-blue-100 font-medium text-sm">Why Choose Us</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                What Makes Us <span className="text-blue-300">Different</span>
              </h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Discover what sets JAS Computer Institute apart from the rest
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all group">
                <div className="inline-flex p-3 bg-blue-500/20 rounded-xl text-blue-300 mb-4 text-3xl group-hover:scale-110 transition">
                  <FaChalkboardTeacher />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Elite Mentors</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Our faculty consists of certified experts with years of industry and teaching experience.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all group">
                <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl text-emerald-300 mb-4 text-3xl group-hover:scale-110 transition">
                  <FaBookOpen />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Curated Content</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Study materials are updated regularly to stay ahead of changing industry requirements.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all group">
                <div className="inline-flex p-3 bg-purple-500/20 rounded-xl text-purple-300 mb-4 text-3xl group-hover:scale-110 transition">
                  <FaUsers />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Small Batches</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  We maintain a 1:12 teacher-student ratio to ensure personalized attention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Updated with Director and Faculty */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <FaUsers className="text-blue-600 text-sm" />
                <span className="text-blue-600 font-medium text-sm">Our Team</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Leadership & <span className="text-blue-600">Expert Faculty</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Dedicated professionals committed to your success under the guidance of our Director, M A Siddiqui
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="group bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition">
                    <FaGraduationCap className="text-white text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-gray-500 text-xs">{member.experience} experience</p>
                  <p className="text-gray-400 text-xs mt-1">Expertise: {member.expertise}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Contact Information Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <FaMapMarkerAlt className="text-blue-600 text-sm" />
                <span className="text-blue-600 font-medium text-sm">Get in Touch</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Visit Our <span className="text-blue-600">Campus</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We'd love to hear from you. Reach out for course details, admissions, or any queries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Address Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center group">
                <div className="inline-flex p-3 bg-red-50 rounded-xl text-red-500 mb-4 text-2xl group-hover:scale-110 transition">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Our Address</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {contactInfo.address}
                </p>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center group">
                <div className="inline-flex p-3 bg-green-50 rounded-xl text-green-500 mb-4 text-2xl group-hover:scale-110 transition">
                  <FaPhone />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Call Us</h3>
                <div className="space-y-2">
                  {contactInfo.phones.map((phone, idx) => (
                    <a 
                      key={idx}
                      href={`tel:+91${phone}`}
                      className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 text-center group">
                <div className="inline-flex p-3 bg-blue-50 rounded-xl text-blue-500 mb-4 text-2xl group-hover:scale-110 transition">
                  <FaEnvelope />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Email Us</h3>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-blue-600 hover:text-blue-700 text-sm break-all"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
                  <FaRocket className="ml-2" />
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
                >
                  Contact Us
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  )
}

export default AboutPage