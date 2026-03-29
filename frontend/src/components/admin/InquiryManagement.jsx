import React, { useState, useEffect } from 'react'
import { inquiryService, userService } from '../../services'
import { Card, Button, Input, Modal, Alert, Loader } from '../common'
import { FaEye, FaEdit, FaCheck, FaTimes, FaUserPlus, FaPhone, FaEnvelope } from 'react-icons/fa'

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [remark, setRemark] = useState('')
  const [filters, setFilters] = useState({ status: '' })
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [inquiriesRes, statsRes] = await Promise.all([
        inquiryService.getAllInquiries(filters),
        inquiryService.getInquiryStats()
      ])
      if (inquiriesRes.success) setInquiries(inquiriesRes.data.inquiries)
      if (statsRes.success) setStats(statsRes.data)
    } catch (error) {
      setError(error.message || 'Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await inquiryService.updateStatus(id, { status })
      if (response.success) {
        fetchData()
      } else {
        setError(response.message || 'Failed to update status')
      }
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  const handleAddRemark = async (id) => {
    try {
      const response = await inquiryService.addRemark(id, { comment: remark })
      if (response.success) {
        fetchData()
        setShowRemarkModal(false)
        setRemark('')
      } else {
        setError(response.message || 'Failed to add remark')
      }
    } catch (err) {
      setError(err.message || 'Failed to add remark')
    }
  }

  const handleConvertToStudent = async (id) => {
    try {
      const response = await inquiryService.convertToStudent(id, {
        password: '123456',
        fatherName: selectedInquiry?.fatherName || 'N/A'
      })
      if (response.success) {
        fetchData()
        setShowViewModal(false)
        alert('Student created successfully!')
      } else {
        setError(response.message || 'Failed to convert')
      }
    } catch (err) {
      setError(err.message || 'Failed to convert')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-600',
      contacted: 'bg-yellow-100 text-yellow-600',
      converted: 'bg-green-100 text-green-600',
      lost: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading && inquiries.length === 0) {
    return <Loader />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-blue-50">
            <p className="text-sm text-blue-600">Total</p>
            <p className="text-2xl font-bold text-blue-700">{stats.summary.total}</p>
          </Card>
          <Card className="bg-blue-100">
            <p className="text-sm text-blue-600">New</p>
            <p className="text-2xl font-bold text-blue-700">{stats.summary.new}</p>
          </Card>
          <Card className="bg-yellow-100">
            <p className="text-sm text-yellow-600">Contacted</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.summary.contacted}</p>
          </Card>
          <Card className="bg-green-100">
            <p className="text-sm text-green-600">Converted</p>
            <p className="text-2xl font-bold text-green-700">{stats.summary.converted}</p>
          </Card>
          <Card className="bg-red-100">
            <p className="text-sm text-red-600">Lost</p>
            <p className="text-2xl font-bold text-red-700">{stats.summary.lost}</p>
          </Card>
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          <Button variant="secondary" onClick={() => setFilters({ status: '' })}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inquiry.name}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEnvelope className="w-3 h-3 mr-1" />
                        {inquiry.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="w-3 h-3 mr-1" />
                        {inquiry.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {inquiry.course?.name || inquiry.courseName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{inquiry.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusUpdate(inquiry._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry)
                        setShowViewModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry)
                        setShowRemarkModal(true)
                      }}
                      className="text-green-600 hover:text-green-800"
                      title="Add Remark"
                    >
                      <FaEdit />
                    </button>
                    {inquiry.status !== 'converted' && (
                      <button
                        onClick={() => handleConvertToStudent(inquiry._id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Convert to Student"
                      >
                        <FaUserPlus />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Inquiry Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Inquiry Details" size="lg">
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedInquiry.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{selectedInquiry.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p>{selectedInquiry.course?.name || selectedInquiry.courseName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="capitalize">{selectedInquiry.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Batch</p>
                <p>{selectedInquiry.preferredBatch || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Message</p>
              <p className="bg-gray-50 p-3 rounded-lg mt-1">{selectedInquiry.message}</p>
            </div>
            {selectedInquiry.remarks?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <div className="space-y-2">
                  {selectedInquiry.remarks.map((rem, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded">
                      <p className="text-sm">{rem.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(rem.createdAt).toLocaleString()} by {rem.createdBy?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Remark Modal */}
      <Modal isOpen={showRemarkModal} onClose={() => setShowRemarkModal(false)} title="Add Remark" size="md">
        <div className="space-y-4">
          <textarea
            rows="4"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your remark..."
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowRemarkModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddRemark(selectedInquiry?._id)}>
              Add Remark
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InquiryManagement