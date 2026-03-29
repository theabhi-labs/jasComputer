import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { teacherService } from '../../services'
import { Card, Button, Alert, Modal } from '../common'
import { 
  FaUsers, FaClock, FaCalendarAlt, FaChalkboardTeacher, 
  FaEye, FaChartLine, FaDownload, FaDoorOpen 
} from 'react-icons/fa'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

const MyBatches = () => {
  const { user } = useAuth()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const response = await teacherService.getAssignedBatches()
      if (response.success) {
        setBatches(response.data.batches)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch batches')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      ongoing: 'bg-green-100 text-green-600',
      upcoming: 'bg-blue-100 text-blue-600',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading) {
    return <div className="text-center py-12">Loading batches...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Batches</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {batches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <Card key={batch._id} hover>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{batch.name}</h3>
                  <p className="text-sm text-gray-500">{batch.course?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                  {batch.status?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaClock className="w-4 h-4 mr-3" />
                  <span>{batch.timing?.startTime} - {batch.timing?.endTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="w-4 h-4 mr-3" />
                  <span>{batch.days?.join(', ')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="w-4 h-4 mr-3" />
                  <span>{batch.currentStrength || 0} / {batch.capacity} students</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaDoorOpen className="w-4 h-4 mr-3" />
                  <span>Room: {batch.room || 'Not assigned'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Link to={`/dashboard/mark-attendance?batch=${batch._id}`}>
                  <Button size="sm" variant="outline">
                    <FaCalendarAlt className="inline mr-1" /> Mark Attendance
                  </Button>
                </Link>
                <Link to={`/dashboard/my-students?batch=${batch._id}`}>
                  <Button size="sm" variant="outline">
                    <FaUsers className="inline mr-1" /> View Students
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedBatch(batch)
                    setShowDetailsModal(true)
                  }}
                >
                  <FaEye className="inline mr-1" /> Details
                </Button>
                <Button size="sm" variant="outline">
                  <FaChartLine className="inline mr-1" /> Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <FaDownload className="inline mr-1" /> Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FaChalkboardTeacher className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No batches assigned yet</p>
            <p className="text-sm text-gray-400 mt-2">Contact admin for batch assignment</p>
          </div>
        </Card>
      )}

      {/* Batch Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Batch Details" size="lg">
        {selectedBatch && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{selectedBatch.name}</h3>
              <p className="text-gray-600">{selectedBatch.course?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Timing</p>
                <p className="font-medium">{selectedBatch.timing?.startTime} - {selectedBatch.timing?.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Days</p>
                <p>{selectedBatch.days?.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p>{format(new Date(selectedBatch.startDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                  {selectedBatch.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p>{selectedBatch.currentStrength || 0} / {selectedBatch.capacity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p>{selectedBatch.room || 'Not assigned'}</p>
              </div>
            </div>

            {selectedBatch.teachers?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Teaching Staff</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.teachers.map((teacher, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {teacher.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedBatch.description && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-600">{selectedBatch.description}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Link to={`/dashboard/mark-attendance?batch=${selectedBatch._id}`}>
                <Button size="sm">Mark Attendance</Button>
              </Link>
              <Link to={`/dashboard/my-students?batch=${selectedBatch._id}`}>
                <Button size="sm" variant="outline">View Students</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyBatches