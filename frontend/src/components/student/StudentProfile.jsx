import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { studentService, authService } from '../../services'
import { Button, Input, Alert } from '../common'
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaUserTie, 
  FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaUpload, FaLock,
  FaArrowLeft
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const StudentProfile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await authService.getMe('student')
      if (response.success) {
        setProfile(response.data.user)
        setFormData(response.data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

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
      const response = await studentService.updateStudent(profile._id, formData)
      if (response.success) {
        setSuccess('Profile updated successfully')
        setProfile(formData)
        setEditing(false)
        updateUser(formData)
      } else {
        setError(response.message || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        'student'
      )
      if (response.success) {
        setSuccess('Password changed successfully')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setError(response.message || 'Failed to change password')
      }
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return <div className="text-center py-12">Loading profile...</div>
  }

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
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <FaLock className="inline mr-2" />
            Change Password
          </button>
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
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-gray-50">
                <FaUpload className="w-3 h-3 text-gray-500" />
                <input type="file" className="hidden" />
              </label>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Enrollment No.</p>
              <p className="font-mono font-bold">{profile?.enrollmentNo}</p>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-500">{profile?.email}</p>
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
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profile?.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Father's Name</label>
              {editing ? (
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ''}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
        </div>

        {/* Address */}
        {profile?.address && (
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
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        {profile?.course && (
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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProfile