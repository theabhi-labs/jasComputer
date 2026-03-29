// src/components/admin/DocumentUpload.jsx
import React, { useState } from 'react'
import { Modal, Button, Alert } from '../../components/common'
import { studentService } from '../../services'
import { FaUpload, FaFilePdf, FaImage, FaCheckCircle, FaSpinner, FaTimes, FaCloudUploadAlt } from 'react-icons/fa'

const DocumentUpload = ({ isOpen, onClose, onSuccess, student }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [documents, setDocuments] = useState({
    photo: null,
    aadharCard: null,
    previousYearMarksheet: null
  })
  const [previews, setPreviews] = useState({
    photo: null,
    aadharCard: null,
    previousYearMarksheet: null
  })

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${docType} file size should be less than 5MB`)
        return
      }
      setDocuments(prev => ({ ...prev, [docType]: file }))
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [docType]: reader.result }))
        }
        reader.readAsDataURL(file)
      } else {
        setPreviews(prev => ({ ...prev, [docType]: null }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!documents.photo || !documents.aadharCard || !documents.previousYearMarksheet) {
      setError('Please select all required documents')
      return
    }
    
    setLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('photo', documents.photo)
    formData.append('aadharCard', documents.aadharCard)
    formData.append('previousYearMarksheet', documents.previousYearMarksheet)
    
    try {
      const response = await studentService.adminUploadDocuments(student._id, formData)
      if (response.success) {
        setSuccess('Documents uploaded successfully!')
        setTimeout(() => {
          onSuccess()
          onClose()
          resetForm()
        }, 2000)
      } else {
        setError(response.message || 'Upload failed')
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDocuments({ photo: null, aadharCard: null, previousYearMarksheet: null })
    setPreviews({ photo: null, aadharCard: null, previousYearMarksheet: null })
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Documents" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Student:</strong> {student?.name} ({student?.email})
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Upload all required documents to complete registration
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Photo Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-all">
            <div className="flex flex-col items-center">
              {previews.photo ? (
                <img src={previews.photo} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
              ) : (
                <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
              )}
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {documents.photo ? documents.photo.name : 'Upload Photo *'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  className="hidden"
                />
              </label>
              {documents.photo && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <FaCheckCircle /> { (documents.photo.size / 1024).toFixed(2) } KB
                </p>
              )}
            </div>
          </div>

          {/* Aadhar Card Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-all">
            <div className="flex flex-col items-center">
              {previews.aadharCard ? (
                <img src={previews.aadharCard} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
              ) : (
                <FaFilePdf className="text-4xl text-gray-400 mb-2" />
              )}
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {documents.aadharCard ? documents.aadharCard.name : 'Upload Aadhar Card *'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'aadharCard')}
                  className="hidden"
                />
              </label>
              {documents.aadharCard && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <FaCheckCircle /> { (documents.aadharCard.size / 1024).toFixed(2) } KB
                </p>
              )}
            </div>
          </div>

          {/* Marksheet Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-all">
            <div className="flex flex-col items-center">
              {previews.previousYearMarksheet ? (
                <img src={previews.previousYearMarksheet} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
              ) : (
                <FaFilePdf className="text-4xl text-gray-400 mb-2" />
              )}
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {documents.previousYearMarksheet ? documents.previousYearMarksheet.name : 'Upload Marksheet *'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'previousYearMarksheet')}
                  className="hidden"
                />
              </label>
              {documents.previousYearMarksheet && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <FaCheckCircle /> { (documents.previousYearMarksheet.size / 1024).toFixed(2) } KB
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FaUpload className="inline mr-2" />
            {loading ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DocumentUpload