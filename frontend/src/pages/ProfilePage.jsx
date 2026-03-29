// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Alert } from '../components/common'
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaUserTie, 
  FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaLock, FaArrowLeft
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    console.log('🔵 ProfilePage mounted')
    console.log('🔵 User from useAuth:', user)
    
    if (user) {
      setProfile(user)
      setFormData(user)
      setLoading(false)
    } else {
      setLoading(false)
      setError('No user data found. Please login again.')
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Update local storage only (for now)
      const updatedUser = { ...profile, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setProfile(updatedUser)
      setSuccess('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg text-center">
        <p className="text-red-600 mb-4">No profile data found</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    )
  }

  const isStudent = profile?.role === 'student' || profile?.enrollmentNo

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex space-x-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaEdit className="inline mr-2" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <FaSave className="inline mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-12">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            {isStudent && profile?.enrollmentNo && (
              <div className="text-right bg-gray-100 px-3 py-1 rounded-lg">
                <p className="text-xs text-gray-500">Enrollment No.</p>
                <p className="font-mono font-bold text-sm">{profile.enrollmentNo}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-500">{profile?.email}</p>
            {profile?.role && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                {profile.role.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="border-t border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profile?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profile?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profile?.phone}</p>
              )}
            </div>

            {isStudent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Father's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile?.fatherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  {editing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth?.split('T')[0] || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  {editing ? (
                    <div className="mt-1 flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Male
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Female
                      </label>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900 capitalize">{profile?.gender || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                  {editing ? (
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{profile?.bloodGroup || '-'}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Address */}
        {isStudent && profile?.address && (
          <div className="border-t border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Street</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address?.street || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile?.address?.street || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">City</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address?.city || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile?.address?.city || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">State</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address?.state || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile?.address?.state || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Pincode</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address?.pincode || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile?.address?.pincode || '-'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Course Info */}
        {isStudent && profile?.course && (
          <div className="border-t border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Course Name</label>
                <p className="mt-1 text-gray-900 font-medium">{profile.course.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Admission Date</label>
                <p className="mt-1 text-gray-900">{new Date(profile.admissionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  profile.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {profile.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage