import React, { useState, useEffect } from 'react'
import { batchService, courseService, userService } from '../../services'
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common'
import { FaPlus, FaEdit, FaTrash, FaUsers, FaClock, FaCalendarAlt } from 'react-icons/fa'
import LoaderJAS from '../common/Loader'

const BatchManagement = () => {
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    teachers: [],
    timing: { startTime: '09:00 AM', endTime: '11:00 AM' },
    days: [],
    startDate: '',
    capacity: 30,
    room: '',
    status: 'upcoming',
    description: ''
  })
  const [error, setError] = useState('')

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [batchesRes, coursesRes, teachersRes] = await Promise.all([
        batchService.getAllBatches(),
        courseService.getAllCourses(),
        userService.getAllUsers({ role: 'teacher' })
      ])
      if (batchesRes.success) setBatches(batchesRes.data.batches)
      if (coursesRes.success) setCourses(coursesRes.data.courses)
      if (teachersRes.success) setTeachers(teachersRes.data.users)
    } catch (error) {
      setError(error.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await batchService.createBatch(formData)
      if (response.success) {
        fetchData()
        setShowAddModal(false)
        resetForm()
      } else {
        setError(response.message || 'Failed to add batch')
      }
    } catch (err) {
      setError(err.message || 'Failed to add batch')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await batchService.updateBatch(selectedBatch._id, formData)
      if (response.success) {
        fetchData()
        setShowEditModal(false)
        setSelectedBatch(null)
        resetForm()
      } else {
        setError(response.message || 'Failed to update batch')
      }
    } catch (err) {
      setError(err.message || 'Failed to update batch')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await batchService.deleteBatch(selectedBatch._id)
      if (response.success) {
        fetchData()
        setShowDeleteConfirm(false)
        setSelectedBatch(null)
      } else {
        setError(response.message || 'Failed to delete batch')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete batch')
    }
  }

  const handleStatusChange = async (batch, newStatus) => {
    try {
      const response = await batchService.changeStatus(batch._id, newStatus)
      if (response.success) {
        fetchData()
      } else {
        setError(response.message || 'Failed to update status')
      }
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      course: '',
      teachers: [],
      timing: { startTime: '09:00 AM', endTime: '11:00 AM' },
      days: [],
      startDate: '',
      capacity: 30,
      room: '',
      status: 'upcoming',
      description: ''
    })
  }

  const handleEdit = (batch) => {
    setSelectedBatch(batch)
    setFormData({
      name: batch.name,
      course: batch.course?._id || batch.course,
      teachers: batch.teachers?.map(t => t._id || t) || [],
      timing: batch.timing,
      days: batch.days,
      startDate: batch.startDate?.split('T')[0] || '',
      capacity: batch.capacity,
      room: batch.room || '',
      status: batch.status,
      description: batch.description || ''
    })
    setShowEditModal(true)
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-600',
      ongoing: 'bg-green-100 text-green-600',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading && batches.length === 0) {
    return <Loader />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <FaPlus className="inline mr-2" />
          Create Batch
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => (
          <Card key={batch._id} hover>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{batch.name}</h3>
                <p className="text-sm text-gray-500">{batch.course?.name}</p>
              </div>
              <select
                value={batch.status}
                onChange={(e) => handleStatusChange(batch, e.target.value)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FaClock className="w-4 h-4 mr-2" />
                {batch.timing?.startTime} - {batch.timing?.endTime} | {batch.days?.join(', ')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                Starts: {new Date(batch.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaUsers className="w-4 h-4 mr-2" />
                {batch.currentStrength || 0} / {batch.capacity} students
              </div>
              {batch.teachers?.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Teachers:</span> {batch.teachers.map(t => t.name).join(', ')}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button onClick={() => handleEdit(batch)} className="text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button onClick={() => {
                setSelectedBatch(batch)
                setShowDeleteConfirm(true)
              }} className="text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Batch Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm() }} title="Create New Batch" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Batch Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., JEE Morning Batch"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teachers</label>
              <select
                multiple
                value={formData.teachers}
                onChange={(e) => setFormData({ ...formData, teachers: Array.from(e.target.selectedOptions, option => option.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <Input
              label="Start Time"
              value={formData.timing.startTime}
              onChange={(e) => setFormData({ ...formData, timing: { ...formData.timing, startTime: e.target.value } })}
              required
              placeholder="09:00 AM"
            />
            <Input
              label="End Time"
              value={formData.timing.endTime}
              onChange={(e) => setFormData({ ...formData, timing: { ...formData.timing, endTime: e.target.value } })}
              required
              placeholder="11:00 AM"
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Room No."
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Room 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.days.includes(day)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Batch description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Create Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm() }} title="Edit Batch" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Batch Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teachers</label>
              <select
                multiple
                value={formData.teachers}
                onChange={(e) => setFormData({ ...formData, teachers: Array.from(e.target.selectedOptions, option => option.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Start Time"
              value={formData.timing.startTime}
              onChange={(e) => setFormData({ ...formData, timing: { ...formData.timing, startTime: e.target.value } })}
              required
            />
            <Input
              label="End Time"
              value={formData.timing.endTime}
              onChange={(e) => setFormData({ ...formData, timing: { ...formData.timing, endTime: e.target.value } })}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Room No."
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.days.includes(day)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowEditModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Update Batch
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Batch"
        message={`Are you sure you want to delete ${selectedBatch?.name}? This will also remove all students from this batch.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}

export default BatchManagement