import React, { useState, useEffect } from 'react'
import { Modal, Input, Button, Alert } from '../../components/common'
import { studentService } from '../../services'

const EditStudent = ({ isOpen, onClose, onSuccess, student, courses }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    dateOfBirth: '',
    gender: 'male',
    course: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        fatherName: student.fatherName || '',
        address: {
          street: student.address?.street || '',
          city: student.address?.city || '',
          state: student.address?.state || '',
          pincode: student.address?.pincode || ''
        },
        dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
        gender: student.gender || 'male',
        course: student.course?._id || '',
        status: student.status || 'active'
      })
    }
  }, [student])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await studentService.updateStudent(student._id, formData)
      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.message || 'Failed to update student')
      }
    } catch (err) {
      setError(err.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

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
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Father's Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex space-x-4">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Address Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
            <Input
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
            <Input
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
            />
            <Input
              label="Pincode"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Update Student
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditStudent