import React, { useState, useEffect } from 'react'
import { userService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import { FaPlus, FaEdit, FaTrash, FaChalkboardTeacher, FaEnvelope, FaPhone, FaGraduationCap, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'teacher',
    teacherDetails: {
      qualification: '',
      experience: 0,
      specialization: [],
      salary: 0,
      salaryType: 'monthly',
      joiningDate: new Date().toISOString().split('T')[0]
    }
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const response = await userService.getAllUsers({ role: 'teacher' })
      if (response.success) {
        setTeachers(response.data.users || [])
      }
    } catch (error) {
      console.error('Fetch teachers error:', error)
      setError(error.message || 'Failed to fetch teachers')
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

  const handleSpecialization = (e) => {
    const value = e.target.value
    const specs = value.split(',').map(s => s.trim()).filter(s => s)
    setFormData(prev => ({
      ...prev,
      teacherDetails: {
        ...prev.teacherDetails,
        specialization: specs
      }
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'teacher',
      teacherDetails: {
        qualification: '',
        experience: 0,
        specialization: [],
        salary: 0,
        salaryType: 'monthly',
        joiningDate: new Date().toISOString().split('T')[0]
      }
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.password.trim() && !showEditModal) return 'Password is required'
    if (!formData.phone.trim()) return 'Phone number is required'
    if (formData.phone.length !== 10) return 'Phone number must be 10 digits'
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email format'
    if (formData.password && formData.password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')

    // Prepare data for API
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      role: 'teacher',
      teacherDetails: {
        qualification: formData.teacherDetails.qualification || '',
        experience: parseInt(formData.teacherDetails.experience) || 0,
        specialization: formData.teacherDetails.specialization || [],
        salary: parseInt(formData.teacherDetails.salary) || 0,
        salaryType: formData.teacherDetails.salaryType || 'monthly',
        joiningDate: formData.teacherDetails.joiningDate || new Date().toISOString().split('T')[0]
      }
    }

    console.log('📤 Adding teacher:', submitData)

    try {
      const response = await userService.createUser(submitData)
      console.log('📥 Response:', response)
      
      if (response.success) {
        toast.success('Teacher added successfully!')
        fetchTeachers()
        setShowAddModal(false)
        resetForm()
      } else {
        setError(response.message || 'Failed to add teacher')
      }
    } catch (err) {
      console.error('Add teacher error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add teacher'
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      teacherDetails: {
        qualification: formData.teacherDetails.qualification || '',
        experience: parseInt(formData.teacherDetails.experience) || 0,
        specialization: formData.teacherDetails.specialization || [],
        salary: parseInt(formData.teacherDetails.salary) || 0,
        salaryType: formData.teacherDetails.salaryType || 'monthly',
        joiningDate: formData.teacherDetails.joiningDate
      }
    }
    
    // Only include password if changed
    if (formData.password) {
      submitData.password = formData.password
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await userService.updateUser(selectedTeacher._id, submitData)
      if (response.success) {
        toast.success('Teacher updated successfully!')
        fetchTeachers()
        setShowEditModal(false)
        setSelectedTeacher(null)
        resetForm()
      } else {
        setError(response.message || 'Failed to update teacher')
      }
    } catch (err) {
      console.error('Update error:', err)
      setError(err.response?.data?.message || 'Failed to update teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await userService.deleteUser(selectedTeacher._id)
      if (response.success) {
        toast.success('Teacher deleted successfully!')
        fetchTeachers()
        setShowDeleteConfirm(false)
        setSelectedTeacher(null)
      } else {
        setError(response.message || 'Failed to delete teacher')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.response?.data?.message || 'Failed to delete teacher')
    }
  }

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher)
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      password: '',
      phone: teacher.phone || '',
      role: teacher.role || 'teacher',
      teacherDetails: {
        qualification: teacher.teacherDetails?.qualification || '',
        experience: teacher.teacherDetails?.experience || 0,
        specialization: teacher.teacherDetails?.specialization || [],
        salary: teacher.teacherDetails?.salary || 0,
        salaryType: teacher.teacherDetails?.salaryType || 'monthly',
        joiningDate: teacher.teacherDetails?.joiningDate?.split('T')[0] || new Date().toISOString().split('T')[0]
      }
    })
    setShowEditModal(true)
  }

  if (loading && teachers.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-500 mt-1">Manage faculty members and their details</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <FaPlus className="inline mr-2" />
          Add Teacher
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {teachers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FaChalkboardTeacher className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No teachers found</p>
            <Button variant="outline" onClick={() => setShowAddModal(true)} className="mt-4">
              Add your first teacher
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher._id} hover>
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <FaChalkboardTeacher className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-500">{teacher.teacherDetails?.qualification || 'Qualification not specified'}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  {teacher.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="w-4 h-4 mr-2" />
                  {teacher.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaGraduationCap className="w-4 h-4 mr-2" />
                  {teacher.teacherDetails?.experience || 0} years experience
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaMoneyBillWave className="w-4 h-4 mr-2" />
                  ₹{teacher.teacherDetails?.salary?.toLocaleString() || 0}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800 p-2">
                  <FaEdit />
                </button>
                <button onClick={() => {
                  setSelectedTeacher(teacher)
                  setShowDeleteConfirm(true)
                }} className="text-red-600 hover:text-red-800 p-2">
                  <FaTrash />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); setError('') }} title="Add New Teacher" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
            <Input
              label="Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="teacher@coaching.com"
            />
            <Input
              label="Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create password"
              autoComplete="new-password"
            />
            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="10-digit mobile number"
            />
            <Input
              label="Qualification"
              name="teacherDetails.qualification"
              value={formData.teacherDetails.qualification}
              onChange={handleChange}
              placeholder="e.g., M.Sc. Physics"
            />
            <Input
              label="Experience (Years)"
              type="number"
              name="teacherDetails.experience"
              value={formData.teacherDetails.experience}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            <Input
              label="Specialization"
              name="teacherDetails.specialization"
              value={formData.teacherDetails.specialization.join(', ')}
              onChange={handleSpecialization}
              placeholder="Physics, Mathematics (comma separated)"
            />
            <Input
              label="Salary (₹)"
              type="number"
              name="teacherDetails.salary"
              value={formData.teacherDetails.salary}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
              <select
                name="teacherDetails.salaryType"
                value={formData.teacherDetails.salaryType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <Input
              label="Joining Date"
              type="date"
              name="teacherDetails.joiningDate"
              value={formData.teacherDetails.joiningDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); resetForm(); setError('') }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Add Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); setError('') }} title="Edit Teacher" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="New Password (leave blank to keep current)"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input
              label="Qualification"
              name="teacherDetails.qualification"
              value={formData.teacherDetails.qualification}
              onChange={handleChange}
            />
            <Input
              label="Experience (years)"
              type="number"
              name="teacherDetails.experience"
              value={formData.teacherDetails.experience}
              onChange={handleChange}
            />
            <Input
              label="Specialization"
              name="teacherDetails.specialization"
              value={formData.teacherDetails.specialization.join(', ')}
              onChange={handleSpecialization}
            />
            <Input
              label="Salary (₹)"
              type="number"
              name="teacherDetails.salary"
              value={formData.teacherDetails.salary}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
              <select
                name="teacherDetails.salaryType"
                value={formData.teacherDetails.salaryType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <Input
              label="Joining Date"
              type="date"
              name="teacherDetails.joiningDate"
              value={formData.teacherDetails.joiningDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowEditModal(false); resetForm(); setError('') }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Update Teacher
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}

export default TeacherManagement