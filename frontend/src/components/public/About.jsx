import React from 'react'
import { FaAward, FaUsers, FaChalkboardTeacher, FaBookOpen, FaHeart, FaLightbulb, FaBullseye, FaHandsHelping } from 'react-icons/fa'

const About = () => {
  const values = [
    { icon: FaHeart, title: 'Excellence', desc: 'Striving for the highest standards in education' },
    { icon: FaUsers, title: 'Student First', desc: 'Every decision prioritizes student success' },
    { icon: FaLightbulb, title: 'Innovation', desc: 'Embracing modern teaching methodologies' },
    { icon: FaAward, title: 'Integrity', desc: 'Honest and transparent practices' },
    { icon: FaBullseye, title: 'Commitment', desc: 'Dedicated to student success' },
    { icon: FaHandsHelping, title: 'Support', desc: '24/7 doubt clearing and guidance' }
  ]

  const team = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Founder & Director',
      experience: '25+ years',
      image: 'https://randomuser.me/api/portraits/men/11.jpg'
    },
    {
      name: 'Prof. Priya Sharma',
      role: 'Academic Head',
      experience: '18+ years',
      image: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    {
      name: 'Mr. Amit Patel',
      role: 'JEE Coordinator',
      experience: '15+ years',
      image: 'https://randomuser.me/api/portraits/men/13.jpg'
    },
    {
      name: 'Dr. Neha Gupta',
      role: 'NEET Coordinator',
      experience: '12+ years',
      image: 'https://randomuser.me/api/portraits/women/14.jpg'
    }
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Coaching MS</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Empowering students to achieve their dreams through quality education and expert guidance since 2010
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Coaching MS was founded in 2010 with a simple mission: to provide the best possible education to students preparing for competitive exams. What started as a small classroom with 20 students has now grown into a premier coaching institute with over 10,000 successful alumni.
              </p>
              <p className="text-gray-600">
                Our journey has been driven by one belief - every student has the potential to succeed, and with the right guidance and support, they can achieve extraordinary results. We take pride in our personalized approach, small batch sizes, and dedicated faculty who go above and beyond to ensure student success.
              </p>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600" 
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBullseye className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide quality education that empowers students to excel in competitive exams and build successful careers through innovative teaching methods and personalized attention.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEye className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become India's most trusted coaching institute, known for excellence in education and transforming the lives of millions of students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mt-6 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm mb-1">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.experience} experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaChalkboardTeacher className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Faculty</h3>
              <p className="text-gray-600">Learn from experienced educators who have mentored thousands of successful students.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaBookOpen className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Material</h3>
              <p className="text-gray-600">Get access to high-quality study materials, practice papers, and mock tests.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaUsers className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Attention</h3>
              <p className="text-gray-600">Small batch sizes ensure individual attention and doubt clearing sessions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About